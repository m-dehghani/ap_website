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

  switch (req.method) {
    case 'GET': {
      const programs = await prisma.program.findMany({
        include: {
          coach: { select: coachSelect },
          schedule: { orderBy: { displayOrder: 'asc' } },
        },
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(programs);
    }
    case 'POST': {
      const {
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
        schedule,
      } = req.body;

      const program = await prisma.program.create({
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
          schedule: {
            create: schedule?.map((s: { day: string; time: string; displayOrder?: number }, i: number) => ({
              day: s.day,
              time: s.time,
              displayOrder: s.displayOrder ?? i,
            })) ?? [],
          },
        },
        include: {
          coach: { select: coachSelect },
          schedule: { orderBy: { displayOrder: 'asc' } },
        },
      });
      return res.status(201).json(program);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}