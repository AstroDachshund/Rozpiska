'use client';
import { useMemo, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { TagChip } from '@/components/tag-chip';
import { matchesTagFilter } from '@/lib/domain/exercise-filter';
import type { ExerciseListItem, TagRow } from '@/lib/exercises/queries';
import type { TagCategory } from '@/lib/exercises/schemas';

export type ExerciseCommandProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: ExerciseListItem) => void;
  exercises: ExerciseListItem[];
  archivedExercises?: ExerciseListItem[];
  tags: TagRow[];
};

const CATEGORY_ORDER: TagCategory[] = ['muscle_group', 'equipment', 'movement_pattern'];

export function ExerciseCommand({
  open,
  onOpenChange,
  onSelect,
  exercises,
  archivedExercises = [],
  tags,
}: ExerciseCommandProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const source = showArchived ? archivedExercises : exercises;
  const selectedIds = useMemo(() => [...selectedTagIds], [selectedTagIds]);
  const filtered = useMemo(
    () => source.filter((ex) => matchesTagFilter(ex.tags, selectedIds)),
    [source, selectedIds]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Szukaj ćwiczeń"
      description="Wyszukaj ćwiczenie po nazwie lub tagach."
    >
      <CommandInput placeholder="Szukaj ćwiczenia…" />
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-2">
        {CATEGORY_ORDER.flatMap((cat) =>
          tags
            .filter((t) => t.category === cat)
            .map((t) => (
              <TagChip
                key={t.id}
                label={t.name}
                category={t.category}
                name={t.name}
                selectable
                selected={selectedTagIds.has(t.id)}
                onToggle={() => toggleTag(t.id)}
              />
            ))
        )}
        {archivedExercises.length > 0 && (
          <Button
            type="button"
            variant={showArchived ? 'secondary' : 'outline'}
            size="sm"
            aria-pressed={showArchived}
            onClick={() => setShowArchived((v) => !v)}
            className="ml-auto"
          >
            Pokaż zarchiwizowane
          </Button>
        )}
      </div>
      <CommandList>
        <CommandEmpty>Brak wyników.</CommandEmpty>
        <CommandGroup heading={showArchived ? 'Zarchiwizowane' : 'Ćwiczenia'}>
          {filtered.map((ex) => (
            <CommandItem key={ex.id} value={ex.name} onSelect={() => onSelect(ex)}>
              <span>{ex.name}</span>
              {ex.tags.length > 0 && (
                <span className="ml-2 flex gap-1">
                  {ex.tags.slice(0, 3).map((t) => (
                    <TagChip key={t.id} label={t.name} category={t.category} name={t.name} />
                  ))}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
