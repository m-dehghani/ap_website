// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/staff/notifications';
import { authorizeStaff } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { sendEmail, sendSms } from '@/lib/notifications';

vi.mock('@/lib/auth', () => ({ authorizeStaff: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));
vi.mock('@/lib/notifications', () => ({
  sendEmail: vi.fn(),
  sendSms: vi.fn(),
}));

const mockPrisma = {
  program: { findMany: vi.fn(), findFirst: vi.fn() },
  user: { findMany: vi.fn(), findFirst: vi.fn() },
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

describe('/api/staff/notifications', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('RESEND_API_KEY', 'test-resend-key');
    vi.stubEnv('RESEND_FROM', 'academy@example.com');
    vi.stubEnv('KAVENEGAR_API_KEY', 'test-kavenegar-key');
    vi.mocked(authorizeStaff).mockResolvedValue({
      id: 'admin-1',
      role: 'ADMIN',
    });
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    vi.mocked(sendEmail).mockResolvedValue(undefined);
    vi.mocked(sendSms).mockResolvedValue(undefined);
    mockPrisma.program.findFirst.mockResolvedValue({ id: 'program-1' });
    mockPrisma.user.findMany.mockResolvedValue([
      { id: 'student-1', email: 'student@example.com', phone: '09123456789' },
      { id: 'student-2', email: null, phone: '09123456780' },
    ]);
  });

  it('sends program messages only to active students in that program', async () => {
    const res = response();

    await handler(
      request({
        audience: 'program',
        programId: 'program-1',
        purpose: 'academy',
        channel: 'both',
        subject: 'Practice update',
        message: 'Training is scheduled for tomorrow.',
      }),
      res as never,
    );

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: 'STUDENT',
          registrations: {
            some: {
              programId: 'program-1',
              status: { in: ['PENDING', 'APPROVED'] },
            },
          },
        }),
        take: 201,
      }),
    );
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendSms).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not allow coaches to send to all marketing recipients', async () => {
    vi.mocked(authorizeStaff).mockResolvedValue({
      id: 'coach-1',
      role: 'COACH',
    });
    const res = response();

    await handler(
      request({
        audience: 'marketing',
        purpose: 'marketing',
        channel: 'email',
        subject: 'Offer',
        message: 'An academy offer.',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
