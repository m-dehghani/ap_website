import { getPrisma } from '@/lib/db';
import { RegistrationInput } from '@/lib/validations';

export interface RegistrationRepository {
  findAll(params: {
    page: number;
    limit: number;
    status?: string;
    programId?: string;
  }): Promise<{ data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
  findById(id: string): Promise<any | null>;
  update(id: string, data: Partial<RegistrationInput>): Promise<any>;
  delete(id: string): Promise<void>;
}

export const createRegistrationRepository = (): RegistrationRepository => ({
  async findAll({ page, limit, status, programId }) {
    const prisma = await getPrisma();
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (programId) where.programId = programId;

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: {
          user: true,
          program: { include: { coach: true } },
          payments: true,
        },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.registration.count({ where }),
    ]);

    return {
      data: registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string) {
    const prisma = await getPrisma();
    return prisma.registration.findUnique({
      where: { id },
      include: {
        user: true,
        program: { include: { coach: true } },
        payments: true,
      },
    });
  },

  async update(id: string, data: Partial<RegistrationInput>) {
    const prisma = await getPrisma();
    return prisma.registration.update({
      where: { id },
      data: {
        status: data.status,
        totalAmount: data.totalAmount,
        paidAmount: data.paidAmount,
        experienceLevel: data.experienceLevel,
        parentName: data.parentName,
        parentEmail: data.parentEmail,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        medicalConditions: data.medicalConditions,
      },
      include: {
        user: true,
        program: { include: { coach: true } },
        payments: true,
      },
    });
  },

  async delete(id: string) {
    const prisma = await getPrisma();
    await prisma.registration.delete({ where: { id } });
  },
});