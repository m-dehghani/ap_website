import { z } from 'zod';

const score = z
  .union([
    z.number(),
    z.string().trim().regex(/^\d+$/).transform(Number),
  ])
  .pipe(z.number().int().min(1).max(10));

const evaluationScores = {
  technical: score,
  physical: score,
  mental: score,
  teamwork: score,
  overall: score,
};

const notes = z
  .string()
  .trim()
  .max(2000)
  .nullable()
  .optional()
  .transform((value) => value || null);

export const coachEvaluationSchema = z.object({
  userId: z.string().trim().min(1),
  ...evaluationScores,
  notes,
});

export const adminEvaluationSchema = z.object({
  userId: z.string().trim().min(1),
  coachId: z.string().trim().min(1),
  ...evaluationScores,
  notes,
});

export const evaluationSelect = {
  id: true,
  technical: true,
  physical: true,
  mental: true,
  teamwork: true,
  overall: true,
  notes: true,
  createdAt: true,
  user: { select: { id: true, firstName: true, lastName: true } },
  coach: { select: { id: true, firstName: true, lastName: true } },
} as const;
