import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/test-utils';
import RefundsPage from '@/pages/admin/refunds';

const { mockRouter } = vi.hoisted(() => ({
  mockRouter: { pathname: '/admin/refunds', replace: vi.fn() },
}));

vi.mock('next/router', () => ({ useRouter: () => mockRouter }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'ADMIN' }, loading: false }),
}));

const queuedPayment = {
  id: 'payment-1',
  type: 'payment',
  customerName: 'علی محمدی',
  phone: '09120000000',
  description: 'نوجوانان',
  reference: 'ref-1',
  amount: 50000,
  currency: 'IRR',
  method: 'ONLINE',
  createdAt: '2026-10-01T10:00:00.000Z',
};

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('admin refund queue', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch.mockImplementation(async (_input: RequestInfo | URL, init?: RequestInit) => ({
      ok: true,
      json: async () =>
        init?.method === 'PATCH'
          ? { message: 'وضعیت بازپرداخت ثبت شد' }
          : { data: [queuedPayment] },
    }));
  });

  it('shows queued payment data and removes it after external refund handling is recorded', async () => {
    renderWithProviders(<RefundsPage />);

    await screen.findByText('علی محمدی');
    expect(screen.getByText('۵٬۰۰۰ تومان')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'ثبت انجام بازپرداخت' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/refunds',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ type: 'payment', id: 'payment-1' }),
        }),
      );
    });
    expect(
      await screen.findByText('بازپرداخت خارج از سامانه انجام و ثبت شد.'),
    ).toBeInTheDocument();
    expect(screen.getByText('موردی در صف بازپرداخت نیست.')).toBeInTheDocument();
  });

  it('shows a clear empty state when the queue has no pending records', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    renderWithProviders(<RefundsPage />);

    expect(
      await screen.findByText('موردی در صف بازپرداخت نیست.'),
    ).toBeInTheDocument();
  });

  it('announces queue loading failures and offers a retry', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    renderWithProviders(<RefundsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'بارگذاری صف بازپرداخت ناموفق بود.',
    );
    expect(
      screen.getByRole('button', { name: 'بارگذاری دوباره' }),
    ).toBeInTheDocument();
  });
});
