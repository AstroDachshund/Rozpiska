// app/auth/confirm/route.ts
// Weryfikacja magic linka / linka zaproszenia flow token-hash (przeżywa otwarcie na innym urządzeniu).
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/session';
import { resolveHomePath, safeRedirectPath } from '@/lib/auth/paths';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get('next'));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      if (next) return NextResponse.redirect(new URL(next, origin));
      const ctx = await getSessionContext();
      return NextResponse.redirect(new URL(resolveHomePath(ctx?.role ?? 'client'), origin));
    }
  }
  return NextResponse.redirect(new URL('/login?error=auth', origin));
}
