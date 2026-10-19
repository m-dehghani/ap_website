import { getPrisma } from '@/lib/db';
import { CoachInput } from '@/lib/validations';

export interface CoachRepository {
  findAll(includeInactive?: boolean): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(data: CoachInput): Promise<any>;
  update(id: string, data: Partial<CoachInput>): Promise<any>;
  delete(id: string): Promise<void>;
}

export const createCoachRepository = (): CoachRepository => ({
  async findAll(includeInactive = false) {
    const prisma = await getPrisma();
    return prisma.coach.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        programs: {
          where: { isActive: true },
          select: { id: true, name: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  },

  async findById(id: string) {
    const prisma = await getPrisma();
    return prisma.coach.findUnique({
      where: { id },
      include: {
        programs: {
          where: { isActive: true },
          select: { id: true, name: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  },

  async create(data: CoachInput) {
    const prisma = await getPrisma();
    const bcrypt = await import('bcryptjs');
    if (!data.password) {
      throw new Error('Coach password is required');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return prisma.coach.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        specialization: data.specialization,
        experience: data.experience,
        title: data.title,
        bio: data.bio,
        quote: data.quote,
        certifications: data.certifications,
        achievements: data.achievements,
        rating: data.rating ?? 0,
        studentsCount: data.studentsCount ?? 0,
        image: data.image,
        instagram: data.instagram,
        twitter: data.twitter,
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder ?? 0,
      },
      include: {
        programs: true,
      },
    });
  },

  async update(id: string, data: Partial<CoachInput>) {
    const prisma = await getPrisma();
    return prisma.coach.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        specialization: data.specialization,
        experience: data.experience,
        title: data.title,
        bio: data.bio,
        quote: data.quote,
        certifications: data.certifications,
        achievements: data.achievements,
        rating: data.rating,
        studentsCount: data.studentsCount,
        image: data.image,
        instagram: data.instagram,
        twitter: data.twitter,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      },
      include: {
        programs: true,
      },
    });
  },

  async delete(id: string) {
    const prisma = await getPrisma();
    await prisma.coach.delete({ where: { id } });
  },
});