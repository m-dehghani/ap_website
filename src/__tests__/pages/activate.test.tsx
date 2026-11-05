import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import ActivatePage from '@/pages/activate';

const router = vi.hoisted(() => ({
  isReady: true,
  query: {},
  push: vi.fn(),
}));

vi.mock('next/router', () => ({
  useRouter: () => router,
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('account activation page', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    router.query = {};
    router.push.mockReset();
  });

  it('proves credentials before requesting a code, then submits the code against its opaque challenge id', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          challengeId: '00000000-0000-4000-8000-000000000001',
          activationSent: true,
          message: 'کد فعال‌سازی ارسال شد',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activated: true,
          message: 'حساب شما فعال شد',
        }),
      });
    vi.stubGlobal('fetch', fetchMock);
    render(<ActivatePage />);

    fireEvent.change(screen.getByLabelText('ایمیل یا شماره تلفن ثبت‌شده'), {
      target: { value: 'student@example.com' },
    });
    fireEvent.change(screen.getByLabelText('رمز عبور حساب'), {
      target: { value: 'secure-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ارسال کد فعال‌سازی' }));

    await screen.findByLabelText('کد شش‌رقمی فعال‌سازی');
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/auth/activate',
      expect.objectContaining({
        body: JSON.stringify({
          action: 'request',
          identifier: 'student@example.com',
          password: 'secure-password',
          channel: 'phone',
        }),
      }),
    );
    fireEvent.change(screen.getByLabelText('کد شش‌رقمی فعال‌سازی'), {
      target: { value: '123456' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'تأیید کد و فعال‌سازی' }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        '/api/auth/activate',
        expect.objectContaining({
          body: JSON.stringify({
            action: 'verify',
            challengeId: '00000000-0000-4000-8000-000000000001',
            code: '123456',
          }),
        }),
      );
    });
    expect(await screen.findByRole('link', { name: 'ورود به حساب کاربری' })).toBeVisible();
  });

  it('returns to proof-backed registration confirmation after activation', async () => {
    router.query = { challengeId: '00000000-0000-4000-8000-000000000001' };
    window.sessionStorage.setItem(
      'registration-confirmation-proof',
      'signed-proof',
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          activated: true,
          message: 'حساب شما فعال شد',
        }),
      }),
    );
    render(<ActivatePage />);

    fireEvent.change(screen.getByLabelText('کد شش‌رقمی فعال‌سازی'), {
      target: { value: '123456' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'تأیید کد و فعال‌سازی' }),
    );

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/registration-success');
    });
  });
});
