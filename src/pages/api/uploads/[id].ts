import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { readImageFile } from '@/lib/uploads';

const imagePathSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }
  const parsedPath = imagePathSchema.safeParse(req.query.id);
  if (!parsedPath.success) return res.status(404).end();

  try {
    const image = await readImageFile(`/api/uploads/${parsedPath.data}`);
    if (!image) return res.status(404).end();

    res.setHeader('Content-Type', image.contentType);
    res.setHeader('Content-Length', String(image.data.byteLength));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(image.data);
  } catch (error) {
    console.error('Image file read failed:', error);
    return res.status(500).end();
  }
}
