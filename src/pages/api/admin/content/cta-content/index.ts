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
      const items = await prisma.cTAContent.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(items);
    }
    case 'POST': {
      const { title, description, primaryCTALabel, primaryCTAHref, secondaryCTALabel, secondaryCTAHref, isActive, displayOrder } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: 'فیلدهای الزامی: title, description' });
      }
      const active = isActive ?? true;
      const item = await prisma.$transaction(async (tx) => {
        if (active) {
          await tx.cTAContent.updateMany({ data: { isActive: false } });
        }
        return tx.cTAContent.create({
          data: {
            title,
            description,
            primaryCTALabel,
            primaryCTAHref,
            secondaryCTALabel,
            secondaryCTAHref,
            isActive: active,
            displayOrder: displayOrder ?? 0,
          },
        });
      });
      return res.status(201).json(item);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}