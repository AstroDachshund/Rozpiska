// lib/supabase/middleware.ts
// Odświeżanie sesji Supabase w każdym żądaniu (wzorzec kanoniczny @supabase/ssr).
// UWAGA: S2.1 = tylko odświeżenie cookies. Routing po roli dokłada S2.3.
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: nie wstawiać żadnego kodu między createServerClient a getUser —
  // to psuje odświeżanie tokenu i może losowo wylogowywać użytkowników.
  await supabase.auth.getUser();

  return supabaseResponse;
}
