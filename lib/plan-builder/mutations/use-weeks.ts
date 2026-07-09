'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { positionBetween } from '@/lib/domain/position';
import { planTreeQueryKey } from '@/lib/plan-builder/queries';
import type { PlanContext, PlanWeek } from '@/lib/plan-builder/types';
import type { WeekInput } from '@/lib/plan-builder/schemas';
import type { Database } from '@/lib/supabase/types';

export function useCreateWeek(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: WeekInput) => {
      const key = planTreeQueryKey(context);
      const tree = queryClient.getQueryData<PlanWeek[]>(key) ?? [];
      const lastPosition = tree.length > 0 ? tree[tree.length - 1]!.position : null;
      // Dołożenie na końcu (before, null) NIGDY nie degeneruje się — positionBetween
      // zwraca `before + STEP` zanim w ogóle sprawdzi próg degeneracji (zob.
      // lib/domain/position.ts). Rebalans rodzeństwa ma sens dopiero przy wstawianiu
      // MIĘDZY dwoma sąsiadami (reorder/dnd, przyszłe S4.2/S4.4) — tam
      // positionBetween(before, after) faktycznie może zwrócić null.
      const position = positionBetween(lastPosition, null)!;

      // Kolumny właścicielskie (trainer_id/client_id) wypełnia trigger BEFORE INSERT
      // z rodzica (plan_templates/assigned_plans) — nigdy nie wysyłamy ich z klienta.
      // Wygenerowany typ Insert oznacza trainer_id jako wymagane; rzutujemy węższy
      // obiekt, bo trigger uzupełnia brakujące kolumny PRZED sprawdzeniem NOT NULL.
      const payload = {
        week_number: input.week_number,
        notes: input.notes ?? null,
        position,
        ...(context.kind === 'template'
          ? { template_id: context.templateId }
          : { assigned_plan_id: context.assignedPlanId }),
      } as Database['public']['Tables']['plan_weeks']['Insert'];

      const { data, error } = await supabase.from('plan_weeks').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planTreeQueryKey(context) });
    },
  });
}

type UpdateWeekInput = { id: string } & Pick<
  Database['public']['Tables']['plan_weeks']['Update'],
  'week_number' | 'notes' | 'position'
>;

export function useUpdateWeek(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }: UpdateWeekInput) => {
      const { data, error } = await supabase
        .from('plan_weeks')
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

export function useDeleteWeek(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plan_weeks').delete().eq('id', id);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planTreeQueryKey(context) });
    },
  });
}
