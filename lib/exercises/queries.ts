// Serwerowe odczyty banku ćwiczeń (RSC). RLS zawęża do trenera.
import { createClient } from '@/lib/supabase/server';
import type { TagCategory } from '@/lib/exercises/schemas';

export type TagRow = { id: string; category: TagCategory; name: string };
export type ExerciseListItem = {
  id: string;
  name: string;
  youtube_url: string | null;
  archived_at: string | null;
  tags: TagRow[];
};
export type ExerciseWithTags = ExerciseListItem & { technique_note: string | null };

type RawLink = { exercise_tags: TagRow | null };
const flattenTags = (links: RawLink[] | null): TagRow[] =>
  (links ?? []).map((l) => l.exercise_tags).filter((t): t is TagRow => t !== null);

export async function listExercises(archived: boolean): Promise<ExerciseListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from('exercises')
    .select(
      'id, name, youtube_url, archived_at, exercise_tag_links(exercise_tags(id, category, name))'
    )
    .order('name', { ascending: true });
  query = archived ? query.not('archived_at', 'is', null) : query.is('archived_at', null);
  const { data } = await query;
  return (data ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    youtube_url: e.youtube_url,
    archived_at: e.archived_at,
    tags: flattenTags(e.exercise_tag_links as RawLink[] | null),
  }));
}

export async function getExercise(id: string): Promise<ExerciseWithTags | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('exercises')
    .select(
      'id, name, technique_note, youtube_url, archived_at, exercise_tag_links(exercise_tags(id, category, name))'
    )
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    technique_note: data.technique_note,
    youtube_url: data.youtube_url,
    archived_at: data.archived_at,
    tags: flattenTags(data.exercise_tag_links as RawLink[] | null),
  };
}

export async function listTags(): Promise<TagRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('exercise_tags')
    .select('id, category, name')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  return (data ?? []) as TagRow[];
}
