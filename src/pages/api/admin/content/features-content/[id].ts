import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();
  const { id } = req.query;

  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

  switch (req.method) {
    case 'GET': {
      const item = await prisma.featuresContent.findUnique({ where: { id } });
      if (!item) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(item);
    }
    case 'PUT': {
      const { icon, title, description, color, bgColor, iconColor, stats, isActive, displayOrder } = req.body;
      const item = await prisma.featuresContent.update({
        where: { id },
        data: { icon, title, description, color, bgColor, iconColor, stats, isActive, displayOrder },
      });
      return res.status(200).json(item);
    }
    case 'DELETE': {
      await prisma.featuresContent.delete({ where: { id } });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}