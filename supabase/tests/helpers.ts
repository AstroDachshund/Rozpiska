// Wspólne narzędzia dla testów RLS.
// Wzorzec: `admin` (service_role, bypass RLS) seeduje dane; osobni użytkownicy
// dostają klienty zalogowane na własne JWT — ich zapytania podlegają RLS jak w produkcji.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const url = process.env.SUPABASE_URL as string;
const anonKey = process.env.SUPABASE_ANON_KEY as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const noPersist = { auth: { autoRefreshToken: false, persistSession: false } } as const;

/** Klient service_role — omija RLS, do seedowania i sprzątania. */
export const admin: SupabaseClient = createClient(url, serviceKey, noPersist);

/** Klient anonimowy (bez JWT) — do testu "anon nie widzi nic". */
export const anon: SupabaseClient = createClient(url, anonKey, noPersist);

export type Role = 'trainer' | 'client';

export interface TestUser {
  userId: string;
  email: string;
  client: SupabaseClient;
}

const createdUserIds: string[] = [];

/** Tworzy użytkownika auth + profil i zwraca klienta zalogowanego jako on. */
export async function createUser(role: Role, fullName: string): Promise<TestUser> {
  const email = `${role}-${randomUUID()}@test.rozpiska.local`;
  const password = 'test-password-123456';

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error('createUser: brak usera');
  const userId = data.user.id;
  createdUserIds.push(userId);

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: userId, role, full_name: fullName });
  if (profileError) throw profileError;

  const client = createClient(url, anonKey, noPersist);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  return { userId, email, client };
}

/** Wiąże klienta z trenerem w trainer_clients (domyślnie aktywny). */
export async function linkClient(
  trainerId: string,
  clientId: string,
  status: 'invited' | 'active' | 'archived' = 'active'
): Promise<void> {
  const { error } = await admin
    .from('trainer_clients')
    .insert({ trainer_id: trainerId, client_id: clientId, status });
  if (error) throw error;
}

export interface TemplateTree {
  templateId: string;
  weekId: string;
  dayId: string;
  sectionId: string;
  exerciseId: string;
  planExerciseId: string;
  planSetId: string;
}

/** Seeduje pełne drzewo szablonu trenera przez service_role (triggery dziedziczą właściciela). */
export async function seedTemplateTree(trainerId: string): Promise<TemplateTree> {
  const template = await insertReturningId('plan_templates', {
    trainer_id: trainerId,
    name: 'Push A (szablon)',
  });
  const week = await insertReturningId('plan_weeks', {
    template_id: template,
    week_number: 1,
  });
  const day = await insertReturningId('plan_days', {
    week_id: week,
    name: 'Push A',
  });
  const section = await insertReturningId('plan_sections', {
    day_id: day,
    section_type: 'main',
  });
  const exercise = await insertReturningId('exercises', {
    trainer_id: trainerId,
    name: 'Wyciskanie sztangi na ławce płaskiej',
  });
  const planExercise = await insertReturningId('plan_exercises', {
    section_id: section,
    exercise_id: exercise,
    exercise_name: 'Wyciskanie sztangi na ławce płaskiej',
  });
  const planSet = await insertReturningId('plan_sets', {
    plan_exercise_id: planExercise,
    set_number: 1,
    reps_min: 8,
    reps_max: 10,
    target_weight: 80,
    rest_seconds: 120,
  });

  return {
    templateId: template,
    weekId: week,
    dayId: day,
    sectionId: section,
    exerciseId: exercise,
    planExerciseId: planExercise,
    planSetId: planSet,
  };
}

/** Przypisuje szablon klientowi jako pełną kopię (uproszczony odpowiednik copy_template_to_assignment z M5). */
export async function seedAssignedPlan(
  trainerId: string,
  clientId: string
): Promise<{ assignedPlanId: string; dayId: string; planSetId: string; exerciseId: string }> {
  const assigned = await insertReturningId('assigned_plans', {
    trainer_id: trainerId,
    client_id: clientId,
    name: 'Push A (przypisany)',
  });
  const week = await insertReturningId('plan_weeks', {
    assigned_plan_id: assigned,
    week_number: 1,
  });
  const day = await insertReturningId('plan_days', { week_id: week, name: 'Push A' });
  const section = await insertReturningId('plan_sections', { day_id: day, section_type: 'main' });
  const exercise = await insertReturningId('exercises', {
    trainer_id: trainerId,
    name: 'Przysiad ze sztangą',
  });
  const planExercise = await insertReturningId('plan_exercises', {
    section_id: section,
    exercise_id: exercise,
    exercise_name: 'Przysiad ze sztangą',
  });
  const planSet = await insertReturningId('plan_sets', {
    plan_exercise_id: planExercise,
    set_number: 1,
    reps_min: 5,
    reps_max: 5,
    target_weight: 100,
  });

  return { assignedPlanId: assigned, dayId: day, planSetId: planSet, exerciseId: exercise };
}

async function insertReturningId(table: string, row: Record<string, unknown>): Promise<string> {
  const { data, error } = await admin.from(table).insert(row).select('id').single();
  if (error) throw new Error(`insert ${table}: ${error.message}`);
  return (data as { id: string }).id;
}

/** Usuwa wszystkich użytkowników utworzonych w teście (kaskada czyści resztę). */
export async function cleanupUsers(): Promise<void> {
  for (const id of createdUserIds.splice(0)) {
    await admin.auth.admin.deleteUser(id);
  }
}

/** Tworzy użytkownika auth + zalogowanego klienta BEZ profilu (profil tworzy accept_invite). */
export async function createUnprofiledUser(email: string): Promise<TestUser> {
  const password = 'test-password-123456';
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error('createUnprofiledUser: brak usera');
  createdUserIds.push(data.user.id);

  const client = createClient(url, anonKey, noPersist);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  return { userId: data.user.id, email, client };
}

/** Wstawia wiersz zaproszenia przez service_role. Domyślnie ważny 7 dni, niezużyty. */
export async function createInvite(
  trainerId: string,
  email: string,
  opts: { expiresInMs?: number; accepted?: boolean } = {}
): Promise<{ id: string; token: string }> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + (opts.expiresInMs ?? 7 * 24 * 60 * 60 * 1000));
  const { data, error } = await admin
    .from('invites')
    .insert({
      trainer_id: trainerId,
      email,
      token,
      expires_at: expiresAt.toISOString(),
      accepted_at: opts.accepted ? new Date().toISOString() : null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: (data as { id: string }).id, token };
}
