// @vitest-environment node

import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const { mockPut, mockDel, mockList, mockFetch } = vi.hoisted(() => ({
  mockPut: vi.fn(),
  mockDel: vi.fn(),
  mockList: vi.fn(),
  mockFetch: vi.fn(),
}));
vi.mock('@vercel/blob', () => ({
  put: mockPut,
  del: mockDel,
  list: mockList,
}));
vi.stubGlobal('fetch', mockFetch);

import {
  areValidImageReferences,
  clearStoredImageFiles,
  deleteUnreferencedImage,
  MAX_IMAGE_BYTES,
  detectImageMimeType,
  isValidImageReference,
  readImageFile,
  removeImageFile,
  saveUploadedImage,
} from '@/lib/uploads';

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

describe('uploaded image storage', () => {
  let directory: string;

  beforeEach(async () => {
    vi.resetAllMocks();
    directory = await mkdtemp(path.join(os.tmpdir(), 'ap-uploads-'));
    vi.stubEnv('UPLOADS_DIR', directory);
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    vi.stubEnv('BLOB_STORE_ID', '');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(directory, { recursive: true, force: true });
  });

  it('accepts supported formats only when the declared MIME matches the signature', () => {
    expect(detectImageMimeType(png, 'image/png')).toBe('image/png');
    expect(detectImageMimeType(png, 'image/jpeg')).toBeNull();
    expect(detectImageMimeType(Buffer.from('<svg></svg>'), 'image/svg+xml')).toBeNull();
  });

  it('rejects empty images and files over the documented 5 MiB limit', () => {
    expect(MAX_IMAGE_BYTES).toBe(5 * 1024 * 1024);
    expect(detectImageMimeType(Buffer.alloc(0), 'image/png')).toBeNull();
    expect(
      detectImageMimeType(Buffer.concat([png, Buffer.alloc(MAX_IMAGE_BYTES)]), 'image/png'),
    ).toBeNull();
  });

  it('writes image bytes to disk and reads them using the stored application path', async () => {
    const url = await saveUploadedImage('image/png', png);

    expect(url).toMatch(
      /^\/api\/uploads\/[a-f0-9-]+\.png$/,
    );
    const stored = await readImageFile(url);
    expect(stored).toEqual({ contentType: 'image/png', data: png });
    expect(await readFile(path.join(directory, url.split('/').at(-1)!))).toEqual(png);
  });

  it('rejects unsafe filenames instead of resolving outside the upload directory', async () => {
    await expect(readImageFile('/api/uploads/../secret.png')).resolves.toBeNull();
  });

  it('clears only app-managed image files when resetting seeded data', async () => {
    await saveUploadedImage('image/png', png);
    await writeFile(path.join(directory, 'keep.txt'), 'preserve');

    await clearStoredImageFiles();

    await expect(readdir(directory)).resolves.toEqual(['keep.txt']);
  });

  it('accepts only persisted app references for new CMS media, retaining unchanged legacy URLs', async () => {
    const store = {} as never;
    const url = await saveUploadedImage('image/png', png);

    await expect(
      isValidImageReference(store, 'https://external.example/photo.jpg'),
    ).resolves.toBe(false);
    await expect(
      isValidImageReference(
        store,
        'https://external.example/photo.jpg',
        ['https://external.example/photo.jpg'],
      ),
    ).resolves.toBe(true);
    await expect(isValidImageReference(store, url)).resolves.toBe(true);
  });

  it('deletes a replaced file only after all profile and CMS references are gone', async () => {
    const image = await saveUploadedImage('image/png', png);
    const findFirst = vi.fn().mockResolvedValue(null);
    const store = {
      user: { findFirst },
      coach: { findFirst },
      staffMember: { findFirst },
      successStory: { findFirst },
      testimonial: { findFirst },
      newsArticle: { findFirst },
      shopProduct: { findFirst },
    } as never;

    await deleteUnreferencedImage(store, image);
    await expect(readImageFile(image)).resolves.toBeNull();

    const retainedImage = await saveUploadedImage('image/png', png);
    findFirst.mockResolvedValueOnce({ id: 'other-record' });
    await deleteUnreferencedImage(store, retainedImage);
    await expect(readImageFile(retainedImage)).resolves.not.toBeNull();
  });

  it('validates every product image reference instead of allowing an arbitrary URL', async () => {
    const store = {} as never;
    const validUrl = await saveUploadedImage('image/png', png);

    await expect(
      areValidImageReferences(store, [
        validUrl,
        'https://external.example/photo.jpg',
      ]),
    ).resolves.toBe(false);
    await expect(areValidImageReferences(store, [validUrl])).resolves.toBe(true);
  });

  it('writes and reads images using configured Vercel Blob storage', async () => {
      vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'vercel_blob_rw_test');
      vi.stubEnv('BLOB_STORE_ID', 'store_test');
      mockPut.mockResolvedValueOnce({ url: 'https://store_test.public.blob.vercel-storage.com/uploads/test.png' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => png,
      });

      const url = await saveUploadedImage('image/png', png);
      const [filename] = url.split('/').slice(-1);
      const stored = await readImageFile(url);

      expect(mockPut).toHaveBeenCalledWith(
        filename,
        png,
        expect.objectContaining({
          access: 'public',
          token: 'vercel_blob_rw_test',
          addRandomSuffix: false,
        }),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        `https://store_test.public.blob.vercel-storage.com/${filename}`,
      );
      expect(stored).toEqual({ contentType: 'image/png', data: png });
    });

    it('returns missing Blob images as not found but surfaces other storage errors', async () => {
      vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'vercel_blob_rw_test');
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
      await expect(
        readImageFile('/api/uploads/550e8400-e29b-41d4-a716-446655440000.png'),
      ).resolves.toBeNull();

      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(
        readImageFile('/api/uploads/550e8400-e29b-41d4-a716-446655440000.png'),
      ).rejects.toThrow('BLOB_FETCH_FAILED: 500');
    });

    it('deletes only managed Blob images under the configured prefix', async () => {
      vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'vercel_blob_rw_test');
      mockDel.mockResolvedValueOnce(undefined);
      mockList.mockResolvedValueOnce({
        blobs: [
          { url: 'https://blob.vercel-storage.com/uploads/550e8400-e29b-41d4-a716-446655440000.png' },
          { url: 'https://blob.vercel-storage.com/uploads/keep.txt' },
          { url: 'https://blob.vercel-storage.com/other/660e8400-e29b-41d4-a716-446655440000.png' },
        ],
        cursor: undefined,
      });
      mockDel.mockResolvedValueOnce(undefined);

      await removeImageFile(
        '/api/uploads/550e8400-e29b-41d4-a716-446655440000.png',
      );
      await clearStoredImageFiles();

      expect(mockDel).toHaveBeenNthCalledWith(
        1,
        'https://blob.vercel-storage.com/550e8400-e29b-41d4-a716-446655440000.png',
        { token: 'vercel_blob_rw_test' },
      );
      expect(mockList).toHaveBeenCalledWith(
        expect.objectContaining({ prefix: 'uploads/', token: 'vercel_blob_rw_test' }),
      );
      expect(mockDel).toHaveBeenNthCalledWith(
        2,
        ['https://blob.vercel-storage.com/uploads/550e8400-e29b-41d4-a716-446655440000.png'],
        { token: 'vercel_blob_rw_test' },
      );
    });
  });
