import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExerciseList } from '@/components/exercise-list';
import { listExercises } from '@/lib/exercises/queries';

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const { archived: archivedParam } = await searchParams;
  const archived = archivedParam === '1';
  const exercises = await listExercises(archived);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Bank ćwiczeń</h1>
        <Button asChild>
          <Link href="/exercises/new">
            <Plus className="size-4" strokeWidth={1.75} /> Dodaj ćwiczenie
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex gap-2 text-sm">
        <Link
          href="/exercises"
          className={!archived ? 'font-medium text-foreground' : 'text-muted-foreground'}
        >
          Aktywne
        </Link>
        <Link
          href="/exercises?archived=1"
          className={archived ? 'font-medium text-foreground' : 'text-muted-foreground'}
        >
          Zarchiwizowane
        </Link>
      </div>

      <ExerciseList exercises={exercises} archived={archived} />
    </main>
  );
}
