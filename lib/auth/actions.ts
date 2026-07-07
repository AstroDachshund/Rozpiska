// lib/auth/actions.ts
'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { passwordLoginSchema, magicLinkSchema } from '@/lib/auth/schemas';
import { resolveHomePath, safeRedirectPath, type Role } from '@/lib/auth/paths';

export type AuthActionState = { error?: string; sentTo?: string };

export async function signInWithPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = passwordLoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: 'Nieprawidłowy e-mail lub hasło.' };

  // Ten sam klient trzyma świeżą sesję w pamięci — czytamy rolę bez wyścigu z cookies.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const next = safeRedirectPath(formData.get('next') as string | null);
  redirect(next ?? resolveHomePath((profile?.role as Role) ?? 'client'));
}

export async function signInWithOtpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const origin = (await headers()).get('origin') ?? 'http://127.0.0.1:3000';
  const next = safeRedirectPath(formData.get('next') as string | null);
  const redirectTo = `${origin}/auth/confirm${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
  });
  if (error) return { error: 'Nie udało się wysłać linku. Spróbuj ponownie za chwilę.' };

  return { sentTo: parsed.data.email };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
