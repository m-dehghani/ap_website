import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';

const idSchema = z.string().uuid();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }
  const parsedId = idSchema.safeParse(req.query.id);
  if (!parsedId.success) return res.status(404).end();

  try {
    const db = await getPrisma();
    const asset = await db.imageAsset.findUnique({
      where: { id: parsedId.data },
      select: { contentType: true, data: true },
    });
    if (!asset) return res.status(404).end();

    res.setHeader('Content-Type', asset.contentType);
    res.setHeader('Content-Length', String(asset.data.byteLength));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(Buffer.from(asset.data));
  } catch (error) {
    console.error('Image asset read failed:', error);
    return res.status(500).end();
  }
}
