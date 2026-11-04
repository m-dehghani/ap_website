import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import { attendanceEligibleRegistrationStatuses } from '@/lib/attendance';

const positiveInteger = (max: number) =>
  z
    .union([
      z.number(),
      z.string().trim().regex(/^\d+$/).transform(Number),
    ])
    .pipe(z.number().int().min(1).max(max));

const sessionInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().nullable().optional(),
  date: z.string().datetime({ offset: true }).transform((value) => new Date(value)),
  location: z.string().trim().min(1).max(200),
  duration: positiveInteger(1440),
  maxCapacity: positiveInteger(1000),
  status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
  programId: z.string().trim().min(1),
  coachId: z.string().trim().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  switch (req.method) {
    case 'GET': {
      const session = await prisma.session.findUnique({
        where: { id },
        include: {
          program: {
            select: {
              id: true,
              name: true,
              registrations: {
                where: {
                  status: { in: [...attendanceEligibleRegistrationStatuses] },
                },
                select: {
                  userId: true,
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
          coach: { select: { id: true, firstName: true, lastName: true } },
          attendance: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      return res.status(200).json(session);
    }

    case 'PUT': {
      const parsed = sessionInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'اطلاعات جلسه معتبر نیست' });
      }
      const {
        name,
        description,
        date,
        duration,
        location,
        maxCapacity,
        status,
        programId,
        coachId,
      } = parsed.data;

      const session = await prisma.session.update({
        where: { id },
        data: {
          name,
          description,
          date,
          duration,
          location,
          maxCapacity,
          status,
          programId,
          coachId,
        },
        include: {
          program: { select: { id: true, name: true } },
          coach: { select: { id: true, firstName: true, lastName: true } },
          attendance: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });
      return res.status(200).json(session);
    }

    case 'DELETE': {
      await prisma.session.delete({ where: { id } });
      return res.status(204).end();
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}