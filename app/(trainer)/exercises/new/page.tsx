import { ExerciseForm } from '@/components/exercise-form';
import { listTags } from '@/lib/exercises/queries';

export default async function NewExercisePage() {
  const allTags = await listTags();
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="font-display text-2xl font-semibold">Nowe ćwiczenie</h1>
      <ExerciseForm allTags={allTags} />
    </main>
  );
}
