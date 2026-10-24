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
      const content = await prisma.heroContent.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(content);
    }
    case 'POST': {
      const { title, subtitle, description, ctaLabel, ctaHref, ctaSecondaryLabel, ctaSecondaryHref, bgGradient, stats, statLabels, isActive, displayOrder } = req.body;
      if (!title || !subtitle || !description) {
        return res.status(400).json({ error: 'فیلدهای الزامی: title, subtitle, description' });
      }
      const content = await prisma.heroContent.create({
        data: {
          title,
          subtitle,
          description,
          ctaLabel,
          ctaHref,
          ctaSecondaryLabel,
          ctaSecondaryHref,
          bgGradient,
          stats: stats ?? {},
          statLabels: statLabels ?? {},
          isActive: isActive ?? true,
          displayOrder: displayOrder ?? 0,
        },
      });
      return res.status(201).json(content);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}