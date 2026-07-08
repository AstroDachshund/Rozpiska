import { notFound } from 'next/navigation';
import { ExerciseForm } from '@/components/exercise-form';
import { getExercise, listTags } from '@/lib/exercises/queries';

export default async function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [exercise, allTags] = await Promise.all([getExercise(id), listTags()]);
  if (!exercise) notFound();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="font-display text-2xl font-semibold">Edytuj ćwiczenie</h1>
      <ExerciseForm
        allTags={allTags}
        exercise={{
          id: exercise.id,
          name: exercise.name,
          technique_note: exercise.technique_note,
          youtube_url: exercise.youtube_url,
          tagIds: exercise.tags.map((t) => t.id),
        }}
      />
    </main>
  );
}
