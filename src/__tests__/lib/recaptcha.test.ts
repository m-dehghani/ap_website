// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyRecaptcha } from '@/lib/recaptcha';

describe('Google reCAPTCHA verification', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('fails closed without sending a request when the server secret is missing', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(verifyRecaptcha('captcha-token')).resolves.toEqual({
      ok: false,
      reason: 'unavailable',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the secret and user token to Google and accepts only success=true', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'server-only-secret');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(verifyRecaptcha('captcha-token')).resolves.toEqual({
      ok: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.google.com/recaptcha/api/siteverify',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(URLSearchParams),
        signal: expect.any(AbortSignal),
      }),
    );
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('secret')).toBe('server-only-secret');
    expect(body.get('response')).toBe('captcha-token');
  });

  it.each([
    ['Google rejection', { success: false }],
    ['an invalid provider response', { success: 'true' }],
  ])('rejects %s without treating it as a provider outage', async (_label, payload) => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'server-only-secret');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => payload,
      }),
    );

    await expect(verifyRecaptcha('captcha-token')).resolves.toEqual({
      ok: false,
      reason: 'invalid',
    });
  });

  it('fails closed when the provider request times out', async () => {
    vi.useFakeTimers();
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'server-only-secret');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      ),
    );

    const pending = verifyRecaptcha('captcha-token');
    await vi.advanceTimersByTimeAsync(5_000);

    await expect(pending).resolves.toEqual({
      ok: false,
      reason: 'unavailable',
    });
  });

  it('fails closed when Google is unreachable', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'server-only-secret');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(verifyRecaptcha('captcha-token')).resolves.toEqual({
      ok: false,
      reason: 'unavailable',
    });
  });
});
