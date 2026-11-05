import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import RegistrationSuccessPage from '@/pages/registration-success';

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('registration success confirmation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
  });

  it('does not show success when opened directly without the session proof', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<RegistrationSuccessPage />);

    expect(await screen.findByRole('heading', { name: 'وضعیت ثبت‌نام قابل تأیید نیست' })).toBeVisible();
    expect(screen.queryByText('ثبت‌نام شما در آکادمی ثبت شده است.')).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows success only after server confirmation and clears the session proof', async () => {
    window.sessionStorage.setItem('registration-confirmation-proof', 'signed-proof');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ verified: true }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<RegistrationSuccessPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'ثبت‌نام شما تأیید شد' })).toBeVisible();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/register/confirmation',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ proof: 'signed-proof' }),
      }),
    );
    expect(window.sessionStorage.getItem('registration-confirmation-proof')).toBeNull();
  });

  it('stays neutral when the server rejects the proof', async () => {
    window.sessionStorage.setItem('registration-confirmation-proof', 'tampered-proof');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ verified: false }),
      }),
    );
    render(<RegistrationSuccessPage />);

    expect(await screen.findByRole('heading', { name: 'وضعیت ثبت‌نام قابل تأیید نیست' })).toBeVisible();
    expect(screen.queryByText('ثبت‌نام شما در آکادمی ثبت شده است.')).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem('registration-confirmation-proof')).toBe(
      'tampered-proof',
    );
  });
});
