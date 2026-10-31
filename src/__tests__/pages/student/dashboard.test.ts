// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSideProps } from '@/pages/student/dashboard';
import { getSession } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/components/Layout', () => ({ default: () => null }));
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const attendanceHistory = [
  {
    id: 'attendance-1',
    status: 'LATE',
    createdAt: new Date('2026-10-25T10:00:00.000Z'),
    session: {
      id: 'session-1',
      name: 'تمرین پایه',
      date: new Date('2026-10-25T09:00:00.000Z'),
      program: { name: 'آموزش فوتبال' },
    },
  },
];

describe('student dashboard attendance history', () => {
  const prisma = {
    user: { findUnique: vi.fn() },
    program: { findMany: vi.fn() },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
      source: 'user',
    });
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      email: null,
      firstName: 'علی',
      lastName: 'رضایی',
      phone: null,
      birthDate: null,
      marketingOptIn: false,
      role: 'STUDENT',
      registrations: [],
      attendance: attendanceHistory,
    });
    prisma.program.findMany.mockResolvedValue([]);
  });

  it('loads and serializes only the authenticated student’s attendance history', async () => {
    const result = await getServerSideProps({
      req: { cookies: { auth_token: 'signed-token' } },
    } as never);

    if (!('props' in result)) throw new Error('Expected student dashboard props');
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'student-1' },
        select: expect.objectContaining({
          attendance: expect.objectContaining({
            select: expect.objectContaining({
              id: true,
              status: true,
              session: expect.any(Object),
            }),
          }),
        }),
      }),
    );
    expect(result.props.student.attendance).toEqual([
      expect.objectContaining({
        id: 'attendance-1',
        status: 'LATE',
        session: expect.objectContaining({ id: 'session-1' }),
      }),
    ]);
    expect(JSON.stringify(result.props)).not.toContain('password');
  });
});
