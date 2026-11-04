import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await getPrisma();
    const provinces = await db.province.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        nameEn: true,
        shippingFee: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
    return res.status(200).json(provinces);
  } catch (error) {
    console.error('Public shipping provinces read error:', error);
    return res.status(500).json({ message: 'خطا در دریافت استان‌ها' });
  }
}
