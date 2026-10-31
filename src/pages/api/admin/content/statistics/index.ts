import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import { statisticCreateSchema } from '@/lib/validation/cmsContent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();

  switch (req.method) {
    case 'GET': {
      const stats = await prisma.statistic.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(stats);
    }
    case 'POST': {
      const parsed = statisticCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'داده‌های ورودی نامعتبر است',
          issues: parsed.error.issues,
        });
      }
      const stat = await prisma.statistic.create({
        data: { ...parsed.data, displayOrder: parsed.data.displayOrder ?? 0 },
      });
      return res.status(201).json(stat);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}