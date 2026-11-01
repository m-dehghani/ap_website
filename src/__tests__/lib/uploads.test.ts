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
import {
  areValidImageReferences,
  clearStoredImageFiles,
  deleteUnreferencedImage,
  MAX_IMAGE_BYTES,
  detectImageMimeType,
  isValidImageReference,
  readImageFile,
  saveUploadedImage,
} from '@/lib/uploads';

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

describe('uploaded image storage', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'ap-uploads-'));
    vi.stubEnv('UPLOADS_DIR', directory);
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
});
