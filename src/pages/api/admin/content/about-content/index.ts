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
      const { section } = req.query;
      if (section && typeof section === 'string') {
        const item = await prisma.aboutContent.findUnique({ where: { section } });
        if (!item) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(item);
      }
      const items = await prisma.aboutContent.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(items);
    }
    case 'POST': {
      const { section, title, content, isActive, displayOrder } = req.body;
      if (!section || !title) {
        return res.status(400).json({ error: 'فیلدهای الزامی: section, title' });
      }
      const item = await prisma.aboutContent.upsert({
        where: { section },
        create: { section, title, content: content ?? {}, isActive: isActive ?? true, displayOrder: displayOrder ?? 0 },
        update: { title, content, isActive, displayOrder },
      });
      return res.status(201).json(item);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}