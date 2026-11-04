// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/student/payments';
import { authorizeStudent } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { CHECKOUT_TTL_MS } from '@/lib/payments';
import { getZarinpalConfig, requestPayment } from '@/lib/zarinpal';

vi.mock('@/lib/auth', () => ({ authorizeStudent: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));
vi.mock('@/lib/zarinpal', () => ({
  getZarinpalConfig: vi.fn(),
  requestPayment: vi.fn(),
}));

const tx = {
  payment: { findFirst: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
  registration: { findMany: vi.fn() },
};
const mockPrisma = {
  $transaction: vi.fn(),
  payment: { updateMany: vi.fn() },
};
const request = () => ({ method: 'POST' }) as never;
const response = () =>
  ({
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    setHeader: ReturnType<typeof vi.fn>;
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('/api/student/payments', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeStudent).mockResolvedValue('student-1');
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    vi.mocked(getZarinpalConfig).mockReturnValue({
      merchantId: 'merchant',
      apiUrl: 'https://gateway.example/api',
      startPayUrl: 'https://gateway.example/pay',
      siteUrl: 'https://academy.example',
    });
    vi.mocked(requestPayment).mockResolvedValue({
      authority: 'authority123',
      paymentUrl: 'https://gateway.example/pay/authority123',
    });
    mockPrisma.$transaction.mockImplementation(
      (callback: (transaction: typeof tx) => Promise<unknown>) =>
        callback(tx),
    );
    tx.payment.findFirst.mockResolvedValue(null);
    tx.payment.updateMany.mockResolvedValue({ count: 0 });
    tx.registration.findMany.mockResolvedValue([
      {
        id: 'registration-1',
        totalAmount: 2000,
        paidAmount: 500,
        program: { name: 'Football' },
      },
      {
        id: 'registration-2',
        totalAmount: 1000,
        paidAmount: 0,
        program: { name: 'Goalkeeping' },
      },
    ]);
    tx.payment.create.mockResolvedValue({});
    mockPrisma.payment.updateMany.mockResolvedValue({ count: 2 });
  });

  it('creates one gateway checkout for the combined unpaid program balances', async () => {
    const res = response();
    const startedAt = Date.now();

    await handler(request(), res as never);

    expect(tx.payment.create).toHaveBeenCalledTimes(2);
    const expiresAt = tx.payment.create.mock.calls[0][0].data.expiresAt;
    expect(expiresAt).toBeInstanceOf(Date);
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(startedAt + CHECKOUT_TTL_MS);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + CHECKOUT_TTL_MS);
    expect(vi.mocked(requestPayment)).toHaveBeenCalledWith(
      expect.any(Object),
      25000,
      'پرداخت شهریه Football، Goalkeeping',
      'https://academy.example/api/student/payments/callback',
    );
    expect(res.json).toHaveBeenCalledWith({
      paymentUrl: 'https://gateway.example/pay/authority123',
    });
    expect(mockPrisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { providerReference: expect.stringMatching(/^pending:/) },
        data: { providerReference: 'authority123' },
      }),
    );
  });

  it('fails expired pending checkouts before allowing a new one', async () => {
    const res = response();

    await handler(request(), res as never);

    expect(tx.payment.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        userId: 'student-1',
        method: 'ZARINPAL',
        status: 'PENDING',
        OR: expect.arrayContaining([
          { expiresAt: { lte: expect.any(Date) } },
          {
            expiresAt: null,
            createdAt: { lte: expect.any(Date) },
          },
        ]),
      }),
      data: { status: 'FAILED' },
    });
    expect(tx.payment.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({
        userId: 'student-1',
        method: 'ZARINPAL',
        status: 'PENDING',
        OR: expect.arrayContaining([
          { expiresAt: { gt: expect.any(Date) } },
          {
            expiresAt: null,
            createdAt: { gt: expect.any(Date) },
          },
        ]),
      }),
      select: { id: true },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('blocks checkout while an unexpired pending payment exists', async () => {
    tx.payment.findFirst.mockResolvedValue({ id: 'pending-1' });
    const res = response();

    await handler(request(), res as never);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(tx.payment.create).not.toHaveBeenCalled();
  });

  it('reports an unavailable gateway instead of fabricating a checkout URL', async () => {
    vi.mocked(getZarinpalConfig).mockReturnValue(null);
    const res = response();

    await handler(request(), res as never);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(requestPayment).not.toHaveBeenCalled();
  });
});
