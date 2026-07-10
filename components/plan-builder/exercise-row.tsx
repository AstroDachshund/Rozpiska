'use client';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InlineEditableText } from '@/components/plan-builder/inline-editable-text';
import { SetRow } from '@/components/plan-builder/set-row';
import {
  useUpdatePlanExercise,
  useDeletePlanExercise,
} from '@/lib/plan-builder/mutations/use-exercises';
import { useCreatePlanSet } from '@/lib/plan-builder/mutations/use-sets';
import type { PlanContext, PlanExercise } from '@/lib/plan-builder/types';

export function ExerciseRow({
  context,
  exercise,
}: {
  context: PlanContext;
  exercise: PlanExercise;
}) {
  const updateExercise = useUpdatePlanExercise(context);
  const deleteExercise = useDeletePlanExercise(context);
  const createSet = useCreatePlanSet(context);

  function handleDelete() {
    if (!confirm(`Usunąć ćwiczenie „${exercise.exercise_name}" wraz z seriami?`)) return;
    deleteExercise.mutate(exercise.id, {
      onError: () => toast.error('Nie udało się usunąć ćwiczenia.'),
    });
  }

  function handleAddSet() {
    // Nowa seria kopiuje wartości z ostatniej — najczęstszy przypadek to identyczne
    // serie w jednym ćwiczeniu (np. "3x8-10 @ 80kg"). Pierwsza seria startuje pusta.
    const last = exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1] : undefined;
    createSet.mutate(
      {
        plan_exercise_id: exercise.id,
        set_number: exercise.sets.length + 1,
        reps_min: last?.reps_min ?? undefined,
        reps_max: last?.reps_max ?? undefined,
        target_weight: last?.target_weight ?? undefined,
        target_rpe: last?.target_rpe ?? undefined,
        rest_seconds: last?.rest_seconds ?? undefined,
      },
      { onError: () => toast.error('Nie udało się dodać serii.') }
    );
  }

  return (
    <li className="rounded-md border border-border bg-card px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{exercise.exercise_name}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Usuń ćwiczenie ${exercise.exercise_name}`}
          onClick={handleDelete}
        >
          <Trash2 className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      <InlineEditableText
        value={exercise.trainer_note ?? ''}
        ariaLabel={`Notatka do ćwiczenia ${exercise.exercise_name}`}
        placeholder="Dodaj notatkę"
        onCommit={(note) =>
          updateExercise.mutate(
            { id: exercise.id, trainer_note: note.length > 0 ? note : null },
            { onError: () => toast.error('Nie udało się zapisać notatki.') }
          )
        }
        className="mt-0.5 block text-left text-sm text-muted-foreground hover:underline"
      />

      <ul className="mt-2 space-y-1.5">
        {exercise.sets.map((set) => (
          <SetRow key={set.id} context={context} set={set} />
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        disabled={createSet.isPending}
        onClick={handleAddSet}
      >
        <Plus className="size-4" strokeWidth={1.75} /> Dodaj serię
      </Button>
    </li>
  );
}
