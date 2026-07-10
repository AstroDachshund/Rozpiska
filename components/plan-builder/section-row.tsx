'use client';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ExerciseRow } from '@/components/plan-builder/exercise-row';
import { useDeleteSection } from '@/lib/plan-builder/mutations/use-sections';
import type { PlanContext, PlanSection } from '@/lib/plan-builder/types';

export const SECTION_TYPES = ['warmup', 'main', 'cooldown'] as const;

export const SECTION_TYPE_LABELS: Record<PlanSection['section_type'], string> = {
  warmup: 'Rozgrzewka',
  main: 'Główna',
  cooldown: 'Cooldown',
};

export function SectionRow({
  context,
  section,
  onAddExercise,
}: {
  context: PlanContext;
  section: PlanSection;
  onAddExercise: (sectionId: string) => void;
}) {
  const deleteSection = useDeleteSection(context);

  function handleDelete() {
    const label = SECTION_TYPE_LABELS[section.section_type];
    if (!confirm(`Usunąć sekcję „${label}" wraz z zawartością?`)) return;
    deleteSection.mutate(section.id, {
      onError: () => toast.error('Nie udało się usunąć sekcji.'),
    });
  }

  return (
    <li className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
      <div className="flex items-center justify-between gap-2">
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
      </div>

      <ul className="mt-2 space-y-2">
        {section.exercises.map((exercise) => (
          <ExerciseRow key={exercise.id} context={context} exercise={exercise} />
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => onAddExercise(section.id)}
      >
        <Plus className="size-4" strokeWidth={1.75} /> Dodaj ćwiczenie
      </Button>
    </li>
  );
}
