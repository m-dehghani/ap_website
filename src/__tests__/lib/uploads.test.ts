// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import {
  areValidImageReferences,
  deleteUnreferencedImage,
  MAX_IMAGE_BYTES,
  detectImageMimeType,
  isValidImageReference,
} from '@/lib/uploads';

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

describe('uploaded image validation', () => {
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

  it('accepts only persisted app references for new CMS media, retaining unchanged legacy URLs', async () => {
    const store = {
      imageAsset: { findUnique: vi.fn().mockResolvedValue({ id: 'asset' }) },
    } as never;

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
    await expect(
      isValidImageReference(
        store,
        '/api/uploads/550e8400-e29b-41d4-a716-446655440000',
      ),
    ).resolves.toBe(true);
  });

  it('deletes a replaced asset only after all profile and CMS references are gone', async () => {
    const image = '/api/uploads/550e8400-e29b-41d4-a716-446655440000';
    const findFirst = vi.fn().mockResolvedValue(null);
    const deleteMany = vi.fn();
    const store = {
      user: { findFirst },
      coach: { findFirst },
      successStory: { findFirst },
      testimonial: { findFirst },
      newsArticle: { findFirst },
      shopProduct: { findFirst },
      imageAsset: { deleteMany },
    } as never;

    await deleteUnreferencedImage(store, image);
    expect(deleteMany).toHaveBeenCalledWith({
      where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });

    findFirst.mockResolvedValueOnce({ id: 'other-record' });
    await deleteUnreferencedImage(store, image);
    expect(deleteMany).toHaveBeenCalledTimes(1);
  });

  it('validates every product image reference instead of allowing an arbitrary URL', async () => {
    const store = {
      imageAsset: {
        findUnique: vi.fn().mockResolvedValueOnce({ id: 'asset' }),
      },
    } as never;

    await expect(
      areValidImageReferences(store, [
        '/api/uploads/550e8400-e29b-41d4-a716-446655440000',
        'https://external.example/photo.jpg',
      ]),
    ).resolves.toBe(false);
  });
});
