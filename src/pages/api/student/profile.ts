import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authorizeStudent, normalizePhone } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { parseBirthDateInput } from '@/lib/age';

const registrationProfileSchema = z.object({
  id: z.string().min(1),
  experienceLevel: z.union([
    z.enum(['beginner', 'intermediate', 'advanced']),
    z.literal(''),
    z.null(),
  ]),
  parentName: z.string().trim().max(100),
  parentEmail: z.union([z.string().trim().email(), z.literal('')]),
  emergencyContactName: z.string().trim().max(100),
  emergencyContactPhone: z
    .union([z.string().regex(/^\+?[\d۰-۹٠-٩\s().-]{7,20}$/), z.literal('')]),
  medicalConditions: z.string().trim().max(2000),
});

const profileSchema = z
  .object({
    firstName: z.string().trim().min(2).max(100).optional(),
    lastName: z.string().trim().min(2).max(100).optional(),
    birthDate: z
      .union([z.string(), z.literal('')])
      .optional()
      .refine((value) => !value || parseBirthDateInput(value) !== null, {
        message: 'تاریخ تولد معتبر نیست',
      }),
    marketingOptIn: z.boolean().optional(),
    registrations: z.array(registrationProfileSchema).max(30).optional(),
  })
  .refine(
    (data) =>
      (data.firstName === undefined) === (data.lastName === undefined),
    { message: 'نام و نام خانوادگی را با هم وارد کنید' },
  )
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.birthDate !== undefined ||
      data.marketingOptIn !== undefined ||
      Boolean(data.registrations?.length),
    { message: 'اطلاعاتی برای ذخیره وارد نشده است' },
  );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = await authorizeStudent(req, res);
    if (!userId) return;

    const data = profileSchema.parse(req.body);
    const db = await getPrisma();
    const user = await db.$transaction(async (tx) => {
      let updatedUser = null;
      if (
        data.firstName !== undefined ||
        data.birthDate !== undefined ||
        data.marketingOptIn !== undefined
      ) {
        updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            ...(data.firstName === undefined
              ? {}
              : { firstName: data.firstName, lastName: data.lastName }),
            ...(data.birthDate === undefined
              ? {}
              : {
                  birthDate: data.birthDate
                    ? parseBirthDateInput(data.birthDate)
                    : null,
                }),
            ...(data.marketingOptIn === undefined
              ? {}
              : { marketingOptIn: data.marketingOptIn }),
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            birthDate: true,
            marketingOptIn: true,
          },
        });
      }

      for (const registration of data.registrations ?? []) {
        const result = await tx.registration.updateMany({
          where: { id: registration.id, userId },
          data: {
            experienceLevel: registration.experienceLevel || null,
            parentName: registration.parentName || null,
            parentEmail: registration.parentEmail?.trim().toLowerCase() || null,
            emergencyContactName: registration.emergencyContactName || null,
            emergencyContactPhone: registration.emergencyContactPhone
              ? normalizePhone(registration.emergencyContactPhone)
              : null,
            medicalConditions: registration.medicalConditions || null,
          },
        });
        if (result.count !== 1) {
          throw new Error('STUDENT_REGISTRATION_NOT_FOUND');
        }
      }
      return updatedUser;
    });
    return res
      .status(200)
      .json({ user, registrations: data.registrations ?? [] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'اطلاعات پروفایل معتبر نیست',
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
      error.code === 'P2002'
    ) {
      return res
        .status(409)
        .json({ message: 'این ایمیل یا شماره تلفن قبلاً استفاده شده است' });
    }
    if (error instanceof Error && error.message === 'STUDENT_REGISTRATION_NOT_FOUND') {
      return res.status(404).json({ message: 'اطلاعات ثبت‌نام یافت نشد' });
    }
    console.error('Student profile update error:', error);
    return res.status(500).json({ message: 'خطا در ذخیره اطلاعات پروفایل' });
  }
}
