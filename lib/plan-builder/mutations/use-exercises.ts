'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { positionBetween } from '@/lib/domain/position';
import { planTreeQueryKey, getSectionExercises } from '@/lib/plan-builder/queries';
import type { PlanContext, PlanWeek } from '@/lib/plan-builder/types';
import type { PlanExerciseInput } from '@/lib/plan-builder/schemas';
import type { Database } from '@/lib/supabase/types';

export function useCreatePlanExercise(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: PlanExerciseInput) => {
      const tree = queryClient.getQueryData<PlanWeek[]>(planTreeQueryKey(context)) ?? [];
      const siblings = getSectionExercises(tree, input.section_id);
      const lastPosition = siblings.length > 0 ? siblings[siblings.length - 1]!.position : null;
      // Dołożenie na końcu nigdy nie degeneruje się (zob. use-weeks.ts) — rebalans
      // ma sens dopiero przy wstawianiu MIĘDZY sąsiadami (reorder/dnd, S4.2/S4.4).
      const position = positionBetween(lastPosition, null)!;

      // exercise_name to snapshot w momencie dodania (§3.1) — zmiana nazwy w banku
      // ćwiczeń później NIE przepisuje tego pola.
      const payload = {
        section_id: input.section_id,
        exercise_id: input.exercise_id,
        exercise_name: input.exercise_name,
        trainer_note: input.trainer_note ?? null,
        position,
      } as Database['public']['Tables']['plan_exercises']['Insert'];

      const { data, error } = await supabase
        .from('plan_exercises')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planTreeQueryKey(context) });
    },
  });
}

type UpdatePlanExerciseInput = { id: string } & Pick<
  Database['public']['Tables']['plan_exercises']['Update'],
  'trainer_note' | 'superset_group' | 'position'
>;

export function useUpdatePlanExercise(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }: UpdatePlanExerciseInput) => {
      const { data, error } = await supabase
        .from('plan_exercises')
        .update(fields)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planTreeQueryKey(context) });
    },
  });
}

export function useDeletePlanExercise(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plan_exercises').delete().eq('id', id);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planTreeQueryKey(context) });
    },
  });
}
