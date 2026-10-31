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
    testimonial: { create: vi.fn(), update: vi.fn() },
    facility: { create: vi.fn() },
    statistic: { create: vi.fn() },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
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
});
