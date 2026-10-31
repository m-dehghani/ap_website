import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { FORM_VALIDATION } from '@/constants/app';
import { normalizePhone } from '@/lib/auth';
import { calculateAge, parseBirthDateInput } from '@/lib/age';

const registrationSchema = z
  .object({
    firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
    lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
    email: z.union([z.string().email('ایمیل نامعتبر است'), z.literal('')]).optional(),
    phone: z
      .union([
        z.string().regex(/^\+?[\d۰-۹٠-٩\s().-]{7,20}$/, 'شماره تلفن نامعتبر است'),
        z.literal(''),
      ])
      .optional(),
    password: z
      .string()
      .min(FORM_VALIDATION.password.minLength, FORM_VALIDATION.password.message),
    programId: z.string().min(1, 'برنامه آموزشی الزامی است'),
    birthDate: z
      .string()
      .min(1, 'تاریخ تولد الزامی است')
      .refine((value) => parseBirthDateInput(value) !== null, {
        message: 'تاریخ تولد معتبر نیست',
      }),
    emergencyContact: z.string().min(10, 'شماره تماس اضطراری نامعتبر است'),
    emergencyContactName: z.string().min(2).max(100).optional(),
    parentName: z.string().trim().max(100).optional(),
    parentEmail: z.union([z.string().trim().email(), z.literal('')]).optional(),
    medicalConditions: z.string().optional(),
    previousExperience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  })
  .refine((data) => Boolean(data.email?.trim() || data.phone?.trim()), {
    message: 'وارد کردن ایمیل یا شماره تلفن الزامی است',
    path: ['email'],
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = registrationSchema.parse(req.body);
    const db = await getPrisma();
    const email = validatedData.email?.trim().toLowerCase() || undefined;
    const phone = validatedData.phone
      ? normalizePhone(validatedData.phone)
      : undefined;
    const identifiers = [
      ...(email
        ? [{ email: { equals: email, mode: 'insensitive' as const } }]
        : []),
      ...(phone ? [{ phone }] : []),
    ];

    const birthDate = parseBirthDateInput(validatedData.birthDate);
    if (!birthDate) {
      return res.status(400).json({ message: 'تاریخ تولد معتبر نیست' });
    }
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const result = await db.$transaction(
      async (tx) => {
        const [existingUser, existingCoach] = await Promise.all([
          tx.user.findFirst({
            where: { OR: identifiers },
            select: { id: true },
          }),
          tx.coach.findFirst({
            where: { OR: identifiers },
            select: { id: true },
          }),
        ]);
        if (existingUser || existingCoach) {
          return { kind: 'duplicate' as const };
        }

        const program = await tx.program.findUnique({
          where: { id: validatedData.programId },
          select: {
            id: true,
            name: true,
            price: true,
            maxStudents: true,
            minAge: true,
            maxAge: true,
            isActive: true,
            coach: { select: { firstName: true, lastName: true } },
          },
        });
        if (!program) return { kind: 'not-found' as const };
        if (!program.isActive) return { kind: 'inactive' as const };

        const age = calculateAge(birthDate);
        if (age < program.minAge || age > program.maxAge) {
          return {
            kind: 'ineligible' as const,
            minAge: program.minAge,
            maxAge: program.maxAge,
          };
        }

        const currentRegistrations = await tx.registration.count({
          where: {
            programId: validatedData.programId,
            status: { in: ['PENDING', 'APPROVED'] },
          },
        });
        if (currentRegistrations >= program.maxStudents) {
          return { kind: 'full' as const };
        }

        const user = await tx.user.create({
          data: {
            email: email ?? null,
            password: hashedPassword,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: phone ?? null,
            birthDate,
            role: 'STUDENT',
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        });

        const registration = await tx.registration.create({
          data: {
            userId: user.id,
            programId: validatedData.programId,
            totalAmount: program.price,
            status: 'PENDING',
            experienceLevel: validatedData.previousExperience ?? null,
            parentName: validatedData.parentName?.trim() || null,
            parentEmail: validatedData.parentEmail?.trim().toLowerCase() || null,
            emergencyContactName:
              validatedData.emergencyContactName?.trim() || null,
            emergencyContactPhone: normalizePhone(
              validatedData.emergencyContact,
            ),
            medicalConditions: validatedData.medicalConditions?.trim() || null,
          },
          select: {
            id: true,
            programId: true,
            status: true,
            totalAmount: true,
          },
        });

        return { kind: 'created' as const, user, registration, program };
      },
      { isolationLevel: 'Serializable' },
    );

    if (result.kind === 'duplicate') {
      return res
        .status(409)
        .json({ message: 'کاربری با این ایمیل یا شماره تلفن قبلاً ثبت شده است' });
    }
    if (result.kind === 'not-found') {
      return res.status(404).json({ message: 'برنامه آموزشی یافت نشد' });
    }
    if (result.kind === 'inactive') {
      return res
        .status(400)
        .json({ message: 'ثبت‌نام در این برنامه امکان‌پذیر نیست' });
    }
    if (result.kind === 'ineligible') {
      return res.status(400).json({
        message: `سن شما باید بین ${result.minAge} تا ${result.maxAge} سال باشد`,
      });
    }
    if (result.kind === 'full') {
      return res.status(409).json({ message: 'ظرفیت این برنامه تکمیل شده است' });
    }

    // Return success response (without password)
    res.status(201).json({
      message: 'ثبت نام با موفقیت انجام شد',
      data: {
        user: {
          id: result.user.id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          phone: result.user.phone,
        },
        registration: {
          id: result.registration.id,
          programId: result.registration.programId,
          status: result.registration.status,
          totalAmount: result.registration.totalAmount,
        },
        program: {
          name: result.program.name,
          price: result.program.price,
          coach:
            result.program.coach.firstName +
            ' ' +
            result.program.coach.lastName,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'اطلاعات ارسالی نامعتبر است',
        errors: error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
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
        .json({ message: 'کاربری با این ایمیل یا شماره تلفن قبلاً ثبت شده است' });
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

    console.error('Registration error:', error);
    res.status(500).json({ message: 'خطا در ثبت نام' });
  }
}
