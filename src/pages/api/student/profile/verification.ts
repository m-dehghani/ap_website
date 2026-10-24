import {
  createHash,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authorizeStudent, normalizePhone } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { sendEmail, sendSms } from '@/lib/notifications';

const requestSchema = z.object({
  action: z.enum([
    'request-contact',
    'verify-contact',
    'request-password',
    'verify-password',
  ]),
  channel: z.enum(['email', 'phone']),
  value: z.string().optional(),
  code: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
  password: z.string().min(8).max(128).optional(),
});

const purposeFor = (action: string, channel: 'email' | 'phone') =>
  action.endsWith('password')
    ? 'PASSWORD_CHANGE'
    : channel === 'email'
      ? 'EMAIL_CHANGE'
      : 'PHONE_CHANGE';

const codeDigest = (challengeId: string, code: string) =>
  createHash('sha256').update(`${challengeId}:${code}`).digest('hex');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = await authorizeStudent(req, res);
    if (!userId) return;
    const input = requestSchema.parse(req.body);
    const db = await getPrisma();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true },
    });
    if (!user) return res.status(404).json({ message: 'حساب کاربری یافت نشد' });

    const purpose = purposeFor(input.action, input.channel);
    const isRequest = input.action.startsWith('request');
    if (isRequest) {
      const target =
        purpose === 'PASSWORD_CHANGE'
          ? input.channel === 'email'
            ? user.email
            : user.phone
          : input.channel === 'email'
            ? input.value?.trim().toLowerCase()
            : input.value
              ? normalizePhone(input.value)
              : null;
      if (!target) {
        return res.status(400).json({
          message:
            purpose === 'PASSWORD_CHANGE'
              ? 'برای تأیید تغییر رمز، ابتدا یک ایمیل یا تلفن در پروفایل ثبت کنید'
              : 'مقدار جدید را وارد کنید',
        });
      }
      if (
        purpose !== 'PASSWORD_CHANGE' &&
        (input.channel === 'email'
          ? !z.string().email().safeParse(target).success
          : !/^\+?\d{7,15}$/.test(target))
      ) {
        return res.status(400).json({ message: 'مقدار واردشده معتبر نیست' });
      }
      const previous = await db.verificationChallenge.findFirst({
        where: { userId, purpose },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });
      if (previous && Date.now() - previous.createdAt.getTime() < 60_000) {
        return res.status(429).json({
          message: 'برای ارسال دوباره کد، یک دقیقه صبر کنید',
        });
      }

      if (purpose !== 'PASSWORD_CHANGE') {
        const duplicate = await Promise.all([
          db.user.findFirst({
            where: {
              ...(input.channel === 'email'
                ? { email: { equals: target, mode: 'insensitive' as const } }
                : { phone: target }),
              NOT: { id: userId },
            },
            select: { id: true },
          }),
          db.coach.findFirst({
            where:
              input.channel === 'email'
                ? { email: { equals: target, mode: 'insensitive' } }
                : { phone: target },
            select: { id: true },
          }),
        ]);
        if (duplicate.some(Boolean)) {
          return res
            .status(409)
            .json({ message: 'این ایمیل یا شماره تلفن قبلاً استفاده شده است' });
        }
      }

      let passwordHash: string | null = null;
      if (purpose === 'PASSWORD_CHANGE') {
        const password = input.password;
        if (!password) {
          return res.status(400).json({ message: 'رمز عبور جدید الزامی است' });
        }
        passwordHash = await bcrypt.hash(password, 12);
      }
      await db.verificationChallenge.deleteMany({ where: { userId, purpose } });
      const code = randomInt(100_000, 1_000_000).toString();
      const challengeId = randomUUID();
      await db.verificationChallenge.create({
        data: {
          id: challengeId,
          userId,
          purpose,
          channel: input.channel.toUpperCase(),
          target,
          codeHash: codeDigest(challengeId, code),
          passwordHash,
          expiresAt: new Date(Date.now() + 10 * 60_000),
        },
      });

      try {
        const message = `کد تأیید آکادمی فوتبال افشین پیروانی: ${code} (اعتبار تا ۱۰ دقیقه)`;
        if (input.channel === 'email') {
          await sendEmail({
            to: target,
            subject: 'کد تأیید آکادمی فوتبال افشین پیروانی',
            text: message,
          });
        } else {
          await sendSms(target, message);
        }
      } catch (deliveryError) {
        console.error(
          'Verification message delivery failed:',
          deliveryError instanceof Error ? deliveryError.name : 'Unknown error',
        );
        return res
          .status(502)
          .json({
            message:
              'ارسال کد تأیید انجام نشد؛ تنظیمات پیام‌رسان را بررسی کنید',
          });
      }

      return res.status(200).json({
        message: 'کد تأیید ارسال شد',
        expiresInSeconds: 600,
      });
    }

    if (!input.code) {
      return res.status(400).json({ message: 'کد تأیید را وارد کنید' });
    }
    const challenge = await db.verificationChallenge.findFirst({
      where: {
        userId,
        purpose,
        expiresAt: { gt: new Date() },
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge) {
      return res.status(400).json({
        message: 'کد تأیید معتبر نیست یا منقضی شده است؛ کد جدید درخواست کنید',
      });
    }
    if (challenge.attempts >= 5) {
      return res.status(429).json({
        message: 'تعداد تلاش‌ها بیش از حد مجاز است؛ کد جدید درخواست کنید',
      });
    }
    const expectedHash = Buffer.from(challenge.codeHash, 'hex');
    const providedHash = Buffer.from(
      codeDigest(challenge.id, input.code),
      'hex',
    );
    if (
      providedHash.length !== expectedHash.length ||
      !timingSafeEqual(providedHash, expectedHash)
    ) {
      const attempts = challenge.attempts + 1;
      await db.verificationChallenge.update({
        where: { id: challenge.id },
        data: {
          attempts,
          ...(attempts >= 5 ? { consumedAt: new Date() } : {}),
        },
      });
      return res.status(attempts >= 5 ? 429 : 400).json({
        message:
          attempts >= 5
            ? 'تعداد تلاش‌ها بیش از حد مجاز است؛ کد جدید درخواست کنید'
            : 'کد تأیید اشتباه است',
      });
    }

    if (purpose !== 'PASSWORD_CHANGE') {
      const conflict = await db.user.findFirst({
        where: {
          ...(input.channel === 'email'
            ? {
                email: {
                  equals: challenge.target,
                  mode: 'insensitive' as const,
                },
              }
            : { phone: challenge.target }),
          NOT: { id: userId },
        },
        select: { id: true },
      });
      if (conflict) {
        await db.verificationChallenge.update({
          where: { id: challenge.id },
          data: { consumedAt: new Date() },
        });
        return res
          .status(409)
          .json({ message: 'این ایمیل یا شماره تلفن قبلاً استفاده شده است' });
      }
    }

    await db.$transaction(async (tx) => {
      if (purpose === 'PASSWORD_CHANGE') {
        if (!challenge.passwordHash) {
          throw new Error(
            'Password verification challenge has no password hash',
          );
        }
        await tx.user.update({
          where: { id: userId },
          data: { password: challenge.passwordHash },
        });
      } else if (input.channel === 'email') {
        await tx.user.update({
          where: { id: userId },
          data: { email: challenge.target, emailVerifiedAt: new Date() },
        });
      } else {
        await tx.user.update({
          where: { id: userId },
          data: { phone: challenge.target, phoneVerifiedAt: new Date() },
        });
      }
      await tx.verificationChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date() },
      });
    });

    return res.status(200).json({
      message:
        purpose === 'PASSWORD_CHANGE'
          ? 'رمز عبور با موفقیت تغییر کرد'
          : 'اطلاعات تماس تأیید و به‌روزرسانی شد',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'اطلاعات ارسالی معتبر نیست',
        errors: error.issues.map(({ path, message }) => ({
          field: path.join('.'),
          message,
        })),
      });
    }
    console.error('Student verification error:', error);
    return res.status(500).json({ message: 'خطا در تأیید اطلاعات' });
  }
}
