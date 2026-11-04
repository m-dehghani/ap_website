import { getPrisma } from '@/lib/db';
import {
  detectImageMimeType,
  imageAssetUrlFromLegacyId,
  MAX_IMAGE_BYTES,
  writeImageFile,
} from '@/lib/uploads';

type Database = Awaited<ReturnType<typeof getPrisma>>;
type LegacyImageAsset = {
  id: string;
  contentType: string;
  data: Uint8Array;
};

export async function migrateImageAssetsToDisk(db: Database): Promise<number> {
  const [table] = await db.$queryRaw<Array<{ exists: boolean }>>`
    SELECT to_regclass('public.image_assets') IS NOT NULL AS "exists"
  `;
  if (!table?.exists) return 0;

  const assets = await db.$queryRaw<LegacyImageAsset[]>`
    SELECT "id", "contentType", "data" FROM "image_assets" ORDER BY "id"
  `;

  for (const asset of assets) {
    const data = Buffer.from(asset.data);
    if (data.byteLength > MAX_IMAGE_BYTES) {
      throw new Error(`Image asset ${asset.id} exceeds the 5 MiB limit`);
    }
    const contentType = detectImageMimeType(data, asset.contentType);
    if (!contentType) {
      throw new Error(`Image asset ${asset.id} has invalid image data`);
    }

    const oldUrl = `/api/uploads/${asset.id}`;
    const newUrl = imageAssetUrlFromLegacyId(asset.id, contentType);
    await writeImageFile(asset.id, contentType, data);

    await db.$transaction(async (tx) => {
      await Promise.all([
        tx.user.updateMany({
          where: { image: oldUrl },
          data: { image: newUrl },
        }),
        tx.coach.updateMany({
          where: { image: oldUrl },
          data: { image: newUrl },
        }),
        tx.successStory.updateMany({
          where: { image: oldUrl },
          data: { image: newUrl },
        }),
        tx.testimonial.updateMany({
          where: { image: oldUrl },
          data: { image: newUrl },
        }),
        tx.newsArticle.updateMany({
          where: { image: oldUrl },
          data: { image: newUrl },
        }),
      ]);

      const products = await tx.shopProduct.findMany({
        where: { images: { has: oldUrl } },
        select: { id: true, images: true },
      });
      for (const product of products) {
        await tx.shopProduct.update({
          where: { id: product.id },
          data: {
            images: product.images.map((image) =>
              image === oldUrl ? newUrl : image,
            ),
          },
        });
      }

      await tx.$executeRaw`
        DELETE FROM "image_assets" WHERE "id" = ${asset.id}
      `;
    });
  }

  return assets.length;
}
