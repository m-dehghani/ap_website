// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/student/profile/verification';
import { authorizeStudent } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { sendEmail, sendSms } from '@/lib/notifications';

vi.mock('@/lib/auth', () => ({
  authorizeStudent: vi.fn(),
  normalizePhone: (value: string) => value.replace(/[^\d+]/g, ''),
}));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));
vi.mock('@/lib/notifications', () => ({
  sendEmail: vi.fn(),
  sendSms: vi.fn(),
}));

const mockPrisma = {
  user: { findUnique: vi.fn(), findFirst: vi.fn() },
  coach: { findFirst: vi.fn() },
  verificationChallenge: {
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};
const request = (body: Record<string, unknown>) =>
  ({ method: 'POST', body }) as never;
const response = () =>
  ({
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    setHeader: ReturnType<typeof vi.fn>;
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('/api/student/profile/verification', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeStudent).mockResolvedValue('student-1');
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      email: 'student@example.com',
      phone: '09123456789',
    });
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.coach.findFirst.mockResolvedValue(null);
    mockPrisma.verificationChallenge.findFirst.mockResolvedValue(null);
    mockPrisma.verificationChallenge.create.mockResolvedValue({ id: 'challenge-1' });
    vi.mocked(sendSms).mockResolvedValue(undefined);
    vi.mocked(sendEmail).mockResolvedValue(undefined);
  });

  it('sends a one-time code to the normalized new phone number', async () => {
    const res = response();

    await handler(
      request({
        action: 'request-contact',
        channel: 'phone',
        value: '0912 345 6789',
      }),
      res as never,
    );

    expect(mockPrisma.verificationChallenge.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'student-1',
        purpose: 'PHONE_CHANGE',
        channel: 'PHONE',
        target: '09123456789',
        codeHash: expect.stringMatching(/^[a-f\d]{64}$/),
        expiresAt: expect.any(Date),
      }),
    });
    expect(sendSms).toHaveBeenCalledWith(
      '09123456789',
      expect.stringMatching(/\d{6}/),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('limits repeated code attempts and does not update the profile', async () => {
    mockPrisma.verificationChallenge.findFirst.mockResolvedValue({
      id: 'challenge-1',
      attempts: 0,
      codeHash: '0'.repeat(64),
      createdAt: new Date(Date.now() - 120_000),
      expiresAt: new Date(Date.now() + 60_000),
    });
    const res = response();

    await handler(
      request({ action: 'verify-contact', channel: 'phone', code: '123456' }),
      res as never,
    );

    expect(mockPrisma.verificationChallenge.update).toHaveBeenCalledWith({
      where: { id: 'challenge-1' },
      data: { attempts: 1 },
    });
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('rejects password changes shorter than 12 characters', async () => {
    const res = response();

    await handler(
      request({
        action: 'request-password',
        channel: 'email',
        password: '12345678901',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getPrisma).not.toHaveBeenCalled();
  });

  it('accepts a 12-character password for a verified password change', async () => {
    const res = response();

    await handler(
      request({
        action: 'request-password',
        channel: 'email',
        password: 'securepass12',
      }),
      res as never,
    );

    expect(mockPrisma.verificationChallenge.create).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
