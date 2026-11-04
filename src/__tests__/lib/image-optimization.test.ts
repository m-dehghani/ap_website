import { describe, expect, it } from 'vitest';
import { imageOptimizationProps } from '@/lib/image-optimization';

describe('image optimization source policy', () => {
  it('lets Next optimize same-origin uploads and configured remote image hosts', () => {
    expect(imageOptimizationProps('/api/uploads/academy.webp')).toEqual({});
    expect(
      imageOptimizationProps('https://images.unsplash.com/photo.webp'),
    ).toEqual({});
    expect(
      imageOptimizationProps('https://res.cloudinary.com/academy/image.webp'),
    ).toEqual({});
  });

  it('keeps unsupported remote hosts on the existing unoptimized path', () => {
    expect(
      imageOptimizationProps('https://legacy-cdn.example/image.webp'),
    ).toEqual({ unoptimized: true });
  });
});
