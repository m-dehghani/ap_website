import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

const amountSchema = z
  .union([
    z.number(),
    z.string().trim().regex(/^\d+$/).transform(Number),
  ])
  .pipe(z.number().int().min(0).max(2_147_483_647));

const registrationUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'CANCELLED', 'COMPLETED']).optional(),
  totalAmount: amountSchema.optional(),
  paidAmount: amountSchema.optional(),
  experienceLevel: z.string().nullable().optional(),
  parentName: z.string().nullable().optional(),
  parentEmail: z.string().nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
  medicalConditions: z.string().nullable().optional(),
  reason: z.string().trim().min(1).max(500).optional(),
});

const normalStatusTransitions: Record<string, string[]> = {
  PENDING: ['APPROVED', 'CANCELLED'],
  APPROVED: ['COMPLETED', 'CANCELLED'],
  CANCELLED: [],
  COMPLETED: [],
};

const registrationDetails = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      birthDate: true,
      role: true,
    },
  },
  program: {
    include: {
      coach: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          specialization: true,
          title: true,
          image: true,
        },
      },
    },
  },
  payments: true,
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  switch (req.method) {
    case 'GET': {
      const registration = await prisma.registration.findUnique({
        where: { id },
        include: registrationDetails,
      });
      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }
      return res.status(200).json(registration);
    }

    case 'PUT': {
      const parsed = registrationUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'اطلاعات ثبت‌نام معتبر نیست' });
      }

      const current = await prisma.registration.findUnique({
        where: { id },
        select: { status: true, totalAmount: true, paidAmount: true },
      });
      if (!current) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      const totalAmount = parsed.data.totalAmount ?? current.totalAmount;
      const paidAmount = parsed.data.paidAmount ?? current.paidAmount;
      if (paidAmount > totalAmount) {
        return res.status(400).json({
          error: 'مبلغ پرداخت‌شده نمی‌تواند از مبلغ کل بیشتر باشد',
        });
      }

      const { status, reason, ...data } = parsed.data;
      if (
        status &&
        status !== current.status &&
        !normalStatusTransitions[current.status]?.includes(status) &&
        !reason
      ) {
        return res.status(400).json({
          error: 'برای این تغییر وضعیت، وارد کردن دلیل الزامی است',
        });
      }

      const updated = await prisma.registration.updateMany({
        where: {
          id,
          status: current.status,
          totalAmount: current.totalAmount,
          paidAmount: current.paidAmount,
        },
        data: { ...data, status },
      });
      if (!updated.count) {
        return res.status(409).json({
          error: 'اطلاعات ثبت‌نام هم‌زمان تغییر کرده است؛ صفحه را تازه‌سازی کنید',
        });
      }

      const registration = await prisma.registration.findUnique({
        where: { id },
        include: registrationDetails,
      });
      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }
      return res.status(200).json(registration);
    }

    case 'DELETE': {
      await prisma.registration.delete({ where: { id } });
      return res.status(204).end();
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}