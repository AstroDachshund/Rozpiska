'use server';
import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { inviteCreateSchema } from '@/lib/invites/schemas';

export type InviteActionState = { error?: string; link?: string };

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function createInviteAction(
  _prev: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const parsed = inviteCreateSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Musisz być zalogowany, aby zapraszać podopiecznych.' };

  const token = randomUUID();
  const { error } = await supabase.from('invites').insert({
    trainer_id: user.id,
    email: parsed.data.email,
    token,
    expires_at: new Date(Date.now() + INVITE_TTL_MS).toISOString(),
  });
  if (error) return { error: 'Nie udało się utworzyć zaproszenia. Spróbuj ponownie.' };

  const origin = (await headers()).get('origin') ?? 'http://127.0.0.1:3000';
  return { link: `${origin}/invite/${token}` };
}
