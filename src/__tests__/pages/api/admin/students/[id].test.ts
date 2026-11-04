import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/admin/students/[id]';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({ authorizeAdmin: vi.fn().mockResolvedValue(true) }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const request = (body: unknown) =>
  ({ method: 'PUT', query: { id: 'registration-1' }, body }) as never;
const response = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('admin student updates', () => {
  const prisma = {
    registration: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.registration.findUnique.mockResolvedValue({
      status: 'PENDING',
      totalAmount: 1000,
      paidAmount: 200,
    });
    prisma.registration.updateMany.mockResolvedValue({ count: 1 });
  });

  it.each([
    { totalAmount: -1, paidAmount: 0 },
    { totalAmount: 1000, paidAmount: -1 },
    { totalAmount: 1000, paidAmount: 1001 },
    { totalAmount: 1000.5, paidAmount: 100 },
    { totalAmount: 2_147_483_648, paidAmount: 100 },
  ])('rejects invalid registration money without writing: %o', async (body) => {
    const res = response();

    await handler(request(body), res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.registration.updateMany).not.toHaveBeenCalled();
  });

  it('checks a partial paid amount against the persisted total', async () => {
    const res = response();

    await handler(request({ paidAmount: 1001 }), res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.registration.updateMany).not.toHaveBeenCalled();
  });

  it('accepts integer strings from the admin amount inputs and stores numbers', async () => {
    const res = response();

    await handler(
      request({ totalAmount: '1200', paidAmount: '250' }),
      res as never,
    );

    expect(prisma.registration.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'registration-1' }),
        data: expect.objectContaining({ totalAmount: 1200, paidAmount: 250 }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('allows a normal pending-to-approved status transition without a reason', async () => {
    const res = response();

    await handler(request({ status: 'APPROVED' }), res as never);

    expect(prisma.registration.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'APPROVED' }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('requires a reason for a non-standard registration status transition', async () => {
    const res = response();

    await handler(request({ status: 'COMPLETED' }), res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.registration.updateMany).not.toHaveBeenCalled();
  });

  it('allows an explicit reason for an otherwise non-standard transition', async () => {
    const res = response();

    await handler(
      request({ status: 'COMPLETED', reason: 'اصلاح ثبت‌نام با تایید مدیر' }),
      res as never,
    );

    expect(prisma.registration.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'registration-1' }),
        data: expect.objectContaining({ status: 'COMPLETED' }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects a stale financial update when registration values changed concurrently', async () => {
    prisma.registration.updateMany.mockResolvedValue({ count: 0 });
    const res = response();

    await handler(
      request({ totalAmount: 1200, paidAmount: 300 }),
      res as never,
    );

    expect(prisma.registration.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'registration-1',
          status: 'PENDING',
          totalAmount: 1000,
          paidAmount: 200,
        },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('rejects an unsupported registration status even with a reason', async () => {
    const res = response();

    await handler(
      request({ status: 'ARCHIVED', reason: 'اصلاح وضعیت' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.registration.updateMany).not.toHaveBeenCalled();
  });
});
