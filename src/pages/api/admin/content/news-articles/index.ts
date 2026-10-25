import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();

  switch (req.method) {
    case 'GET': {
      const { category, type, isPublished, featured, limit } = req.query;
      const where: Record<string, unknown> = {};
      if (category) where.category = category;
      if (type) where.type = type;
      if (isPublished !== undefined) where.isPublished = isPublished === 'true';
      if (featured !== undefined) where.featured = featured === 'true';

      const take = limit ? parseInt(limit as string, 10) : undefined;

      const articles = await prisma.newsArticle.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take,
      });
      return res.status(200).json(articles);
    }
    case 'POST': {
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
      if (!title || !excerpt || !content || !category || !author) {
        return res.status(400).json({
          error: 'فیلدهای الزامی: title, excerpt, content, category, author',
        });
      }
      const article = await prisma.newsArticle.create({
        data: {
          title,
          excerpt,
          content,
          category,
          type: type ?? 'NEWS',
          author,
          image,
          videoUrl:
            typeof videoUrl === 'string' && videoUrl.trim()
              ? videoUrl.trim()
              : null,
          tags: tags ?? [],
          readTimeMinutes: readTimeMinutes ?? 1,
          likes: likes ?? 0,
          comments: comments ?? 0,
          featured: featured ?? false,
          isPublished: isPublished ?? true,
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        },
      });
      return res.status(201).json(article);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}