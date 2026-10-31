import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/admin/sessions';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({ authorizeAdmin: vi.fn().mockResolvedValue(true) }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const validSession = {
  name: 'تمرین رده نوجوانان',
  description: null,
  date: '2026-11-01T10:00:00.000Z',
  duration: 60,
  location: 'زمین شماره یک',
  maxCapacity: 15,
  status: 'SCHEDULED',
  programId: 'program-1',
  coachId: 'coach-1',
};
const request = (body: unknown) =>
  ({ method: 'POST', query: {}, body }) as never;
const response = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('admin session creation', () => {
  const prisma = { session: { create: vi.fn() } };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.session.create.mockResolvedValue({ id: 'session-1' });
  });

  it.each([
    { ...validSession, date: 'not-a-date' },
    { ...validSession, date: 0 },
    { ...validSession, duration: 0 },
    { ...validSession, duration: true },
    { ...validSession, duration: 10.5 },
    { ...validSession, maxCapacity: -1 },
    { ...validSession, maxCapacity: true },
    { ...validSession, status: 'UNKNOWN' },
    { ...validSession, name: ' ' },
  ])('rejects malformed session data before persistence: %o', async (body) => {
    const res = response();

    await handler(request(body), res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it('creates a valid session using a validated ISO date', async () => {
    const res = response();

    await handler(request(validSession), res as never);

    expect(prisma.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: validSession.name,
          date: new Date(validSession.date),
          duration: 60,
          maxCapacity: 15,
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
