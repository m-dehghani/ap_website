import type { NextApiRequest, NextApiResponse } from 'next';
import { requireRole } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { coachEvaluationSchema, evaluationSelect } from '@/lib/evaluations';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const coach = await requireRole(req, res, ['COACH']);
  if (!coach) return;
  if (coach.source !== 'coach') {
    return res.status(403).json({ message: 'دسترسی مجاز نیست' });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: 'متد درخواست پشتیبانی نمی‌شود' });
  }

  const prisma = await getPrisma();
  if (req.method === 'GET') {
    const evaluations = await prisma.evaluation.findMany({
      where: { coachId: coach.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: evaluationSelect,
    });
    return res.status(200).json({ evaluations });
  }

  const parsed = coachEvaluationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'اطلاعات ارزیابی معتبر نیست' });
  }

  const registration = await prisma.registration.findFirst({
    where: {
      userId: parsed.data.userId,
      program: { coachId: coach.id },
    },
    select: { id: true },
  });
  if (!registration) {
    return res.status(403).json({ message: 'دسترسی مجاز نیست' });
  }

  const evaluation = await prisma.evaluation.create({
    data: {
      ...parsed.data,
      coachId: coach.id,
    },
    select: evaluationSelect,
  });
  return res.status(201).json({ evaluation });
}
