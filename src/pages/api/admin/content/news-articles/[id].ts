import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

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
        tags,
        readTimeMinutes,
        likes,
        comments,
        featured,
        isPublished,
        publishedAt,
      } = req.body;
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
          tags,
          readTimeMinutes,
          likes,
          comments,
          featured,
          isPublished,
          publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        },
      });
      return res.status(200).json(article);
    }
    case 'DELETE': {
      await prisma.newsArticle.delete({
        where: { id },
      });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}