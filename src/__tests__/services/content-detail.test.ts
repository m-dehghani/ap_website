import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPrisma } from '@/lib/db';
import { getPublishedNewsArticleById } from '@/services/content';

vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

describe('published news article detail lookup', () => {
  const prisma = { newsArticle: { findFirst: vi.fn() } };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
  });

  it('looks up by stable ID and published status and serializes the article', async () => {
    prisma.newsArticle.findFirst.mockResolvedValue({
      id: 'article/verified',
      title: 'خبر آکادمی',
      excerpt: 'خلاصه خبر',
      content: 'متن خبر',
      category: 'academy',
      type: 'NEWS',
      author: 'تحریریه',
      image: null,
      videoUrl: null,
      tags: [],
      readTimeMinutes: 2,
      likes: 0,
      comments: 0,
      featured: false,
      publishedAt: new Date('2026-11-01T10:00:00.000Z'),
    });

    const article = await getPublishedNewsArticleById('article/verified');

    expect(prisma.newsArticle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'article/verified', isPublished: true },
      }),
    );
    expect(article).toEqual(
      expect.objectContaining({
        id: 'article/verified',
        title: 'خبر آکادمی',
        publishedAt: '2026-11-01T10:00:00.000Z',
      }),
    );
  });

  it('returns no article when the ID is missing or unpublished', async () => {
    prisma.newsArticle.findFirst.mockResolvedValue(null);

    await expect(getPublishedNewsArticleById('draft-article')).resolves.toBeNull();

    expect(prisma.newsArticle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'draft-article', isPublished: true },
      }),
    );
  });
});
