// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/student/registrations';
import { authorizeStudent } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({ authorizeStudent: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const tx = {
  user: { findUnique: vi.fn() },
  program: { findUnique: vi.fn() },
  registration: {
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
};
const mockPrisma = {
  registration: { findFirst: vi.fn(), update: vi.fn() },
  $transaction: vi.fn(),
};

const request = (method: string, body: Record<string, unknown>) =>
  ({ method, body }) as never;
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

describe('/api/student/registrations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeStudent).mockResolvedValue('student-1');
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    tx.user.findUnique.mockResolvedValue({
      birthDate: new Date('2012-01-01T00:00:00.000Z'),
    });
    tx.program.findUnique.mockResolvedValue({
      id: 'program-1',
      name: 'Football',
      price: 1000,
      minAge: 8,
      maxAge: 20,
      maxStudents: 10,
      isActive: true,
    });
    mockPrisma.$transaction.mockImplementation(
      (callback: (transaction: typeof tx) => Promise<unknown>) =>
        callback(tx),
    );
    tx.registration.findFirst.mockResolvedValue(null);
    tx.registration.count.mockResolvedValue(0);
    tx.registration.create.mockResolvedValue({
      id: 'registration-1',
      status: 'PENDING',
      totalAmount: 1000,
      paidAmount: 0,
    });
  });

  it('uses the persisted birth date and creates an eligible enrollment', async () => {
    const res = response();

    await handler(request('POST', { programId: 'program-1' }), res as never);

    expect(tx.registration.create).toHaveBeenCalledWith({
      data: {
        userId: 'student-1',
        programId: 'program-1',
        totalAmount: 1000,
        status: 'PENDING',
      },
      select: expect.any(Object),
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('rejects a student whose persisted age is outside the program range', async () => {
    tx.program.findUnique.mockResolvedValue({
      id: 'program-1',
      name: 'Adults',
      price: 1000,
      minAge: 18,
      maxAge: 30,
      maxStudents: 10,
      isActive: true,
    });
    const res = response();

    await handler(request('POST', { programId: 'program-1' }), res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(tx.registration.create).not.toHaveBeenCalled();
  });

  it('prevents cancellation once a payment is pending', async () => {
    mockPrisma.registration.findFirst.mockResolvedValue({
      id: 'registration-1',
      status: 'PENDING',
      paidAmount: 0,
      payments: [{ status: 'PENDING' }],
    });
    const res = response();

    await handler(
      request('DELETE', { registrationId: 'registration-1' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(mockPrisma.registration.update).not.toHaveBeenCalled();
  });
});
