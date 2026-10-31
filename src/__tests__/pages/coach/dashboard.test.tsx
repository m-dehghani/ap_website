// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSideProps } from '@/pages/coach/dashboard';
import { getSession } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/components/Layout', () => ({
  default: () => null,
}));

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getPrisma: vi.fn(),
}));

const mockPrisma = {
  coach: { findUnique: vi.fn() },
};

describe('coach dashboard getServerSideProps', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      id: 'coach-1',
      role: 'COACH',
      source: 'coach',
    });
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    mockPrisma.coach.findUnique.mockResolvedValue({
      id: 'coach-1',
      firstName: 'Coach',
      lastName: 'One',
      email: 'coach@example.com',
      phone: '09120000000',
      specialization: 'Football',
      title: null,
      experience: 5,
      studentsCount: 12,
      rating: 4.5,
      programs: [],
      sessions: [
        {
          id: 'session-1',
          name: 'Training',
          date: new Date('2026-10-31T10:00:00.000Z'),
          duration: 60,
          location: 'Field',
          maxCapacity: 15,
          status: 'SCHEDULED',
        },
      ],
    });
  });

  it('returns safe coach props and serializes scheduled dates', async () => {
    const result = await getServerSideProps({
      req: { cookies: { auth_token: 'signed-token' } },
    } as never);

    expect(result).toHaveProperty('props.coach');
    if (!('props' in result)) throw new Error('Expected coach dashboard props');

    expect(result.props.coach).not.toHaveProperty('password');
    expect(result.props.coach.sessions[0].date).toBe(
      '2026-10-31T10:00:00.000Z',
    );
    expect(
      JSON.stringify(result.props),
    ).not.toContain('coach-password');
  });

  it('does not select the coach password', async () => {
    await getServerSideProps({
      req: { cookies: { auth_token: 'signed-token' } },
    } as never);

    const [query] = mockPrisma.coach.findUnique.mock.calls[0];
    expect(query.select).not.toHaveProperty('password');
    expect(query.select).not.toHaveProperty('passwordHash');
  });
});
