// lib/auth/session.ts
import { createClient } from '@/lib/supabase/server';
import type { Role } from '@/lib/auth/paths';

export interface SessionContext {
  userId: string;
  role: Role;
  fullName: string;
}

/** Bieżący użytkownik + rola/imię z profiles, albo null. Osobne żądanie → cookies już ustawione. */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();
  if (!profile) return null;

  return { userId: user.id, role: profile.role as Role, fullName: profile.full_name };
}
