import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

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
      const story = await prisma.successStory.findUnique({
        where: { id },
        include: {
          program: { select: { name: true } },
          coach: { select: { firstName: true, lastName: true } },
        },
      });
      if (!story) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(story);
    }
    case 'PUT': {
      const {
        playerName,
        age,
        achievement,
        description,
        quote,
        image,
        date,
        goals,
        assists,
        matches,
        isPublished,
        programId,
        coachId,
        displayOrder,
      } = req.body;
      const story = await prisma.successStory.update({
        where: { id },
        data: {
          playerName,
          age,
          achievement,
          description,
          quote,
          image,
          date: date ? new Date(date) : undefined,
          goals,
          assists,
          matches,
          isPublished,
          programId,
          coachId,
          displayOrder,
        },
        include: {
          program: { select: { name: true } },
          coach: { select: { firstName: true, lastName: true } },
        },
      });
      return res.status(200).json(story);
    }
    case 'DELETE': {
      await prisma.successStory.delete({
        where: { id },
      });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}