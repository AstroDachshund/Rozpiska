'use client';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InlineEditableText } from '@/components/plan-builder/inline-editable-text';
import {
  SectionRow,
  SECTION_TYPES,
  SECTION_TYPE_LABELS,
} from '@/components/plan-builder/section-row';
import { useUpdateDay, useDeleteDay } from '@/lib/plan-builder/mutations/use-days';
import { useCreateSection } from '@/lib/plan-builder/mutations/use-sections';
import type { PlanContext, PlanDay } from '@/lib/plan-builder/types';

export function DayNode({
  context,
  day,
  autoFocusName,
}: {
  context: PlanContext;
  day: PlanDay;
  autoFocusName: boolean;
}) {
  const updateDay = useUpdateDay(context);
  const deleteDay = useDeleteDay(context);
  const createSection = useCreateSection(context);

  // Wyświetlanie zawsze rozgrzewka -> główna -> cooldown, niezależnie od position/kolejności
  // utworzenia. To sortowanie wyłącznie prezentacyjne — nie zapisuje position.
  const sortedSections = [...day.sections].sort(
    (a, b) => SECTION_TYPES.indexOf(a.section_type) - SECTION_TYPES.indexOf(b.section_type)
  );
  const missingTypes = SECTION_TYPES.filter((t) => !day.sections.some((s) => s.section_type === t));

  function handleDelete() {
    if (!confirm(`Usunąć dzień „${day.name}" wraz z zawartością?`)) return;
    deleteDay.mutate(day.id, {
      onError: () => toast.error('Nie udało się usunąć dnia.'),
    });
  }

  return (
    <li className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <InlineEditableText
          value={day.name}
          ariaLabel={`Nazwa dnia: ${day.name}`}
          required
          autoFocus={autoFocusName}
          onCommit={(name) =>
            updateDay.mutate(
              { id: day.id, name },
              { onError: () => toast.error('Nie udało się zapisać nazwy dnia.') }
            )
          }
          className="text-left text-base font-medium text-foreground hover:underline"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Usuń dzień ${day.name}`}
          onClick={handleDelete}
        >
          <Trash2 className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      <ul className="mt-3 space-y-2">
        {sortedSections.map((section) => (
          <SectionRow key={section.id} context={context} section={section} />
        ))}
      </ul>

      {missingTypes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {missingTypes.map((t) => (
            <Button
              key={t}
              type="button"
              variant="outline"
              size="sm"
              disabled={createSection.isPending}
              onClick={() =>
                createSection.mutate(
                  { day_id: day.id, section_type: t },
                  { onError: () => toast.error('Nie udało się dodać sekcji.') }
                )
              }
            >
              <Plus className="size-4" strokeWidth={1.75} /> {SECTION_TYPE_LABELS[t]}
            </Button>
          ))}
        </div>
      )}
    </li>
  );
}
