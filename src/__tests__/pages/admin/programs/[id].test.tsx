import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/test-utils';
import ProgramFormPage from '@/pages/admin/programs/[id]';
import { createMockCoach, createMockProgram } from '@/test-utils';

const { mockRouter } = vi.hoisted(() => ({
  mockRouter: {
    isReady: true,
    pathname: '/admin/programs/new',
    query: {} as Record<string, string>,
    push: vi.fn(),
    back: vi.fn(),
  },
}));

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { role: 'ADMIN' },
    loading: false,
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Admin program form', () => {
  const coach = createMockCoach();
  const program = {
    ...createMockProgram(),
    coachId: coach.id,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockRouter.isReady = true;
    mockRouter.pathname = '/admin/programs/new';
    mockRouter.query = {};
    mockFetch.mockImplementation(async (input: RequestInfo | URL) => ({
      ok: true,
      json: async () => (
        String(input).includes('/coaches') ? [coach] : program
      ),
      text: async () => '',
    }));
  });

  it('loads available coaches for creating a program', async () => {
    renderWithProviders(<ProgramFormPage />);

    await waitFor(() => {
      expect(
        document.querySelector<HTMLSelectElement>('select[name="coachId"]')
          ?.options,
      ).toHaveLength(2);
    });

    fireEvent.change(
      document.querySelector<HTMLSelectElement>('select[name="coachId"]')!,
      { target: { value: coach.id } },
    );
    expect(
      document.querySelector<HTMLSelectElement>('select[name="coachId"]')
        ?.value,
    ).toBe(coach.id);
    expect(screen.getByRole('option', { name: 'علی محمدی' })).toBeInTheDocument();
  });

  it('loads the existing coach selection when editing a program', async () => {
    mockRouter.pathname = '/admin/programs/[id]';
    mockRouter.query = { id: program.id };

    renderWithProviders(<ProgramFormPage />);

    await screen.findByRole('button', { name: 'ذخیره تغییرات' });

    await waitFor(() => {
      expect(
        document.querySelector<HTMLSelectElement>('select[name="coachId"]')
          ?.value,
      ).toBe(coach.id);
    });
    expect(mockFetch).toHaveBeenCalledWith(`/api/admin/programs/${program.id}`, undefined);
  });
});
