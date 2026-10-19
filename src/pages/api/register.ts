import { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
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
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
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

    const [existingUser, existingCoach] = await Promise.all([
      db.user.findFirst({ where: { OR: identifiers } }),
      db.coach.findFirst({ where: { OR: identifiers } }),
    ]);

    if (existingUser || existingCoach) {
      return res
        .status(409)
        .json({ message: 'کاربری با این ایمیل یا شماره تلفن قبلاً ثبت شده است' });
    }

    // Get program details
    const program = await db.program.findUnique({
      where: { id: validatedData.programId },
      include: { coach: true },
    });

    if (!program) {
      return res.status(404).json({ message: 'برنامه آموزشی یافت نشد' });
    }
    if (!program.isActive) {
      return res.status(400).json({ message: 'ثبت‌نام در این برنامه امکان‌پذیر نیست' });
    }

    const birthDate = parseBirthDateInput(validatedData.birthDate);
    if (!birthDate) {
      return res.status(400).json({ message: 'تاریخ تولد معتبر نیست' });
    }
    const age = calculateAge(birthDate);
    if (age < program.minAge || age > program.maxAge) {
      return res.status(400).json({
        message: `سن شما باید بین ${program.minAge} تا ${program.maxAge} سال باشد`,
      });
    }

    // Check if program has available slots
    const currentRegistrations = await db.registration.count({
      where: {
        programId: validatedData.programId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (currentRegistrations >= program.maxStudents) {
      return res
        .status(400)
        .json({ message: 'ظرفیت این برنامه تکمیل شده است' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user and registration in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create user
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
      });

      // Create registration
      const registration = await tx.registration.create({
        data: {
          userId: user.id,
          programId: validatedData.programId,
          totalAmount: program.price,
          status: 'PENDING',
          experienceLevel: validatedData.previousExperience ?? null,
          parentName: validatedData.parentName?.trim() || null,
          parentEmail: validatedData.parentEmail?.trim().toLowerCase() || null,
          emergencyContactName: validatedData.emergencyContactName?.trim() || null,
          emergencyContactPhone: normalizePhone(validatedData.emergencyContact),
          medicalConditions: validatedData.medicalConditions?.trim() || null,
        },
      });

      return { user, registration };
    });

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
          name: program.name,
          price: program.price,
          coach: program.coach.firstName + ' ' + program.coach.lastName,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

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

    res.status(500).json({ message: 'خطا در ثبت نام' });
  }
}
