import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test-utils';
import PaymentGatewaysPage from '@/pages/admin/payment-gateways';

const { mockRouter } = vi.hoisted(() => ({
  mockRouter: { pathname: '/admin/payment-gateways', replace: vi.fn() },
}));

vi.mock('next/router', () => ({ useRouter: () => mockRouter }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'ADMIN' }, loading: false }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('admin payment gateway settings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        keyReady: true,
        defaultProvider: 'ZARINPAL',
        providers: [
          {
            provider: 'ZARINPAL',
            enabled: true,
            configured: true,
            isDefault: true,
            state: 'available',
          },
          {
            provider: 'ZIBAL',
            enabled: false,
            configured: false,
            isDefault: false,
            state: 'configurable',
          },
          {
            provider: 'PASARGAD',
            enabled: false,
            configured: false,
            isDefault: false,
            state: 'deferred',
          },
        ],
      }),
    });
  });

  it('shows both live providers but gives deferred Pasargad no enable or credential control', async () => {
    renderWithProviders(<PaymentGatewaysPage />);

    expect(
      await screen.findByRole('checkbox', {
        name: 'فعال‌سازی درگاه زیبال',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'فعال‌سازی درگاه زرین‌پال',
      }),
    ).toBeInTheDocument();

    const deferred = screen.getByRole('region', {
      name: 'درگاه پاسارگاد',
    });
    expect(deferred).toHaveTextContent('در انتظار تأیید مستندات رسمی');
    expect(deferred.querySelector('input, button, select')).toBeNull();
  });

  it('announces missing encryption-key configuration and prevents credential edits', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        keyReady: false,
        defaultProvider: null,
        providers: [
          {
            provider: 'ZARINPAL',
            enabled: false,
            configured: false,
            isDefault: false,
            state: 'available',
          },
          {
            provider: 'ZIBAL',
            enabled: false,
            configured: false,
            isDefault: false,
            state: 'configurable',
          },
          {
            provider: 'PASARGAD',
            enabled: false,
            configured: false,
            isDefault: false,
            state: 'deferred',
          },
        ],
      }),
    });
    renderWithProviders(<PaymentGatewaysPage />);

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('PAYMENT_CONFIG_ENCRYPTION_KEY');
    expect(
      screen.getByRole('button', { name: 'ذخیره تنظیمات زرین‌پال' }),
    ).toBeDisabled();
  });
});
