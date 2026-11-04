// @vitest-environment node

import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import handler from '@/pages/api/auth/activate';
import { getPrisma } from '@/lib/db';
import { sendEmail, sendSms } from '@/lib/notifications';

vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));
vi.mock('@/lib/notifications', () => ({
  sendEmail: vi.fn(),
  sendSms: vi.fn(),
}));

const user = {
  id: 'student-1',
  role: 'STUDENT',
  password: '',
  activatedAt: null,
  email: 'student@example.com',
  phone: '09123456789',
};
const challengeId = '00000000-0000-4000-8000-000000000001';

const prisma = {
  user: {
    findFirst: vi.fn(),
    updateMany: vi.fn(),
  },
  verificationChallenge: {
    count: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

let requestId = 0;
const request = (
  body: Record<string, unknown>,
  remoteAddress = `198.51.100.${++requestId}`,
) =>
  ({
    method: 'POST',
    body,
    socket: { remoteAddress },
  }) as never;

const response = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
  };
  return res as never as typeof res;
};

const codeHash = (challengeId: string, code: string) =>
  createHash('sha256').update(`${challengeId}:${code}`).digest('hex');

const makeChallenge = (overrides: Record<string, unknown> = {}) => ({
  id: challengeId,
  userId: user.id,
  purpose: 'ACCOUNT_ACTIVATION',
  channel: 'EMAIL',
  target: user.email,
  codeHash: codeHash(challengeId, '123456'),
  attempts: 0,
  expiresAt: new Date(Date.now() + 10 * 60_000),
  consumedAt: null,
  user,
  ...overrides,
});

