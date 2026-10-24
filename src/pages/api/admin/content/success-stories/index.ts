import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();

  switch (req.method) {
    case 'GET': {
      const { isPublished } = req.query;
      const where: Record<string, unknown> = {};
      if (isPublished !== undefined) where.isPublished = isPublished === 'true';
      const stories = await prisma.successStory.findMany({
        where,
        include: {
          program: { select: { name: true } },
          coach: { select: { firstName: true, lastName: true } },
        },
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(stories);
    }
    case 'POST': {
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
      if (!playerName || !achievement || !description) {
        return res.status(400).json({ error: 'فیلدهای الزامی: playerName, achievement, description' });
      }
      const story = await prisma.successStory.create({
        data: {
          playerName,
          age: age ?? 0,
          achievement,
          description,
          quote,
          image,
          date: date ? new Date(date) : new Date(),
          goals: goals ?? 0,
          assists: assists ?? 0,
          matches: matches ?? 0,
          isPublished: isPublished ?? true,
          programId,
          coachId,
          displayOrder: displayOrder ?? 0,
        },
        include: {
          program: { select: { name: true } },
          coach: { select: { firstName: true, lastName: true } },
        },
      });
      return res.status(201).json(story);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}