// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import testimonialsHandler from '@/pages/api/admin/content/testimonials';
import testimonialDetailHandler from '@/pages/api/admin/content/testimonials/[id]';
import facilitiesHandler from '@/pages/api/admin/content/facilities';
import statisticsHandler from '@/pages/api/admin/content/statistics';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({ authorizeAdmin: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const request = (
  method: string,
  body: unknown,
  query: Record<string, string> = {},
) => ({ method, query, body }) as never;
const response = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('admin CMS content mutation validation', () => {
  const prisma = {
      testimonial: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
      },
    facility: { create: vi.fn() },
    statistic: { create: vi.fn() },
      imageAsset: { findUnique: vi.fn(), deleteMany: vi.fn() },
      user: { findFirst: vi.fn() },
      coach: { findFirst: vi.fn() },
      successStory: { findFirst: vi.fn() },
      newsArticle: { findFirst: vi.fn() },
      shopProduct: { findFirst: vi.fn() },
    };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    for (const model of [
      prisma.user,
      prisma.coach,
      prisma.successStory,
      prisma.testimonial,
      prisma.newsArticle,
      prisma.shopProduct,
    ]) {
      model.findFirst.mockResolvedValue(null);
    }
  });

  it.each([
    [
      'testimonials',
      testimonialsHandler,
      {
        name: 'مربی',
        role: 'والد',
        content: 'نظر',
        rating: 6,
      },
      prisma.testimonial.create,
    ],
    [
      'facilities',
      facilitiesHandler,
      { category: 'PITCH', name: '', displayOrder: 0 },
      prisma.facility.create,
    ],
    [
      'statistics',
      statisticsHandler,
      { key: 'players', value: '100', label: 'بازیکن', displayOrder: -1 },
      prisma.statistic.create,
    ],
  ])('rejects invalid %s creation before writing', async (_resource, handler, body, create) => {
    const res = response();

    await handler(request('POST', body), res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects invalid testimonial updates before writing', async () => {
    const res = response();

    await testimonialDetailHandler(
      request('PUT', { rating: 0 }, { id: 'testimonial-1' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.testimonial.update).not.toHaveBeenCalled();
  });

  it('preserves omitted fields on a valid partial testimonial update', async () => {
    const res = response();

    await testimonialDetailHandler(
      request('PUT', { rating: 4 }, { id: 'testimonial-1' }),
      res as never,
    );

    expect(prisma.testimonial.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'testimonial-1' },
        data: { rating: 4 },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects a new testimonial image URL that is not an uploaded app asset', async () => {
    const res = response();

    await testimonialsHandler(
      request('POST', {
        name: 'مربی',
        role: 'والد',
        content: 'نظر',
        image: 'https://external.example/photo.jpg',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.testimonial.create).not.toHaveBeenCalled();
  });

  it('cleans up an unreferenced replaced testimonial image after the update succeeds', async () => {
    const oldImage = '/api/uploads/550e8400-e29b-41d4-a716-446655440000';
    const newImage = '/api/uploads/550e8400-e29b-41d4-a716-446655440001';
    prisma.testimonial.findUnique.mockResolvedValue({ image: oldImage });
    prisma.imageAsset.findUnique.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440001' });
    prisma.testimonial.update.mockResolvedValue({ id: 'testimonial-1', image: newImage });
    const res = response();

    await testimonialDetailHandler(
      request('PUT', { image: newImage }, { id: 'testimonial-1' }),
      res as never,
    );

    expect(prisma.testimonial.update).toHaveBeenCalled();
    expect(prisma.imageAsset.deleteMany).toHaveBeenCalledWith({
      where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
