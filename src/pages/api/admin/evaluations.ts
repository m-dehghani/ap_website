import type { NextApiRequest, NextApiResponse } from 'next';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { adminEvaluationSchema, evaluationSelect } from '@/lib/evaluations';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: 'متد درخواست پشتیبانی نمی‌شود' });
  }

  const prisma = await getPrisma();
  if (req.method === 'GET') {
    const evaluations = await prisma.evaluation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: evaluationSelect,
    });
    return res.status(200).json({ evaluations });
  }

  const parsed = adminEvaluationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'اطلاعات ارزیابی معتبر نیست' });
  }

  const evaluation = await prisma.evaluation.create({
    data: parsed.data,
    select: evaluationSelect,
  });
  return res.status(201).json({ evaluation });
}
