import { getPrisma } from '@/lib/db';
import { CoachViewModel, toCoachViewModel } from '@/types/viewModels/coach';

export async function getCoaches(): Promise<CoachViewModel[]> {
  const prisma = await getPrisma();
  const coaches = await prisma.coach.findMany({
    where: { isActive: true },
    include: {
      programs: {
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { displayOrder: 'asc' },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  return coaches.map(toCoachViewModel);
}
