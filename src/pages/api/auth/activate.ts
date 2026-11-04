import {
  createHash,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { rejectRateLimitedRequest } from '@/lib/api-rate-limit';
import { getPrisma } from '@/lib/db';
import { normalizePhone } from '@/lib/auth';
import { sendEmail, sendSms } from '@/lib/notifications';

const requestSchema = z.object({
  action: z.literal('request'),
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(128),
  channel: z.enum(['email', 'phone']),
});

const verifySchema = z.object({
  action: z.literal('verify'),
  challengeId: z.string().uuid(),
  code: z
    .string()
    .regex(/^[\d۰-۹٠-٩]{6}$/)
    .transform(normalizePhone),
});

const activationSchema = z.discriminatedUnion('action', [
  requestSchema,
  verifySchema,
]);

const PURPOSE = 'ACCOUNT_ACTIVATION';
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_DAY = 5;
const RESEND_INTERVAL_MS = 60_000;
const CHALLENGE_LIFETIME_MS = 10 * 60_000;

const codeDigest = (challengeId: string, code: string) =>
  createHash('sha256').update(`${challengeId}:${code}`).digest('hex');

const constantTimeMatches = (expectedHex: string, actualHex: string) => {
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = Buffer.from(actualHex, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

class ActivationConflictError extends Error {}

type ActivationChallenge = {
  id: string;
  userId: string;
  purpose: string;
  channel: string;
  target: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  user: {
    id: string;
    role: string;
    activatedAt: Date | null;
    email: string | null;
    phone: string | null;
  };
};

function challengeMatchesCurrentContact(challenge: ActivationChallenge): boolean {
  if (challenge.channel === 'EMAIL') {
    return challenge.user.email?.trim().toLowerCase() === challenge.target;
  }
  if (challenge.channel === 'PHONE') {
    return (
      challenge.user.phone !== null &&
      normalizePhone(challenge.user.phone) === challenge.target
    );
  }
  return false;
}

async function requestActivation(
  input: z.infer<typeof requestSchema>,
  res: NextApiResponse,
) {
  const identifier = input.identifier.includes('@')
    ? input.identifier.toLowerCase()
    : normalizePhone(input.identifier);
  const isEmail = identifier.includes('@');
  if (
    isEmail
      ? !z.string().email().safeParse(identifier).success
      : !/^\+?\d{7,15}$/.test(identifier)
  ) {
    return res.status(400).json({
      message: 'ایمیل یا شماره تلفن معتبر وارد کنید',
    });
  }

  const db = await getPrisma();
  const user = await db.user.findFirst({
    where: isEmail
      ? { email: { equals: identifier, mode: 'insensitive' } }
      : { phone: { in: [...new Set([input.identifier, identifier])] } },
    select: {
      id: true,
      role: true,
      password: true,
      activatedAt: true,
      email: true,
      phone: true,
    },
  });
  if (
    !user ||
    user.role !== 'STUDENT' ||
    !(await bcrypt.compare(input.password, user.password))
  ) {
    return res.status(401).json({
      message: 'ایمیل، شماره تلفن یا رمز عبور اشتباه است',
    });
  }
  if (user.activatedAt) {
    return res.status(409).json({
      message: 'حساب شما فعال است؛ برای ورود به حساب مراجعه کنید',
      alreadyActive: true,
    });
  }

  const target =
    input.channel === 'email'
      ? user.email?.trim().toLowerCase()
      : user.phone
        ? normalizePhone(user.phone)
        : undefined;
  if (!target) {
    return res.status(400).json({
      message:
        input.channel === 'email'
          ? 'برای این حساب ایمیلی ثبت نشده است؛ از شماره تلفن استفاده کنید'
          : 'برای این حساب شماره تلفنی ثبت نشده است؛ از ایمیل استفاده کنید',
    });
  }

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60_000);
  const challengeId = randomUUID();
  const code = randomInt(100_000, 1_000_000).toString();
  const result = await db.$transaction(
    async (tx) => {
      const [sendCount, previous] = await Promise.all([
        tx.verificationChallenge.count({
          where: {
            userId: user.id,
            purpose: PURPOSE,
            createdAt: { gte: dayAgo },
          },
        }),
        tx.verificationChallenge.findFirst({
          where: { userId: user.id, purpose: PURPOSE },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ]);
      if (sendCount >= MAX_SENDS_PER_DAY) return { kind: 'daily-limit' as const };
      if (
        previous &&
        now.getTime() - previous.createdAt.getTime() < RESEND_INTERVAL_MS
      ) {
        return { kind: 'resend-limit' as const };
      }

      await tx.verificationChallenge.updateMany({
        where: {
          userId: user.id,
          purpose: PURPOSE,
          consumedAt: null,
        },
        data: { consumedAt: now },
      });
      await tx.verificationChallenge.create({
        data: {
          id: challengeId,
          userId: user.id,
          purpose: PURPOSE,
          channel: input.channel.toUpperCase(),
          target,
          codeHash: codeDigest(challengeId, code),
          expiresAt: new Date(now.getTime() + CHALLENGE_LIFETIME_MS),
        },
        select: { id: true },
      });
      return { kind: 'created' as const };
    },
    { isolationLevel: 'Serializable' },
  );

  if (result.kind === 'daily-limit') {
    return res.status(429).json({
      message: 'در ۲۴ ساعت گذشته پنج کد ارسال شده است؛ بعداً دوباره تلاش کنید',
    });
  }
  if (result.kind === 'resend-limit') {
    return res.status(429).json({
      message: 'برای ارسال دوباره کد، یک دقیقه صبر کنید',
    });
  }

  try {
    const message = `کد فعال‌سازی آکادمی فوتبال افشین پیروانی: ${code} (اعتبار تا ۱۰ دقیقه)`;
    if (input.channel === 'email') {
      await sendEmail({
        to: target,
        subject: 'فعال‌سازی حساب آکادمی فوتبال افشین پیروانی',
        text: message,
      });
    } else {
      await sendSms(target, message);
    }
    return res.status(200).json({
      message: 'کد فعال‌سازی ارسال شد',
      pendingActivation: true,
      activationSent: true,
      challengeId,
      expiresInSeconds: 600,
    });
  } catch (deliveryError) {
    console.error(
      'Account activation delivery failed:',
      deliveryError instanceof Error ? deliveryError.name : 'Unknown error',
    );
    return res.status(502).json({
      message: 'ارسال کد انجام نشد؛ رمز عبور خود را وارد کنید و دوباره تلاش کنید',
      pendingActivation: true,
      activationSent: false,
      canResend: true,
      challengeId,
    });
  }
}

async function verifyActivation(
  input: z.infer<typeof verifySchema>,
  res: NextApiResponse,
) {
  const db = await getPrisma();
  const challenge = (await db.verificationChallenge.findUnique({
    where: { id: input.challengeId },
    select: {
      id: true,
      userId: true,
      purpose: true,
      channel: true,
      target: true,
      codeHash: true,
      attempts: true,
      expiresAt: true,
      consumedAt: true,
      user: {
        select: {
          id: true,
          role: true,
          activatedAt: true,
          email: true,
          phone: true,
        },
      },
    },
  })) as ActivationChallenge | null;
  const now = new Date();
  if (
    !challenge ||
    challenge.purpose !== PURPOSE ||
    challenge.consumedAt ||
    challenge.expiresAt <= now
  ) {
    return res.status(400).json({
      message: 'کد فعال‌سازی معتبر نیست یا منقضی شده است؛ کد تازه درخواست کنید',
    });
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    return res.status(429).json({
      message: 'تعداد تلاش‌ها بیش از حد مجاز است؛ کد تازه درخواست کنید',
    });
  }
  if (
    challenge.user.id !== challenge.userId ||
    challenge.user.role !== 'STUDENT' ||
    challenge.user.activatedAt ||
    !challengeMatchesCurrentContact(challenge)
  ) {
    return res.status(400).json({
      message: 'این کد برای اطلاعات فعلی حساب معتبر نیست؛ کد تازه درخواست کنید',
    });
  }

  const actualHash = codeDigest(challenge.id, input.code);
  if (!constantTimeMatches(challenge.codeHash, actualHash)) {
    const updated = await db.verificationChallenge.updateMany({
      where: {
        id: challenge.id,
        userId: challenge.userId,
        purpose: PURPOSE,
        channel: challenge.channel,
        target: challenge.target,
        consumedAt: null,
        expiresAt: { gt: now },
        attempts: { lt: MAX_ATTEMPTS },
      },
      data: { attempts: { increment: 1 } },
    });
    if (!updated.count || challenge.attempts + 1 >= MAX_ATTEMPTS) {
      if (!updated.count) {
        return res.status(400).json({
          message:
            'کد فعال‌سازی معتبر نیست یا منقضی شده است؛ کد تازه درخواست کنید',
        });
      }
      await db.verificationChallenge.updateMany({
        where: {
          id: challenge.id,
          consumedAt: null,
          attempts: { gte: MAX_ATTEMPTS },
        },
        data: { consumedAt: now },
      });
      return res.status(429).json({
        message: 'تعداد تلاش‌ها بیش از حد مجاز است؛ کد تازه درخواست کنید',
      });
    }
    return res.status(400).json({ message: 'کد فعال‌سازی اشتباه است' });
  }

  const contactFilter =
    challenge.channel === 'EMAIL'
      ? { email: challenge.target }
      : { phone: challenge.target };
  const verifiedAtField =
    challenge.channel === 'EMAIL'
      ? { emailVerifiedAt: now }
      : { phoneVerifiedAt: now };
  try {
    await db.$transaction(
      async (tx) => {
        const consumed = await tx.verificationChallenge.updateMany({
          where: {
            id: challenge.id,
            userId: challenge.userId,
            purpose: PURPOSE,
            channel: challenge.channel,
            target: challenge.target,
            codeHash: challenge.codeHash,
            consumedAt: null,
            expiresAt: { gt: now },
            attempts: { lt: MAX_ATTEMPTS },
          },
          data: { consumedAt: now },
        });
        if (!consumed.count) throw new ActivationConflictError();

        const activated = await tx.user.updateMany({
          where: {
            id: challenge.userId,
            role: 'STUDENT',
            activatedAt: null,
            ...contactFilter,
          },
          data: { activatedAt: now, ...verifiedAtField },
        });
        if (!activated.count) throw new ActivationConflictError();
      },
      { isolationLevel: 'Serializable' },
    );
  } catch (error) {
    if (error instanceof ActivationConflictError) {
      return res.status(409).json({
        message: 'این کد قبلاً استفاده شده یا اطلاعات حساب تغییر کرده است',
      });
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2034'
    ) {
      return res.status(409).json({
        message: 'درخواست هم‌زمان دیگری انجام شد؛ دوباره تلاش کنید',
      });
    }
    throw error;
  }

  return res.status(200).json({
    message: 'حساب شما فعال شد؛ اکنون می‌توانید وارد شوید',
    activated: true,
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  if (rejectRateLimitedRequest(req, res, 'activation')) return;

  try {
    const input = activationSchema.parse(req.body);
    if (input.action === 'request') return requestActivation(input, res);
    return await verifyActivation(input, res);
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
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2034'
    ) {
      return res.status(409).json({
        message: 'درخواست هم‌زمان دیگری انجام شد؛ دوباره تلاش کنید',
      });
    }
    console.error(
      'Account activation request failed:',
      error instanceof Error ? error.name : 'Unknown error',
    );
    return res.status(500).json({ message: 'خطا در فعال‌سازی حساب' });
  }
}
