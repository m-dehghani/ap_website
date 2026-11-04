import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import {
  deleteUnreferencedImage,
  imageAssetUrlSchema,
  isValidImageReference,
} from '@/lib/uploads';

const profileImageSchema = z.object({ image: imageAssetUrlSchema });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ message: 'روش درخواست پشتیبانی نمی‌شود' });
  }

  try {
    const session = await getSession(req);
    if (!session) {
      return res.status(401).json({ message: 'برای ذخیره تصویر وارد حساب شوید' });
    }

    const parsedBody = profileImageSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ message: 'تصویر پروفایل معتبر نیست' });
    }

    const db = await getPrisma();
    const { image, oldImage } = await db.$transaction(async (tx) => {
      const current =
        session.source === 'coach'
          ? await tx.coach.findUnique({
              where: { id: session.id },
              select: { image: true },
            })
          : await tx.user.findUnique({
              where: { id: session.id },
              select: { image: true },
            });

      if (!current) throw new Error('PROFILE_NOT_FOUND');
      if (
        !(await isValidImageReference(tx, parsedBody.data.image, [
          current.image,
        ]))
      ) {
        throw new Error('INVALID_PROFILE_IMAGE');
      }

      const updated =
        session.source === 'coach'
          ? await tx.coach.update({
              where: { id: session.id },
              data: { image: parsedBody.data.image },
              select: { image: true },
            })
          : await tx.user.update({
              where: { id: session.id },
              data: { image: parsedBody.data.image },
              select: { image: true },
            });

      return { image: updated.image, oldImage: current.image };
    });

    await deleteUnreferencedImage(db, oldImage);
    return res.status(200).json({ image });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_PROFILE_IMAGE') {
      return res.status(400).json({
        message: 'تصویر باید از بخش بارگذاری انتخاب شود',
      });
    }
    if (error instanceof Error && error.message === 'PROFILE_NOT_FOUND') {
      return res.status(404).json({ message: 'حساب کاربری یافت نشد' });
    }
    console.error('Profile image save failed:', error);
    return res.status(500).json({ message: 'ذخیره تصویر پروفایل ناموفق بود' });
  }
}
