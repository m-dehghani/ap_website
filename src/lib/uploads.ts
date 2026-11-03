import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const imageUploadScopeSchema = z.enum([
  'profile',
  'success-story',
  'testimonial',
  'coach',
  'staff-member',
  'news-article',
  'shop-product',
]);

export type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

const imageExtensions: Record<ImageMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const imageMimeTypesByExtension: Record<string, ImageMimeType> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};
const imageAssetUrlPattern =
  /^\/api\/uploads\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.(jpg|png|webp)$/i;
export const imageAssetUrlSchema = z
  .string()
  .regex(imageAssetUrlPattern, 'نشانی تصویر بارگذاری‌شده معتبر نیست');

type ImageStore = Pick<
  Awaited<ReturnType<typeof getPrisma>>,
  | 'user'
  | 'coach'
  | 'staffMember'
  | 'successStory'
  | 'testimonial'
  | 'newsArticle'
  | 'shopProduct'
>;

function getUploadsDirectory() {
  return path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'));
}

function getImageFilename(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = imageAssetUrlPattern.exec(url);
  return match ? `${match[1]}.${match[2].toLowerCase()}` : null;
}

export function getImageMimeTypeFromUrl(
  url: string | null | undefined,
): ImageMimeType | null {
  const filename = getImageFilename(url);
  if (!filename) return null;
  return imageMimeTypesByExtension[path.extname(filename).slice(1)] ?? null;
}

export function detectImageMimeType(
  data: Buffer,
  declaredMimeType: string,
): ImageMimeType | null {
  if (!data.length || data.length > MAX_IMAGE_BYTES) return null;

  let detected: ImageMimeType | null = null;
  if (
    data.length >= 8 &&
    data.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    detected = 'image/png';
  } else if (
    data.length >= 3 &&
    data[0] === 0xff &&
    data[1] === 0xd8 &&
    data[2] === 0xff
  ) {
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

export async function writeImageFile(
  id: string,
  contentType: ImageMimeType,
  data: Uint8Array,
): Promise<string> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('INVALID_IMAGE_ID');
  }
  if (data.byteLength === 0 || data.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('INVALID_IMAGE_SIZE');
  }

  const filename = `${id}.${imageExtensions[contentType]}`;
  const filePath = path.join(getUploadsDirectory(), filename);
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    await writeFile(filePath, data, { flag: 'wx', mode: 0o640 });
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) {
      throw error;
    }
    const existing = await readFile(filePath);
    if (!existing.equals(Buffer.from(data))) {
      throw new Error('IMAGE_FILE_ALREADY_EXISTS');
    }
  }

  return `/api/uploads/${filename}`;
}

export async function saveUploadedImage(
  contentType: ImageMimeType,
  data: Uint8Array,
): Promise<string> {
  return writeImageFile(randomUUID(), contentType, data);
}

export async function readImageFile(
  url: string,
): Promise<{ contentType: ImageMimeType; data: Buffer } | null> {
  const filename = getImageFilename(url);
  const contentType = getImageMimeTypeFromUrl(url);
  if (!filename || !contentType) return null;

  try {
    return {
      contentType,
      data: await readFile(path.join(getUploadsDirectory(), filename)),
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function removeImageFile(url: string): Promise<void> {
  const filename = getImageFilename(url);
  if (filename) {
    await rm(path.join(getUploadsDirectory(), filename), { force: true });
  }
}

export async function clearStoredImageFiles(): Promise<void> {
  const directory = getUploadsDirectory();
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  const storedImageFilename =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i;
  await Promise.all(
    entries
      .filter(
        (entry) => entry.isFile() && storedImageFilename.test(entry.name),
      )
      .map((entry) => rm(path.join(directory, entry.name))),
  );
}

export function imageAssetUrlFromLegacyId(
  id: string,
  contentType: string,
): string {
  const extension = Object.entries(imageExtensions).find(
    ([mimeType]) => mimeType === contentType,
  )?.[1];
  if (!extension) {
    throw new Error('UNSUPPORTED_IMAGE_CONTENT_TYPE');
  }
  return `/api/uploads/${id}.${extension}`;
}

export async function isValidImageReference(
  _store: ImageStore,
  image: string | null | undefined,
  unchanged: readonly (string | null | undefined)[] = [],
): Promise<boolean> {
  if (!image) return true;
  if (unchanged.includes(image)) return true;
  if (!imageAssetUrlSchema.safeParse(image).success) return false;
  return (await readImageFile(image)) !== null;
}

export async function areValidImageReferences(
  store: ImageStore,
  images: readonly string[],
  unchanged: readonly (string | null | undefined)[] = [],
): Promise<boolean> {
  for (const image of images) {
    if (!(await isValidImageReference(store, image, unchanged))) return false;
  }
  return true;
}

export async function deleteUnreferencedImage(
  store: ImageStore,
  image: string | null | undefined,
): Promise<void> {
  if (!image || !getImageFilename(image)) return;

  const [user, coach, staff, story, testimonial, article, product] =
    await Promise.all([
      store.user.findFirst({ where: { image }, select: { id: true } }),
      store.coach.findFirst({ where: { image }, select: { id: true } }),
      store.staffMember.findFirst({ where: { image }, select: { id: true } }),
      store.successStory.findFirst({ where: { image }, select: { id: true } }),
      store.testimonial.findFirst({ where: { image }, select: { id: true } }),
      store.newsArticle.findFirst({ where: { image }, select: { id: true } }),
      store.shopProduct.findFirst({
        where: { images: { has: image } },
        select: { id: true },
      }),
    ]);
  if (user || coach || staff || story || testimonial || article || product) return;

  await removeImageFile(image);
}
