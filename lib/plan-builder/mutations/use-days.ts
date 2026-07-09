'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { positionBetween, rebalance } from '@/lib/domain/position';
import { planTreeQueryKey, getWeekDays } from '@/lib/plan-builder/queries';
import type { PlanContext, PlanWeek } from '@/lib/plan-builder/types';
import type { DayInput } from '@/lib/plan-builder/schemas';
import type { Database } from '@/lib/supabase/types';

export function useCreateDay(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: DayInput) => {
      const key = planTreeQueryKey(context);
      const tree = queryClient.getQueryData<PlanWeek[]>(key) ?? [];
      const siblings = getWeekDays(tree, input.week_id);
      const lastPosition = siblings.length > 0 ? siblings[siblings.length - 1]!.position : null;
      let position = positionBetween(lastPosition, null);

      if (position === null) {
        const fresh = rebalance(siblings.length);
        await Promise.all(
          siblings.map((day, i) =>
            supabase.from('plan_days').update({ position: fresh[i] }).eq('id', day.id)
          )
        );
        position = positionBetween(fresh.length > 0 ? fresh[fresh.length - 1]! : null, null)!;
      }

      // week_id wystarcza — trigger dziedziczy trainer_id/client_id/template_id/
      // assigned_plan_id z plan_weeks (private.plan_structure_inherit_ownership).
      const payload = {
        week_id: input.week_id,
        name: input.name,
        position,
      } as Database['public']['Tables']['plan_days']['Insert'];

      const { data, error } = await supabase.from('plan_days').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planTreeQueryKey(context) });
    },
  });
}

type UpdateDayInput = { id: string } & Pick<
  Database['public']['Tables']['plan_days']['Update'],
  'name' | 'position'
>;

export function useUpdateDay(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }: UpdateDayInput) => {
      const { data, error } = await supabase
        .from('plan_days')
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

export function useDeleteDay(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plan_days').delete().eq('id', id);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planTreeQueryKey(context) });
    },
  });
}
