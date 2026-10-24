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
      const hours = await prisma.openingHour.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(hours);
    }
    case 'POST': {
      const { type, days, hours, displayOrder } = req.body;
      if (!type || !days || !hours) {
        return res.status(400).json({ error: 'فیلدهای الزامی: type, days, hours' });
      }
      const openingHour = await prisma.openingHour.create({
        data: {
          type,
          days,
          hours,
          displayOrder: displayOrder ?? 0,
        },
      });
      return res.status(201).json(openingHour);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}