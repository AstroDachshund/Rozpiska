// app/auth/confirm/route.ts
// Weryfikacja magic linka / linka zaproszenia flow token-hash (przeżywa otwarcie na innym urządzeniu).
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/session';
import { resolveHomePath, safeRedirectPath } from '@/lib/auth/paths';
import { INVITE_COOKIE } from '@/lib/invites/cookie';

export async function GET(request: NextRequest): Promise<never> {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get('next'));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      // Sesja ustawiona. Jeśli to runda zaproszenia (cookie obecne) — aktywuj relację.
      const cookieStore = await cookies();
      const inviteToken = cookieStore.get(INVITE_COOKIE)?.value;
      if (inviteToken) {
        const { error: acceptError } = await supabase
          .schema('app')
          .rpc('accept_invite', { p_token: inviteToken });
        cookieStore.delete(INVITE_COOKIE);
        // MUSI być redirect() z next/navigation (nie NextResponse.redirect): tylko ono
        // zrzuca na odpowiedź cookies sesji ustawione przez verifyOtp przez next/headers.
        if (acceptError) redirect('/login?error=invite');
        redirect(resolveHomePath('client'));
      }

      const ctx = await getSessionContext();
      redirect(next ?? resolveHomePath(ctx?.role ?? 'client'));
    }
  }
  redirect('/login?error=auth');
}
