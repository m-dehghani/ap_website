import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import { milestoneUpdateSchema } from '@/lib/validation/cmsContent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  switch (req.method) {
    case 'GET': {
      const milestone = await prisma.milestone.findUnique({
        where: { id },
      });
      if (!milestone) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(milestone);
    }
    case 'PUT': {
      const parsed = milestoneUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'اطلاعات افتخار معتبر نیست' });
      }
      const milestone = await prisma.milestone.update({
        where: { id },
        data: parsed.data,
      });
      return res.status(200).json(milestone);
    }
    case 'DELETE': {
      await prisma.milestone.delete({
        where: { id },
      });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}