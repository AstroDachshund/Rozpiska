import { z } from 'zod';
import { emailSchema } from '@/lib/auth/schemas';

export const inviteCreateSchema = z.object({ email: emailSchema });
export type InviteCreateInput = z.infer<typeof inviteCreateSchema>;
