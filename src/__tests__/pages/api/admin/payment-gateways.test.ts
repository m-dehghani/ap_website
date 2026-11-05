// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/admin/payment-gateways';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { CHECKOUT_TTL_MS } from '@/lib/payments';

vi.mock('@/lib/auth', () => ({ authorizeAdmin: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const request = (method: string, body?: unknown) =>
  ({ method, body, query: {} }) as never;
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

describe('/api/admin/payment-gateways', () => {
  const tx = {
    paymentGatewayConfig: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
    },
    payment: { count: vi.fn() },
    shopOrder: { count: vi.fn() },
  };
  const prisma = {
    paymentGatewayConfig: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
    },
    payment: { count: vi.fn() },
    shopOrder: { count: vi.fn() },
    $transaction: vi.fn(),
  };
  const validKey = Buffer.alloc(32, 9).toString('base64');

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.PAYMENT_CONFIG_ENCRYPTION_KEY = validKey;
    delete process.env.ZARINPAL_MERCHANT_ID;
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.paymentGatewayConfig.findMany.mockResolvedValue([]);
    prisma.paymentGatewayConfig.findUnique.mockResolvedValue(null);
    prisma.paymentGatewayConfig.updateMany.mockResolvedValue({ count: 0 });
    prisma.paymentGatewayConfig.upsert.mockResolvedValue({});
    tx.paymentGatewayConfig.findMany.mockResolvedValue([]);
    tx.paymentGatewayConfig.findUnique.mockResolvedValue(null);
    tx.paymentGatewayConfig.updateMany.mockResolvedValue({ count: 0 });
    tx.paymentGatewayConfig.upsert.mockResolvedValue({});
    tx.payment.count.mockResolvedValue(0);
    tx.shopOrder.count.mockResolvedValue(0);
    prisma.$transaction.mockImplementation(
      (callback: (transaction: typeof tx) => Promise<unknown>) =>
        callback(tx),
    );
  });

  it('requires an admin before reading or mutating gateway settings', async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(false);

    await handler(request('GET'), response() as never);
    await handler(
      request('PUT', {
        provider: 'ZIBAL',
        enabled: true,
        isDefault: true,
        credential: 'merchant-secret',
      }),
      response() as never,
    );

    expect(getPrisma).not.toHaveBeenCalled();
  });

  it('returns only public config state and marks Pasargad deferred without credentials', async () => {
    process.env.ZARINPAL_MERCHANT_ID = 'environment-secret';
    prisma.paymentGatewayConfig.findMany.mockResolvedValue([
      {
        provider: 'ZIBAL',
        enabled: true,
        isDefault: false,
        encryptedCredential: 'ciphertext-never-return-this',
      },
    ]);
    const res = response();

    await handler(request('GET'), res as never);

    const payload = JSON.stringify(vi.mocked(res.json).mock.calls[0][0]);
    expect(payload).not.toContain('environment-secret');
    expect(payload).not.toContain('ciphertext-never-return-this');
    expect(payload).not.toContain('merchant');
    expect(payload).toContain('"provider":"PASARGAD"');
    expect(payload).toContain('"state":"deferred"');
    expect(payload).toContain('"enabled":false');
  });

  it('fails closed without an encryption key before writing provider credentials', async () => {
    delete process.env.PAYMENT_CONFIG_ENCRYPTION_KEY;
    const res = response();

    await handler(
      request('PUT', {
        provider: 'ZIBAL',
        enabled: true,
        isDefault: true,
        credential: 'merchant-secret',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(503);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(res.json).mock.calls)).not.toContain(
      'merchant-secret',
    );
  });

  it('rejects Pasargad configuration instead of persisting an unsupported gateway', async () => {
    const res = response();

    await handler(
      request('PUT', {
        provider: 'PASARGAD',
        enabled: true,
        isDefault: true,
        credential: 'pasargad-credential',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('encrypts Zibal credentials before persisting and never returns the secret', async () => {
    const res = response();

    await handler(
      request('PUT', {
        provider: 'ZIBAL',
        enabled: true,
        isDefault: true,
        credential: 'zibal-merchant-secret',
      }),
      res as never,
    );

    expect(tx.paymentGatewayConfig.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { provider: 'ZIBAL' },
        create: expect.objectContaining({
          provider: 'ZIBAL',
          enabled: true,
          isDefault: true,
          encryptedCredential: expect.not.stringContaining(
            'zibal-merchant-secret',
          ),
        }),
      }),
    );
    expect(JSON.stringify(vi.mocked(res.json).mock.calls)).not.toContain(
      'zibal-merchant-secret',
    );
  });

  it('cannot clear credentials while unresolved payments could still receive callbacks', async () => {
    tx.paymentGatewayConfig.findUnique.mockResolvedValue({
      provider: 'ZIBAL',
      enabled: false,
      isDefault: false,
      encryptedCredential: 'encrypted',
    });
    tx.payment.count.mockResolvedValue(1);
    const res = response();

    await handler(
      request('PUT', {
        provider: 'ZIBAL',
        enabled: false,
        isDefault: false,
        clearCredential: true,
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(tx.paymentGatewayConfig.upsert).not.toHaveBeenCalled();
  });

  it('cannot replace gateway credentials while existing callbacks still need verification', async () => {
    tx.paymentGatewayConfig.findUnique.mockResolvedValue({
      provider: 'ZIBAL',
      enabled: false,
      isDefault: false,
      encryptedCredential: 'encrypted',
    });
    tx.shopOrder.count.mockResolvedValue(1);
    const res = response();

    await handler(
      request('PUT', {
        provider: 'ZIBAL',
        enabled: false,
        isDefault: false,
        credential: 'replacement-secret',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(tx.paymentGatewayConfig.upsert).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(res.json).mock.calls)).not.toContain(
      'replacement-secret',
    );
  });

  it('limits credential-change checks to the provider callback window', async () => {
    tx.paymentGatewayConfig.findUnique.mockResolvedValue({
      provider: 'ZIBAL',
      enabled: false,
      isDefault: false,
      encryptedCredential: 'encrypted',
    });
    const startedAt = Date.now();
    const res = response();

    await handler(
      request('PUT', {
        provider: 'ZIBAL',
        enabled: false,
        isDefault: false,
        credential: 'replacement-secret',
      }),
      res as never,
    );

    const paymentWhere = tx.payment.count.mock.calls[0][0].where;
    const orderWhere = tx.shopOrder.count.mock.calls[0][0].where;
    expect(paymentWhere.OR).toHaveLength(2);
    expect(paymentWhere.OR[0].expiresAt.gt).toBeInstanceOf(Date);
    expect(paymentWhere.OR[1]).toMatchObject({
      expiresAt: null,
      createdAt: { gt: expect.any(Date) },
    });
    const paymentBoundary = paymentWhere.OR[0].expiresAt.gt.getTime();
    expect(paymentBoundary).toBeGreaterThanOrEqual(
      startedAt - CHECKOUT_TTL_MS,
    );
    expect(paymentBoundary).toBeLessThanOrEqual(
      Date.now() - CHECKOUT_TTL_MS,
    );
    expect(orderWhere.expiresAt.gt).toBeInstanceOf(Date);
    const orderBoundary = orderWhere.expiresAt.gt.getTime();
    expect(orderBoundary).toBeGreaterThanOrEqual(startedAt - CHECKOUT_TTL_MS);
    expect(orderBoundary).toBeLessThanOrEqual(Date.now() - CHECKOUT_TTL_MS);
    expect(paymentWhere).toMatchObject({
      provider: 'ZIBAL',
      status: { in: ['PENDING', 'FAILED'] },
    });
    expect(orderWhere).toMatchObject({
      provider: 'ZIBAL',
      status: { in: ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'CANCELLED'] },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
