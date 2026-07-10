import { z } from 'zod';

export const weekInputSchema = z.object({
  week_number: z.number().int().min(1, 'Numer tygodnia musi być dodatni.'),
  notes: z
    .string()
    .trim()
    .max(2000, 'Notatka jest za długa.')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});
export type WeekInput = z.infer<typeof weekInputSchema>;

export const dayInputSchema = z.object({
  week_id: z.string().uuid(),
  name: z.string().trim().min(1, 'Podaj nazwę dnia.').max(120, 'Nazwa jest za długa.'),
});
export type DayInput = z.infer<typeof dayInputSchema>;

export const sectionInputSchema = z.object({
  day_id: z.string().uuid(),
  section_type: z.enum(['warmup', 'main', 'cooldown']),
});
export type SectionInput = z.infer<typeof sectionInputSchema>;

export const planExerciseInputSchema = z.object({
  section_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  exercise_name: z.string().trim().min(1, 'Brak nazwy ćwiczenia.'),
  trainer_note: z
    .string()
    .trim()
    .max(2000, 'Notatka jest za długa.')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});
export type PlanExerciseInput = z.infer<typeof planExerciseInputSchema>;

export const setInputSchema = z
  .object({
    plan_exercise_id: z.string().uuid(),
    set_number: z.number().int().min(1, 'Numer serii musi być dodatni.'),
    reps_min: z.number().int().positive().optional(),
    reps_max: z.number().int().positive().optional(),
    target_weight: z.number().positive().optional(),
    target_rpe: z.number().min(1).max(10).optional(),
    rest_seconds: z.number().int().nonnegative().optional(),
  })
  .refine((v) => v.reps_min === undefined || v.reps_max === undefined || v.reps_max >= v.reps_min, {
    message: 'Górny zakres powtórzeń musi być ≥ dolnego.',
    path: ['reps_max'],
  });
export type SetInput = z.infer<typeof setInputSchema>;

export const templateInputSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę szablonu.').max(120, 'Nazwa jest za długa.'),
});
export type TemplateInput = z.infer<typeof templateInputSchema>;
