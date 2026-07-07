import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email('Podaj poprawny adres e-mail.');

export const passwordLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków.'),
});

export const magicLinkSchema = z.object({ email: emailSchema });

export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
