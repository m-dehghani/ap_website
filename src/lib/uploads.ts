import { z } from 'zod';
import { getPrisma } from '@/lib/db';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const imageUploadScopeSchema = z.enum([
  'profile',
  'success-story',
  'testimonial',
  'coach',
  'news-article',
  'shop-product',
]);

const imageAssetUrlPattern =
  /^\/api\/uploads\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
export const imageAssetUrlSchema = z
  .string()
  .regex(imageAssetUrlPattern, 'نشانی تصویر بارگذاری‌شده معتبر نیست');

type ImageStore = Pick<
  Awaited<ReturnType<typeof getPrisma>>,
  | 'imageAsset'
  | 'user'
  | 'coach'
  | 'successStory'
  | 'testimonial'
  | 'newsArticle'
  | 'shopProduct'
>;

export function detectImageMimeType(
  data: Buffer,
  declaredMimeType: string,
): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (!data.length || data.length > MAX_IMAGE_BYTES) return null;

  let detected: 'image/jpeg' | 'image/png' | 'image/webp' | null = null;
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

export function imageAssetIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return imageAssetUrlPattern.exec(url)?.[1] ?? null;
}

export async function isValidImageReference(
  store: ImageStore,
  image: string | null | undefined,
  unchanged: readonly (string | null | undefined)[] = [],
): Promise<boolean> {
  if (!image) return true;
  if (unchanged.includes(image)) return true;
  const id = imageAssetIdFromUrl(image);
  if (!id) return false;
  return Boolean(
    await store.imageAsset.findUnique({
      where: { id },
      select: { id: true },
    }),
  );
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
  const id = imageAssetIdFromUrl(image);
  if (!id || !image) return;

  const [user, coach, story, testimonial, article, product] = await Promise.all([
    store.user.findFirst({ where: { image }, select: { id: true } }),
    store.coach.findFirst({ where: { image }, select: { id: true } }),
    store.successStory.findFirst({ where: { image }, select: { id: true } }),
    store.testimonial.findFirst({ where: { image }, select: { id: true } }),
    store.newsArticle.findFirst({ where: { image }, select: { id: true } }),
    store.shopProduct.findFirst({
      where: { images: { has: image } },
      select: { id: true },
    }),
  ]);
  if (user || coach || story || testimonial || article || product) return;

  await store.imageAsset.deleteMany({ where: { id } });
}
