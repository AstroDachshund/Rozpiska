'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { WeekNode } from '@/components/plan-builder/week-node';
import { ExerciseCommand } from '@/components/exercise-command';
import { usePlanTree } from '@/lib/plan-builder/queries';
import { useCreateWeek } from '@/lib/plan-builder/mutations/use-weeks';
import { useCreatePlanExercise } from '@/lib/plan-builder/mutations/use-exercises';
import type { PlanContext } from '@/lib/plan-builder/types';
import type { ExerciseListItem, TagRow } from '@/lib/exercises/queries';

type Props = {
  context: PlanContext;
  exercises: ExerciseListItem[];
  archivedExercises: ExerciseListItem[];
  tags: TagRow[];
};

export function PlanBuilderTree({ context, exercises, archivedExercises, tags }: Props) {
  const { data: weeks, isPending, isError } = usePlanTree(context);
  const createWeek = useCreateWeek(context);
  const createExercise = useCreatePlanExercise(context);
  // Id sekcji, dla której otwarty jest współdzielony picker — jedna instancja
  // ExerciseCommand na całe drzewo, nie jedna na sekcję (zob. Global Constraints).
  const [pickerSectionId, setPickerSectionId] = useState<string | null>(null);

  function handleAddWeek() {
    const nextNumber =
      weeks && weeks.length > 0 ? Math.max(...weeks.map((w) => w.week_number)) + 1 : 1;
    createWeek.mutate(
      { week_number: nextNumber },
      { onError: () => toast.error('Nie udało się dodać tygodnia.') }
    );
  }

  if (isPending) {
    return <p className="mt-8 text-sm text-muted-foreground">Wczytywanie planu…</p>;
  }

  if (isError) {
    return <p className="mt-8 text-sm text-destructive">Nie udało się wczytać planu.</p>;
  }

  return (
    <div>
      {weeks && weeks.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Ten szablon nie ma jeszcze żadnego tygodnia.
        </p>
      )}

      <ul className="mt-4 space-y-4">
        {weeks?.map((week) => (
          <WeekNode
            key={week.id}
            context={context}
            week={week}
            onAddExercise={setPickerSectionId}
          />
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        className="mt-4"
        disabled={createWeek.isPending}
        onClick={handleAddWeek}
      >
        <Plus className="size-4" strokeWidth={1.75} /> Dodaj tydzień
      </Button>

      <ExerciseCommand
        open={pickerSectionId !== null}
        onOpenChange={(open) => {
          if (!open) setPickerSectionId(null);
        }}
        exercises={exercises}
        archivedExercises={archivedExercises}
        tags={tags}
        onSelect={(exercise) => {
          const sectionId = pickerSectionId;
          setPickerSectionId(null);
          if (!sectionId) return;
          createExercise.mutate(
            { section_id: sectionId, exercise_id: exercise.id, exercise_name: exercise.name },
            { onError: () => toast.error('Nie udało się dodać ćwiczenia.') }
          );
        }}
      />
    </div>
  );
}
