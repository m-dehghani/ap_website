import { z } from 'zod';

// Coach validation schemas
export const coachSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است').max(50, 'نام نباید بیش از ۵۰ کاراکتر باشد'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است').max(50, 'نام خانوادگی نباید بیش از ۵۰ کاراکتر باشد'),
  email: z.string().email('فرمت ایمیل نامعتبر است'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد').optional(),
  phone: z.string().min(10, 'شماره تلفن نامعتبر است').max(15, 'شماره تلفن نامعتبر است'),
  specialization: z.string().min(1, 'تخصص الزامی است').max(200, 'تخصص نباید بیش از ۲۰۰ کاراکتر باشد'),
  experience: z.coerce.number().int().min(0, 'تجربه نمی‌تواند منفی باشد').max(100, 'تجربه نامعتبر است'),
  title: z.string().max(100, 'عنوان نباید بیش از ۱۰۰ کاراکتر باشد').optional().nullable(),
  bio: z.string().max(2000, 'بیوگرافی نباید بیش از ۲۰۰۰ کاراکتر باشد').optional().nullable(),
  quote: z.string().max(500, 'شعار نباید بیش از ۵۰۰ کاراکتر باشد').optional().nullable(),
  certifications: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  rating: z.coerce.number().min(0, 'امتیاز باید بین ۰ و ۵ باشد').max(5, 'امتیاز باید بین ۰ و ۵ باشد').default(0),
  studentsCount: z.coerce.number().int().min(0, 'تعداد دانش‌آموزان نمی‌تواند منفی باشد').default(0),
  image: z.string().url('آدرس تصویر نامعتبر است').optional().nullable().or(z.literal('')),
  instagram: z.string().max(100).optional().nullable().or(z.literal('')),
  twitter: z.string().max(100).optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const coachCreateSchema = coachSchema;
export const coachUpdateSchema = coachSchema.partial();

// Program validation schemas
export const scheduleItemSchema = z.object({
  day: z.string().min(1, 'روز الزامی است'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'فرمت ساعت نامعتبر است (HH:MM)'),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const programSchema = z.object({
  name: z.string().min(1, 'نام برنامه الزامی است').max(100, 'نام نباید بیش از ۱۰۰ کاراکتر باشد'),
  description: z.string().min(1, 'توضیحات الزامی است').max(2000, 'توضیحات نباید بیش از ۲۰۰۰ کاراکتر باشد'),
  price: z.coerce.number().int().min(0, 'قیمت نمی‌تواند منفی باشد'),
  duration: z.coerce.number().int().min(1, 'مدت باید حداقل ۱ ماه باشد').max(24, 'مدت نباید بیش از ۲۴ ماه باشد'),
  sessionCount: z.coerce.number().int().min(1, 'تعداد جلسات باید حداقل ۱ باشد').max(200, 'تعداد جلسات نامعتبر است'),
  maxStudents: z.coerce.number().int().min(1, 'حداکثر دانش‌آموز باید حداقل ۱ باشد').max(100, 'حداکثر دانش‌آموز نامعتبر است').default(15),
  popular: z.boolean().default(false),
  icon: z.string().max(10, 'آیکون نامعتبر است').default('⚽'),
  ageRange: z.string().max(50, 'بازه سنی نامعتبر است').default('8-12 سال'),
  minAge: z.coerce.number().int().min(0).max(99).default(8),
  maxAge: z.coerce.number().int().min(0).max(99).default(12),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'کد رنگ نامعتبر است').default('#3B82F6'),
  period: z.string().max(50, 'دوره نامعتبر است').default('ماهانه'),
  rating: z.coerce.number().min(0).max(5).default(4.5),
  studentsEnrolled: z.coerce.number().int().min(0).default(0),
  features: z.array(z.string()).default([]),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  coachId: z.string().min(1, 'انتخاب مربی الزامی است'),
  schedule: z.array(scheduleItemSchema).default([]),
  isActive: z.boolean().default(true),
});

export const programCreateSchema = programSchema;
export const programUpdateSchema = programSchema.partial();

// Registration validation schemas
export const registrationSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'CANCELLED', 'COMPLETED']).default('PENDING'),
  totalAmount: z.coerce.number().int().min(0),
  paidAmount: z.coerce.number().int().min(0),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional().nullable(),
  parentName: z.string().max(100).optional().nullable(),
  parentEmail: z.string().email('فرمت ایمیل نامعتبر است').optional().nullable().or(z.literal('')),
  emergencyContactName: z.string().max(100).optional().nullable(),
  emergencyContactPhone: z.string().max(15).optional().nullable(),
  medicalConditions: z.string().max(1000).optional().nullable(),
});

export const registrationUpdateSchema = registrationSchema.partial();

// Session validation schemas
export const sessionSchema = z.object({
  name: z.string().min(1, 'نام جلسه الزامی است').max(100),
  description: z.string().max(1000).optional().nullable(),
  date: z.string().datetime('تاریخ نامعتبر است'),
  duration: z.coerce.number().int().min(15, 'مدت باید حداقل ۱۵ دقیقه باشد').max(480, 'مدت نباید بیش از ۴۸۰ دقیقه باشد'),
  location: z.string().min(1, 'مکان الزامی است').max(200),
  maxCapacity: z.coerce.number().int().min(1).max(100).default(15),
  status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  programId: z.string().min(1, 'برنامه الزامی است'),
  coachId: z.string().min(1, 'مربی الزامی است'),
});

export const sessionCreateSchema = sessionSchema;
export const sessionUpdateSchema = sessionSchema.partial();

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Type exports
export type CoachInput = z.infer<typeof coachSchema>;
export type ProgramInput = z.infer<typeof programSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;