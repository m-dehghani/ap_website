import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import {
  getMaxVideoUploadBytes,
  saveUploadedVideo,
  validateVideoUpload,
} from '@/lib/media';

const uploadScopeSchema = z.enum(['product', 'news']);

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 60,
};

async function readVideoBody(req: NextApiRequest, limit: number) {
  const contentLength = req.headers['content-length'];
  if (
    typeof contentLength === 'string' &&
    (!/^\d+$/.test(contentLength) || Number(contentLength) > limit)
  ) {
    throw new Error('VIDEO_TOO_LARGE');
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > limit) throw new Error('VIDEO_TOO_LARGE');
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
  const parsedScope = uploadScopeSchema.safeParse(req.query.scope);
  if (!parsedScope.success) {
    return res.status(400).json({ message: 'نوع بارگذاری معتبر نیست' });
  }
  const session = await requireRole(
    req,
    res,
    parsedScope.data === 'news' ? ['ADMIN'] : ['ADMIN', 'SHOP_MANAGER'],
  );
  if (!session) return;

  const limit = getMaxVideoUploadBytes();
  try {
    const bytes = await readVideoBody(req, limit);
    const filename = req.headers['x-upload-filename'];
    const contentType = req.headers['content-type']
      ?.split(';', 1)[0]
      ?.trim()
      .toLowerCase();
    const validation = bytes && typeof filename === 'string'
      ? validateVideoUpload(filename, contentType ?? '', bytes)
      : null;
    if (!bytes || !validation) {
      return res.status(400).json({
        message: 'فقط فایل معتبر MP4 یا WebM پذیرفته می‌شود',
      });
    }

    const url = await saveUploadedVideo(validation.contentType, bytes);
    return res.status(201).json({ url });
  } catch (error) {
    if (error instanceof Error && error.message === 'VIDEO_TOO_LARGE') {
      return res.status(413).json({
        message: `حجم ویدئو نباید بیشتر از ${limit / (1024 * 1024)} مگابایت باشد`,
      });
    }
    console.error('Video upload failed:', error);
    return res.status(503).json({ message: 'ذخیره‌سازی پایدار بارگذاری در دسترس نیست' });
  }
}
