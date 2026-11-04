import { z } from 'zod';
import type { getPrisma } from '@/lib/db';

export const attendanceEligibleRegistrationStatuses = [
  'PENDING',
  'APPROVED',
] as const;

export const attendanceStatusSchema = z.enum([
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
]);

export const attendanceRequestSchema = z
  .object({
    attendance: z
      .array(
        z
          .object({
            userId: z.string().trim().min(1),
            status: attendanceStatusSchema,
            notes: z.string().trim().max(1000).nullable().optional(),
          })
          .strict(),
      )
      .min(1)
      .max(1000)
      .refine(
        (entries) =>
          new Set(entries.map((entry) => entry.userId)).size === entries.length,
        'هر دانش‌آموز فقط یک بار در فهرست حضور و غیاب وارد شود',
      ),
  })
  .strict();

export type AttendanceRequest = z.infer<typeof attendanceRequestSchema>;
type Prisma = Awaited<ReturnType<typeof getPrisma>>;

export async function saveAttendance(
  prisma: Prisma,
  sessionId: string,
  programId: string,
  attendance: AttendanceRequest['attendance'],
) {
  return prisma.$transaction(async (tx) => {
    const registrations = await tx.registration.findMany({
      where: {
        programId,
        status: { in: [...attendanceEligibleRegistrationStatuses] },
        userId: { in: attendance.map(({ userId }) => userId) },
      },
      select: { userId: true },
    });
    const enrolledIds = new Set(registrations.map(({ userId }) => userId));
    if (attendance.some(({ userId }) => !enrolledIds.has(userId))) {
      return { missingUsers: true as const };
    }

    const records = await Promise.all(
      attendance.map(({ userId, status, notes }) =>
        tx.attendance.upsert({
          where: { userId_sessionId: { userId, sessionId } },
          create: {
            userId,
            sessionId,
            status,
            notes: notes ?? null,
          },
          update: {
            status,
            ...(notes === undefined ? {} : { notes }),
          },
          select: { id: true, userId: true, status: true, notes: true },
        }),
      ),
    );
    return { records };
  });
}
