import { fireEvent, renderWithProviders, screen, waitFor } from '@/test-utils';
import MessagesPage from '@/pages/admin/messages';

const { mockRouter } = vi.hoisted(() => ({
  mockRouter: { pathname: '/admin/messages', replace: vi.fn() },
}));
vi.mock('next/router', () => ({ useRouter: () => mockRouter }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'ADMIN' }, loading: false }),
}));

const message = {
  id: 'message-1',
  firstName: 'علی',
  lastName: 'محمدی',
  email: 'ali@example.com',
  phone: '09120000000',
  message: 'برای ثبت نام اطلاعات می‌خواستم.',
  status: 'NEW',
  createdAt: '2026-10-01T10:00:00.000Z',
};
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('admin contact inbox', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch.mockImplementation(async (_input: RequestInfo | URL, init?: RequestInit) => ({
      ok: true,
      json: async () =>
        init?.method === 'PATCH'
          ? { message: 'وضعیت پیام به‌روزرسانی شد.' }
          : { data: [message] },
    }));
  });

  it('lists contact details and lets admins update message status', async () => {
    renderWithProviders(<MessagesPage />);

    expect(await screen.findByText('برای ثبت نام اطلاعات می‌خواستم.')).toBeInTheDocument();
    const status = screen.getByRole('combobox', {
      name: 'وضعیت پیام علی محمدی',
    });
    fireEvent.change(status, { target: { value: 'READ' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/messages',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            id: 'message-1',
            status: 'READ',
            expectedStatus: 'NEW',
          }),
        }),
      );
    });
    expect(await screen.findByText('وضعیت پیام به‌روزرسانی شد.')).toHaveAttribute(
      'role',
      'status',
    );
    expect(status).toHaveValue('READ');
  });

  it('announces inbox load failures and offers retry', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    renderWithProviders(<MessagesPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'بارگذاری پیام‌ها ناموفق بود.',
    );
    expect(screen.getByRole('button', { name: 'بارگذاری دوباره' })).toBeInTheDocument();
  });
});
