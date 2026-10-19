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

const createRequest = (body: Record<string, unknown>) =>
  ({
    method: 'POST',
    body,
    cookies: {},
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

  it('normalizes Persian phone digits for matching', () => {
    expect(normalizePhone('۰۹۱۲ ۳۴۵-۶۷۸۹')).toBe('09123456789');
  });
});
