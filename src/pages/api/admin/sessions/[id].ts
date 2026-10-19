import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

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
          program: { select: { id: true, name: true } },
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

      const session = await prisma.session.update({
        where: { id },
        data: {
          name,
          description,
          date: new Date(date),
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