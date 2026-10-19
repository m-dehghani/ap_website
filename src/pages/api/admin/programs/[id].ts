import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

const coachSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  specialization: true,
  experience: true,
  title: true,
  image: true,
  isActive: true,
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  switch (req.method) {
    case 'GET': {
      const program = await prisma.program.findUnique({
        where: { id },
        include: {
          coach: { select: coachSelect },
          schedule: { orderBy: { displayOrder: 'asc' } },
        },
      });
      if (!program) {
        return res.status(404).json({ error: 'Program not found' });
      }
      return res.status(200).json(program);
    }

    case 'PUT': {
      const {
        name,
        description,
        price,
        duration,
        sessionCount,
        maxStudents,
        popular,
        icon,
        ageRange,
        minAge,
        maxAge,
        color,
        period,
        rating,
        studentsEnrolled,
        features,
        level,
        coachId,
        isActive,
        schedule,
      } = req.body;

      const program = await prisma.program.update({
        where: { id },
        data: {
          name,
          description,
          price,
          duration,
          sessionCount,
          maxStudents,
          popular,
          isActive,
          icon,
          ageRange,
          minAge,
          maxAge,
          color,
          period,
          rating,
          studentsEnrolled,
          features,
          level,
          coachId,
          ...(Array.isArray(schedule)
            ? {
                schedule: {
                  deleteMany: {},
                  create: schedule.map(
                    (
                      s: { day: string; time: string; displayOrder?: number },
                      i: number,
                    ) => ({
                      day: s.day,
                      time: s.time,
                      displayOrder: s.displayOrder ?? i,
                    }),
                  ),
                },
              }
            : {}),
        },
        include: {
          coach: { select: coachSelect },
          schedule: { orderBy: { displayOrder: 'asc' } },
        },
      });
      return res.status(200).json(program);
    }

    case 'DELETE': {
      await prisma.program.delete({ where: { id } });
      return res.status(204).end();
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}