describe('/api/auth/activate', () => {
  let passwordHash: string;

  beforeEach(async () => {
    vi.resetAllMocks();
    passwordHash = await bcrypt.hash('correct-password', 4);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.user.findFirst.mockResolvedValue({ ...user, password: passwordHash });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    prisma.verificationChallenge.count.mockResolvedValue(0);
    prisma.verificationChallenge.findFirst.mockResolvedValue(null);
    prisma.verificationChallenge.findUnique.mockResolvedValue(makeChallenge());
    prisma.verificationChallenge.create.mockResolvedValue({
      id: challengeId,
      createdAt: new Date(),
    });
    prisma.verificationChallenge.updateMany.mockResolvedValue({ count: 1 });
    prisma.$transaction.mockImplementation(async (callback) =>
      (callback as (tx: typeof prisma) => Promise<unknown>)(prisma),
    );
    vi.mocked(sendEmail).mockResolvedValue(undefined);
    vi.mocked(sendSms).mockResolvedValue(undefined);
  });

  it('creates a destination-bound email challenge only after password proof', async () => {
    const res = response();

    await handler(
      request({
        action: 'request',
        identifier: user.email,
        password: 'correct-password',
        channel: 'email',
      }),
      res as never,
    );

    expect(prisma.verificationChallenge.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: user.id,
        purpose: 'ACCOUNT_ACTIVATION',
        channel: 'EMAIL',
        target: user.email,
        codeHash: expect.any(String),
        expiresAt: expect.any(Date),
      }),
      select: { id: true },
    });
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: user.email }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        challengeId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        ),
        pendingActivation: true,
        activationSent: true,
      }),
    );
    expect(
      prisma.verificationChallenge.create.mock.calls[0][0].data.id,
    ).toBe(res.json.mock.calls[0][0].challengeId);
    expect(JSON.stringify(res.json.mock.calls)).not.toMatch(/\b\d{6}\b/);
  });

  it('supports sending the activation code to the registered phone', async () => {
    await handler(
      request({
        action: 'request',
        identifier: user.phone,
        password: 'correct-password',
        channel: 'phone',
      }),
      response() as never,
    );

    expect(prisma.verificationChallenge.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        channel: 'PHONE',
        target: user.phone,
      }),
      select: { id: true },
    });
    expect(sendSms).toHaveBeenCalledWith(user.phone, expect.any(String));
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('does not create a challenge when the account password is wrong', async () => {
    const res = response();

    await handler(
      request({
        action: 'request',
        identifier: user.email,
        password: 'wrong-password',
        channel: 'email',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(prisma.verificationChallenge.create).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('enforces the five-send rolling 24-hour account limit', async () => {
    prisma.verificationChallenge.count.mockResolvedValue(5);
    const res = response();

    await handler(
      request({
        action: 'request',
        identifier: user.email,
        password: 'correct-password',
        channel: 'email',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(429);
    expect(prisma.verificationChallenge.create).not.toHaveBeenCalled();
  });

  it('enforces the minimum resend interval', async () => {
    prisma.verificationChallenge.findFirst.mockResolvedValue({
      createdAt: new Date(Date.now() - 30_000),
    });
    const res = response();

    await handler(
      request({
        action: 'request',
        identifier: user.email,
        password: 'correct-password',
        channel: 'email',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(429);
    expect(prisma.verificationChallenge.create).not.toHaveBeenCalled();
  });

  it('reuses the per-IP abuse limiter for activation requests', async () => {
    const responses = Array.from({ length: 6 }, () => response());

    for (const res of responses) {
      await handler(
        request(
          {
            action: 'request',
            identifier: user.email,
            password: 'correct-password',
            channel: 'email',
          },
          '203.0.113.250',
        ),
        res as never,
      );
    }

    expect(responses[5].status).toHaveBeenCalledWith(429);
    expect(responses[5].setHeader).toHaveBeenCalledWith(
      'Retry-After',
      expect.any(String),
    );
    expect(prisma.verificationChallenge.create).toHaveBeenCalledTimes(5);
  });

  it('keeps the account pending and gives a safe resend path when delivery fails', async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error('provider offline'));
    const res = response();

    await handler(
      request({
        action: 'request',
        identifier: user.email,
        password: 'correct-password',
        channel: 'email',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        pendingActivation: true,
        activationSent: false,
        canResend: true,
      }),
    );
  });

  it.each([
    ['EMAIL', 'emailVerifiedAt'],
    ['PHONE', 'phoneVerifiedAt'],
  ] as const)(
    'activates once through the registered %s and records only that contact as verified',
    async (channel, verifiedField) => {
      const target = channel === 'EMAIL' ? user.email : user.phone;
      prisma.verificationChallenge.findUnique.mockResolvedValue(
        makeChallenge({ channel, target }),
      );
      const res = response();

      await handler(
        request({
          action: 'verify',
          challengeId,
          code: '123456',
        }),
        res as never,
      );

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.verificationChallenge.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: challengeId,
          userId: user.id,
          purpose: 'ACCOUNT_ACTIVATION',
          channel,
          target,
          consumedAt: null,
          attempts: { lt: 5 },
        }),
        data: { consumedAt: expect.any(Date) },
      });
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: user.id,
          role: 'STUDENT',
          activatedAt: null,
          [channel === 'EMAIL' ? 'email' : 'phone']: target,
        }),
        data: {
          activatedAt: expect.any(Date),
          [verifiedField]: expect.any(Date),
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
    },
  );

  it('counts an incorrect code and never activates the account', async () => {
    const res = response();

    await handler(
      request({
        action: 'verify',
        challengeId,
        code: '000000',
      }),
      res as never,
    );

    expect(prisma.verificationChallenge.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: challengeId,
          attempts: { lt: 5 },
          consumedAt: null,
        }),
        data: { attempts: { increment: 1 } },
      }),
    );
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('consumes a challenge atomically after the fifth incorrect guess', async () => {
    prisma.verificationChallenge.findUnique.mockResolvedValue(
      makeChallenge({ attempts: 4 }),
    );
    const res = response();

    await handler(
      request({ action: 'verify', challengeId, code: '000000' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(429);
    expect(prisma.verificationChallenge.updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          id: challengeId,
          attempts: { gte: 5 },
        }),
        data: { consumedAt: expect.any(Date) },
      }),
    );
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it.each([
    ['expired', { expiresAt: new Date(Date.now() - 1) }],
    ['replayed', { consumedAt: new Date() }],
    ['wrong destination', { target: 'other@example.com' }],
    ['wrong channel', { channel: 'PHONE', target: 'different-phone' }],
    ['over the attempt limit', { attempts: 5 }],
  ])('rejects an %s challenge without activating the account', async (_label, changes) => {
    prisma.verificationChallenge.findUnique.mockResolvedValue(
      makeChallenge(changes),
    );
    const res = response();

    await handler(
      request({
        action: 'verify',
        challengeId,
        code: '123456',
      }),
      res as never,
    );

    expect(res.status).not.toHaveBeenCalledWith(200);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a challenge whose persisted account relation does not match its owner id', async () => {
    prisma.verificationChallenge.findUnique.mockResolvedValue(
      makeChallenge({
        userId: 'different-student',
        user: { ...user, id: user.id },
      }),
    );
    const res = response();

    await handler(
      request({ action: 'verify', challengeId, code: '123456' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('does not activate an account when a concurrent request already consumed the challenge', async () => {
    prisma.verificationChallenge.updateMany.mockResolvedValueOnce({ count: 0 });
    const res = response();

    await handler(
      request({ action: 'verify', challengeId, code: '123456' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });
});
