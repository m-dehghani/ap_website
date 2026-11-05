import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import { deleteUnreferencedImage, isValidImageReference } from '@/lib/uploads';
import {
  deleteUnreferencedMedia,
  isValidVideoReference,
  videoContentFieldsSchema,
} from '@/lib/media';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  switch (req.method) {
    case 'GET': {
      const article = await prisma.newsArticle.findUnique({
        where: { id },
      });
      if (!article) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(article);
    }
    case 'PUT': {
      const parsedVideoFields = videoContentFieldsSchema.safeParse(req.body);
      if (!parsedVideoFields.success) {
        return res.status(400).json({ error: 'نشانی ویدئو معتبر نیست' });
      }
      const {
        title,
        excerpt,
        content,
        category,
        type,
        author,
        image,
        videoUrl,
        tags,
        readTimeMinutes,
        likes,
        comments,
        featured,
        isPublished,
        publishedAt,
      } = req.body;
      const current = await prisma.newsArticle.findUnique({
        where: { id },
        select: { image: true, uploadedVideoUrl: true },
      });
      if (!current) {
        return res.status(404).json({ error: 'Not found' });
      }
      if (
        image !== undefined &&
        !(await isValidImageReference(prisma, image, [current.image]))
      ) {
        return res.status(400).json({ error: 'تصویر باید از بخش بارگذاری انتخاب شود' });
      }
      if (
        !(await isValidVideoReference(
          prisma,
          parsedVideoFields.data.uploadedVideoUrl,
          [current.uploadedVideoUrl],
        ))
      ) {
        return res.status(400).json({ error: 'ویدئو باید از بخش بارگذاری انتخاب شود' });
      }
      const article = await prisma.newsArticle.update({
        where: { id },
        data: {
          title,
          excerpt,
          content,
          category,
          type,
          author,
          image,
          videoUrl:
            typeof videoUrl === 'string' && videoUrl.trim()
              ? videoUrl.trim()
              : videoUrl === undefined
                ? undefined
                : null,
          uploadedVideoUrl: parsedVideoFields.data.uploadedVideoUrl,
          aparatVideoUrl: parsedVideoFields.data.aparatVideoUrl,
          tags,
          readTimeMinutes,
          likes,
          comments,
          featured,
          isPublished,
          publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        },
      });
      if (image !== undefined && image !== current.image) {
        await deleteUnreferencedImage(prisma, current.image);
      }
      if (
        current.uploadedVideoUrl &&
        parsedVideoFields.data.uploadedVideoUrl !== undefined &&
        parsedVideoFields.data.uploadedVideoUrl !== current.uploadedVideoUrl
      ) {
        await deleteUnreferencedMedia(prisma, current.uploadedVideoUrl);
      }
      return res.status(200).json(article);
    }
    case 'DELETE': {
      const removed = await prisma.newsArticle.delete({
        where: { id },
        select: { image: true, uploadedVideoUrl: true },
      });
      await deleteUnreferencedImage(prisma, removed.image);
      await deleteUnreferencedMedia(prisma, removed.uploadedVideoUrl);
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}