import { randomUUID } from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession, requireRole } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import {
  deleteUnreferencedImage,
  detectImageMimeType,
  imageUploadScopeSchema,
  MAX_IMAGE_BYTES,
} from '@/lib/uploads';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 30,
};

async function readImageBody(req: NextApiRequest): Promise<Buffer | null> {
  const contentLength = req.headers['content-length'];
  if (
    typeof contentLength === 'string' &&
    (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_IMAGE_BYTES)
  ) {
    throw new Error('IMAGE_TOO_LARGE');
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_IMAGE_BYTES) throw new Error('IMAGE_TOO_LARGE');
    chunks.push(buffer);
  }
  return size ? Buffer.concat(chunks, size) : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'روش درخواست پشتیبانی نمی‌شود' });
  }

  const parsedScope = imageUploadScopeSchema.safeParse(req.query.scope);
  if (!parsedScope.success) {
    return res.status(400).json({ message: 'نوع بارگذاری معتبر نیست' });
  }
  const scope = parsedScope.data;

  try {
    let session;
    if (scope === 'profile') {
      session = await getSession(req);
      if (!session) {
        return res.status(401).json({ message: 'برای بارگذاری وارد حساب شوید' });
      }
    } else {
      session = await requireRole(
        req,
        res,
        scope === 'shop-product' ? ['ADMIN', 'SHOP_MANAGER'] : ['ADMIN'],
      );
      if (!session) return;
    }

    const declaredMimeType = req.headers['content-type']
      ?.split(';', 1)[0]
      ?.trim()
      .toLowerCase();
    const image = await readImageBody(req);
    if (!image || !detectImageMimeType(image, declaredMimeType ?? '')) {
      return res.status(400).json({
        message: 'فقط تصویر معتبر JPEG، PNG یا WebP پذیرفته می‌شود',
      });
    }

    const db = await getPrisma();
    const id = randomUUID();
    const url = `/api/uploads/${id}`;
    if (scope === 'profile') {
      await db.$transaction(async (tx) => {
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

        await tx.imageAsset.create({
          data: {
            id,
            contentType: declaredMimeType!,
            data: Uint8Array.from(image),
          },
        });
        if (session.source === 'coach') {
          await tx.coach.update({
            where: { id: session.id },
            data: { image: url },
            select: { image: true },
          });
        } else {
          await tx.user.update({
            where: { id: session.id },
            data: { image: url },
            select: { image: true },
          });
        }
        await deleteUnreferencedImage(tx, current.image);
      });
      return res.status(200).json({ url });
    }

    await db.imageAsset.create({
      data: {
        id,
        contentType: declaredMimeType!,
        data: Uint8Array.from(image),
      },
    });
    return res.status(201).json({ id, url });
  } catch (error) {
    if (error instanceof Error && error.message === 'IMAGE_TOO_LARGE') {
      return res.status(413).json({
        message: 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد',
      });
    }
    if (error instanceof Error && error.message === 'PROFILE_NOT_FOUND') {
      return res.status(404).json({ message: 'حساب کاربری یافت نشد' });
    }
    console.error('Image upload failed:', error);
    return res.status(500).json({ message: 'بارگذاری تصویر ناموفق بود' });
  }
}
