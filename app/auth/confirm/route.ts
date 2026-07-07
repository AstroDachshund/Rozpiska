// app/auth/confirm/route.ts
// Weryfikacja magic linka / linka zaproszenia flow token-hash (przeżywa otwarcie na innym urządzeniu).
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/session';
import { resolveHomePath, safeRedirectPath } from '@/lib/auth/paths';

export async function GET(request: NextRequest): Promise<never> {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get('next'));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      // MUSI być redirect() z next/navigation, nie NextResponse.redirect: tylko ono
      // zrzuca na odpowiedź cookies sesji ustawione przez verifyOtp przez next/headers.
      // (NextResponse.redirect tworzy własną odpowiedź i gubi te cookies → brak sesji.)
      const ctx = await getSessionContext();
      redirect(next ?? resolveHomePath(ctx?.role ?? 'client'));
    }
  }
  redirect('/login?error=auth');
}
