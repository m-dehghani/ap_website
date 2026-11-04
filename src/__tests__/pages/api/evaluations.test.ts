// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import adminHandler from '@/pages/api/admin/evaluations';
import coachHandler from '@/pages/api/coach/evaluations';
import { authorizeAdmin, requireRole } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({
  authorizeAdmin: vi.fn(),
  requireRole: vi.fn(),
}));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const scores = {
  technical: 8,
  physical: 7,
  mental: 9,
  teamwork: 8,
  overall: 8,
};
const request = (method: string, body?: unknown) =>
  ({ method, query: {}, body }) as never;
const response = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
  };

describe('evaluation APIs', () => {
  const prisma = {
    registration: { findFirst: vi.fn() },
    evaluation: { create: vi.fn(), findMany: vi.fn() },
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
    prisma.registration.findFirst.mockResolvedValue({
      id: 'registration-1',
      program: { id: 'program-1', coachId: 'coach-1' },
    });
    prisma.evaluation.create.mockResolvedValue({
      id: 'evaluation-1',
      userId: 'student-1',
      coachId: 'coach-1',
      ...scores,
      notes: 'ادامه تمرین',
    });
    prisma.evaluation.findMany.mockResolvedValue([]);
  });

  it('creates an evaluation for a student enrolled in the coach’s program', async () => {
    const res = response();

    await coachHandler(
      request('POST', { userId: 'student-1', ...scores, notes: 'ادامه تمرین' }),
      res as never,
    );

    expect(prisma.registration.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'student-1',
          program: { coachId: 'coach-1' },
        }),
      }),
    );
    expect(prisma.evaluation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          userId: 'student-1',
          coachId: 'coach-1',
          ...scores,
          notes: 'ادامه تمرین',
        },
        select: expect.any(Object),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('accepts both inclusive score boundaries', async () => {
    const res = response();

    await coachHandler(
      request('POST', {
        userId: 'student-1',
        technical: 1,
        physical: 10,
        mental: 1,
        teamwork: 10,
        overall: 1,
      }),
      res as never,
    );

    expect(prisma.evaluation.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('accepts native form score fields as integer strings', async () => {
    const res = response();

    await coachHandler(
      request('POST', {
        userId: 'student-1',
        technical: '1',
        physical: '10',
        mental: '8',
        teamwork: '9',
        overall: '8',
      }),
      res as never,
    );

    expect(prisma.evaluation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          technical: 1,
          physical: 10,
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 403 and does not create an evaluation for another program’s student', async () => {
    const res = response();
    prisma.registration.findFirst.mockResolvedValue(null);

    await coachHandler(
      request('POST', { userId: 'student-1', ...scores }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.evaluation.create).not.toHaveBeenCalled();
  });

  it.each([0, 11, 1.5])('rejects invalid score %s before persistence', async (score) => {
    const res = response();

    await coachHandler(
      request('POST', {
        userId: 'student-1',
        ...scores,
        technical: score,
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.registration.findFirst).not.toHaveBeenCalled();
    expect(prisma.evaluation.create).not.toHaveBeenCalled();
  });

  it('rejects a coach identity backed by a user account', async () => {
    const res = response();
    vi.mocked(requireRole).mockResolvedValue({
      id: 'coach-1',
      role: 'COACH',
      source: 'user',
    } as never);

    await coachHandler(
      request('POST', { userId: 'student-1', ...scores }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.registration.findFirst).not.toHaveBeenCalled();
  });

  it('does not allow a student session to write through the coach API', async () => {
    const res = response();
    vi.mocked(requireRole).mockResolvedValue(null);

    await coachHandler(
      request('POST', { userId: 'student-1', ...scores }),
      res as never,
    );

    expect(requireRole).toHaveBeenCalledWith(
      expect.any(Object),
      res,
      ['COACH'],
    );
    expect(prisma.evaluation.create).not.toHaveBeenCalled();
  });

  it('lists only evaluations created by the signed-in coach', async () => {
    const res = response();

    await coachHandler(request('GET'), res as never);

    expect(prisma.evaluation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { coachId: 'coach-1' } }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('allows an authorized admin to create an evaluation', async () => {
    const res = response();

    await adminHandler(
      request('POST', {
        userId: 'student-1',
        coachId: 'coach-2',
        ...scores,
      }),
      res as never,
    );

    expect(prisma.evaluation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          userId: 'student-1',
          coachId: 'coach-2',
          ...scores,
          notes: null,
        },
        select: expect.any(Object),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('rejects admin evaluation writes when admin authorization fails', async () => {
    const res = response();
    vi.mocked(authorizeAdmin).mockResolvedValue(false);

    await adminHandler(
      request('POST', { userId: 'student-1', coachId: 'coach-2', ...scores }),
      res as never,
    );

    expect(prisma.evaluation.create).not.toHaveBeenCalled();
  });

  it('lists evaluations through the admin-only endpoint', async () => {
    const res = response();

    await adminHandler(request('GET'), res as never);

    expect(authorizeAdmin).toHaveBeenCalled();
    expect(prisma.evaluation.findMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
