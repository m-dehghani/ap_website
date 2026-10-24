import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authorizeStaff } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { sendEmail, sendSms } from '@/lib/notifications';

const notificationSchema = z.object({
  audience: z.enum(['student', 'program', 'marketing']),
  studentId: z.string().min(1).optional(),
  programId: z.string().min(1).optional(),
  purpose: z.enum(['academy', 'marketing']),
  channel: z.enum(['email', 'sms', 'both']),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(5000),
});

const activeRegistrationStatuses = ['PENDING', 'APPROVED'];
const maxRecipients = 200;

export const config = { maxDuration: 60 };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const staff = await authorizeStaff(req, res);
    if (!staff) return;
    const db = await getPrisma();

    if (req.method === 'GET') {
      const coachId = staff.role === 'COACH' ? staff.id : undefined;
      const [programs, students] = await Promise.all([
        db.program.findMany({
          where: {
            isActive: true,
            ...(coachId ? { coachId } : {}),
          },
          select: { id: true, name: true },
          orderBy: { displayOrder: 'asc' },
        }),
        db.user.findMany({
          where: {
            role: 'STUDENT',
            ...(coachId
              ? {
                  registrations: {
                    some: {
                      status: { in: activeRegistrationStatuses },
                      program: { coachId },
                    },
                  },
                }
              : {}),
          },
          select: { id: true, firstName: true, lastName: true },
          orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
          take: maxRecipients,
        }),
      ]);
      return res.status(200).json({ programs, students });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const input = notificationSchema.parse(req.body);
    if (
      ['sms', 'both'].includes(input.channel) &&
      input.message.length > 1000
    ) {
      return res.status(400).json({
        message: 'متن پیامک نمی‌تواند بیشتر از ۱۰۰۰ نویسه باشد',
      });
    }
    if (
      (input.audience === 'student' && !input.studentId) ||
      (input.audience === 'program' && !input.programId) ||
      (input.audience === 'marketing' && staff.role !== 'ADMIN') ||
      (input.audience === 'marketing' && input.purpose !== 'marketing') ||
      (input.purpose === 'marketing' &&
        input.audience !== 'marketing' &&
        input.audience !== 'program') ||
      (['email', 'both'].includes(input.channel) && !input.subject)
    ) {
      return res
        .status(400)
        .json({ message: 'مخاطب یا اطلاعات پیام معتبر نیست' });
    }

    const coachId = staff.role === 'COACH' ? staff.id : undefined;
    let recipients: Array<{
      id: string;
      email: string | null;
      phone: string | null;
    }> = [];

    if (input.audience === 'student') {
      const student = await db.user.findFirst({
        where: {
          id: input.studentId,
          role: 'STUDENT',
          ...(input.purpose === 'marketing' ? { marketingOptIn: true } : {}),
          ...(coachId
            ? {
                registrations: {
                  some: {
                    status: { in: activeRegistrationStatuses },
                    program: { coachId },
                  },
                },
              }
            : {}),
        },
        select: { id: true, email: true, phone: true },
      });
      if (!student) {
        return res.status(404).json({
          message: 'دانش‌آموز یافت نشد یا اجازه ارسال به او را ندارید',
        });
      }
      recipients = [student];
    } else if (input.audience === 'marketing') {
      recipients = await db.user.findMany({
        where: { role: 'STUDENT', marketingOptIn: true },
        select: { id: true, email: true, phone: true },
        orderBy: { id: 'asc' },
        take: maxRecipients + 1,
      });
    } else {
      const program = await db.program.findFirst({
        where: {
          id: input.programId,
          ...(coachId ? { coachId } : {}),
        },
        select: { id: true },
      });
      if (!program) {
        return res.status(404).json({
          message: 'برنامه یافت نشد یا اجازه ارسال به این برنامه را ندارید',
        });
      }
      recipients = await db.user.findMany({
        where: {
          role: 'STUDENT',
          ...(input.purpose === 'marketing' ? { marketingOptIn: true } : {}),
          registrations: {
            some: {
              programId: program.id,
              status: { in: activeRegistrationStatuses },
            },
          },
        },
        select: { id: true, email: true, phone: true },
        orderBy: { id: 'asc' },
        take: maxRecipients + 1,
      });
    }

    if (recipients.length > maxRecipients) {
      return res.status(413).json({
        message: `ارسال هم‌زمان به بیش از ${maxRecipients} دانش‌آموز مجاز نیست`,
      });
    }
    if (
      (input.channel === 'email' || input.channel === 'both') &&
      (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM)
    ) {
      return res
        .status(503)
        .json({ message: 'ارسال ایمیل در سامانه پیکربندی نشده است' });
    }
    if (
      (input.channel === 'sms' || input.channel === 'both') &&
      !process.env.KAVENEGAR_API_KEY
    ) {
      return res
        .status(503)
        .json({ message: 'ارسال پیامک در سامانه پیکربندی نشده است' });
    }
    if (recipients.length === 0) {
      return res
        .status(400)
        .json({ message: 'دانش‌آموزی در این گروه برای ارسال پیدا نشد' });
    }

    const deliveries = recipients.flatMap((recipient) => [
      ...(input.channel !== 'sms' && recipient.email
        ? [{ recipient, channel: 'email' as const }]
        : []),
      ...(input.channel !== 'email' && recipient.phone
        ? [{ recipient, channel: 'sms' as const }]
        : []),
    ]);
    if (deliveries.length === 0) {
      return res.status(400).json({
        message: 'مخاطبان انتخاب‌شده راه ارتباطی متناسب با نوع پیام ندارند',
      });
    }

    let sent = 0;
    let failed = 0;
    let nextDelivery = 0;
    await Promise.all(
      Array.from({ length: Math.min(5, deliveries.length) }, async () => {
        while (nextDelivery < deliveries.length) {
          const delivery = deliveries[nextDelivery++];
          try {
            if (delivery.channel === 'email' && delivery.recipient.email) {
              await sendEmail({
                to: delivery.recipient.email,
                subject: input.subject ?? 'پیام آکادمی فوتبال افشین پیروانی',
                text: input.message,
              });
            } else if (delivery.channel === 'sms' && delivery.recipient.phone) {
              await sendSms(delivery.recipient.phone, input.message);
            }
            sent += 1;
          } catch (error) {
            failed += 1;
            console.error(
              `Notification delivery failed for student ${delivery.recipient.id} via ${delivery.channel}:`,
              error instanceof Error ? error.name : 'Unknown error',
            );
          }
        }
      }),
    );

    return res.status(failed > 0 ? 207 : 200).json({
      recipients: recipients.length,
      sent,
      failed,
      message:
        failed > 0
          ? 'برخی پیام‌ها ارسال نشدند؛ وضعیت ارائه‌دهندگان پیام را بررسی کنید'
          : 'پیام‌ها با موفقیت ارسال شدند',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'اطلاعات پیام معتبر نیست',
        errors: error.issues.map(({ path, message }) => ({
          field: path.join('.'),
          message,
        })),
      });
    }
    console.error('Staff notification error:', error);
    return res.status(500).json({ message: 'خطا در پردازش پیام' });
  }
}
