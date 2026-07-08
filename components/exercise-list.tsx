import Link from 'next/link';
import { SquarePlay, Pencil } from 'lucide-react';
import { TagChip } from '@/components/tag-chip';
import { Button } from '@/components/ui/button';
import { archiveExerciseAction, restoreExerciseAction } from '@/lib/exercises/actions';
import type { ExerciseListItem } from '@/lib/exercises/queries';

export function ExerciseList({
  exercises,
  archived,
}: {
  exercises: ExerciseListItem[];
  archived: boolean;
}) {
  if (exercises.length === 0) {
    return (
      <p className="mt-8 text-sm text-muted-foreground">
        {archived
          ? 'Brak zarchiwizowanych ćwiczeń.'
          : 'Nie masz jeszcze żadnych ćwiczeń. Dodaj pierwsze.'}
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
      {exercises.map((ex) => (
        <li key={ex.id} className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{ex.name}</span>
              {ex.youtube_url && (
                <a
                  href={ex.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Otwórz wideo na YouTube"
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <SquarePlay className="size-5" strokeWidth={1.75} />
                </a>
              )}
            </div>
            {ex.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ex.tags.map((t) => (
                  <TagChip key={t.id} label={t.name} category={t.category} name={t.name} />
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!archived && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/exercises/${ex.id}/edit`}>
                  <Pencil className="size-4" strokeWidth={1.75} /> Edytuj
                </Link>
              </Button>
            )}
            <form
              action={
                (archived ? restoreExerciseAction : archiveExerciseAction) as unknown as (
                  formData: FormData
                ) => void
              }
            >
              <input type="hidden" name="id" value={ex.id} />
              <Button type="submit" variant="ghost" size="sm">
                {archived ? 'Przywróć' : 'Archiwizuj'}
              </Button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
