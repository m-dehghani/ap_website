import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession, requireRole } from '@/lib/auth';
import {
  detectImageMimeType,
  imageUploadScopeSchema,
  saveUploadedImage,
} from '@/lib/uploads';
import { getMaxImageUploadBytes, saveUploadedMedia } from '@/lib/media';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 30,
};

async function readImageBody(req: NextApiRequest, limit: number): Promise<Buffer | null> {
  const contentLength = req.headers['content-length'];
  if (
    typeof contentLength === 'string' &&
    (!/^\d+$/.test(contentLength) || Number(contentLength) > limit)
  ) {
    throw new Error('IMAGE_TOO_LARGE');
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > limit) throw new Error('IMAGE_TOO_LARGE');
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
    const limit = getMaxImageUploadBytes();
    const image = await readImageBody(req, limit);
    const contentType = image
      ? detectImageMimeType(image, declaredMimeType ?? '')
      : null;
    if (!contentType) {
      return res.status(400).json({
        message: 'فقط تصویر معتبر JPEG، PNG یا WebP پذیرفته می‌شود',
      });
    }

    if (!image) {
      return res.status(400).json({
        message: 'فقط تصویر معتبر JPEG، PNG یا WebP پذیرفته می‌شود',
      });
    }

    const url = scope === 'site-logo'
      ? await saveUploadedMedia(contentType, image)
      : await saveUploadedImage(contentType, image);
    return res.status(201).json({ url });
  } catch (error) {
    if (error instanceof Error && error.message === 'IMAGE_TOO_LARGE') {
      return res.status(413).json({
        message: `حجم تصویر نباید بیشتر از ${getMaxImageUploadBytes() / (1024 * 1024)} مگابایت باشد`,
      });
    }
    console.error('Image upload failed:', error);
    return res.status(500).json({ message: 'بارگذاری تصویر ناموفق بود' });
  }
}
