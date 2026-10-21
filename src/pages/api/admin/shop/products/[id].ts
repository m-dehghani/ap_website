import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeShopManager } from '@/lib/auth';
import { shopProductInputSchema } from '@/lib/shop';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeShopManager(req, res))) return;
  const id = typeof req.query.id === 'string' ? req.query.id : '';
  if (!id) return res.status(400).json({ message: 'شناسه محصول معتبر نیست' });
  const db = await getPrisma();

  if (req.method === 'DELETE') {
    try {
      const result = await db.shopProduct.updateMany({
        where: { id },
        data: { isActive: false, featured: false },
      });
      if (!result.count) return res.status(404).json({ message: 'محصول یافت نشد' });
      return res.status(200).json({ message: 'محصول از فروشگاه پنهان شد' });
    } catch (error) {
      console.error(`Shop product ${id} deactivation error:`, error);
      return res.status(500).json({ message: 'خطا در غیرفعال‌سازی محصول' });
    }
  }
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const parsed = shopProductInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'اطلاعات محصول معتبر نیست',
      errors: parsed.error.issues.map(({ path, message }) => ({
        field: path.join('.'),
        message,
      })),
    });
  }
  const { variants, ...product } = parsed.data;
  try {
    const updated = await db.$transaction(async (tx) => {
      const current = await tx.shopProduct.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!current) return null;

      const foreignSku = await tx.shopVariant.findFirst({
        where: {
          sku: { in: variants.map(({ sku }) => sku) },
          productId: { not: id },
        },
        select: { sku: true },
      });
      if (foreignSku) throw new Error('SKU_CONFLICT');
      const belowReservations = await tx.shopVariant.findFirst({
        where: {
          sku: { in: variants.map(({ sku }) => sku) },
          reserved: { gt: 0 },
        },
        select: { sku: true, reserved: true },
      });
      if (
        belowReservations &&
        variants.some(
          (variant) =>
            variant.sku === belowReservations.sku &&
            variant.stock < belowReservations.reserved,
        )
      ) {
        throw new Error('STOCK_BELOW_RESERVATION');
      }

      const saved = await tx.shopProduct.update({
        where: { id },
        data: product,
      });
      const submittedSkus = variants.map(({ sku }) => sku);
      await tx.shopVariant.updateMany({
        where: { productId: id, sku: { notIn: submittedSkus } },
        data: { isActive: false },
      });
      for (const variant of variants) {
        await tx.shopVariant.upsert({
          where: { sku: variant.sku },
          create: {
            ...variant,
            isActive: variant.isActive ?? true,
            productId: id,
          },
          update: {
            size: variant.size,
            color: variant.color,
            priceOverride: variant.priceOverride,
            stock: variant.stock,
            isActive: variant.isActive ?? true,
          },
        });
      }
      return saved;
    });
    if (!updated) return res.status(404).json({ message: 'محصول یافت نشد' });
    const result = await db.shopProduct.findUnique({
      where: { id },
      include: { variants: { orderBy: { sku: 'asc' } } },
    });
    return res.status(200).json({ product: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'SKU_CONFLICT') {
      return res.status(409).json({ message: 'این SKU برای محصول دیگری ثبت شده است' });
    }
    if (error instanceof Error && error.message === 'STOCK_BELOW_RESERVATION') {
      return res.status(409).json({
        message: 'موجودی نمی‌تواند از تعداد رزروشده برای پرداخت‌های درحال انجام کمتر باشد',
      });
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({ message: 'نشانی محصول یا SKU تکراری است' });
    }
    console.error(`Shop product ${id} update error:`, error);
    return res.status(500).json({ message: 'خطا در ویرایش محصول' });
  }
}
