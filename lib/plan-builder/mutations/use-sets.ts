'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { positionBetween } from '@/lib/domain/position';
import { planTreeQueryKey, getExerciseSets } from '@/lib/plan-builder/queries';
import type { PlanContext, PlanWeek } from '@/lib/plan-builder/types';
import type { SetInput } from '@/lib/plan-builder/schemas';
import type { Database } from '@/lib/supabase/types';

export function useCreatePlanSet(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: SetInput) => {
      const tree = queryClient.getQueryData<PlanWeek[]>(planTreeQueryKey(context)) ?? [];
      const siblings = getExerciseSets(tree, input.plan_exercise_id);
      const lastPosition = siblings.length > 0 ? siblings[siblings.length - 1]!.position : null;
      // Dołożenie na końcu nigdy nie degeneruje się (zob. use-weeks.ts) — rebalans
      // ma sens dopiero przy wstawianiu MIĘDZY sąsiadami (reorder/dnd, S4.2/S4.4).
      const position = positionBetween(lastPosition, null)!;

      const payload = {
        plan_exercise_id: input.plan_exercise_id,
        set_number: input.set_number,
        reps_min: input.reps_min ?? null,
        reps_max: input.reps_max ?? null,
        target_weight: input.target_weight ?? null,
        target_rpe: input.target_rpe ?? null,
        rest_seconds: input.rest_seconds ?? null,
        position,
      } as Database['public']['Tables']['plan_sets']['Insert'];

      const { data, error } = await supabase.from('plan_sets').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planTreeQueryKey(context) });
    },
  });
}

type UpdatePlanSetInput = { id: string } & Pick<
  Database['public']['Tables']['plan_sets']['Update'],
  | 'set_number'
  | 'reps_min'
  | 'reps_max'
  | 'target_weight'
  | 'target_rpe'
  | 'rest_seconds'
  | 'position'
>;

export function useUpdatePlanSet(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }: UpdatePlanSetInput) => {
      const { data, error } = await supabase
        .from('plan_sets')
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

export function useDeletePlanSet(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plan_sets').delete().eq('id', id);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planTreeQueryKey(context) });
    },
  });
}
