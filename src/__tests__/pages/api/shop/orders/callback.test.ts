// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/shop/orders/callback';
import { getPrisma } from '@/lib/db';
import { getPaymentGateway } from '@/lib/payment-gateways';

vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));
vi.mock('@/lib/payment-gateways', () => ({ getPaymentGateway: vi.fn() }));

const item = { variantId: 'variant-1', quantity: 2 };
const tx = {
  shopOrder: { findUnique: vi.fn(), update: vi.fn() },
  shopVariant: { updateMany: vi.fn(), update: vi.fn() },
};
const mockPrisma = {
  shopOrder: { findUnique: vi.fn() },
  $transaction: vi.fn(),
};
const verifyPayment = vi.fn();
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
const order = (overrides: Record<string, unknown> = {}) => ({
  id: 'order-1',
  orderNumber: 'AP-123',
  totalAmount: 100_000,
  status: 'PENDING_PAYMENT',
  provider: 'ZARINPAL',
  providerReference: 'authority123',
  expiresAt: new Date(Date.now() + 60_000),
  items: [item],
  ...overrides,
});

describe('/api/shop/orders/callback reservation consistency', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    verifyPayment.mockResolvedValue({ state: 'paid', reference: '123' });
    vi.mocked(getPaymentGateway).mockResolvedValue({
      verifyPayment,
    } as never);
    mockPrisma.shopOrder.findUnique.mockResolvedValue(order());
    tx.shopOrder.findUnique.mockResolvedValue(order());
    tx.shopOrder.update.mockResolvedValue({});
    tx.shopVariant.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.$transaction.mockImplementation(
      (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
    );
  });

  it('releases stock once when the customer cancels a pending order', async () => {
    verifyPayment.mockResolvedValue({ state: 'not-paid' });
    const res = response();

    await handler(request('NOK'), res as never);

    expect(tx.shopVariant.updateMany).toHaveBeenCalledWith({
      where: { id: 'variant-1', reserved: { gte: 2 } },
      data: { reserved: { decrement: 2 } },
    });
    expect(tx.shopOrder.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'CANCELLED' },
    });
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/shop/payment?result=cancelled&order=AP-123',
    );
  });

  it('releases stock when the gateway confirms payment failure', async () => {
    verifyPayment.mockResolvedValue({ state: 'not-paid' });
    const res = response();

    await handler(request('OK'), res as never);

    expect(tx.shopVariant.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.shopOrder.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'PAYMENT_FAILED' },
    });
  });

  it('does not trust Zibal success=1 without verification and exact rial amount', async () => {
    verifyPayment.mockResolvedValue({ state: 'not-paid' });
    mockPrisma.shopOrder.findUnique.mockResolvedValue(order({ provider: 'ZIBAL' }));
    const req = {
      method: 'GET',
      query: { trackId: '15966442233311', success: '1' },
    } as never;
    const res = response();

    await handler(req, res as never);

    expect(getPaymentGateway).toHaveBeenCalledWith(
      mockPrisma,
      'ZIBAL',
      { allowDisabled: true },
    );
    expect(verifyPayment).toHaveBeenCalledWith(
      '15966442233311',
      1_000_000,
    );
    expect(tx.shopVariant.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.shopVariant.update).not.toHaveBeenCalled();
    expect(tx.shopOrder.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'PAYMENT_FAILED' },
    });
  });

  it('does not release twice when a cancellation callback is repeated', async () => {
    tx.shopOrder.findUnique.mockResolvedValue(order({ status: 'CANCELLED' }));
    const res = response();

    await handler(request('NOK'), res as never);

    expect(tx.shopVariant.updateMany).not.toHaveBeenCalled();
    expect(tx.shopOrder.update).not.toHaveBeenCalled();
  });

  it('queues a verified late payment for refund without decrementing stock', async () => {
    tx.shopOrder.findUnique.mockResolvedValue(
      order({ expiresAt: new Date(Date.now() - 60_000) }),
    );
    const res = response();

    await handler(request('OK'), res as never);

    expect(tx.shopVariant.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.shopVariant.update).not.toHaveBeenCalled();
    expect(tx.shopOrder.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'REFUND_REQUIRED' },
    });
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/shop/payment?result=refund-required&order=AP-123',
    );
  });

  it('queues a verified late payment after expiry cleanup without releasing again', async () => {
    tx.shopOrder.findUnique.mockResolvedValue(
      order({
        status: 'CANCELLED',
        expiresAt: new Date(Date.now() - 60_000),
      }),
    );
    const res = response();

    await handler(request('OK'), res as never);

    expect(tx.shopVariant.updateMany).not.toHaveBeenCalled();
    expect(tx.shopVariant.update).not.toHaveBeenCalled();
    expect(tx.shopOrder.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'REFUND_REQUIRED' },
    });
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/shop/payment?result=refund-required&order=AP-123',
    );
  });

  it('does not touch inventory when a late-payment callback is repeated', async () => {
    tx.shopOrder.findUnique.mockResolvedValue(order({ status: 'REFUND_REQUIRED' }));
    const res = response();

    await handler(request('OK'), res as never);

    expect(tx.shopVariant.updateMany).not.toHaveBeenCalled();
    expect(tx.shopVariant.update).not.toHaveBeenCalled();
    expect(tx.shopOrder.update).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/shop/payment?result=refund-required&order=AP-123',
    );
  });
});
