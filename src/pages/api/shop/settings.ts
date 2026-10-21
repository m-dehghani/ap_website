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
    const settings = await db.shopSettings.findUnique({
      where: { id: 'default' },
      select: { shippingFee: true },
    });
    return res.status(200).json({ shippingFee: settings?.shippingFee ?? 0 });
  } catch (error) {
    console.error('Public shop settings read error:', error);
    return res.status(500).json({ message: 'خطا در دریافت هزینه ارسال' });
  }
}
