// Klient Supabase dla Server Components / Route Handlers (odczyt sesji z cookies).
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './types';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Wywołane z Server Component — ignorujemy; odświeżanie sesji obsłuży middleware (M2).
          }
        },
      },
    }
  );

  // @supabase/ssr@0.5.2's createServerClient/createBrowserClient declare their return type as
  // SupabaseClient<Database, SchemaName, Schema> (old 3-generic order). The installed
  // @supabase/supabase-js (^2.48.1 → resolves to 2.x with the newer generic signature
  // <Database, SchemaNameOrClientOptions, SchemaName, Schema, ClientOptions>) reinterprets that
  // 3rd positional arg as SchemaName (expects a string) instead of the schema shape, so every
  // Schema/Row ends up typed `never` for any .from(...).select(...) through this client. The
  // runtime object is a correctly configured SupabaseClient; only the declared type is wrong.
  // Recasting to the 1-generic form (which re-triggers the correct smart defaults) fixes it
  // without any behavior change. Remove once @supabase/ssr is upgraded past this mismatch.
  return client as unknown as SupabaseClient<Database>;
}
