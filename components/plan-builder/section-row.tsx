'use client';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useDeleteSection } from '@/lib/plan-builder/mutations/use-sections';
import type { PlanContext, PlanSection } from '@/lib/plan-builder/types';

export const SECTION_TYPES = ['warmup', 'main', 'cooldown'] as const;

export const SECTION_TYPE_LABELS: Record<PlanSection['section_type'], string> = {
  warmup: 'Rozgrzewka',
  main: 'Główna',
  cooldown: 'Cooldown',
};

export function SectionRow({ context, section }: { context: PlanContext; section: PlanSection }) {
  const deleteSection = useDeleteSection(context);

  function handleDelete() {
    const label = SECTION_TYPE_LABELS[section.section_type];
    if (!confirm(`Usunąć sekcję „${label}" wraz z zawartością?`)) return;
    deleteSection.mutate(section.id, {
      onError: () => toast.error('Nie udało się usunąć sekcji.'),
    });
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm">
      <span className="font-medium text-foreground">
        {SECTION_TYPE_LABELS[section.section_type]}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Usuń sekcję ${SECTION_TYPE_LABELS[section.section_type]}`}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" strokeWidth={1.75} />
      </Button>
    </li>
  );
}
