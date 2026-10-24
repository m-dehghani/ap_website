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
      const facilities = await prisma.facility.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(facilities);
    }
    case 'POST': {
      const { category, name, displayOrder } = req.body;
      if (!category || !name) {
        return res.status(400).json({ error: 'فیلدهای الزامی: category, name' });
      }
      const facility = await prisma.facility.create({
        data: {
          category,
          name,
          displayOrder: displayOrder ?? 0,
        },
      });
      return res.status(201).json(facility);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}