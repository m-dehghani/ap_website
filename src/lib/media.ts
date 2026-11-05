import { randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { del, get, head, put } from '@vercel/blob';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';
import { aparatVideoUrlSchema } from '@/lib/aparat';

export { getAparatEmbedUrl, parseAparatVideoUrl } from '@/lib/aparat';

const VERCEL_VIDEO_LIMIT = 4 * 1024 * 1024;
const OTHER_VIDEO_LIMIT = 100 * 1024 * 1024;
const VERCEL_IMAGE_LIMIT = 4 * 1024 * 1024;
const OTHER_IMAGE_LIMIT = 5 * 1024 * 1024;
const uuidPattern =
  '[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

export type VideoMimeType = 'video/mp4' | 'video/webm';
export type UploadedImageMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';
export type MediaMimeType = VideoMimeType | UploadedImageMimeType;

const extensions: Record<MediaMimeType, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const mediaTypesByExtension: Record<string, MediaMimeType> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};
const mediaUrlPattern = new RegExp(
  `^/uploads/(${uuidPattern})\\.(mp4|webm|jpg|png|webp)$`,
  'i',
);
export const videoAssetUrlSchema = z
  .string()
  .regex(new RegExp(`^/uploads/${uuidPattern}\\.(mp4|webm)$`, 'i'));
export const uploadedLogoUrlSchema = z
  .string()
  .regex(new RegExp(`^/uploads/${uuidPattern}\\.(jpg|png|webp)$`, 'i'));
export const videoContentFieldsSchema = z.object({
  uploadedVideoUrl: videoAssetUrlSchema.nullable().optional(),
  aparatVideoUrl: aparatVideoUrlSchema,
});

type VideoReferenceStore = Pick<
  Awaited<ReturnType<typeof getPrisma>>,
  'newsArticle' | 'shopProduct' | 'siteBranding'
>;

function uploadsDirectory() {
  const configured = process.env.UPLOADS_DIR?.trim();
  if (process.env.NODE_ENV === 'production' && !configured && process.env.VERCEL !== '1') {
    throw new Error('DURABLE_UPLOADS_DIR_REQUIRED');
  }
  return path.resolve(configured || path.join(process.cwd(), 'uploads'));
}

function storageBackend(): { kind: 'blob'; token: string } | { kind: 'disk'; directory: string } {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (process.env.VERCEL === '1') {
    if (!token) throw new Error('VERCEL_BLOB_TOKEN_REQUIRED');
    return { kind: 'blob', token };
  }
  if (process.env.NODE_ENV === 'production') {
    return { kind: 'disk', directory: uploadsDirectory() };
  }
  if (token) return { kind: 'blob', token };
  return { kind: 'disk', directory: uploadsDirectory() };
}

export function getMaxVideoUploadBytes() {
  return process.env.VERCEL === '1' ? VERCEL_VIDEO_LIMIT : OTHER_VIDEO_LIMIT;
}

export function getMaxImageUploadBytes() {
  return process.env.VERCEL === '1' ? VERCEL_IMAGE_LIMIT : OTHER_IMAGE_LIMIT;
}

function detectImageMimeType(
  data: Buffer,
  declaredMimeType: string,
): UploadedImageMimeType | null {
  if (!data.length || data.length > getMaxImageUploadBytes()) return null;
  let detected: UploadedImageMimeType | null = null;
  if (
    data.length >= 8 &&
    data.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    detected = 'image/png';
  } else if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    detected = 'image/jpeg';
  } else if (
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP'
  ) {
    detected = 'image/webp';
  }
  return detected === declaredMimeType ? detected : null;
}

export function getVideoMimeTypeFromSignature(data: Buffer): VideoMimeType | null {
  if (data.length >= 12 && data.toString('ascii', 4, 8) === 'ftyp') {
    return 'video/mp4';
  }
  if (data.length >= 4 && data.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) {
    return 'video/webm';
  }
  return null;
}

