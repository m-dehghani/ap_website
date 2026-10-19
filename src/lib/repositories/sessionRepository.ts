import { getPrisma } from '@/lib/db';
import { SessionInput } from '@/lib/validations';

export interface SessionRepository {
  findAll(params: {
    page: number;
    limit: number;
    programId?: string;
    coachId?: string;
    status?: string;
  }): Promise<{ data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
  findById(id: string): Promise<any | null>;
  create(data: SessionInput): Promise<any>;
  update(id: string, data: Partial<SessionInput>): Promise<any>;
  delete(id: string): Promise<void>;
}

export const createSessionRepository = (): SessionRepository => ({
  async findAll({ page, limit, programId, coachId, status }) {
    const prisma = await getPrisma();
    const skip = (page - 1) * limit;

    const where: any = {};
    if (programId) where.programId = programId;
    if (coachId) where.coachId = coachId;
    if (status) where.status = status;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          program: { select: { id: true, name: true } },
          coach: { select: { id: true, firstName: true, lastName: true } },
          attendance: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.session.count({ where }),
    ]);

    return {
      data: sessions,
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
    return prisma.session.findUnique({
      where: { id },
      include: {
        program: { select: { id: true, name: true } },
        coach: { select: { id: true, firstName: true, lastName: true } },
        attendance: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  },

  async create(data: SessionInput) {
    const prisma = await getPrisma();
    return prisma.session.create({
      data: {
        name: data.name,
        description: data.description,
        date: new Date(data.date),
        duration: data.duration,
        location: data.location,
        maxCapacity: data.maxCapacity,
        status: data.status ?? 'SCHEDULED',
        programId: data.programId,
        coachId: data.coachId,
      },
      include: {
        program: { select: { id: true, name: true } },
        coach: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  },

  async update(id: string, data: Partial<SessionInput>) {
    const prisma = await getPrisma();
    return prisma.session.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        duration: data.duration,
        location: data.location,
        maxCapacity: data.maxCapacity,
        status: data.status,
        programId: data.programId,
        coachId: data.coachId,
      },
      include: {
        program: { select: { id: true, name: true } },
        coach: { select: { id: true, firstName: true, lastName: true } },
        attendance: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  },

  async delete(id: string) {
    const prisma = await getPrisma();
    await prisma.session.delete({ where: { id } });
  },
});