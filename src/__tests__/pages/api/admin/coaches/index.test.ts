import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '@/pages/api/admin/coaches/index';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  authorizeAdmin: vi.fn().mockResolvedValue(true),
}));

// Mock Prisma
vi.mock('@/lib/db', () => ({
  getPrisma: vi.fn(),
}));

// Mock NextApiRequest/Response
const createMockReq = (overrides = {}) => ({
  method: 'GET',
  query: {},
  body: {},
  headers: {},
  ...overrides,
});

const createMockRes = () => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return res;
};

describe('/api/admin/coaches', () => {
  const mockPrisma = {
    coach: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    (getPrisma as vi.Mock).mockResolvedValue(mockPrisma);
  });

  describe('GET', () => {
    it('returns list of coaches with programs', async () => {
      const mockCoaches = [
        {
          id: 'coach-1',
          firstName: 'علی',
          lastName: 'محمدی',
          email: 'ali@example.com',
          phone: '09123456789',
          specialization: 'مربی فیفا',
          experience: 10,
          title: 'مربی ارشد',
          bio: 'تجربه ۱۰ ساله',
          quote: 'فوتبال هنر است',
          certifications: ['فیفا C'],
          achievements: ['قهرمان'],
          rating: 4.8,
          studentsCount: 150,
          image: '/coach1.jpg',
          instagram: '@ali',
          twitter: '@ali',
          isActive: true,
          displayOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          programs: [{ id: 'prog-1', name: 'برنامه ۱' }],
        },
      ];

      mockPrisma.coach.findMany.mockResolvedValue(mockCoaches);

      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCoaches);
    });

    it('orders coaches by displayOrder', async () => {
      mockPrisma.coach.findMany.mockResolvedValue([]);

      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      await handler(req, res);

      expect(mockPrisma.coach.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { displayOrder: 'asc' },
          include: { programs: true },
        }),
      );
    });

    it('returns 405 for non-GET/POST methods', async () => {
      const req = createMockReq({ method: 'PUT' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('handles database errors', async () => {
      mockPrisma.coach.findMany.mockRejectedValue(new Error('DB Error'));

      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      await expect(handler(req, res)).rejects.toThrow('DB Error');
    });
  });

  describe('POST', () => {
    const validCoachData = {
      firstName: 'علی',
      lastName: 'محمدی',
      email: 'ali@example.com',
      password: 'coach-password',
      phone: '09123456789',
      specialization: 'مربی فیفا',
      experience: 10,
      title: 'مربی ارشد',
      bio: 'تجربه ۱۰ ساله',
      quote: 'فوتبال هنر است',
      certifications: ['فیفا C'],
      achievements: ['قهرمان'],
      rating: 4.8,
      studentsCount: 150,
      image: '/coach1.jpg',
      instagram: '@ali',
      twitter: '@ali',
      isActive: true,
      displayOrder: 0,
    };

    it('creates new coach with all fields', async () => {
      const createdCoach = { ...validCoachData, id: 'coach-new', programs: [] };
      mockPrisma.coach.create.mockResolvedValue(createdCoach);

      const req = createMockReq({
        method: 'POST',
        body: validCoachData,
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'coach-new',
          firstName: 'علی',
          lastName: 'محمدی',
        }),
      );
    });

    it('includes certifications and achievements as arrays', async () => {
      mockPrisma.coach.create.mockResolvedValue({
        ...validCoachData,
        id: 'coach-new',
        programs: [],
      });

      const req = createMockReq({
        method: 'POST',
        body: validCoachData,
      });
      const res = createMockRes();

      await handler(req, res);

      expect(mockPrisma.coach.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            certifications: ['فیفا C'],
            achievements: ['قهرمان'],
          }),
        }),
      );
    });

    it('sets default values for optional fields', async () => {
      const minimalData = {
        firstName: 'علی',
        lastName: 'محمدی',
        email: 'ali@example.com',
        password: 'coach-password',
        phone: '09123456789',
        specialization: 'مربی فیفا',
        experience: 10,
      };

      mockPrisma.coach.create.mockResolvedValue({
        ...minimalData,
        id: 'coach-new',
        programs: [],
      });

      const req = createMockReq({
        method: 'POST',
        body: minimalData,
      });
      const res = createMockRes();

      await handler(req, res);

      expect(mockPrisma.coach.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: true,
            displayOrder: 0,
            certifications: [],
            achievements: [],
            rating: 0,
            studentsCount: 0,
          }),
        }),
      );
    });

    it('returns 405 for non-POST methods', async () => {
      const req = createMockReq({ method: 'PUT' });
      const res = createMockRes();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
    });
  });
});
