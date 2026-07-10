'use client';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createTemplateAction, type TemplateFormState } from '@/lib/plan-builder/template-actions';

const initial: TemplateFormState = {};

export function TemplateCreateForm() {
  const [state, action, pending] = useActionState(createTemplateAction, initial);

  return (
    <form action={action} className="flex items-start gap-2">
      <div className="flex-1">
        <Input
          name="name"
          placeholder="Nazwa szablonu (np. Push A)"
          aria-label="Nazwa szablonu"
          required
        />
        {state.error && <p className="mt-1 text-sm text-destructive">{state.error}</p>}
      </div>
      <Button type="submit" disabled={pending}>
        Utwórz szablon
      </Button>
    </form>
  );
}
