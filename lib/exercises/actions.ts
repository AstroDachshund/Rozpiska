'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { exerciseInputSchema, tagInputSchema } from '@/lib/exercises/schemas';
import type { TagRow } from '@/lib/exercises/queries';

export type ExerciseFormState = { error?: string };
export type CreateTagState = { error?: string; tag?: TagRow };

function parseExercise(formData: FormData) {
  return exerciseInputSchema.safeParse({
    name: formData.get('name'),
    technique_note: formData.get('technique_note') ?? undefined,
    youtube_url: formData.get('youtube_url') ?? undefined,
    tag_ids: formData.getAll('tag_ids'),
  });
}

export async function createExerciseAction(
  _prev: ExerciseFormState,
  formData: FormData
): Promise<ExerciseFormState> {
  const parsed = parseExercise(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Musisz być zalogowany.' };

  const { name, technique_note, youtube_url, tag_ids } = parsed.data;
  const { data: created, error } = await supabase
    .from('exercises')
    .insert({
      trainer_id: user.id,
      name,
      technique_note: technique_note ?? null,
      youtube_url: youtube_url ?? null,
    })
    .select('id')
    .single();
  if (error || !created) return { error: 'Nie udało się zapisać ćwiczenia.' };

  if (tag_ids.length > 0) {
    await supabase
      .from('exercise_tag_links')
      .insert(tag_ids.map((tag_id) => ({ exercise_id: created.id, tag_id })));
  }

  revalidatePath('/exercises');
  redirect('/exercises');
}

export async function updateExerciseAction(
  _prev: ExerciseFormState,
  formData: FormData
): Promise<ExerciseFormState> {
  const id = formData.get('id');
  if (typeof id !== 'string' || id.length === 0) return { error: 'Brak ćwiczenia.' };
  const parsed = parseExercise(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Musisz być zalogowany.' };

  const { name, technique_note, youtube_url, tag_ids } = parsed.data;

  const { data: updated, error } = await supabase
    .from('exercises')
    .update({ name, technique_note: technique_note ?? null, youtube_url: youtube_url ?? null })
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) return { error: 'Nie udało się zapisać zmian.' };
  if (!updated) return { error: 'Nie znaleziono ćwiczenia.' };

  // Rekoncyliacja linków: policz różnicę względem obecnych.
  const { data: existing } = await supabase
    .from('exercise_tag_links')
    .select('tag_id')
    .eq('exercise_id', id);
  const current = new Set((existing ?? []).map((r) => r.tag_id as string));
  const next = new Set(tag_ids);
  const toRemove = [...current].filter((t) => !next.has(t));
  const toAdd = [...next].filter((t) => !current.has(t));

  if (toRemove.length > 0) {
    const { error: delErr } = await supabase
      .from('exercise_tag_links')
      .delete()
      .eq('exercise_id', id)
      .in('tag_id', toRemove);
    if (delErr) return { error: 'Nie udało się zaktualizować tagów.' };
  }
  if (toAdd.length > 0) {
    const { error: insErr } = await supabase
      .from('exercise_tag_links')
      .insert(toAdd.map((tag_id) => ({ exercise_id: id, tag_id })));
    if (insErr) return { error: 'Nie udało się zaktualizować tagów.' };
  }

  revalidatePath('/exercises');
  redirect('/exercises');
}

async function setArchived(id: unknown, value: string | null): Promise<ExerciseFormState> {
  if (typeof id !== 'string' || id.length === 0) return { error: 'Brak ćwiczenia.' };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Musisz być zalogowany.' };
  const { data: updated, error } = await supabase
    .from('exercises')
    .update({ archived_at: value })
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) return { error: 'Operacja nie powiodła się.' };
  if (!updated) return { error: 'Nie znaleziono ćwiczenia.' };
  revalidatePath('/exercises');
  return {};
}

export async function archiveExerciseAction(formData: FormData): Promise<ExerciseFormState> {
  return setArchived(formData.get('id'), new Date().toISOString());
}

export async function restoreExerciseAction(formData: FormData): Promise<ExerciseFormState> {
  return setArchived(formData.get('id'), null);
}

export async function createTagAction(
  _prev: CreateTagState,
  formData: FormData
): Promise<CreateTagState> {
  const parsed = tagInputSchema.safeParse({
    category: formData.get('category'),
    name: formData.get('name'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Musisz być zalogowany.' };

  const { category, name } = parsed.data;
  const { data: inserted, error } = await supabase
    .from('exercise_tags')
    .insert({ trainer_id: user.id, category, name })
    .select('id, category, name')
    .single();

  if (error) {
    // Konflikt unique (trainer_id, category, name) → zwróć istniejący (idempotentnie).
    const { data: existing } = await supabase
      .from('exercise_tags')
      .select('id, category, name')
      .eq('category', category)
      .eq('name', name)
      .maybeSingle();
    if (existing) return { tag: existing as TagRow };
    return { error: 'Nie udało się utworzyć tagu.' };
  }
  revalidatePath('/exercises');
  return { tag: inserted as TagRow };
}
