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
      const categories = await prisma.newsCategory.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(categories);
    }
    case 'POST': {
      const { slug, name, icon, displayOrder } = req.body;
      if (!slug || !name) {
        return res.status(400).json({ error: 'فیلدهای الزامی: slug, name' });
      }
      const category = await prisma.newsCategory.create({
        data: {
          slug,
          name,
          icon: icon ?? '',
          displayOrder: displayOrder ?? 0,
        },
      });
      return res.status(201).json(category);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}