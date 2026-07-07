'use server';
import { randomUUID } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/session';
import { inviteCreateSchema } from '@/lib/invites/schemas';
import { INVITE_COOKIE, inviteCookieOptions } from '@/lib/invites/cookie';

export type InviteActionState = { error?: string; link?: string };

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function createInviteAction(
  _prev: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const parsed = inviteCreateSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const ctx = await getSessionContext();
  if (!ctx) return { error: 'Musisz być zalogowany, aby zapraszać podopiecznych.' };
  if (ctx.role !== 'trainer') return { error: 'Tylko trener może zapraszać podopiecznych.' };

  const supabase = await createClient();
  const token = randomUUID();
  const { error } = await supabase.from('invites').insert({
    trainer_id: ctx.userId,
    email: parsed.data.email,
    token,
    expires_at: new Date(Date.now() + INVITE_TTL_MS).toISOString(),
  });
  if (error) return { error: 'Nie udało się utworzyć zaproszenia. Spróbuj ponownie.' };

  const origin = (await headers()).get('origin') ?? 'http://127.0.0.1:3000';
  return { link: `${origin}/invite/${token}` };
}

export type InviteMagicState = { error?: string; sentTo?: string };

export async function sendInviteMagicLinkAction(
  _prev: InviteMagicState,
  formData: FormData
): Promise<InviteMagicState> {
  const token = formData.get('token');
  if (typeof token !== 'string' || token.length === 0) {
    return { error: 'Nieprawidłowy link zaproszenia.' };
  }

  const supabase = await createClient();

  // E-mail bierzemy z serwera (preview_invite), NIE z formularza — pole jest tylko do
  // wyświetlenia; nawet podmienione, użyjemy adresu z zaproszenia (email-lock).
  const { data: preview } = await supabase
    .schema('app')
    .rpc('preview_invite', { p_token: token })
    .maybeSingle();
  if (!preview || !preview.valid) {
    return { error: 'Ten link zaproszenia jest nieprawidłowy lub wygasł.' };
  }

  // Token musi przeżyć rundę przez e-mail → httpOnly cookie odczytane potem w /auth/confirm.
  (await cookies()).set(INVITE_COOKIE, token, inviteCookieOptions);

  const origin = (await headers()).get('origin') ?? 'http://127.0.0.1:3000';
  const { error } = await supabase.auth.signInWithOtp({
    email: preview.email,
    options: { shouldCreateUser: true, emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) return { error: 'Nie udało się wysłać linku. Spróbuj ponownie za chwilę.' };

  return { sentTo: preview.email };
}
