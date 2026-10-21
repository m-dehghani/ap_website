import type { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify } from 'jose';
import { getPrisma } from '@/lib/db';

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production');
  }

  return new TextEncoder().encode(
    secret || 'local-development-only-jwt-secret',
  );
}

export async function authorizeStudent(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<string | null> {
  const token = req.cookies.auth_token;
  if (!token) {
    res.status(401).json({ message: 'احراز هویت نشده' });
    return null;
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId !== 'string') {
      res.status(401).json({ message: 'توکن نامعتبر است' });
      return null;
    }
    userId = payload.userId;
  } catch {
    res.status(401).json({ message: 'توکن نامعتبر یا منقضی شده' });
    return null;
  }

  const db = await getPrisma();
  const student = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (student?.role !== 'STUDENT') {
    res.status(403).json({ message: 'دسترسی مجاز نیست' });
    return null;
  }

  return userId;
}

export async function authorizeAdmin(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> {
  const token = req.cookies.auth_token;
  if (!token) {
    res.status(401).json({ message: 'احراز هویت نشده' });
    return false;
  }

  const secret = getJwtSecret();
  let userId: string;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== 'string') {
      res.status(401).json({ message: 'توکن نامعتبر است' });
      return false;
    }
    userId = payload.userId;
  } catch {
    res.status(401).json({ message: 'توکن نامعتبر یا منقضی شده' });
    return false;
  }

  const db = await getPrisma();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    res.status(403).json({ message: 'دسترسی مجاز نیست' });
    return false;
  }

  return true;
}

export async function authorizeShopManager(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> {
  const token = req.cookies.auth_token;
  if (!token) {
    res.status(401).json({ message: 'احراز هویت نشده' });
    return false;
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId !== 'string') {
      res.status(401).json({ message: 'توکن نامعتبر است' });
      return false;
    }
    userId = payload.userId;
  } catch {
    res.status(401).json({ message: 'توکن نامعتبر یا منقضی شده' });
    return false;
  }

  const db = await getPrisma();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role === 'SHOP_MANAGER' || user?.role === 'ADMIN') return true;

  res.status(403).json({ message: 'دسترسی مجاز نیست' });
  return false;
}

export type StaffSession = {
  id: string;
  role: 'ADMIN' | 'COACH';
};

export async function authorizeStaff(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<StaffSession | null> {
  const token = req.cookies.auth_token;
  if (!token) {
    res.status(401).json({ message: 'احراز هویت نشده' });
    return null;
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId !== 'string') {
      res.status(401).json({ message: 'توکن نامعتبر است' });
      return null;
    }
    userId = payload.userId;
  } catch {
    res.status(401).json({ message: 'توکن نامعتبر یا منقضی شده' });
    return null;
  }

  const db = await getPrisma();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (user?.role === 'ADMIN') return { id: user.id, role: 'ADMIN' };

  const coach = await db.coach.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  });
  if (coach?.isActive) return { id: coach.id, role: 'COACH' };

  res.status(403).json({ message: 'دسترسی مجاز نیست' });
  return null;
}

export function normalizePhone(value: string): string {
  const latinDigits = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
  return latinDigits.replace(/[^\d+]/g, '');
}
