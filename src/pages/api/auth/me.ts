import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { getJwtSecret } from '@/lib/auth';
import { jwtVerify } from 'jose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ message: 'احراز هویت نشده' });
  }

  const secret = getJwtSecret();
  let userId: string;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== 'string') {
      return res.status(401).json({ message: 'توکن نامعتبر است' });
    }
    userId = payload.userId;
  } catch {
    return res.status(401).json({ message: 'توکن نامعتبر یا منقضی شده' });
  }

  try {
    const db = await getPrisma();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthDate: true,
        role: true,
        registrations: {
          include: {
            program: {
              include: {
                coach: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    specialization: true,
                    title: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (user && ['STUDENT', 'ADMIN', 'SHOP_MANAGER'].includes(user.role)) {
      return res.status(200).json({ user });
    }

    const coach = await db.coach.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialization: true,
        title: true,
        image: true,
        isActive: true,
      },
    });

    if (coach?.isActive) {
      return res.status(200).json({ user: { ...coach, role: 'COACH' } });
    }

    return res.status(404).json({ message: 'کاربر یافت نشد' });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ message: 'خطا در بررسی احراز هویت' });
  }
}
