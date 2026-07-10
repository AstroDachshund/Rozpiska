'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InlineEditableText } from '@/components/plan-builder/inline-editable-text';
import { DayNode } from '@/components/plan-builder/day-node';
import { useUpdateWeek, useDeleteWeek } from '@/lib/plan-builder/mutations/use-weeks';
import { useCreateDay } from '@/lib/plan-builder/mutations/use-days';
import type { PlanContext, PlanWeek } from '@/lib/plan-builder/types';

export function WeekNode({
  context,
  week,
  onAddExercise,
}: {
  context: PlanContext;
  week: PlanWeek;
  onAddExercise: (sectionId: string) => void;
}) {
  const updateWeek = useUpdateWeek(context);
  const deleteWeek = useDeleteWeek(context);
  const createDay = useCreateDay(context);
  // Id dnia właśnie utworzonego przyciskiem poniżej — włącza autoFocus na jego
  // InlineEditableText raz, przy montowaniu (zob. inline-editable-text.tsx).
  const [justCreatedDayId, setJustCreatedDayId] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Usunąć tydzień ${week.week_number} wraz z zawartością?`)) return;
    deleteWeek.mutate(week.id, {
      onError: () => toast.error('Nie udało się usunąć tygodnia.'),
    });
  }

  function handleAddDay() {
    createDay.mutate(
      { week_id: week.id, name: `Dzień ${week.days.length + 1}` },
      {
        onSuccess: (row) => setJustCreatedDayId(row.id),
        onError: () => toast.error('Nie udało się dodać dnia.'),
      }
    );
  }

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Tydzień {week.week_number}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Usuń tydzień ${week.week_number}`}
          onClick={handleDelete}
        >
          <Trash2 className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      <InlineEditableText
        value={week.notes ?? ''}
        ariaLabel={`Notatka tygodnia ${week.week_number}`}
        placeholder="Dodaj notatkę"
        onCommit={(notes) =>
          updateWeek.mutate(
            { id: week.id, notes: notes.length > 0 ? notes : null },
            { onError: () => toast.error('Nie udało się zapisać notatki.') }
          )
        }
        className="mt-1 block text-left text-sm text-muted-foreground hover:underline"
      />

      <ul className="mt-4 space-y-3">
        {week.days.map((day) => (
          <DayNode
            key={day.id}
            context={context}
            day={day}
            autoFocusName={day.id === justCreatedDayId}
            onAddExercise={onAddExercise}
          />
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        disabled={createDay.isPending}
        onClick={handleAddDay}
      >
        <Plus className="size-4" strokeWidth={1.75} /> Dodaj dzień
      </Button>
    </li>
  );
}
