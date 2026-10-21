import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';
import { authorizeShopManager } from '@/lib/auth';

const statusSchema = z.object({
  status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED']),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeShopManager(req, res))) return;
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const id = typeof req.query.id === 'string' ? req.query.id : '';
  const parsed = statusSchema.safeParse(req.body);
  if (!id || !parsed.success) {
    return res.status(400).json({ message: 'وضعیت سفارش معتبر نیست' });
  }
  try {
    const db = await getPrisma();
    const updated = await db.shopOrder.updateMany({
      where: {
        id,
        status:
          parsed.data.status === 'PROCESSING'
            ? 'PAID'
            : parsed.data.status === 'SHIPPED'
              ? 'PROCESSING'
              : 'SHIPPED',
      },
      data: { status: parsed.data.status },
    });
    if (!updated.count) {
      return res.status(409).json({
        message: 'سفارش یافت نشد یا تغییر وضعیت آن در این مرحله مجاز نیست',
      });
    }
    return res.status(200).json({ message: 'وضعیت سفارش به‌روز شد' });
  } catch (error) {
    console.error(`Shop order ${id} status update error:`, error);
    return res.status(500).json({ message: 'خطا در تغییر وضعیت سفارش' });
  }
}