export function validateVideoUpload(
  filename: string,
  declaredMimeType: string,
  data: Buffer,
): { contentType: VideoMimeType; extension: 'mp4' | 'webm' } | null {
  if (!data.length || data.length > getMaxVideoUploadBytes()) return null;
  const fileExtension = path.extname(filename).slice(1).toLowerCase();
  const contentType = getVideoMimeTypeFromSignature(data);
  if (!contentType || contentType !== declaredMimeType.toLowerCase()) return null;
  const extension = contentType === 'video/mp4' ? 'mp4' : 'webm';
  return fileExtension === extension ? { contentType, extension } : null;
}

function parseMediaUrl(url: string) {
  const match = mediaUrlPattern.exec(url);
  if (!match) return null;
  const extension = url.split('.').at(-1)?.toLowerCase() ?? '';
  return {
    filename: `${match[1].toLowerCase()}.${extension}`,
    contentType: mediaTypesByExtension[extension],
  };
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = Buffer.from(value);
    chunks.push(chunk);
    total += chunk.byteLength;
  }
  return Buffer.concat(chunks, total);
}

export async function saveUploadedMedia(
  contentType: MediaMimeType,
  data: Buffer,
): Promise<string> {
  if (contentType.startsWith('video/')) {
    const expected = contentType as VideoMimeType;
    if (
      data.length > getMaxVideoUploadBytes() ||
      getVideoMimeTypeFromSignature(data) !== expected
    ) {
      throw new Error('INVALID_VIDEO_CONTENT');
    }
  } else if (detectImageMimeType(data, contentType) !== contentType) {
    throw new Error('INVALID_IMAGE_CONTENT');
  }

  const id = randomUUID();
  const filename = `${id}.${extensions[contentType]}`;
  const storage = storageBackend();
  if (storage.kind === 'blob') {
    await put(`uploads/${filename}`, data, {
      access: 'public',
      token: storage.token,
      addRandomSuffix: false,
      multipart: data.byteLength > 4 * 1024 * 1024,
      contentType,
    });
  } else {
    await mkdir(storage.directory, { recursive: true });
    await writeFile(path.join(storage.directory, filename), data, {
      flag: 'wx',
      mode: 0o640,
    });
  }
  return `/uploads/${filename}`;
}

export async function saveUploadedVideo(
  contentType: VideoMimeType,
  data: Buffer,
): Promise<string> {
  return saveUploadedMedia(contentType, data);
}

