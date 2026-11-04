// @vitest-environment node

import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { migrateImageAssetsToDisk } from '@/lib/migrate-image-assets';
import { readImageFile } from '@/lib/uploads';

const imageId = '550e8400-e29b-41d4-a716-446655440000';
const legacyUrl = `/api/uploads/${imageId}`;
const imageBytes = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

describe('legacy image asset migration', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'ap-image-migration-'));
    vi.stubEnv('UPLOADS_DIR', directory);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(directory, { recursive: true, force: true });
  });

  it('copies image bytes to disk and updates profile, CMS, and product references before deleting the row', async () => {
    const tx = {
      user: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      coach: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
      successStory: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
      testimonial: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      newsArticle: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
      shopProduct: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'product-1', images: [legacyUrl, '/legacy.jpg'] },
        ]),
        update: vi.fn().mockResolvedValue({}),
      },
      $executeRaw: vi.fn().mockResolvedValue(1),
    };
    const db = {
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([{ exists: true }])
        .mockResolvedValueOnce([
          { id: imageId, contentType: 'image/png', data: imageBytes },
        ]),
      $transaction: vi.fn((callback) => callback(tx)),
    } as never;

    await expect(migrateImageAssetsToDisk(db)).resolves.toBe(1);

    const migratedUrl = `/api/uploads/${imageId}.png`;
    await expect(readImageFile(migratedUrl)).resolves.toEqual({
      contentType: 'image/png',
      data: Buffer.from(imageBytes),
    });
    expect(tx.user.updateMany).toHaveBeenCalledWith({
      where: { image: legacyUrl },
      data: { image: migratedUrl },
    });
    expect(tx.testimonial.updateMany).toHaveBeenCalledWith({
      where: { image: legacyUrl },
      data: { image: migratedUrl },
    });
    expect(tx.shopProduct.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { images: [migratedUrl, '/legacy.jpg'] },
    });
    expect(tx.$executeRaw).toHaveBeenCalledOnce();
  });

  it('does not silently migrate invalid image data', async () => {
    const db = {
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([{ exists: true }])
        .mockResolvedValueOnce([
          { id: imageId, contentType: 'image/png', data: Buffer.from('not image') },
        ]),
    } as never;

    await expect(migrateImageAssetsToDisk(db)).rejects.toThrow(
      `Image asset ${imageId} has invalid image data`,
    );
  });

  it('does not require migration when the legacy table is absent', async () => {
    const db = {
      $queryRaw: vi.fn().mockResolvedValue([{ exists: false }]),
    } as never;

    await expect(migrateImageAssetsToDisk(db)).resolves.toBe(0);
    expect(db.$queryRaw).toHaveBeenCalledOnce();
  });
});
