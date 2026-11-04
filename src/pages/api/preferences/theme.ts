import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

const themePreferenceSchema = z
  .object({
    themePreference: z.enum(['light', 'dark', 'system']),
  })
  .strict();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await requireSession(req, res);
    if (!session) return;

    const parsed = themePreferenceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'پوسته انتخاب‌شده معتبر نیست' });
    }

    const db = await getPrisma();
    const preference =
      session.source === 'user'
        ? await db.user.update({
            where: { id: session.id },
            data: { themePreference: parsed.data.themePreference },
            select: { themePreference: true },
          })
        : await db.coach.update({
            where: { id: session.id },
            data: { themePreference: parsed.data.themePreference },
            select: { themePreference: true },
          });

    return res.status(200).json(preference);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      return res.status(404).json({ message: 'حساب کاربری یافت نشد' });
    }

    console.error('Theme preference update error:', error);
    return res.status(500).json({ message: 'ذخیره پوسته حساب ناموفق بود' });
  }
}
