import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authorizeAccount } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

const voteSchema = z.object({
  vote: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const reviewId = typeof req.query.id === 'string' ? req.query.id : '';
  if (!reviewId) return res.status(400).json({ message: 'دیدگاه معتبر نیست' });

  const userId = await authorizeAccount(req, res);
  if (!userId) return;

  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'رأی ثبت‌شده معتبر نیست' });
  }

  try {
    const db = await getPrisma();
    const review = await db.shopReview.findUnique({
      where: { id: reviewId },
      select: { userId: true, isPublished: true },
    });
    if (!review?.isPublished) {
      return res.status(404).json({ message: 'دیدگاه در دسترس نیست' });
    }
    if (review.userId === userId) {
      return res.status(403).json({ message: 'امکان رأی دادن به دیدگاه خودتان را ندارید' });
    }

    if (parsed.data.vote === 0) {
      await db.shopReviewVote.deleteMany({
        where: { reviewId, userId },
      });
    } else {
      await db.shopReviewVote.upsert({
        where: { reviewId_userId: { reviewId, userId } },
        create: { reviewId, userId, vote: parsed.data.vote },
        update: { vote: parsed.data.vote },
      });
    }

    const votes = await db.shopReviewVote.groupBy({
      by: ['vote'],
      where: { reviewId },
      _count: { _all: true },
    });
    return res.status(200).json({
      vote: parsed.data.vote,
      likes: votes.find(({ vote }) => vote === 1)?._count._all ?? 0,
      dislikes: votes.find(({ vote }) => vote === -1)?._count._all ?? 0,
    });
  } catch (error) {
    console.error('Shop review vote error:', error);
    return res.status(500).json({ message: 'ثبت رأی ناموفق بود' });
  }
}
