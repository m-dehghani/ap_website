import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import { deleteUnreferencedImage, isValidImageReference } from '@/lib/uploads';

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
      const current =
        image === undefined
          ? null
          : await prisma.newsArticle.findUnique({
              where: { id },
              select: { image: true },
            });
      if (image !== undefined && !current) {
        return res.status(404).json({ error: 'Not found' });
      }
      if (
        image !== undefined &&
        !(await isValidImageReference(prisma, image, [current?.image]))
      ) {
        return res.status(400).json({ error: 'تصویر باید از بخش بارگذاری انتخاب شود' });
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
              : null,
          tags,
          readTimeMinutes,
          likes,
          comments,
          featured,
          isPublished,
          publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        },
      });
      if (current && image !== current.image) {
        await deleteUnreferencedImage(prisma, current.image);
      }
      return res.status(200).json(article);
    }
    case 'DELETE': {
      const removed = await prisma.newsArticle.delete({
        where: { id },
        select: { image: true },
      });
      await deleteUnreferencedImage(prisma, removed.image);
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}