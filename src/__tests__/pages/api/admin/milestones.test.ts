import { beforeEach, describe, expect, it, vi } from 'vitest';
import createHandler from '@/pages/api/admin/content/milestones';
import updateHandler from '@/pages/api/admin/content/milestones/[id]';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({ authorizeAdmin: vi.fn().mockResolvedValue(true) }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const request = (method: string, body: unknown, query: Record<string, string> = {}) =>
  ({ method, body, query }) as never;

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

describe('admin academy honors', () => {
  const prisma = {
    milestone: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.milestone.create.mockResolvedValue({ id: 'honor-1', isVerified: false });
    prisma.milestone.update.mockResolvedValue({ id: 'honor-1', isVerified: true });
  });

  it('creates academy milestones as unverified by default', async () => {
    const res = response();

    await createHandler(
      request('POST', {
        year: 1404,
        title: 'قهرمانی ثبت‌شده',
        description: 'توضیحات رویداد',
        displayOrder: 1,
      }),
      res as never,
    );

    expect(prisma.milestone.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        year: 1404,
        isVerified: false,
      }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('rejects invalid honor data before persistence', async () => {
    const res = response();

    await createHandler(
      request('POST', {
        year: 1404,
        title: ' ',
        description: 'توضیحات رویداد',
        isVerified: 'true',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.milestone.create).not.toHaveBeenCalled();
  });

  it('allows admins to explicitly verify an honor', async () => {
    const res = response();

    await updateHandler(
      request(
        'PUT',
        {
          year: 1404,
          title: 'قهرمانی ثبت‌شده',
          description: 'توضیحات رویداد',
          displayOrder: 1,
          isVerified: true,
        },
        { id: 'honor-1' },
      ),
      res as never,
    );

    expect(prisma.milestone.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'honor-1' },
        data: expect.objectContaining({ isVerified: true }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
