'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { templateInputSchema } from '@/lib/plan-builder/schemas';

export type TemplateFormState = { error?: string };

export async function createTemplateAction(
  _prev: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const parsed = templateInputSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Musisz być zalogowany.' };

  const { data: created, error } = await supabase
    .from('plan_templates')
    .insert({ trainer_id: user.id, name: parsed.data.name })
    .select('id')
    .single();
  if (error || !created) return { error: 'Nie udało się utworzyć szablonu.' };

  redirect(`/templates/${created.id}`);
}
