// Odczyt drzewa kreatora: jedno zapytanie Supabase (zagnieżdżony select), potem
// czyste mapowanie na wygodne typy (types.ts) + sortowanie po position na każdym
// poziomie. Sortujemy PO STRONIE KLIENTA (nie przez nested-order Supabase) — prościej
// i niezależne od szczegółów API zagnieżdżonego sortowania w danej wersji supabase-js.
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { PlanContext, PlanWeek, PlanDay, PlanSection, PlanExercise, PlanSet } from './types';

type RawSet = Omit<PlanSet, never>;
type RawExercise = Omit<PlanExercise, 'sets'> & { plan_sets: RawSet[] | null };
type RawSection = Omit<PlanSection, 'exercises'> & { plan_exercises: RawExercise[] | null };
type RawDay = Omit<PlanDay, 'sections'> & { plan_sections: RawSection[] | null };
export type RawPlanWeek = Omit<PlanWeek, 'days'> & { plan_days: RawDay[] | null };

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

/** Czyste mapowanie: surowy select PostgREST -> PlanWeek[] posortowane na każdym poziomie. */
export function mapRawTreeToPlanWeeks(raw: RawPlanWeek[]): PlanWeek[] {
  return [...raw].sort(byPosition).map((week) => ({
    id: week.id,
    week_number: week.week_number,
    notes: week.notes,
    position: week.position,
    days: [...(week.plan_days ?? [])].sort(byPosition).map((day) => ({
      id: day.id,
      name: day.name,
      position: day.position,
      sections: [...(day.plan_sections ?? [])].sort(byPosition).map((section) => ({
        id: section.id,
        section_type: section.section_type,
        position: section.position,
        exercises: [...(section.plan_exercises ?? [])].sort(byPosition).map((exercise) => ({
          id: exercise.id,
          exercise_id: exercise.exercise_id,
          exercise_name: exercise.exercise_name,
          trainer_note: exercise.trainer_note,
          superset_group: exercise.superset_group,
          position: exercise.position,
          sets: [...(exercise.plan_sets ?? [])].sort(byPosition),
        })),
      })),
    })),
  }));
}

export function getWeekDays(weeks: PlanWeek[], weekId: string): PlanDay[] {
  return weeks.find((w) => w.id === weekId)?.days ?? [];
}

export function getDaySections(weeks: PlanWeek[], dayId: string): PlanSection[] {
  for (const week of weeks) {
    const day = week.days.find((d) => d.id === dayId);
    if (day) return day.sections;
  }
  return [];
}

export function getSectionExercises(weeks: PlanWeek[], sectionId: string): PlanExercise[] {
  for (const week of weeks) {
    for (const day of week.days) {
      const section = day.sections.find((s) => s.id === sectionId);
      if (section) return section.exercises;
    }
  }
  return [];
}

export function getExerciseSets(weeks: PlanWeek[], exerciseId: string): PlanSet[] {
  for (const week of weeks) {
    for (const day of week.days) {
      for (const section of day.sections) {
        const exercise = section.exercises.find((e) => e.id === exerciseId);
        if (exercise) return exercise.sets;
      }
    }
  }
  return [];
}

export function planTreeQueryKey(context: PlanContext) {
  return ['plan-tree', context] as const;
}

const TREE_SELECT = `
  id, week_number, notes, position,
  plan_days (
    id, name, position,
    plan_sections (
      id, section_type, position,
      plan_exercises (
        id, exercise_id, exercise_name, trainer_note, superset_group, position,
        plan_sets (
          id, set_number, reps_min, reps_max, target_weight, target_rpe, rest_seconds, position
        )
      )
    )
  )
`;

export async function fetchPlanTree(context: PlanContext): Promise<PlanWeek[]> {
  const supabase = createClient();
  const column = context.kind === 'template' ? 'template_id' : 'assigned_plan_id';
  const value = context.kind === 'template' ? context.templateId : context.assignedPlanId;

  const { data, error } = await supabase.from('plan_weeks').select(TREE_SELECT).eq(column, value);
  if (error) throw error;
  return mapRawTreeToPlanWeeks((data ?? []) as unknown as RawPlanWeek[]);
}

export function usePlanTree(context: PlanContext) {
  return useQuery({
    queryKey: planTreeQueryKey(context),
    queryFn: () => fetchPlanTree(context),
  });
}
