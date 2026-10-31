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
};
const createdRegistration = {
  id: 'registration-1',
  programId: 'program-1',
  status: 'PENDING',
  totalAmount: 1000,
};
const transaction = {
  user: {
    findFirst: vi.fn(),
    create: vi.fn().mockResolvedValue(createdUser),
  },
  coach: { findFirst: vi.fn() },
  program: { findUnique: vi.fn() },
  registration: {
    count: vi.fn(),
    create: vi.fn().mockResolvedValue(createdRegistration),
  },
};
const mockPrisma = {
  $transaction: vi.fn(),
};

let registrationCount = 0;

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

const validRegistration = (overrides: Record<string, unknown> = {}) => ({
  firstName: 'Student',
  lastName: 'User',
  phone: '09123456789',
  password: 'securepass123',
  programId: 'program-1',
  birthDate: '2012-01-01',
  emergencyContact: '09123456780',
  ...overrides,
});

describe('/api/register', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    registrationCount = 0;
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    transaction.user.findFirst.mockResolvedValue(null);
    transaction.coach.findFirst.mockResolvedValue(null);
    transaction.program.findUnique.mockResolvedValue({
      id: 'program-1',
      name: 'Program',
      price: 1000,
      maxStudents: 10,
      minAge: 0,
      maxAge: 99,
      isActive: true,
      coach: { firstName: 'Coach', lastName: 'User' },
    });
    transaction.registration.count.mockImplementation(async () => registrationCount);
    transaction.user.create.mockResolvedValue(createdUser);
    transaction.registration.create.mockImplementation(async () => {
      registrationCount += 1;
      return createdRegistration;
    });
    mockPrisma.$transaction.mockImplementation((callback) =>
      (callback as (tx: typeof transaction) => Promise<unknown>)(transaction),
    );
  });

  it('requires at least one account email or phone number', async () => {
    const res = createResponse();

    await handler(
      createRequest(
        validRegistration({
          email: undefined,
          phone: undefined,
        }),
      ),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(getPrisma).not.toHaveBeenCalled();
  });

  it('requires a 12-character password before accessing the database', async () => {
    const res = createResponse();

    await handler(
      createRequest(validRegistration({ password: '12345678901' })),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'password' }),
        ]),
      }),
    );
    expect(getPrisma).not.toHaveBeenCalled();
  });

  it('creates an account using phone alone and normalizes Persian digits', async () => {
    const req = createRequest(
      validRegistration({ phone: '۰۹۱۲۳۴۵۶۷۸۹' }),
    );
    const res = createResponse();

    await handler(req, res as never);

    expect(transaction.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: null,
        phone: '09123456789',
        role: 'STUDENT',
      }),
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('password');
  });

  it('stores the birth date supplied during public registration', async () => {
    const res = createResponse();

    await handler(
      createRequest(validRegistration()),
      res as never,
    );

    expect(transaction.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        birthDate: new Date('2012-01-01T00:00:00.000Z'),
      }),
      select: expect.any(Object),
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('stores the submitted registration contact and health details', async () => {
    await handler(
      createRequest(
        validRegistration({
          emergencyContactName: 'Parent',
          parentName: 'Guardian',
          parentEmail: 'PARENT@example.com',
          medicalConditions: 'Asthma',
          previousExperience: 'intermediate',
        }),
      ),
      createResponse() as never,
    );

    expect(transaction.registration.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        experienceLevel: 'intermediate',
        parentName: 'Guardian',
        parentEmail: 'parent@example.com',
        emergencyContactName: 'Parent',
        emergencyContactPhone: '09123456780',
        medicalConditions: 'Asthma',
      }),
      select: expect.any(Object),
    });
  });

  it.each([
    ['user', 'email'],
    ['user', 'phone'],
    ['coach', 'email'],
    ['coach', 'phone'],
  ] as const)(
    'returns 409 when the %s %s already exists',
    async (accountType, contactType) => {
      const duplicate = { id: 'existing-account' };
      const email = 'student@example.com';
      const phone = '09123456780';
      const contact =
        contactType === 'email'
          ? { email, phone: undefined }
          : { email: undefined, phone };
      if (accountType === 'user') {
        transaction.user.findFirst.mockResolvedValue(duplicate);
      } else {
        transaction.coach.findFirst.mockResolvedValue(duplicate);
      }
      const res = createResponse();

      await handler(
        createRequest(validRegistration(contact)),
        res as never,
      );

      expect(res.status).toHaveBeenCalledWith(409);
      expect(transaction.user.create).not.toHaveBeenCalled();
      expect(
        accountType === 'user'
          ? transaction.user.findFirst
          : transaction.coach.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          OR: [
            ...(contactType === 'email'
              ? [{ email: { equals: email, mode: 'insensitive' } }]
              : []),
            ...(contactType === 'phone' ? [{ phone }] : []),
          ],
        },
        select: { id: true },
      });
    },
  );

  it('rejects registration when persisted birth date is outside the program age range', async () => {
    transaction.program.findUnique.mockResolvedValue({
      id: 'program-1',
      name: 'Program',
      price: 1000,
      maxStudents: 10,
      minAge: 8,
      maxAge: 15,
      isActive: true,
      coach: { firstName: 'Coach', lastName: 'User' },
    });
    const res = createResponse();

    await handler(
      createRequest(validRegistration({ birthDate: '2000-01-01' })),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(transaction.user.create).not.toHaveBeenCalled();
  });

  it('returns 409 when the program has no remaining capacity', async () => {
    transaction.program.findUnique.mockResolvedValue({
      id: 'program-1',
      name: 'Program',
      price: 1000,
      maxStudents: 1,
      minAge: 0,
      maxAge: 99,
      isActive: true,
      coach: { firstName: 'Coach', lastName: 'User' },
    });
    transaction.registration.count.mockResolvedValue(1);
    const res = createResponse();

    await handler(
      createRequest(validRegistration()),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(transaction.user.create).not.toHaveBeenCalled();
  });

  it('creates only one registration when two requests race for the final place', async () => {
    let transactionTail = Promise.resolve();
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      const previous = transactionTail;
      let release!: () => void;
      transactionTail = new Promise<void>((resolve) => {
        release = resolve;
      });
      await previous;
      try {
        return await (
          callback as (tx: typeof transaction) => Promise<unknown>
        )(transaction);
      } finally {
        release();
      }
    });
    transaction.program.findUnique.mockResolvedValue({
      id: 'program-1',
      name: 'Program',
      price: 1000,
      maxStudents: 1,
      minAge: 0,
      maxAge: 99,
      isActive: true,
      coach: { firstName: 'Coach', lastName: 'User' },
    });
    const firstResponse = createResponse();
    const secondResponse = createResponse();

    await Promise.all([
      handler(
        createRequest(validRegistration({ phone: '09123456781' })),
        firstResponse as never,
      ),
      handler(
        createRequest(validRegistration({ phone: '09123456782' })),
        secondResponse as never,
      ),
    ]);

    const statuses = [
      firstResponse.status.mock.calls.at(-1)?.[0],
      secondResponse.status.mock.calls.at(-1)?.[0],
    ].sort();
    expect(statuses).toEqual([201, 409]);
    expect(transaction.registration.count).toHaveBeenCalledWith({
      where: {
        programId: 'program-1',
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });
    expect(transaction.user.create).toHaveBeenCalledTimes(1);
    expect(transaction.registration.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: 'Serializable' },
    );
  });

  it('maps unique constraint errors to the duplicate-account conflict', async () => {
    mockPrisma.$transaction.mockRejectedValue({ code: 'P2002' });
    const res = createResponse();

    await handler(createRequest(validRegistration()), res as never);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('maps serializable transaction conflicts to a retryable conflict', async () => {
    mockPrisma.$transaction.mockRejectedValue({ code: 'P2034' });
    const res = createResponse();

    await handler(createRequest(validRegistration()), res as never);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'اطلاعات برنامه هم‌زمان تغییر کرده است؛ لطفاً دوباره تلاش کنید',
    });
  });
});
