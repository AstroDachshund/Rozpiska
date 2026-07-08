import { z } from 'zod';

export const tagCategorySchema = z.enum(['muscle_group', 'equipment', 'movement_pattern']);
export type TagCategory = z.infer<typeof tagCategorySchema>;

const optionalText = (max: number, msg: string) =>
  z
    .string()
    .trim()
    .max(max, msg)
    .optional()
    .transform((v) => (v === '' ? undefined : v));

// Pusty string → undefined; w przeciwnym razie URL z hosta YouTube.
const youtubeUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === '' || v === undefined ? undefined : v))
  .refine(
    (v) => {
      if (v === undefined) return true;
      try {
        const host = new URL(v).hostname.replace(/^www\.|^m\./, '');
        return host === 'youtube.com' || host === 'youtu.be';
      } catch {
        return false;
      }
    },
    { message: 'Podaj poprawny link do YouTube (youtube.com lub youtu.be).' }
  );

export const exerciseInputSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę ćwiczenia.').max(120, 'Nazwa jest za długa.'),
  technique_note: optionalText(2000, 'Notatka jest za długa.'),
  youtube_url: youtubeUrl,
  tag_ids: z.array(z.string().uuid('Nieprawidłowy tag.')).default([]),
});
export type ExerciseInput = z.infer<typeof exerciseInputSchema>;

export const tagInputSchema = z.object({
  category: tagCategorySchema,
  name: z.string().trim().min(1, 'Podaj nazwę tagu.').max(60, 'Nazwa tagu jest za długa.'),
});
export type TagInput = z.infer<typeof tagInputSchema>;
