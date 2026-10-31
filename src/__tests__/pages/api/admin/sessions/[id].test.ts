import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/admin/sessions/[id]';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({ authorizeAdmin: vi.fn().mockResolvedValue(true) }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const request = (body: unknown) =>
  ({ method: 'PUT', query: { id: 'session-1' }, body }) as never;
const response = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('admin session updates', () => {
  const prisma = { session: { update: vi.fn() } };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.session.update.mockResolvedValue({ id: 'session-1' });
  });

  it('rejects invalid session status without changing the existing session', async () => {
    const res = response();

    await handler(
      request({
        name: 'تمرین',
        description: null,
        date: '2026-11-01T10:00:00.000Z',
        duration: 60,
        location: 'زمین',
        maxCapacity: 15,
        status: 'INVALID',
        programId: 'program-1',
        coachId: 'coach-1',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.session.update).not.toHaveBeenCalled();
  });

  it('updates a valid session after parsing its date and integer fields', async () => {
    const res = response();

    await handler(
      request({
        name: 'تمرین',
        description: null,
        date: '2026-11-01T10:00:00.000Z',
        duration: 60,
        location: 'زمین',
        maxCapacity: 15,
        status: 'SCHEDULED',
        programId: 'program-1',
        coachId: 'coach-1',
      }),
      res as never,
    );

    expect(prisma.session.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          date: new Date('2026-11-01T10:00:00.000Z'),
          duration: 60,
          maxCapacity: 15,
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects a missing date rather than persisting an invalid Date', async () => {
    const res = response();

    await handler(
      request({
        name: 'تمرین',
        duration: 60,
        location: 'زمین',
        maxCapacity: 15,
        status: 'SCHEDULED',
        programId: 'program-1',
        coachId: 'coach-1',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.session.update).not.toHaveBeenCalled();
  });

  it('rejects coercible non-date values instead of accepting an epoch timestamp', async () => {
    const res = response();

    await handler(
      request({
        name: 'تمرین',
        description: null,
        date: 0,
        duration: 60,
        location: 'زمین',
        maxCapacity: 15,
        status: 'SCHEDULED',
        programId: 'program-1',
        coachId: 'coach-1',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.session.update).not.toHaveBeenCalled();
  });
});
