import { beforeEach, describe, expect, it, vi } from 'vitest';
import citiesHandler from '@/pages/api/shipping/cities';
import provincesHandler from '@/pages/api/shipping/provinces';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const request = (
  method: string,
  query: Record<string, string | string[]> = {},
) => ({ method, query }) as never;

const response = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
  };

describe('public shipping locations', () => {
  const prisma = {
    province: { findMany: vi.fn() },
    city: { findMany: vi.fn() },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
  });

  it('returns active provinces in display order', async () => {
    const provinces = [{ id: 'province-1', name: 'تهران', shippingFee: 50000 }];
    prisma.province.findMany.mockResolvedValue(provinces);
    const res = response();

    await provincesHandler(request('GET'), res as never);

    expect(prisma.province.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      select: { id: true, name: true, nameEn: true, shippingFee: true },
      orderBy: { displayOrder: 'asc' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(provinces);
  });

  it('returns active cities for the selected active province', async () => {
    const cities = [{ id: 'city-1', name: 'تهران', shippingFee: 30000 }];
    prisma.city.findMany.mockResolvedValue(cities);
    const res = response();

    await citiesHandler(request('GET', { province: 'تهران' }), res as never);

    expect(prisma.city.findMany).toHaveBeenCalledWith({
      where: { isActive: true, province: { isActive: true, name: 'تهران' } },
      select: { id: true, name: true, nameEn: true, shippingFee: true },
      orderBy: { displayOrder: 'asc' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(cities);
  });

  it('rejects missing or repeated province query values', async () => {
    for (const query of [{}, { province: ['تهران', 'فارس'] }]) {
      const res = response();
      await citiesHandler(request('GET', query), res as never);
      expect(res.status).toHaveBeenCalledWith(400);
    }

    expect(getPrisma).not.toHaveBeenCalled();
  });

  it('rejects unsupported methods', async () => {
    const res = response();

    await provincesHandler(request('POST'), res as never);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(getPrisma).not.toHaveBeenCalled();
  });
});
