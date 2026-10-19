// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authorizeAdmin, normalizePhone } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { jwtVerify } from 'jose';

vi.mock('@/lib/db', () => ({
  getPrisma: vi.fn(),
}));

vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
}));

const mockPrisma = {
  user: { findUnique: vi.fn() },
};

const createResponse = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('authorization helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: { userId: 'user-1', role: 'STUDENT' },
      protectedHeader: { alg: 'HS256' },
    } as never);
  });

  it('rejects a request with no auth cookie', async () => {
    const res = createResponse();
    const allowed = await authorizeAdmin(
      { cookies: {} } as never,
      res as never,
    );

    expect(allowed).toBe(false);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a non-admin based on the current database role', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'STUDENT' });
    const res = createResponse();
    const allowed = await authorizeAdmin(
      { cookies: { auth_token: 'signed-token' } } as never,
      res as never,
    );

    expect(allowed).toBe(false);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows an admin based on the current database role', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
    const res = createResponse();
    const allowed = await authorizeAdmin(
      { cookies: { auth_token: 'signed-token' } } as never,
      res as never,
    );

    expect(allowed).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('normalizes Persian and Arabic phone digits and separators', () => {
    expect(normalizePhone('۰۹۱۲ ۳۴۵-٦٧٨٩')).toBe('09123456789');
  });
});
