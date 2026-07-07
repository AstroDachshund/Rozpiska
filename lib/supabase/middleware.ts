// lib/supabase/middleware.ts
// Odświeżanie sesji Supabase (wzorzec kanoniczny @supabase/ssr) + routing po roli (S2.3).
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { requiredRole, resolveRouteAction } from '@/lib/auth/routes';
import type { Role } from '@/lib/auth/paths';

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

  // IMPORTANT: nic między createServerClient a getUser — psuje odświeżanie tokenu.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rolę czytamy tylko, gdy jest user i ścieżka jej potrzebuje (chroniona lub korzeń).
  let role: Role | null = null;
  if (user && (requiredRole(pathname) !== null || pathname === '/')) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    role = (data?.role as Role | undefined) ?? null;
  }

  const action = resolveRouteAction({ pathname, isAuthed: !!user, role });
  if (action.kind === 'redirect') {
    const url = request.nextUrl.clone();
    // split('?') always yields at least one element; noUncheckedIndexedAccess just can't see that.
    const [path, query = ''] = action.to.split('?');
    url.pathname = path!;
    url.search = query ? `?${query}` : '';
    const redirect = NextResponse.redirect(url);
    // KLUCZOWE: przenosimy odświeżone cookies sesji na odpowiedź redirect,
    // inaczej goły NextResponse.redirect je gubi (losowe wylogowania).
    supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return supabaseResponse;
}
