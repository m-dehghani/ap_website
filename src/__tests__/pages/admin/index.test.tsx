import { renderWithProviders, screen } from '@/test-utils';
import AdminDashboard, { getServerSideProps } from '@/pages/admin';

const { mockRouter, mockGetSession, mockGetPrisma } = vi.hoisted(() => ({
  mockRouter: { pathname: '/admin', replace: vi.fn() },
  mockGetSession: vi.fn(),
  mockGetPrisma: vi.fn(),
}));

vi.mock('next/router', () => ({ useRouter: () => mockRouter }));
vi.mock('@/lib/auth', () => ({ getSession: mockGetSession }));
vi.mock('@/lib/db', () => ({ getPrisma: mockGetPrisma }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'admin-1',
      role: 'ADMIN',
      firstName: 'مدیر',
      lastName: 'آکادمی',
    },
    loading: false,
    refreshUser: vi.fn(),
  }),
}));

describe('admin dashboard shell', () => {
  it('loads the root route for a database-backed admin session', async () => {
    const admin = {
      id: 'admin-1',
      email: 'admin@example.invalid',
      firstName: 'مدیر',
      lastName: 'آکادمی',
      role: 'ADMIN',
    };
    mockGetSession.mockResolvedValue({
      id: admin.id,
      role: 'ADMIN',
      source: 'user',
    });
    const findUnique = vi.fn().mockResolvedValue(admin);
    mockGetPrisma.mockResolvedValue({ user: { findUnique } });

    const result = await getServerSideProps!({
      req: { cookies: { auth_token: 'test-token' } },
    } as never);

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: admin.id } }),
    );
    expect(result).toEqual({ props: { admin } });
  });

  it('renders the authenticated dashboard inside the complete shared layout', () => {
    renderWithProviders(
      <AdminDashboard
        admin={{
          id: 'admin-1',
          firstName: 'مدیر',
          lastName: 'آکادمی',
          email: 'admin@example.invalid',
          role: 'ADMIN',
        }}
      />,
    );

    expect(
      screen.getByRole('navigation', { name: 'پنل مدیریت' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getAllByRole('heading', { level: 1, name: 'پنل مدیریت' }),
    ).toHaveLength(2);
  });
});