export async function readMediaFile(
  url: string,
  range?: { start: number; end: number },
): Promise<{ contentType: MediaMimeType; data: Buffer; size: number } | null> {
  const parsed = parseMediaUrl(url);
  if (!parsed) return null;
  const storage = storageBackend();
  if (storage.kind === 'blob') {
    const pathname = `uploads/${parsed.filename}`;
    let metadata;
    try {
      metadata = await head(pathname, { token: storage.token });
    } catch (error) {
      if (error instanceof Error && /not found/i.test(error.message)) return null;
      throw error;
    }
    const boundedRange =
      range && metadata.size > 0
        ? { start: range.start, end: Math.min(range.end, metadata.size - 1) }
        : undefined;
    const result = await get(pathname, {
      access: 'public',
      token: storage.token,
      ...(boundedRange
        ? { headers: { Range: `bytes=${boundedRange.start}-${boundedRange.end}` } }
        : {}),
    });
    if (!result || result.statusCode !== 200) return null;
    let data = await streamToBuffer(result.stream);
    if (boundedRange && data.byteLength !== boundedRange.end - boundedRange.start + 1) {
      if (data.byteLength < boundedRange.end + 1) {
        throw new Error('BLOB_RANGE_READ_FAILED');
      }
      data = data.subarray(boundedRange.start, boundedRange.end + 1);
    }
    return {
      contentType: parsed.contentType,
      data,
      size: metadata.size,
    };
  }

  const filePath = path.join(storage.directory, parsed.filename);
  try {
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) return null;
    if (!range) {
      return {
        contentType: parsed.contentType,
        data: await readFile(filePath),
        size: fileInfo.size,
      };
    }
    const start = range.start;
    const end = Math.min(range.end, fileInfo.size - 1);
    if (start < 0 || start >= fileInfo.size || end < start) {
      return { contentType: parsed.contentType, data: Buffer.alloc(0), size: fileInfo.size };
    }
    const data = Buffer.alloc(end - start + 1);
    const file = await open(filePath, 'r');
    try {
      await file.read(data, 0, data.byteLength, start);
    } finally {
      await file.close();
    }
    return { contentType: parsed.contentType, data, size: fileInfo.size };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function getMediaFileSize(url: string): Promise<number | null> {
  const parsed = parseMediaUrl(url);
  if (!parsed) return null;
  const storage = storageBackend();
  if (storage.kind === 'blob') {
    try {
      const metadata = await head(`uploads/${parsed.filename}`, {
        token: storage.token,
      });
      return metadata.size;
    } catch (error) {
      if (error instanceof Error && /not found/i.test(error.message)) return null;
      throw error;
    }
  }
  try {
    const fileInfo = await stat(path.join(storage.directory, parsed.filename));
    return fileInfo.isFile() ? fileInfo.size : null;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function readVideoFile(
  url: string,
  range?: { start: number; end: number },
): Promise<{ contentType: VideoMimeType; data: Buffer; size: number } | null> {
  const parsed = parseMediaUrl(url);
  if (!parsed || !parsed.contentType.startsWith('video/')) return null;
  return (await readMediaFile(url, range)) as {
    contentType: VideoMimeType;
    data: Buffer;
    size: number;
  } | null;
}

export async function removeMediaFile(url: string): Promise<void> {
  const parsed = parseMediaUrl(url);
  if (!parsed) return;
  const storage = storageBackend();
  if (storage.kind === 'blob') {
    await del(`uploads/${parsed.filename}`, { token: storage.token });
  } else {
    await rm(path.join(storage.directory, parsed.filename), { force: true });
  }
}

export async function isValidVideoReference(
  _store: VideoReferenceStore,
  url: string | null | undefined,
  unchanged: readonly (string | null | undefined)[] = [],
): Promise<boolean> {
  if (!url) return true;
  if (unchanged.includes(url)) return true;
  if (!videoAssetUrlSchema.safeParse(url).success) return false;
  return (await getMediaFileSize(url)) !== null;
}

export async function isValidUploadedLogoReference(
  url: string | null | undefined,
  unchanged: readonly (string | null | undefined)[] = [],
): Promise<boolean> {
  if (!url) return true;
  if (unchanged.includes(url)) return true;
  if (!uploadedLogoUrlSchema.safeParse(url).success) return false;
  return (await getMediaFileSize(url)) !== null;
}

export async function deleteUnreferencedMedia(
  store: VideoReferenceStore,
  url: string | null | undefined,
): Promise<void> {
  if (!url || !mediaUrlPattern.test(url)) return;
  const [article, product, branding] = await Promise.all([
    store.newsArticle.findFirst({
      where: { OR: [{ uploadedVideoUrl: url }, { videoUrl: url }] },
      select: { id: true },
    }),
    store.shopProduct.findFirst({
      where: { uploadedVideoUrl: url },
      select: { id: true },
    }),
    store.siteBranding.findFirst({
      where: { logoUrl: url },
      select: { id: true },
    }),
  ]);
  if (article || product || branding) return;
  await removeMediaFile(url);
}

export function parseByteRange(
  header: string | undefined,
  size: number,
): { start: number; end: number } | 'invalid' | null {
  if (header === undefined) return null;
  if (!Number.isSafeInteger(size) || size <= 0) return 'invalid';
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return 'invalid';
  const startValue = match[1] ? Number(match[1]) : null;
  const endValue = match[2] ? Number(match[2]) : null;
  if (startValue === null) {
    if (!endValue || !Number.isSafeInteger(endValue)) return 'invalid';
    const start = Math.max(size - endValue, 0);
    return { start, end: size - 1 };
  }
  if (!Number.isSafeInteger(startValue) || startValue >= size) return 'invalid';
  const end = endValue === null ? size - 1 : Number(endValue);
  if (!Number.isSafeInteger(end) || end < startValue) return 'invalid';
  return { start: startValue, end: Math.min(end, size - 1) };
}
