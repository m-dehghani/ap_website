import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPrisma } from '@/lib/db';
import { getMilestones } from '@/services/content';

vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

describe('public academy honors', () => {
  const prisma = { milestone: { findMany: vi.fn() } };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.milestone.findMany.mockResolvedValue([
      {
        id: 'verified-honor',
        year: 1404,
        title: 'افتخار تأییدشده',
        description: 'توضیح',
      },
    ]);
  });

  it('loads only honors explicitly verified by an admin', async () => {
    const honors = await getMilestones();

    expect(prisma.milestone.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isVerified: true },
      }),
    );
    expect(honors).toEqual([
      {
        id: 'verified-honor',
        year: 1404,
        title: 'افتخار تأییدشده',
        description: 'توضیح',
      },
    ]);
  });
});
