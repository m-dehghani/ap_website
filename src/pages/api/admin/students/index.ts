import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();

  switch (req.method) {
    case 'GET': {
      const { status, programId, page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (status) where.status = status;
      if (programId) where.programId = programId;

      const [registrations, total] = await Promise.all([
        prisma.registration.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                birthDate: true,
                role: true,
              },
            },
            program: {
              include: {
                coach: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    specialization: true,
                    title: true,
                    image: true,
                  },
                },
              },
            },
            payments: true,
          },
          orderBy: { registeredAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.registration.count({ where }),
      ]);

      return res.status(200).json({
        data: registrations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}