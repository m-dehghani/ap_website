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
      const milestones = await prisma.milestone.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(milestones);
    }
    case 'POST': {
      const { year, title, description, displayOrder } = req.body;
      if (!year || !title || !description) {
        return res.status(400).json({ error: 'فیلدهای الزامی: year, title, description' });
      }
      const milestone = await prisma.milestone.create({
        data: {
          year,
          title,
          description,
          displayOrder: displayOrder ?? 0,
        },
      });
      return res.status(201).json(milestone);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}