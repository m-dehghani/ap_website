import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/admin/refunds';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({ authorizeAdmin: vi.fn().mockResolvedValue(true) }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const request = (method: string, body?: unknown) =>
  ({ method, query: {}, body }) as never;
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

describe('/api/admin/refunds', () => {
  const prisma = {
    payment: { findMany: vi.fn(), updateMany: vi.fn() },
    shopOrder: { findMany: vi.fn(), updateMany: vi.fn() },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.payment.findMany.mockResolvedValue([
      {
        id: 'payment-1',
        amount: 50000,
        currency: 'IRR',
        method: 'ONLINE',
        providerReference: 'ref-1',
        createdAt: new Date('2026-10-01T10:00:00.000Z'),
        user: { firstName: 'علی', lastName: 'محمدی', phone: '09120000000' },
        registration: { program: { name: 'نوجوانان' } },
      },
    ]);
    prisma.shopOrder.findMany.mockResolvedValue([
      {
        id: 'order-1',
        orderNumber: 'ORD-1',
        fullName: 'سارا رضایی',
        phone: '09121111111',
        totalAmount: 2000,
        createdAt: new Date('2026-10-02T10:00:00.000Z'),
        items: [],
      },
    ]);
    prisma.payment.updateMany.mockResolvedValue({ count: 1 });
    prisma.shopOrder.updateMany.mockResolvedValue({ count: 1 });
  });

  it('requires admin authorization before reading the queue', async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(false);
    const res = response();

    await handler(request('GET'), res as never);

    expect(res.status).not.toHaveBeenCalledWith(200);
    expect(prisma.payment.findMany).not.toHaveBeenCalled();
    expect(prisma.shopOrder.findMany).not.toHaveBeenCalled();
  });

  it('requires admin authorization before transitioning a queue item', async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(false);
    const res = response();

    await handler(
      request('PATCH', { type: 'payment', id: 'payment-1' }),
      res as never,
    );

    expect(prisma.payment.updateMany).not.toHaveBeenCalled();
  });

  it('lists only records flagged for external refund handling', async () => {
    const res = response();

    await handler(request('GET'), res as never);

    expect(prisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'REFUND_REQUIRED' } }),
    );
    expect(prisma.shopOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'REFUND_REQUIRED' } }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'payment-1', type: 'payment' }),
          expect.objectContaining({ id: 'order-1', type: 'shopOrder' }),
        ]),
      }),
    );
  });

  it.each([
    { type: 'payment', id: 'payment-1' },
    { type: 'shopOrder', id: 'order-1' },
  ])('conditionally marks $type as refunded', async (body) => {
    const res = response();

    await handler(request('PATCH', body), res as never);

    const model = body.type === 'payment' ? prisma.payment : prisma.shopOrder;
    expect(model.updateMany).toHaveBeenCalledWith({
      where: { id: body.id, status: 'REFUND_REQUIRED' },
      data: { status: 'REFUNDED' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not transition an item whose status changed after the queue read', async () => {
    prisma.payment.updateMany.mockResolvedValue({ count: 0 });
    const res = response();

    await handler(
      request('PATCH', { type: 'payment', id: 'payment-1' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('rejects unsupported item types without writing', async () => {
    const res = response();

    await handler(
      request('PATCH', { type: 'gateway', id: 'payment-1' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.payment.updateMany).not.toHaveBeenCalled();
    expect(prisma.shopOrder.updateMany).not.toHaveBeenCalled();
  });
});
