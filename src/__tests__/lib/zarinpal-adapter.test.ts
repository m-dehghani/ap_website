import { afterEach, describe, expect, it, vi } from 'vitest';
import { createZarinpalAdapter } from '@/lib/payment-providers/zarinpal-adapter';
import type { ZarinpalConfig } from '@/lib/zarinpal';

const config: ZarinpalConfig = {
  merchantId: 'merchant-test',
  apiUrl: 'https://sandbox.zarinpal.com/pg/v4/payment',
  startPayUrl: 'https://sandbox.zarinpal.com/pg/StartPay',
  siteUrl: 'https://academy.example',
};

const mockFetch = (body: unknown, ok = true, status = 200) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => vi.unstubAllGlobals());

describe('Zarinpal payment gateway adapter', () => {
  it('creates a checkout with the configured rial amount and callback', async () => {
    const fetchMock = mockFetch({
      data: { code: 100, authority: 'A00000000000000000000000000123456789' },
    });
    const gateway = createZarinpalAdapter(config);

    await expect(
      gateway.requestPayment(250_000, 'Tuition', 'https://academy.example/callback'),
    ).resolves.toEqual({
      reference: 'A00000000000000000000000000123456789',
      paymentUrl:
        'https://sandbox.zarinpal.com/pg/StartPay/A00000000000000000000000000123456789',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://sandbox.zarinpal.com/pg/v4/payment/request.json',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          merchant_id: config.merchantId,
          amount: 250_000,
          description: 'Tuition',
          callback_url: 'https://academy.example/callback',
        }),
      }),
    );
  });

  it('verifies payment references and maps successful provider responses', async () => {
    const fetchMock = mockFetch({ data: { code: 100, ref_id: 987654 } });
    const gateway = createZarinpalAdapter(config);

    await expect(
      gateway.verifyPayment('A-authority', 250_000),
    ).resolves.toEqual({ state: 'paid', reference: '987654' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://sandbox.zarinpal.com/pg/v4/payment/verify.json',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          merchant_id: config.merchantId,
          authority: 'A-authority',
          amount: 250_000,
        }),
      }),
    );
  });

  it('treats a provider cancellation as unpaid and rejects provider failures', async () => {
    mockFetch({ data: { code: -21 } });
    const gateway = createZarinpalAdapter(config);
    await expect(
      gateway.verifyPayment('A-cancelled', 250_000),
    ).resolves.toEqual({ state: 'not-paid' });

    mockFetch({ data: { code: -9 } });
    await expect(
      gateway.verifyPayment('A-invalid', 250_000),
    ).rejects.toThrow('Zarinpal could not verify the payment');
  });

  it('treats the sandbox errors response for a cancelled payment as unpaid', async () => {
    const fetchMock = mockFetch(
      { errors: { code: -51, message: 'Payment was cancelled' } },
      false,
      400,
    );
    const gateway = createZarinpalAdapter(config);

    await expect(
      gateway.verifyPayment('A-cancelled', 250_000),
    ).resolves.toEqual({ state: 'not-paid' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://sandbox.zarinpal.com/pg/v4/payment/verify.json',
      expect.any(Object),
    );
  });

  it('rejects other non-2xx verification errors', async () => {
    mockFetch(
      { errors: { code: -9, message: 'Provider error' } },
      false,
      400,
    );
    const gateway = createZarinpalAdapter(config);

    await expect(
      gateway.verifyPayment('A-invalid', 250_000),
    ).rejects.toThrow('Zarinpal could not verify the payment');
  });
});
