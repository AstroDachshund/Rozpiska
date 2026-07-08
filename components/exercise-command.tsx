'use client';
import { useMemo, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

// cmdk's default filter does a plain substring match, which does not fold
// Polish diacritics (e.g. "wioslowanie" would not match "Wiosłowanie hantlem").
// Normalize both sides before comparing so Polish users typing without
// diacritics still get results.
function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>Szukaj ćwiczeń</DialogTitle>
        <DialogDescription>Wyszukaj ćwiczenie po nazwie lub tagach.</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        {/*
          Not using CommandDialog here: it hardcodes its inner <Command> and
          does not forward extra props (like `filter`), so there is no way to
          reach cmdk's Root through it. Composing Dialog + Command directly
          lets us wire a diacritic-insensitive filter without touching the
          generated components/ui/command.tsx.
        */}
        <Command
          className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          filter={(value, search) =>
            normalizeForSearch(value).includes(normalizeForSearch(search)) ? 1 : 0
          }
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
        </Command>
      </DialogContent>
    </Dialog>
  );
}
