import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { readImageFile } from '@/lib/uploads';
import {
  getMediaFileSize,
  parseByteRange,
  readMediaFile,
} from '@/lib/media';

const imagePathSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|mp4|webm)$/i);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  const parsedPath = imagePathSchema.safeParse(req.query.id);
  if (!parsedPath.success) return res.status(404).end();

  try {
    const stableUrl = `/uploads/${parsedPath.data}`;
    const isVideo = /\.(mp4|webm)$/i.test(parsedPath.data);
    if (isVideo) {
      const size = await getMediaFileSize(stableUrl);
      if (size === null) return res.status(404).end();
      const range = parseByteRange(req.headers.range, size);
      if (range === 'invalid') {
        res.setHeader('Content-Range', `bytes */${size}`);
        res.setHeader('Accept-Ranges', 'bytes');
        return res.status(416).end();
      }
      const video = await readMediaFile(stableUrl, range ?? undefined);
      if (!video) return res.status(404).end();
      const start = range?.start ?? 0;
      const end = range ? Math.min(range.end, size - 1) : size - 1;
      res.setHeader('Content-Type', video.contentType);
      res.setHeader('Content-Length', String(video.data.byteLength));
      res.setHeader('Accept-Ranges', 'bytes');
      if (range) res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      if (req.method === 'HEAD') {
        return res.status(range ? 206 : 200).end();
      }
      return res.status(range ? 206 : 200).send(video.data);
    }

    const media = await readMediaFile(stableUrl);
    const image =
      media ??
      (await readImageFile(`/api/uploads/${parsedPath.data}`));
    if (!image) return res.status(404).end();
    res.setHeader('Content-Type', image.contentType);
    res.setHeader('Content-Length', String(image.data.byteLength));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Disposition', 'inline');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(image.data);
  } catch (error) {
    console.error('Media file read failed:', error);
    return res.status(500).end();
  }
}
