import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authorizeShopManager } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

const moderationSchema = z.object({
  id: z.string().min(1),
  isPublished: z.boolean(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeShopManager(req, res))) return;
  const db = await getPrisma();
  if (req.method === 'GET') {
    try {
      const reviews = await db.shopReview.findMany({
        orderBy: [{ isPublished: 'asc' }, { createdAt: 'desc' }],
        take: 100,
        include: {
          product: { select: { name: true, slug: true } },
          user: { select: { firstName: true, lastName: true } },
        },
      });
      return res.status(200).json({ reviews });
    } catch (error) {
      console.error('Shop review moderation listing error:', error);
      return res.status(500).json({ message: 'خطا در دریافت دیدگاه‌ها' });
    }
  }
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const parsed = moderationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'وضعیت دیدگاه معتبر نیست' });
  }
  try {
    const result = await db.shopReview.updateMany({
      where: { id: parsed.data.id },
      data: { isPublished: parsed.data.isPublished },
    });
    if (!result.count) return res.status(404).json({ message: 'دیدگاه یافت نشد' });
    return res.status(200).json({ message: 'وضعیت دیدگاه تغییر کرد' });
  } catch (error) {
    console.error('Shop review moderation error:', error);
    return res.status(500).json({ message: 'خطا در تغییر وضعیت دیدگاه' });
  }
}
