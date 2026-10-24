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
      const link = await prisma.socialLink.findUnique({
        where: { id },
      });
      if (!link) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(link);
    }
    case 'PUT': {
      const { platform, name, url, icon, isActive, displayOrder } = req.body;
      const link = await prisma.socialLink.update({
        where: { id },
        data: {
          platform,
          name,
          url,
          icon,
          isActive,
          displayOrder,
        },
      });
      return res.status(200).json(link);
    }
    case 'DELETE': {
      await prisma.socialLink.delete({
        where: { id },
      });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}