// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/student/payments/callback';
import { getPrisma } from '@/lib/db';
import { getZarinpalConfig, verifyPayment } from '@/lib/zarinpal';

vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));
vi.mock('@/lib/zarinpal', () => ({
  getZarinpalConfig: vi.fn(),
  verifyPayment: vi.fn(),
}));

const tx = {
  payment: { findMany: vi.fn(), update: vi.fn() },
  registration: { update: vi.fn() },
};
const mockPrisma = {
  payment: { findMany: vi.fn(), updateMany: vi.fn() },
  $transaction: vi.fn(),
};
const request = (status: string) =>
  ({
    method: 'GET',
    query: { Authority: 'authority123', Status: status },
  }) as never;
const response = () =>
  ({
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    redirect: vi.fn(),
  }) as never as {
    setHeader: ReturnType<typeof vi.fn>;
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    redirect: ReturnType<typeof vi.fn>;
  };

describe('/api/student/payments/callback', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    vi.mocked(getZarinpalConfig).mockReturnValue({
      merchantId: 'merchant',
      apiUrl: 'https://gateway.example/api',
      startPayUrl: 'https://gateway.example/pay',
      siteUrl: 'https://academy.example',
    });
    vi.mocked(verifyPayment).mockResolvedValue({ code: 100, ref_id: 123 });
    mockPrisma.payment.findMany.mockResolvedValue([
      { id: 'payment-1', amount: 10000, status: 'PENDING' },
    ]);
    mockPrisma.payment.updateMany.mockResolvedValue({ count: 1 });
    tx.payment.findMany.mockResolvedValue([
      {
        id: 'payment-1',
        amount: 10000,
        status: 'PENDING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        registrationId: 'registration-1',
        registration: {
          status: 'APPROVED',
          totalAmount: 1000,
          paidAmount: 0,
        },
      },
    ]);
    tx.payment.update.mockResolvedValue({});
    tx.registration.update.mockResolvedValue({});
    mockPrisma.$transaction.mockImplementation(
      (callback: (transaction: typeof tx) => Promise<unknown>) =>
        callback(tx),
    );
  });

  it('verifies the gateway amount before crediting the registration balance', async () => {
    const res = response();

    await handler(request('OK'), res as never);

    expect(verifyPayment).toHaveBeenCalledWith(
      expect.any(Object),
      'authority123',
      10000,
    );
    expect(tx.payment.update).toHaveBeenCalledWith({
      where: { id: 'payment-1' },
      data: { status: 'COMPLETED' },
    });
    expect(tx.registration.update).toHaveBeenCalledWith({
      where: { id: 'registration-1' },
      data: { paidAmount: { increment: 1000 } },
    });
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/student/dashboard?payment=success',
    );
  });

  it('does not trust a cancellation query unless the gateway verifies it', async () => {
    vi.mocked(verifyPayment).mockResolvedValue({ code: -21 });
    const res = response();

    await handler(request('NOK'), res as never);

    expect(mockPrisma.payment.updateMany).toHaveBeenCalledWith({
      where: {
        providerReference: 'authority123',
        method: 'ZARINPAL',
        status: 'PENDING',
      },
      data: { status: 'FAILED' },
    });
    expect(tx.registration.update).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/student/dashboard?payment=cancelled',
    );
  });

  it('queues a gateway-verified success after expiry without crediting tuition', async () => {
    const expiredAt = new Date(Date.now() - 15 * 60 * 1000);
    mockPrisma.payment.findMany.mockResolvedValue([
      { id: 'payment-1', amount: 10000, status: 'FAILED' },
    ]);
    tx.payment.findMany.mockResolvedValue([
      {
        id: 'payment-1',
        amount: 10000,
        status: 'FAILED',
        createdAt: expiredAt,
        expiresAt: expiredAt,
        registrationId: 'registration-1',
        registration: {
          status: 'APPROVED',
          totalAmount: 1000,
          paidAmount: 0,
        },
      },
    ]);
    const res = response();

    await handler(request('OK'), res as never);

    expect(verifyPayment).toHaveBeenCalledWith(
      expect.any(Object),
      'authority123',
      10000,
    );
    expect(tx.payment.update).toHaveBeenCalledWith({
      where: { id: 'payment-1' },
      data: { status: 'REFUND_REQUIRED' },
    });
    expect(tx.registration.update).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/student/dashboard?payment=refund-required',
    );
  });
});
