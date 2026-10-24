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
      const content = await prisma.heroContent.findUnique({ where: { id } });
      if (!content) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(content);
    }
    case 'PUT': {
      const { title, subtitle, description, ctaLabel, ctaHref, ctaSecondaryLabel, ctaSecondaryHref, bgGradient, stats, statLabels, isActive, displayOrder } = req.body;
      const content = await prisma.heroContent.update({
        where: { id },
        data: {
          title,
          subtitle,
          description,
          ctaLabel,
          ctaHref,
          ctaSecondaryLabel,
          ctaSecondaryHref,
          bgGradient,
          stats,
          statLabels,
          isActive,
          displayOrder,
        },
      });
      return res.status(200).json(content);
    }
    case 'DELETE': {
      await prisma.heroContent.delete({ where: { id } });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}