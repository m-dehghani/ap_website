import type { NextApiRequest, NextApiResponse } from 'next';
import { errors, jwtVerify } from 'jose';
import { getPrisma } from '@/lib/db';

export type Session =
  | {
      id: string;
      role: 'STUDENT' | 'ADMIN' | 'SHOP_MANAGER';
      source: 'user';
    }
  | {
      id: string;
      role: 'COACH';
      source: 'coach';
    };

type SessionRequest = Pick<NextApiRequest, 'cookies'>;
export type SessionResult =
  | { session: Session; reason: 'session' }
  | {
      session: null;
      reason: 'missing' | 'invalid-token' | 'invalid-subject' | 'unrecognized';
    };

function isUserRole(
  role: string,
): role is Exclude<Session['role'], 'COACH'> {
  return role === 'STUDENT' || role === 'ADMIN' || role === 'SHOP_MANAGER';
}

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production');
  }

  return new TextEncoder().encode(
    secret || 'local-development-only-jwt-secret',
  );
}

export async function getSessionResult(
  req: SessionRequest,
): Promise<SessionResult> {
  const token = req.cookies.auth_token;
  if (!token) return { session: null, reason: 'missing' };

  let payload: Awaited<ReturnType<typeof jwtVerify>>['payload'];
  try {
    ({ payload } = await jwtVerify(token, getJwtSecret()));
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      return { session: null, reason: 'invalid-token' };
    }
    throw error;
  }

  if (typeof payload.userId !== 'string') {
    return { session: null, reason: 'invalid-subject' };
  }

  const db = await getPrisma();
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true },
  });

  if (user && isUserRole(user.role)) {
    return {
      session: { id: user.id, role: user.role, source: 'user' },
      reason: 'session',
    };
  }

  const coach = await db.coach.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (coach?.role === 'COACH' && coach.isActive) {
    return {
      session: { id: coach.id, role: 'COACH', source: 'coach' },
      reason: 'session',
    };
  }

  return { session: null, reason: 'unrecognized' };
}

export async function getSession(req: SessionRequest): Promise<Session | null> {
  return (await getSessionResult(req)).session;
}

export async function getOptionalSession(
  req: SessionRequest,
): Promise<Session | null> {
  return getSession(req);
}

export async function requireSession(
  req: SessionRequest,
  res: NextApiResponse,
): Promise<Session | null> {
  const result = await getSessionResult(req);
  if (result.session) return result.session;
  sendSessionFailure(res, result.reason);
  return null;
}

function sendSessionFailure(
  res: NextApiResponse,
  reason: Exclude<SessionResult['reason'], 'session'>,
): void {
  if (reason === 'unrecognized') {
    res.status(403).json({ message: 'دسترسی مجاز نیست' });
    return;
  }

  const message =
    reason === 'missing'
      ? 'احراز هویت نشده'
      : reason === 'invalid-subject'
        ? 'توکن نامعتبر است'
        : 'توکن نامعتبر یا منقضی شده';
  res.status(401).json({ message });
}

export async function requireRole(
  req: SessionRequest,
  res: NextApiResponse,
  roles: readonly Session['role'][],
): Promise<Session | null> {
  const result = await getSessionResult(req);
  if (!result.session) {
    sendSessionFailure(res, result.reason);
    return null;
  }
  if (roles.includes(result.session.role)) return result.session;

  res.status(403).json({ message: 'دسترسی مجاز نیست' });
  return null;
}

export async function authorizeStudent(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<string | null> {
  const session = await requireRole(req, res, ['STUDENT']);
  return session?.id ?? null;
}

export async function getOptionalAccountId(
  req: NextApiRequest,
): Promise<string | null> {
  const session = await getOptionalSession(req);
  if (
    session?.source === 'user' &&
    ['STUDENT', 'ADMIN', 'SHOP_MANAGER'].includes(session.role)
  ) {
    return session.id;
  }
  return null;
}

export async function authorizeAccount(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<string | null> {
  const accountId = await getOptionalAccountId(req);
  if (accountId) return accountId;

  res.status(401).json({ message: 'برای رأی دادن ابتدا وارد حساب کاربری شوید' });
  return null;
}

export async function authorizeAdmin(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> {
  return Boolean(await requireRole(req, res, ['ADMIN']));
}

export async function authorizeShopManager(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> {
  return Boolean(await requireRole(req, res, ['ADMIN', 'SHOP_MANAGER']));
}

export type StaffSession = {
  id: string;
  role: 'ADMIN' | 'COACH';
};

export async function authorizeStaff(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<StaffSession | null> {
  const session = await requireRole(req, res, ['ADMIN', 'COACH']);
  if (!session) return null;
  return {
    id: session.id,
    role: session.role === 'ADMIN' ? 'ADMIN' : 'COACH',
  };
}

export function normalizePhone(value: string): string {
  const latinDigits = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
  return latinDigits.replace(/[^\d+]/g, '');
}
