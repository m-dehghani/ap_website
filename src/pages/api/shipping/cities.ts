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

  const province = req.query.province;
  if (typeof province !== 'string' || !province.trim()) {
    return res.status(400).json({ message: 'استان معتبر نیست' });
  }

  try {
    const db = await getPrisma();
    const cities = await db.city.findMany({
      where: {
        isActive: true,
        province: { isActive: true, name: province },
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        shippingFee: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
    return res.status(200).json(cities);
  } catch (error) {
    console.error('Public shipping cities read error:', error);
    return res.status(500).json({ message: 'خطا در دریافت شهرها' });
  }
}
