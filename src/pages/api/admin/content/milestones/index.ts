import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import { milestoneCreateSchema } from '@/lib/validation/cmsContent';

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
      const parsed = milestoneCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'اطلاعات افتخار معتبر نیست' });
      }
      const milestone = await prisma.milestone.create({
        data: parsed.data,
      });
      return res.status(201).json(milestone);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}