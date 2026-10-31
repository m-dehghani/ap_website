import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import { testimonialUpdateSchema } from '@/lib/validation/cmsContent';

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
      const testimonial = await prisma.testimonial.findUnique({
        where: { id },
        include: {
          program: { select: { name: true } },
        },
      });
      if (!testimonial) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(testimonial);
    }
    case 'PUT': {
      const parsed = testimonialUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'داده‌های ورودی نامعتبر است',
          issues: parsed.error.issues,
        });
      }
      const {
        date,
        ...data
      } = parsed.data;
      const testimonial = await prisma.testimonial.update({
        where: { id },
        data: {
          ...data,
          ...(date === undefined
            ? {}
            : { date: date ? new Date(date) : null }),
        },
        include: {
          program: { select: { name: true } },
        },
      });
      return res.status(200).json(testimonial);
    }
    case 'DELETE': {
      await prisma.testimonial.delete({
        where: { id },
      });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}