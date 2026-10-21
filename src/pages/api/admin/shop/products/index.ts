import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeShopManager } from '@/lib/auth';
import { shopProductInputSchema } from '@/lib/shop';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeShopManager(req, res))) return;
  const db = await getPrisma();

  if (req.method === 'GET') {
    try {
      const products = await db.shopProduct.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { variants: { orderBy: { sku: 'asc' } } },
      });
      return res.status(200).json({ products });
    } catch (error) {
      console.error('Shop product management listing error:', error);
      return res.status(500).json({ message: 'خطا در دریافت محصولات' });
    }
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
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
    const created = await db.shopProduct.create({
      data: {
        ...product,
        variants: {
          create: variants.map((variant) => ({
            ...variant,
            isActive: variant.isActive ?? true,
          })),
        },
      },
      include: { variants: true },
    });
    return res.status(201).json({ product: created });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({ message: 'نشانی محصول یا SKU تکراری است' });
    }
    console.error('Shop product creation error:', error);
    return res.status(500).json({ message: 'خطا در ایجاد محصول' });
  }
}
