// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import createHandler from '@/pages/api/admin/content/news-articles';
import detailHandler from '@/pages/api/admin/content/news-articles/[id]';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({ authorizeAdmin: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const request = (method: string, body: unknown, id?: string) =>
  ({ method, body, query: id ? { id } : {} }) as never;
const response = () =>
  ({
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  }) as never as {
    headers: Record<string, string>;
    setHeader: (name: string, value: string) => void;
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
  };

describe('admin news video API fields', () => {
  const prisma = {
    newsArticle: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    shopProduct: { findFirst: vi.fn() },
    siteBranding: { findFirst: vi.fn() },
    user: { findFirst: vi.fn() },
    coach: { findFirst: vi.fn() },
    staffMember: { findFirst: vi.fn() },
    successStory: { findFirst: vi.fn() },
    testimonial: { findFirst: vi.fn() },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.newsArticle.create.mockResolvedValue({ id: 'article-1' });
    prisma.newsArticle.update.mockResolvedValue({ id: 'article-1' });
  });

  it('rejects hostile Aparat hosts before creating a news article', async () => {
    const res = response();

    await createHandler(
      request('POST', {
        title: 'عنوان',
        excerpt: 'خلاصه',
        content: 'متن',
        category: 'academy',
        author: 'مدیر',
        aparatVideoUrl: 'https://www.aparat.com.evil.example/v/abc123',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.newsArticle.create).not.toHaveBeenCalled();
  });

  it('keeps legacy news videoUrl values while saving the new Aparat reference separately', async () => {
    const res = response();
    const legacyUrl = 'https://legacy.example/embed/old-video';
    const aparatUrl = 'https://www.aparat.com/v/abc123';

    await createHandler(
      request('POST', {
        title: 'عنوان',
        excerpt: 'خلاصه',
        content: 'متن',
        category: 'academy',
        author: 'مدیر',
        videoUrl: legacyUrl,
        aparatVideoUrl: aparatUrl,
      }),
      res as never,
    );

    expect(prisma.newsArticle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          videoUrl: legacyUrl,
          uploadedVideoUrl: null,
          aparatVideoUrl: aparatUrl,
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('preserves existing video fields when a partial edit omits them', async () => {
    prisma.newsArticle.findUnique.mockResolvedValue({
      image: null,
      uploadedVideoUrl: '/uploads/550e8400-e29b-41d4-a716-446655440000.mp4',
    });
    const res = response();

    await detailHandler(request('PUT', { title: 'عنوان جدید' }, 'article-1'), res as never);

    expect(prisma.newsArticle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          videoUrl: undefined,
          uploadedVideoUrl: undefined,
          aparatVideoUrl: undefined,
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
