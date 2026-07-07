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

  // S2.1: magic-link `next` deep-linking jest odłożone do S2.3. Nie ma jeszcze producenta
  // `next` (middleware roli powstaje w S2.3), a wartość i tak nie przetrwałaby rundy przez
  // e-mail bez threadingu `.RedirectTo` w szablonie. Link ląduje na stronie roli.
  //
  // Uwaga: `emailRedirectTo` NIE kształtuje linka w mailu — szablon (magic_link.html) buduje
  // adres z `{{ .SiteURL }}`. Ta wartość służy tylko walidacji przez allow-listę redirectów
  // Supabase (musi być dozwolonym URL-em). W S2.3 posłuży też do przeniesienia `next` przez
  // `{{ .RedirectTo }}`. `origin` z nagłówka jest bezpieczny — Server Actions wymuszają same-origin.
  const origin = (await headers()).get('origin') ?? 'http://127.0.0.1:3000';
  const redirectTo = `${origin}/auth/confirm`;

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
