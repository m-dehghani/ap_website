import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { getSessionResult } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!req.cookies.auth_token) {
    return res.status(401).json({ message: 'احراز هویت نشده' });
  }

  try {
    const result = await getSessionResult(req);
    if (!result.session) {
      if (result.reason === 'unrecognized') {
        return res.status(404).json({ message: 'کاربر یافت نشد' });
      }

      const message =
        result.reason === 'invalid-subject'
          ? 'توکن نامعتبر است'
          : 'توکن نامعتبر یا منقضی شده';
      return res.status(401).json({ message });
    }

    const { session } = result;
    const db = await getPrisma();
    if (session.source === 'user') {
      const user = await db.user.findUnique({
        where: { id: session.id },
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

      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    const coach = await db.coach.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialization: true,
        title: true,
        image: true,
        role: true,
        isActive: true,
      },
    });

    if (coach?.isActive && coach.role === 'COACH') {
      return res.status(200).json({ user: { ...coach, role: 'COACH' } });
    }

    return res.status(404).json({ message: 'کاربر یافت نشد' });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ message: 'خطا در بررسی احراز هویت' });
  }
}
