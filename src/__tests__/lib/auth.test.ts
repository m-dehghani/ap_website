// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authorizeAdmin,
  authorizeShopManager,
  authorizeStaff,
  authorizeStudent,
  getSession,
  normalizePhone,
  requireRole,
} from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { jwtVerify } from 'jose';

const joseMocks = vi.hoisted(() => {
  class JOSEError extends Error {}
  class JWTExpired extends JOSEError {}

  return {
    jwtVerify: vi.fn(),
    JOSEError,
    JWTExpired,
  };
});

vi.mock('@/lib/db', () => ({
  getPrisma: vi.fn(),
}));

vi.mock('jose', () => ({
  jwtVerify: joseMocks.jwtVerify,
  errors: {
    JOSEError: joseMocks.JOSEError,
    JWTExpired: joseMocks.JWTExpired,
  },
}));

const mockPrisma = {
  user: { findUnique: vi.fn() },
  coach: { findUnique: vi.fn() },
};

const createResponse = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('session helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: { userId: 'user-1', role: 'ADMIN' },
      protectedHeader: { alg: 'HS256' },
    } as never);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'STUDENT',
    });
    mockPrisma.coach.findUnique.mockResolvedValue(null);
  });

  it('uses the database role rather than a forged JWT role', async () => {
    const session = await getSession({
      cookies: { auth_token: 'signed-token' },
    });

    expect(session).toEqual({
      id: 'user-1',
      role: 'STUDENT',
      source: 'user',
    });
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, role: true },
    });
  });

  it.each(['ADMIN', 'SHOP_MANAGER'] as const)(
    'returns the current %s database role for a user account',
    async (role) => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', role });
      const session = await getSession({
        cookies: { auth_token: 'signed-token' },
      });

      expect(session).toEqual({ id: 'user-1', role, source: 'user' });
    },
  );

  it('returns an active coach session even when the JWT role is not COACH', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.coach.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'COACH',
      isActive: true,
    });

    const session = await getSession({
      cookies: { auth_token: 'signed-token' },
    });

    expect(session).toEqual({
      id: 'user-1',
      role: 'COACH',
      source: 'coach',
    });
  });

  it('rejects inactive coach records', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.coach.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'COACH',
      isActive: false,
    });

    await expect(
      getSession({ cookies: { auth_token: 'signed-token' } }),
    ).resolves.toBeNull();
  });

  it('returns null for a missing token without querying the database', async () => {
    await expect(getSession({ cookies: {} })).resolves.toBeNull();
    expect(getPrisma).not.toHaveBeenCalled();
  });

  it('returns null for an expired JWT', async () => {
    vi.mocked(jwtVerify).mockRejectedValue(
      new joseMocks.JWTExpired('expired'),
    );

    await expect(
      getSession({ cookies: { auth_token: 'expired-token' } }),
    ).resolves.toBeNull();
    expect(getPrisma).not.toHaveBeenCalled();
  });

  it('does not hide unexpected JWT verification errors', async () => {
    vi.mocked(jwtVerify).mockRejectedValue(new Error('unexpected failure'));

    await expect(
      getSession({ cookies: { auth_token: 'signed-token' } }),
    ).rejects.toThrow('unexpected failure');
  });
});

describe('authorization helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: { userId: 'user-1', role: 'STUDENT' },
      protectedHeader: { alg: 'HS256' },
    } as never);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'STUDENT',
    });
    mockPrisma.coach.findUnique.mockResolvedValue(null);
  });

  it('preserves the unauthenticated student response', async () => {
    const res = createResponse();
    const id = await authorizeStudent({ cookies: {} } as never, res as never);

    expect(id).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'احراز هویت نشده' });
  });

  it('rejects a non-admin based on the current database role', async () => {
    const res = createResponse();
    const allowed = await authorizeAdmin(
      { cookies: { auth_token: 'signed-token' } } as never,
      res as never,
    );

    expect(allowed).toBe(false);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'دسترسی مجاز نیست' });
  });

  it('preserves the forbidden response for a valid token without an account', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.coach.findUnique.mockResolvedValue(null);
    const res = createResponse();
    const allowed = await authorizeAdmin(
      { cookies: { auth_token: 'signed-token' } } as never,
      res as never,
    );

    expect(allowed).toBe(false);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'دسترسی مجاز نیست' });
  });

  it('allows an admin based on the current database role', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'ADMIN',
    });
    const res = createResponse();
    const allowed = await authorizeAdmin(
      { cookies: { auth_token: 'signed-token' } } as never,
      res as never,
    );

    expect(allowed).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows a shop manager based on the current database role', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'SHOP_MANAGER',
    });
    const res = createResponse();
    const allowed = await authorizeShopManager(
      { cookies: { auth_token: 'signed-token' } } as never,
      res as never,
    );

    expect(allowed).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows an admin to manage the shop', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'ADMIN',
    });
    const res = createResponse();
    const allowed = await authorizeShopManager(
      { cookies: { auth_token: 'signed-token' } } as never,
      res as never,
    );

    expect(allowed).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows staff access for an active coach', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.coach.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'COACH',
      isActive: true,
    });
    const res = createResponse();

    await expect(
      authorizeStaff(
        { cookies: { auth_token: 'signed-token' } } as never,
        res as never,
      ),
    ).resolves.toEqual({ id: 'user-1', role: 'COACH' });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('denies roles that are not allowed by requireRole', async () => {
    const res = createResponse();
    const session = await requireRole(
      { cookies: { auth_token: 'signed-token' } } as never,
      res as never,
      ['ADMIN'],
    );

    expect(session).toBeNull();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('normalizes Persian and Arabic phone digits and separators', () => {
    expect(normalizePhone('۰۹۱۲ ۳۴۵-٦٧٨٩')).toBe('09123456789');
  });
});
