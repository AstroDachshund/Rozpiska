'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { positionBetween } from '@/lib/domain/position';
import { planTreeQueryKey, getDaySections } from '@/lib/plan-builder/queries';
import type { PlanContext, PlanWeek } from '@/lib/plan-builder/types';
import type { SectionInput } from '@/lib/plan-builder/schemas';
import type { Database } from '@/lib/supabase/types';

export function useCreateSection(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: SectionInput) => {
      const tree = queryClient.getQueryData<PlanWeek[]>(planTreeQueryKey(context)) ?? [];
      const siblings = getDaySections(tree, input.day_id);
      const lastPosition = siblings.length > 0 ? siblings[siblings.length - 1]!.position : null;
      // Dołożenie na końcu nigdy nie degeneruje się (zob. use-weeks.ts) — rebalans
      // ma sens dopiero przy wstawianiu MIĘDZY sąsiadami (reorder/dnd, S4.2/S4.4).
      const position = positionBetween(lastPosition, null)!;

      const payload = {
        day_id: input.day_id,
        section_type: input.section_type,
        position,
      } as Database['public']['Tables']['plan_sections']['Insert'];

      const { data, error } = await supabase
        .from('plan_sections')
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

type UpdateSectionInput = { id: string } & Pick<
  Database['public']['Tables']['plan_sections']['Update'],
  'section_type' | 'position'
>;

export function useUpdateSection(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }: UpdateSectionInput) => {
      const { data, error } = await supabase
        .from('plan_sections')
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

export function useDeleteSection(context: PlanContext) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plan_sections').delete().eq('id', id);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: planTreeQueryKey(context) });
    },
  });
}
