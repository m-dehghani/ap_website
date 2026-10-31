// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import adminHandler from '@/pages/api/admin/sessions/[id]/attendance';
import coachHandler from '@/pages/api/coach/sessions/[id]/attendance';
import { authorizeAdmin, requireRole } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({
  authorizeAdmin: vi.fn(),
  requireRole: vi.fn(),
}));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const request = (method: string, body: unknown) =>
  ({ method, query: { id: 'session-1' }, body }) as never;
const response = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
  };

const validRoster = {
  attendance: [
    { userId: 'student-1', status: 'PRESENT' },
    { userId: 'student-2', status: 'LATE', notes: 'با تأخیر رسید' },
  ],
};

describe('attendance APIs', () => {
  const tx = {
    registration: { findMany: vi.fn() },
    attendance: { upsert: vi.fn() },
  };
  const prisma = {
    session: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(requireRole).mockResolvedValue({
      id: 'coach-1',
      role: 'COACH',
      source: 'coach',
    });
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      programId: 'program-1',
      coachId: 'coach-1',
      program: { coachId: 'coach-1' },
    });
    tx.registration.findMany.mockResolvedValue([
      { userId: 'student-1' },
      { userId: 'student-2' },
    ]);
    tx.attendance.upsert.mockImplementation(async (args) => ({
      id: `attendance-${args.where.userId_sessionId.userId}`,
      ...args.create,
      ...args.update,
    }));
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));
  });

  it('rejects a coach who does not own the session or its program with 403', async () => {
    const res = response();
    prisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      programId: 'program-1',
      coachId: 'coach-owner',
      program: { coachId: 'coach-owner' },
    });

    await coachHandler(request('POST', validRoster), res as never);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(tx.attendance.upsert).not.toHaveBeenCalled();
  });

  it('allows the owning coach to save attendance for their session', async () => {
    const res = response();

    await coachHandler(request('POST', validRoster), res as never);

    expect(prisma.session.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'session-1' },
        select: expect.objectContaining({
          coachId: true,
          program: { select: { coachId: true } },
        }),
      }),
    );
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(tx.attendance.upsert).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects the whole roster when any user is not registered in the program', async () => {
    const res = response();
    tx.registration.findMany.mockResolvedValue([{ userId: 'student-1' }]);

    await adminHandler(request('POST', validRoster), res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(tx.attendance.upsert).not.toHaveBeenCalled();
  });

  it('upserts each enrolled user by the unique user-session pair', async () => {
    const res = response();

    await adminHandler(request('POST', validRoster), res as never);

    expect(tx.registration.findMany).toHaveBeenCalledWith({
      where: {
        programId: 'program-1',
        status: { in: ['PENDING', 'APPROVED'] },
        userId: { in: ['student-1', 'student-2'] },
      },
      select: { userId: true },
    });
    expect(tx.attendance.upsert).toHaveBeenCalledTimes(2);
    expect(tx.attendance.upsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { userId_sessionId: { userId: 'student-1', sessionId: 'session-1' } },
        create: {
          userId: 'student-1',
          sessionId: 'session-1',
          status: 'PRESENT',
          notes: null,
        },
        update: { status: 'PRESENT' },
      }),
    );
    expect(tx.attendance.upsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { userId_sessionId: { userId: 'student-2', sessionId: 'session-1' } },
        create: expect.objectContaining({ status: 'LATE', notes: 'با تأخیر رسید' }),
        update: { status: 'LATE', notes: 'با تأخیر رسید' },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updates only the requested user-session attendance on PUT', async () => {
    const res = response();

    await adminHandler(
      request('PUT', {
        attendance: [{ userId: 'student-2', status: 'ABSENT' }],
      }),
      res as never,
    );

    expect(tx.attendance.upsert).toHaveBeenCalledTimes(1);
    expect(tx.attendance.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_sessionId: { userId: 'student-2', sessionId: 'session-1' } },
        update: { status: 'ABSENT' },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects unknown attendance statuses before opening a transaction', async () => {
    const res = response();

    await adminHandler(
      request('PUT', { attendance: [{ userId: 'student-1', status: 'UNKNOWN' }] }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
