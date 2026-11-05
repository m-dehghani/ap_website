// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  requestZibalPayment,
  verifyZibalPayment,
} from '@/lib/payment-providers/zibal';

describe('Zibal IPG adapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a rial checkout and returns the documented browser start URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ result: 100, trackId: 15966442233311 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await requestZibalPayment(
      { merchant: 'merchant-token' },
      125_000,
      'پرداخت شهریه',
      'https://academy.example/api/student/payments/callback?provider=ZIBAL',
      'payment-group-7',
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://gateway.zibal.ir/v1/request',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: 'merchant-token',
          amount: 125_000,
          description: 'پرداخت شهریه',
          callbackUrl:
            'https://academy.example/api/student/payments/callback?provider=ZIBAL',
          orderId: 'payment-group-7',
        }),
      }),
    );
    expect(result).toEqual({
      reference: '15966442233311',
      paymentUrl: 'https://gateway.zibal.ir/start/15966442233311',
    });
  });

  it('rejects unsuccessful request results and never includes credentials in errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({ result: 103, message: 'invalid merchant' }),
      ),
    );

    const request = requestZibalPayment(
      { merchant: 'do-not-leak-this' },
      5000,
      'خرید',
      'https://academy.example/callback',
      'order-1',
    );
    await expect(request).rejects.toThrow('Zibal rejected the payment request');
    await expect(request).rejects.not.toThrow('do-not-leak-this');
  });

  it.each([
    [100, 1, 125_000, true],
    [201, 1, 125_000, true],
    [202, 0, 125_000, false],
    [100, 1, 125_001, false],
    [100, 2, 125_000, false],
  ])(
    'trusts only verified paid responses with the exact expected rial amount (%s/%s/%s)',
    async (result, status, amount, paid) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          Response.json({ result, status, amount, refNumber: 445566 }),
        ),
      );

      await expect(
        verifyZibalPayment({ merchant: 'merchant-token' }, 15966442233311, 125_000),
      ).resolves.toEqual(
        paid
          ? { state: 'paid', reference: '445566' }
          : { state: 'not-paid' },
      );
    },
  );

  it('sends only merchant and trackId to the official verify endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        result: 100,
        status: 1,
        amount: 125_000,
        refNumber: 445566,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await verifyZibalPayment(
      { merchant: 'merchant-token' },
      15966442233311,
      125_000,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://gateway.zibal.ir/v1/verify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          merchant: 'merchant-token',
          trackId: 15966442233311,
        }),
      }),
    );
  });

  it('treats malformed/provider-error responses as verification errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ result: 115, message: 'error' })),
    );

    await expect(
      verifyZibalPayment({ merchant: 'merchant-token' }, 15966442233311, 125_000),
    ).rejects.toThrow();
  });
});
