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

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  switch (req.method) {
    case 'GET': {
      const category = await prisma.newsCategory.findUnique({
        where: { id },
      });
      if (!category) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(category);
    }
    case 'PUT': {
      const { slug, name, icon, displayOrder } = req.body;
      const category = await prisma.newsCategory.update({
        where: { id },
        data: {
          slug,
          name,
          icon,
          displayOrder,
        },
      });
      return res.status(200).json(category);
    }
    case 'DELETE': {
      await prisma.newsCategory.delete({
        where: { id },
      });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}