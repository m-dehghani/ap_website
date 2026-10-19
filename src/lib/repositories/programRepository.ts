import { getPrisma } from '@/lib/db';
import { ProgramInput } from '@/lib/validations';

export interface ProgramRepository {
  findAll(includeInactive?: boolean): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(data: ProgramInput): Promise<any>;
  update(id: string, data: Partial<ProgramInput>): Promise<any>;
  delete(id: string): Promise<void>;
}

export const createProgramRepository = (): ProgramRepository => ({
  async findAll(includeInactive = false) {
    const prisma = await getPrisma();
    return prisma.program.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        coach: true,
        schedule: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { displayOrder: 'asc' },
    });
  },

  async findById(id: string) {
    const prisma = await getPrisma();
    return prisma.program.findUnique({
      where: { id },
      include: {
        coach: true,
        schedule: { orderBy: { displayOrder: 'asc' } },
      },
    });
  },

  async create(data: ProgramInput) {
    const prisma = await getPrisma();
    return prisma.program.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        sessionCount: data.sessionCount,
        maxStudents: data.maxStudents,
        popular: data.popular ?? false,
        icon: data.icon ?? '⚽',
        ageRange: data.ageRange ?? '8-12 سال',
        minAge: data.minAge ?? 8,
        maxAge: data.maxAge ?? 12,
        color: data.color ?? '#3B82F6',
        period: data.period ?? 'ماهانه',
        rating: data.rating ?? 4.5,
        studentsEnrolled: data.studentsEnrolled ?? 0,
        features: data.features ?? [],
        level: data.level ?? 'BEGINNER',
        coachId: data.coachId,
        schedule: {
          create: data.schedule?.map((s, i) => ({
            day: s.day,
            time: s.time,
            displayOrder: s.displayOrder ?? i,
          })) ?? [],
        },
      },
      include: {
        coach: true,
        schedule: true,
      },
    });
  },

  async update(id: string, data: Partial<ProgramInput>) {
    const prisma = await getPrisma();
    
    // Delete existing schedules and recreate
    if (data.schedule) {
      await prisma.schedule.deleteMany({ where: { programId: id } });
    }

    return prisma.program.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        sessionCount: data.sessionCount,
        maxStudents: data.maxStudents,
        popular: data.popular,
        icon: data.icon,
        ageRange: data.ageRange,
        minAge: data.minAge,
        maxAge: data.maxAge,
        color: data.color,
        period: data.period,
        rating: data.rating,
        studentsEnrolled: data.studentsEnrolled,
        features: data.features,
        level: data.level,
        coachId: data.coachId,
        isActive: data.isActive,
        schedule: data.schedule ? {
          create: data.schedule.map((s, i) => ({
            day: s.day,
            time: s.time,
            displayOrder: s.displayOrder ?? i,
          })),
        } : undefined,
      },
      include: {
        coach: true,
        schedule: { orderBy: { displayOrder: 'asc' } },
      },
    });
  },

  async delete(id: string) {
    const prisma = await getPrisma();
    await prisma.program.delete({ where: { id } });
  },
});