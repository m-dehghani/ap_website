import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();
  const { section } = req.query;

  if (typeof section !== 'string') return res.status(400).json({ error: 'Invalid section' });

  switch (req.method) {
    case 'GET': {
      const item = await prisma.aboutContent.findUnique({ where: { section } });
      if (!item) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(item);
    }
    case 'PUT': {
      const { title, content, isActive, displayOrder } = req.body;
      const item = await prisma.aboutContent.update({
        where: { section },
        data: { title, content, isActive, displayOrder },
      });
      return res.status(200).json(item);
    }
    case 'DELETE': {
      await prisma.aboutContent.delete({ where: { section } });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}