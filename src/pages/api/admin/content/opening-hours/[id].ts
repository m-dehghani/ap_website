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
      const hour = await prisma.openingHour.findUnique({
        where: { id },
      });
      if (!hour) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(hour);
    }
    case 'PUT': {
      const { type, days, hours, displayOrder } = req.body;
      const openingHour = await prisma.openingHour.update({
        where: { id },
        data: {
          type,
          days,
          hours,
          displayOrder,
        },
      });
      return res.status(200).json(openingHour);
    }
    case 'DELETE': {
      await prisma.openingHour.delete({
        where: { id },
      });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}