import type { NextApiRequest, NextApiResponse } from 'next';
import { authorizeStudent } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { shopReviewInputSchema } from '@/lib/shop';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const userId = await authorizeStudent(req, res);
  if (!userId) return;
  const parsed = shopReviewInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'متن یا امتیاز دیدگاه معتبر نیست',
      errors: parsed.error.issues.map(({ path, message }) => ({
        field: path.join('.'),
        message,
      })),
    });
  }

  const { productId, orderNumber, rating, body, mediaUrls } = parsed.data;
  try {
    const db = await getPrisma();
    const order = await db.shopOrder.findFirst({
      where: {
        orderNumber,
        userId,
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        items: { some: { productId } },
      },
      select: { id: true },
    });
    if (!order) {
      return res.status(403).json({
        message: 'برای ثبت دیدگاه، باید با حساب خریدار وارد شوید و محصول را خریده باشید',
      });
    }
    const review = await db.shopReview.create({
      data: { productId, userId, orderId: order.id, rating, body, mediaUrls },
      select: { id: true, rating: true, body: true, isPublished: true },
    });
    return res.status(201).json({
      review,
      message: 'دیدگاه شما پس از بررسی منتشر خواهد شد',
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({ message: 'برای این سفارش قبلاً دیدگاه ثبت کرده‌اید' });
    }
    console.error('Shop review creation error:', error);
    return res.status(500).json({ message: 'خطا در ثبت دیدگاه' });
  }
}
