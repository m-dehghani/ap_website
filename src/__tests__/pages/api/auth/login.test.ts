// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/auth/login';
import { getPrisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { normalizePhone } from '@/lib/auth';

vi.mock('@/lib/db', () => ({
  getPrisma: vi.fn(),
}));

const mockPrisma = {
  user: { findFirst: vi.fn() },
  coach: { findFirst: vi.fn() },
};

let requestId = 0;
const createRequest = (
  body: Record<string, unknown>,
  remoteAddress = `192.0.2.${++requestId}`,
) =>
  ({
    method: 'POST',
    body,
    cookies: {},
    socket: { remoteAddress },
  }) as never;

const createResponse = () => {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
  };
  return response as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
  };
};

describe('/api/auth/login', () => {
  let passwordHash: string;

  beforeEach(async () => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    passwordHash = await bcrypt.hash('secret123', 4);
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.coach.findFirst.mockResolvedValue(null);
  });

  it('recognizes a student by phone without accepting a client-selected role', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'student-1',
      email: null,
      phone: '09123456789',
      password: passwordHash,
      firstName: 'Student',
      lastName: 'User',
      role: 'STUDENT',
      activatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const req = createRequest({
      identifier: '۰۹۱۲۳۴۵۶۷۸۹',
      password: 'secret123',
      role: 'ADMIN',
    });
    const res = createResponse();

    await handler(req, res as never);

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { phone: { in: ['۰۹۱۲۳۴۵۶۷۸۹', '09123456789'] } },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'ورود با موفقیت انجام شد',
      user: {
        id: 'student-1',
        email: null,
        phone: '09123456789',
        firstName: 'Student',
        lastName: 'User',
        role: 'STUDENT',
        themePreference: 'system',
      },
    });
  });

  it('identifies an active coach by email', async () => {
    mockPrisma.coach.findFirst.mockResolvedValue({
      id: 'coach-1',
      email: 'coach@example.com',
      phone: '09123456789',
      password: passwordHash,
      firstName: 'Coach',
      lastName: 'User',
      isActive: true,
    });
    const req = createRequest({
      identifier: 'coach@example.com',
      password: 'secret123',
    });
    const res = createResponse();

    await handler(req, res as never);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ id: 'coach-1', role: 'COACH' }),
      }),
    );
  });

  it('requires exactly one login identifier', async () => {
    const req = createRequest({ password: 'secret123' });
    const res = createResponse();

    await handler(req, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('returns an explicit 429 after five login requests from one address', async () => {
    const responses = Array.from({ length: 6 }, () => createResponse());

    for (const res of responses) {
      await handler(
        createRequest(
          { identifier: 'student@example.com', password: 'bad-password' },
          '192.0.2.200',
        ),
        res as never,
      );
    }

    expect(responses.slice(0, 5).map((res) => res.status.mock.calls.at(-1)?.[0]))
      .toEqual([401, 401, 401, 401, 401]);
    expect(responses[5].status).toHaveBeenCalledWith(429);
    expect(responses[5].setHeader).toHaveBeenCalledWith(
      'Retry-After',
      expect.any(String),
    );
    expect(
      Number(responses[5].setHeader.mock.calls[0][1]),
    ).toBeGreaterThan(0);
    expect(responses[5].json).toHaveBeenCalledWith({
      message: 'تعداد درخواست‌ها بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید',
    });
  });

  it('allows a normal login request below the rate limit', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'student-1',
      email: 'student@example.com',
      phone: null,
      password: passwordHash,
      firstName: 'Student',
      lastName: 'User',
      role: 'STUDENT',
      activatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const res = createResponse();

    await handler(
      createRequest({
        identifier: 'student@example.com',
        password: 'secret123',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status).not.toHaveBeenCalledWith(429);
  });

  it('does not issue a session cookie to an unactivated student with valid credentials', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'student-pending',
      email: 'student@example.com',
      phone: null,
      password: passwordHash,
      firstName: 'Student',
      lastName: 'User',
      role: 'STUDENT',
      activatedAt: null,
    });
    const res = createResponse();

    await handler(
      createRequest({
        identifier: 'student@example.com',
        password: 'secret123',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        activationRequired: true,
        activationUrl: '/activate',
      }),
    );
    expect(res.setHeader).not.toHaveBeenCalledWith(
      'Set-Cookie',
      expect.anything(),
    );
  });

  it('does not apply the student activation gate to administrative accounts', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      phone: null,
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      activatedAt: null,
    });
    const res = createResponse();

    await handler(
      createRequest({
        identifier: 'admin@example.com',
        password: 'secret123',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.arrayContaining([expect.stringContaining('auth_token=')]),
    );
  });

  it('normalizes Persian phone digits for matching', () => {
    expect(normalizePhone('۰۹۱۲ ۳۴۵-۶۷۸۹')).toBe('09123456789');
  });
});
