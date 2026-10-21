import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';
import { authorizeShopManager } from '@/lib/auth';

const settingsSchema = z.object({
  shippingFee: z.number().int().nonnegative().max(100_000_000),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeShopManager(req, res))) return;
  const db = await getPrisma();
  if (req.method === 'GET') {
    try {
      const settings = await db.shopSettings.findUnique({
        where: { id: 'default' },
      });
      return res.status(200).json({ settings: settings ?? { shippingFee: 0 } });
    } catch (error) {
      console.error('Shop settings read error:', error);
      return res.status(500).json({ message: 'خطا در دریافت تنظیمات فروشگاه' });
    }
  }
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'هزینه ارسال معتبر نیست' });
  }
  try {
    const settings = await db.shopSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', shippingFee: parsed.data.shippingFee },
      update: { shippingFee: parsed.data.shippingFee },
    });
    return res.status(200).json({ settings });
  } catch (error) {
    console.error('Shop settings update error:', error);
    return res.status(500).json({ message: 'خطا در ذخیره تنظیمات فروشگاه' });
  }
}
