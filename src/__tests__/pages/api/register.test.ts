// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/register';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  getPrisma: vi.fn(),
}));

const createdUser = {
  id: 'student-1',
  email: null,
  phone: '09123456789',
  firstName: 'Student',
  lastName: 'User',
  password: 'hashed-password',
};
const createdRegistration = {
  id: 'registration-1',
  programId: 'program-1',
  status: 'PENDING',
  totalAmount: 1000,
};
const transaction = {
  user: { create: vi.fn().mockResolvedValue(createdUser) },
  registration: { create: vi.fn().mockResolvedValue(createdRegistration) },
};
const mockPrisma = {
  user: { findFirst: vi.fn() },
  coach: { findFirst: vi.fn() },
  program: { findUnique: vi.fn() },
  registration: { count: vi.fn() },
  $transaction: vi.fn(),
};

const createRequest = (body: Record<string, unknown>) =>
  ({
    method: 'POST',
    body,
  }) as never;

const createResponse = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('/api/register', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.coach.findFirst.mockResolvedValue(null);
    mockPrisma.program.findUnique.mockResolvedValue({
      id: 'program-1',
      price: 1000,
      maxStudents: 10,
      minAge: 0,
      maxAge: 99,
      isActive: true,
      coach: { firstName: 'Coach', lastName: 'User' },
    });
    mockPrisma.registration.count.mockResolvedValue(0);
    transaction.user.create.mockResolvedValue(createdUser);
    transaction.registration.create.mockResolvedValue(createdRegistration);
    mockPrisma.$transaction.mockImplementation((callback) =>
      (callback as (tx: typeof transaction) => Promise<unknown>)(transaction),
    );
  });

  it('requires at least one account email or phone number', async () => {
    const req = createRequest({
      firstName: 'Student',
      lastName: 'User',
      password: 'secret123',
      programId: 'program-1',
      birthDate: '2012-01-01',
      emergencyContact: '09123456780',
    });
    const res = createResponse();

    await handler(req, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getPrisma).not.toHaveBeenCalled();
  });

  it('creates an account using phone alone and normalizes Persian digits', async () => {
    const req = createRequest({
      firstName: 'Student',
      lastName: 'User',
      phone: '۰۹۱۲۳۴۵۶۷۸۹',
      password: 'secret123',
      programId: 'program-1',
      birthDate: '2012-01-01',
      emergencyContact: '09123456780',
    });
    const res = createResponse();

    await handler(req, res as never);

    expect(transaction.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: null,
        phone: '09123456789',
        role: 'STUDENT',
      }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          user: expect.objectContaining({
            email: null,
            phone: '09123456789',
          }),
        }),
      }),
    );
  });

  it('stores the birth date supplied during public registration', async () => {
    const req = createRequest({
      firstName: 'Student',
      lastName: 'User',
      phone: '09123456789',
      password: 'secret123',
      programId: 'program-1',
      birthDate: '2012-01-01',
      emergencyContact: '09123456780',
    });
    const res = createResponse();

    await handler(req, res as never);

    expect(transaction.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        birthDate: new Date('2012-01-01T00:00:00.000Z'),
      }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('stores the submitted registration contact and health details', async () => {
    const req = createRequest({
      firstName: 'Student',
      lastName: 'User',
      phone: '09123456789',
      password: 'secret123',
      programId: 'program-1',
      birthDate: '2012-01-01',
      emergencyContact: '09123456780',
      emergencyContactName: 'Parent',
      parentName: 'Guardian',
      parentEmail: 'PARENT@example.com',
      medicalConditions: 'Asthma',
      previousExperience: 'intermediate',
    });
    const res = createResponse();

    await handler(req, res as never);

    expect(transaction.registration.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        experienceLevel: 'intermediate',
        parentName: 'Guardian',
        parentEmail: 'parent@example.com',
        emergencyContactName: 'Parent',
        emergencyContactPhone: '09123456780',
        medicalConditions: 'Asthma',
      }),
    });
  });

  it('rejects registration when persisted birth date is outside the program age range', async () => {
    mockPrisma.program.findUnique.mockResolvedValue({
      id: 'program-1',
      price: 1000,
      maxStudents: 10,
      minAge: 8,
      maxAge: 15,
      isActive: true,
      coach: { firstName: 'Coach', lastName: 'User' },
    });
    const req = createRequest({
      firstName: 'Student',
      lastName: 'User',
      phone: '09123456789',
      password: 'secret123',
      programId: 'program-1',
      birthDate: '2000-01-01',
      emergencyContact: '09123456780',
    });
    const res = createResponse();

    await handler(req, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(transaction.user.create).not.toHaveBeenCalled();
  });
});
