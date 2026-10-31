import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import { testimonialUpdateSchema } from '@/lib/validation/cmsContent';
import { deleteUnreferencedImage, isValidImageReference } from '@/lib/uploads';

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
      const current =
        parsed.data.image === undefined
          ? null
          : await prisma.testimonial.findUnique({
              where: { id },
              select: { image: true },
            });
      if (parsed.data.image !== undefined && !current) {
        return res.status(404).json({ error: 'Not found' });
      }
      if (
        parsed.data.image !== undefined &&
        !(await isValidImageReference(prisma, parsed.data.image, [current?.image]))
      ) {
        return res.status(400).json({ error: 'تصویر باید از بخش بارگذاری انتخاب شود' });
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
      if (current && parsed.data.image !== current.image) {
        await deleteUnreferencedImage(prisma, current.image);
      }
      return res.status(200).json(testimonial);
    }
    case 'DELETE': {
      const removed = await prisma.testimonial.delete({
        where: { id },
        select: { image: true },
      });
      await deleteUnreferencedImage(prisma, removed.image);
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}