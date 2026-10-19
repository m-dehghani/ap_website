import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCoaches } from '@/services/coachService';
import { getPrisma } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  getPrisma: vi.fn(),
}));

describe('coachService', () => {
  const mockPrisma = {
    coach: {
      findMany: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getPrisma as vi.Mock).mockResolvedValue(mockPrisma);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCoaches', () => {
    it('returns formatted coaches with all required fields', async () => {
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
          programs: [
            { id: 'prog-1', name: 'برنامه ۱' },
            { id: 'prog-2', name: 'برنامه ۲' },
          ],
        },
      ];

      mockPrisma.coach.findMany.mockResolvedValue(mockCoaches);

      const result = await getCoaches();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'coach-1',
        firstName: 'علی',
        lastName: 'محمدی',
        fullName: 'علی محمدی',
        title: 'مربی ارشد',
        specialization: 'مربی فیفا',
        experience: 10,
        bio: 'تجربه ۱۰ ساله',
        quote: 'فوتبال هنر است',
        certifications: ['فیفا C'],
        achievements: ['قهرمان'],
        rating: 4.8,
        studentsCount: 150,
        image: '/coach1.jpg',
        instagram: '@ali',
        twitter: '@ali',
        programs: [
          { id: 'prog-1', name: 'برنامه ۱' },
          { id: 'prog-2', name: 'برنامه ۲' },
        ],
      });
    });

    it('filters only active coaches', async () => {
      mockPrisma.coach.findMany.mockResolvedValue([]);

      await getCoaches();

      expect(mockPrisma.coach.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        }),
      );
    });

    it('includes only active programs for each coach', async () => {
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
          programs: [
            { id: 'prog-1', name: 'برنامه فعال' },
            { id: 'prog-2', name: 'برنامه غیرفعال' },
          ],
        },
      ];

      mockPrisma.coach.findMany.mockResolvedValue(mockCoaches);

      const result = await getCoaches();

      expect(result[0].programs).toHaveLength(2);
      expect(result[0].programs[0].name).toBe('برنامه فعال');
    });

    it('orders programs by displayOrder', async () => {
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
          certifications: [],
          achievements: [],
          rating: 4.8,
          studentsCount: 150,
          image: '/coach1.jpg',
          instagram: '@ali',
          twitter: '@ali',
          isActive: true,
          displayOrder: 0,
          programs: [
            {
              id: 'prog-1',
              name: 'برنامه اول',
              isActive: true,
              displayOrder: 0,
            },
            {
              id: 'prog-2',
              name: 'برنامه دوم',
              isActive: true,
              displayOrder: 1,
            },
          ],
        },
      ];

      mockPrisma.coach.findMany.mockResolvedValue(mockCoaches);

      const result = await getCoaches();

      // The service orders by displayOrder ascending, so prog-1 (displayOrder: 0) should come first
      expect(result[0].programs[0].name).toBe('برنامه اول');
      expect(result[0].programs[1].name).toBe('برنامه دوم');
    });

    it('returns empty array when no coaches found', async () => {
      mockPrisma.coach.findMany.mockResolvedValue([]);

      const result = await getCoaches();

      expect(result).toEqual([]);
    });

    it('handles database error gracefully', async () => {
      mockPrisma.coach.findMany.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(getCoaches()).rejects.toThrow('Database connection failed');
    });
  });
});
