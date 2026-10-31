import { z } from 'zod';

const requiredText = z.string().trim().min(1);
const optionalDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')
  .nullable()
  .optional();
const displayOrder = z.number().int().min(0).optional();

const testimonialFields = {
  name: requiredText,
  role: requiredText,
  content: requiredText,
  image: z.string().max(2048).nullable().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  category: requiredText.optional(),
  improvement: z.string().nullable().optional(),
  date: optionalDate,
  isPublished: z.boolean().optional(),
  programId: z.string().nullable().optional(),
  displayOrder,
};

export const testimonialCreateSchema = z.object(testimonialFields);
export const testimonialUpdateSchema = testimonialCreateSchema.partial();

export const facilityCreateSchema = z.object({
  category: requiredText,
  name: requiredText,
  displayOrder,
});
export const facilityUpdateSchema = facilityCreateSchema.partial();

export const statisticCreateSchema = z.object({
  key: requiredText,
  value: requiredText,
  label: requiredText,
  description: z.string().nullable().optional(),
  displayOrder,
});
export const statisticUpdateSchema = statisticCreateSchema.partial();
