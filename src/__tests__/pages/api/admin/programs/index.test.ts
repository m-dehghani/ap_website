import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/admin/programs';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  authorizeAdmin: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/db', () => ({
  getPrisma: vi.fn(),
}));

const createMockReq = (overrides = {}) => ({
  method: 'GET',
  query: {},
  body: {},
  headers: {},
  ...overrides,
});

const createMockRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  end: vi.fn().mockReturnThis(),
});

describe('/api/admin/programs', () => {
  const mockPrisma = {
    program: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
  });

  it('returns programs with ordered schedules', async () => {
    const programs = [{ id: 'program-1' }];
    mockPrisma.program.findMany.mockResolvedValue(programs);
    const res = createMockRes();

    await handler(createMockReq(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(programs);
    expect(mockPrisma.program.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          schedule: { orderBy: { displayOrder: 'asc' } },
        }),
        orderBy: { displayOrder: 'asc' },
      }),
    );
  });

  it('creates a program and returns its related coach and schedules', async () => {
    const input = {
      name: 'برنامه نوجوانان',
      description: 'برنامه تمرینی',
      price: 500000,
      duration: 3,
      sessionCount: 24,
      maxStudents: 15,
      isActive: true,
      popular: false,
      icon: '⚽',
      ageRange: '12-15 سال',
      minAge: 12,
      maxAge: 15,
      color: '#3B82F6',
      period: 'فصلی',
      rating: 4.5,
      studentsEnrolled: 0,
      features: ['تمرین تکنیک'],
      level: 'BEGINNER',
      coachId: 'coach-1',
      schedule: [{ day: 'شنبه', time: '17:00', displayOrder: 2 }],
    };
    const createdProgram = { id: 'program-1', ...input };
    mockPrisma.program.create.mockResolvedValue(createdProgram);
    const res = createMockRes();

    await handler(createMockReq({ method: 'POST', body: input }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdProgram);
    expect(mockPrisma.program.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isActive: true,
          coachId: 'coach-1',
          schedule: {
            create: [{ day: 'شنبه', time: '17:00', displayOrder: 2 }],
          },
        }),
        include: expect.objectContaining({
          coach: {
            select: expect.not.objectContaining({ password: true }),
          },
          schedule: { orderBy: { displayOrder: 'asc' } },
        }),
      }),
    );
  });

  it('rejects unsupported methods', async () => {
    const res = createMockRes();

    await handler(createMockReq({ method: 'DELETE' }), res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });
});
