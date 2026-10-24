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
      const stats = await prisma.statistic.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(stats);
    }
    case 'POST': {
      const { key, value, label, description, displayOrder } = req.body;
      if (!key || !value || !label) {
        return res.status(400).json({ error: 'فیلدهای الزامی: key, value, label' });
      }
      const stat = await prisma.statistic.create({
        data: {
          key,
          value,
          label,
          description,
          displayOrder: displayOrder ?? 0,
        },
      });
      return res.status(201).json(stat);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}