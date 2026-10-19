import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();

  switch (req.method) {
    case 'GET': {
      const { programId, coachId, status, page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (programId) where.programId = programId;
      if (coachId) where.coachId = coachId;
      if (status) where.status = status;

      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where,
          include: {
            program: { select: { id: true, name: true } },
            coach: { select: { id: true, firstName: true, lastName: true } },
            attendance: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { date: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.session.count({ where }),
      ]);

      return res.status(200).json({
        data: sessions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }
    case 'POST': {
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
      } = req.body;

      const session = await prisma.session.create({
        data: {
          name,
          description,
          date: new Date(date),
          duration,
          location,
          maxCapacity,
          status: status || 'SCHEDULED',
          programId,
          coachId,
        },
        include: {
          program: { select: { id: true, name: true } },
          coach: { select: { id: true, firstName: true, lastName: true } },
        },
      });
      return res.status(201).json(session);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}