// Serwerowe odczyty szablonów (RSC). RLS zawęża do trenera (plan_templates_trainer_all).
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export type TemplateRow = Pick<
  Database['public']['Tables']['plan_templates']['Row'],
  'id' | 'name' | 'created_at'
>;

export async function listTemplates(): Promise<TemplateRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('plan_templates')
    .select('id, name, created_at')
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTemplate(id: string): Promise<TemplateRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('plan_templates')
    .select('id, name, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
