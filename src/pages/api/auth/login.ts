import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { getJwtSecret, normalizePhone } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { SignJWT } from 'jose';

const loginSchema = z
  .object({
    identifier: z.string().trim().optional(),
    email: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    password: z.string().min(1, 'رمز عبور الزامی است'),
  })
  .refine(
    ({ identifier, email, phone }) =>
      [identifier, email, phone].filter((value) => value?.length).length === 1,
    {
      message: 'ایمیل یا شماره تلفن را وارد کنید',
      path: ['identifier'],
    },
  );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const validatedData = loginSchema.parse(req.body);
    const identifier =
      validatedData.identifier ?? validatedData.email ?? validatedData.phone;
    if (!identifier) {
      return res.status(400).json({
        message: 'ایمیل یا شماره تلفن را وارد کنید',
      });
    }
    const isEmail = identifier.includes('@');
    const normalizedIdentifier = isEmail
      ? identifier.toLowerCase()
      : normalizePhone(identifier);

    if (
      isEmail
        ? !z.string().email().safeParse(normalizedIdentifier).success
        : !/^\+?\d{7,15}$/.test(normalizedIdentifier)
    ) {
      return res.status(400).json({
        message: 'ایمیل یا شماره تلفن معتبر وارد کنید',
      });
    }

    const db = await getPrisma();
    const contactValues = [...new Set([identifier, normalizedIdentifier])];
    const [user, coach] = await Promise.all([
      db.user.findFirst({
        where: isEmail
          ? { email: { equals: normalizedIdentifier, mode: 'insensitive' } }
          : { phone: { in: contactValues } },
      }),
      db.coach.findFirst({
        where: isEmail
          ? { email: { equals: normalizedIdentifier, mode: 'insensitive' } }
          : { phone: { in: contactValues } },
      }),
    ]);

    const candidates = [
      ...(user && ['STUDENT', 'ADMIN'].includes(user.role) ? [user] : []),
      ...(coach?.isActive ? [{ ...coach, role: 'COACH' }] : []),
    ];
    const matchingUsers = (
      await Promise.all(
        candidates.map(async (candidate) =>
          (await bcrypt.compare(validatedData.password, candidate.password))
            ? candidate
            : null,
        ),
      )
    ).filter((candidate) => candidate !== null);

    if (matchingUsers.length !== 1) {
      return res.status(401).json({
        message: 'ایمیل، شماره تلفن یا رمز عبور اشتباه است',
      });
    }

    const userRecord = matchingUsers[0];
    const token = await new SignJWT({
      userId: userRecord.id,
      role: userRecord.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecret());

    res.setHeader('Set-Cookie', [
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    ]);

    return res.status(200).json({
      message: 'ورود با موفقیت انجام شد',
      user: {
        id: userRecord.id,
        email: userRecord.email,
        phone: userRecord.phone,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        role: userRecord.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'اطلاعات ارسالی نامعتبر است',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    console.error('Login error:', error);
    return res.status(500).json({ message: 'خطا در ورود' });
  }
}
