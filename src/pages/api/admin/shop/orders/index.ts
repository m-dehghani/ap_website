import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeShopManager } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeShopManager(req, res))) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await getPrisma();
    const orders = await db.shopOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { items: true },
    });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Shop orders listing error:', error);
    return res.status(500).json({ message: 'خطا در دریافت سفارش‌ها' });
  }
}
