import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import { deleteUnreferencedImage, isValidImageReference } from '@/lib/uploads';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  switch (req.method) {
    case 'GET': {
      const coach = await prisma.coach.findUnique({
        where: { id },
        include: {
          programs: true,
        },
      });
      if (!coach) {
        return res.status(404).json({ error: 'Coach not found' });
      }
      const { password: _, ...safeCoach } = coach;
      return res.status(200).json(safeCoach);
    }

    case 'PUT': {
      const {
        firstName,
        lastName,
        email,
        phone,
        specialization,
        experience,
        title,
        bio,
        quote,
        certifications,
        achievements,
        rating,
        studentsCount,
        image,
        instagram,
        twitter,
        isActive,
        displayOrder,
      } = req.body;

      const current =
        image === undefined
          ? null
          : await prisma.coach.findUnique({
              where: { id },
              select: { image: true },
            });
      if (image !== undefined && !current) {
        return res.status(404).json({ error: 'Coach not found' });
      }
      if (
        image !== undefined &&
        !(await isValidImageReference(prisma, image, [current?.image]))
      ) {
        return res.status(400).json({ error: 'تصویر باید از بخش بارگذاری انتخاب شود' });
      }
      const coach = await prisma.coach.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email,
          phone,
          specialization,
          experience,
          title,
          bio,
          quote,
          certifications,
          achievements,
          rating,
          studentsCount,
          image,
          instagram,
          twitter,
          isActive,
          displayOrder,
        },
        include: {
          programs: true,
        },
      });
      if (current && image !== current.image) {
        await deleteUnreferencedImage(prisma, current.image);
      }
      const { password: _, ...safeCoach } = coach;
      return res.status(200).json(safeCoach);
    }

    case 'DELETE': {
      const removed = await prisma.coach.delete({
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