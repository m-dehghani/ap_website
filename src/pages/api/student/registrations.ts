import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authorizeStudent } from '@/lib/auth';
import { calculateAge } from '@/lib/age';
import { getPrisma } from '@/lib/db';

const enrollmentSchema = z.object({ programId: z.string().min(1) });
const cancellationSchema = z.object({ registrationId: z.string().min(1) });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!['POST', 'DELETE'].includes(req.method ?? '')) {
    res.setHeader('Allow', 'POST, DELETE');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = await authorizeStudent(req, res);
    if (!userId) return;
    const db = await getPrisma();

    if (req.method === 'POST') {
      const { programId } = enrollmentSchema.parse(req.body);
      const result = await db.$transaction(
        async (tx) => {
          const [student, program] = await Promise.all([
            tx.user.findUnique({
              where: { id: userId },
              select: { birthDate: true },
            }),
            tx.program.findUnique({
              where: { id: programId },
              select: {
                id: true,
                name: true,
                price: true,
                minAge: true,
                maxAge: true,
                maxStudents: true,
                isActive: true,
              },
            }),
          ]);
          if (!program) return { kind: 'not-found' as const };
          if (!program.isActive) return { kind: 'inactive' as const };
          if (!student?.birthDate) return { kind: 'missing-birth-date' as const };
          const age = calculateAge(student.birthDate);
          if (age < program.minAge || age > program.maxAge) {
            return {
              kind: 'ineligible' as const,
              minAge: program.minAge,
              maxAge: program.maxAge,
            };
          }

          const existing = await tx.registration.findFirst({
            where: {
              userId,
              programId,
              status: { in: ['PENDING', 'APPROVED'] },
            },
            select: { id: true },
          });
          if (existing) return { kind: 'duplicate' as const };

          const enrollmentCount = await tx.registration.count({
            where: {
              programId,
              status: { in: ['PENDING', 'APPROVED'] },
            },
          });
          if (enrollmentCount >= program.maxStudents) {
            return { kind: 'full' as const };
          }

          const registration = await tx.registration.create({
            data: {
              userId,
              programId,
              totalAmount: program.price,
              status: 'PENDING',
            },
            select: {
              id: true,
              status: true,
              totalAmount: true,
              paidAmount: true,
            },
          });
          return {
            kind: 'created' as const,
            registration,
            program: { id: program.id, name: program.name },
          };
        },
        { isolationLevel: 'Serializable' },
      );

      if (result.kind === 'not-found') {
        return res.status(404).json({ message: 'برنامه آموزشی یافت نشد' });
      }
      if (result.kind === 'inactive') {
        return res.status(400).json({ message: 'این برنامه در حال حاضر فعال نیست' });
      }
      if (result.kind === 'missing-birth-date') {
        return res.status(400).json({
          message: 'برای ثبت‌نام ابتدا تاریخ تولد خود را در پروفایل وارد کنید',
        });
      }
      if (result.kind === 'ineligible') {
        return res.status(400).json({
          message: `سن شما باید بین ${result.minAge} تا ${result.maxAge} سال باشد`,
        });
      }
      if (result.kind === 'duplicate') {
        return res.status(409).json({ message: 'شما قبلاً در این برنامه ثبت‌نام کرده‌اید' });
      }
      if (result.kind === 'full') {
        return res.status(409).json({ message: 'ظرفیت این برنامه تکمیل شده است' });
      }
      return res.status(201).json({
        registration: result.registration,
        program: result.program,
      });
    }

    const { registrationId } = cancellationSchema.parse(req.body);
    const registration = await db.registration.findFirst({
      where: { id: registrationId, userId },
      select: {
        id: true,
        status: true,
        paidAmount: true,
        payments: { select: { status: true } },
      },
    });
    if (!registration) {
      return res.status(404).json({ message: 'ثبت‌نام یافت نشد' });
    }
    if (!['PENDING', 'APPROVED'].includes(registration.status)) {
      return res.status(409).json({ message: 'این ثبت‌نام قابل لغو نیست' });
    }
    if (
      registration.paidAmount > 0 ||
      registration.payments.some((payment) =>
        ['PENDING', 'COMPLETED', 'REFUND_REQUIRED'].includes(payment.status),
      )
    ) {
      return res.status(409).json({
        message: 'برای لغو ثبت‌نامی که پرداخت آن آغاز یا انجام شده است با آکادمی تماس بگیرید',
      });
    }

    await db.registration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' },
    });
    return res.status(200).json({ message: 'ثبت‌نام لغو شد' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'اطلاعات ارسالی معتبر نیست',
        errors: error.issues.map(({ path, message }) => ({
          field: path.join('.'),
          message,
        })),
      });
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2034'
    ) {
      return res.status(409).json({
        message: 'اطلاعات برنامه هم‌زمان تغییر کرده است؛ لطفاً دوباره تلاش کنید',
      });
    }
    console.error('Student registration update error:', error);
    return res.status(500).json({ message: 'خطا در به‌روزرسانی ثبت‌نام' });
  }
}
