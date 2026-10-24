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
      const facility = await prisma.facility.findUnique({
        where: { id },
      });
      if (!facility) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(facility);
    }
    case 'PUT': {
      const { category, name, displayOrder } = req.body;
      const facility = await prisma.facility.update({
        where: { id },
        data: {
          category,
          name,
          displayOrder,
        },
      });
      return res.status(200).json(facility);
    }
    case 'DELETE': {
      await prisma.facility.delete({
        where: { id },
      });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}