import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();

  switch (req.method) {
    case 'GET': {
      const items = await prisma.featuresContent.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(items);
    }
    case 'POST': {
      const { icon, title, description, color, bgColor, iconColor, stats, isActive, displayOrder } = req.body;
      if (!icon || !title || !description) {
        return res.status(400).json({ error: 'فیلدهای الزامی: icon, title, description' });
      }
      const item = await prisma.featuresContent.create({
        data: { icon, title, description, color, bgColor, iconColor, stats, isActive: isActive ?? true, displayOrder: displayOrder ?? 0 },
      });
      return res.status(201).json(item);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}