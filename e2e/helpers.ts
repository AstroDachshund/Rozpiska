// Fixture'y E2E: admin (service_role) seeduje dane; magic link domykamy generateLink
// (deterministycznie, bez scrapowania Mailpita).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const url = process.env.SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const admin: SupabaseClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const createdUserIds: string[] = [];

export async function createTrainer(): Promise<{ userId: string; email: string; password: string }> {
  const email = `trainer-${randomUUID()}@e2e.rozpiska.local`;
  const password = 'e2e-password-123456';
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw error ?? new Error('createTrainer: brak usera');
  createdUserIds.push(data.user.id);
  const { error: pErr } = await admin
    .from('profiles')
    .insert({ id: data.user.id, role: 'trainer', full_name: 'Trener E2E' });
  if (pErr) throw pErr;
  return { userId: data.user.id, email, password };
}

/** Świeży e-mail zaproszonego klienta (konto powstaje dopiero przez flow zaproszenia). */
export function freshClientEmail(): string {
  return `client-${randomUUID()}@e2e.rozpiska.local`;
}

export async function createInvite(trainerId: string, email: string): Promise<{ token: string }> {
  const token = randomUUID();
  const { error } = await admin.from('invites').insert({
    trainer_id: trainerId,
    email,
    token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  if (error) throw error;
  return { token };
}

/** Buduje URL confirm z token_hash (jak w live smoke S2.2). Wymaga istniejącego usera. */
export async function confirmUrlFor(email: string): Promise<string> {
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  if (error) throw error;
  const tokenHash = (data.properties as { hashed_token: string }).hashed_token;
  return `/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink`;
}

/** Rejestruje usera utworzonego przez flow (np. przez shouldCreateUser) do sprzątania. */
export async function trackUserByEmail(email: string): Promise<void> {
  const { data } = await admin.auth.admin.listUsers();
  const u = data.users.find((x) => x.email === email);
  if (u) createdUserIds.push(u.id);
}

export async function cleanup(): Promise<void> {
  for (const id of createdUserIds.splice(0)) {
    await admin.auth.admin.deleteUser(id);
  }
}
