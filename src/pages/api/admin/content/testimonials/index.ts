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
      const { category, isPublished } = req.query;
      const where: Record<string, unknown> = {};
      if (category) where.category = category;
      if (isPublished !== undefined) where.isPublished = isPublished === 'true';
      const testimonials = await prisma.testimonial.findMany({
        where,
        include: {
          program: { select: { name: true } },
        },
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(testimonials);
    }
    case 'POST': {
      const {
        name,
        role,
        content,
        image,
        rating,
        category,
        improvement,
        date,
        isPublished,
        programId,
        displayOrder,
      } = req.body;
      if (!name || !role || !content) {
        return res.status(400).json({ error: 'فیلدهای الزامی: name, role, content' });
      }
      const testimonial = await prisma.testimonial.create({
        data: {
          name,
          role,
          content,
          image,
          rating: rating ?? 5,
          category: category ?? 'GENERAL',
          improvement,
          date: date ? new Date(date) : null,
          isPublished: isPublished ?? true,
          programId,
          displayOrder: displayOrder ?? 0,
        },
        include: {
          program: { select: { name: true } },
        },
      });
      return res.status(201).json(testimonial);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}