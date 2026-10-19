import { getPrisma } from '@/lib/db';
import {
  ProgramViewModel,
  toProgramViewModel,
} from '@/types/viewModels/program';

export async function getPrograms(): Promise<ProgramViewModel[]> {
  const prisma = await getPrisma();
  const programs = await prisma.program.findMany({
    where: { isActive: true },
    include: {
      coach: true,
      schedule: { orderBy: { displayOrder: 'asc' } },
    },
    orderBy: { displayOrder: 'asc' },
  });

  return programs.map(toProgramViewModel);
}
