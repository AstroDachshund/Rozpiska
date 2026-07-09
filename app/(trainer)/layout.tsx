// Kontekst trenera: desktop-first, motyw jasny (default). Bez klasy `dark`.
import { TrainerCommandMenu } from '@/components/trainer-command-menu';
import { Toaster } from '@/components/ui/sonner';
import { listExercises, listTags } from '@/lib/exercises/queries';

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const [exercises, archivedExercises, tags] = await Promise.all([
    listExercises(false),
    listExercises(true),
    listTags(),
  ]);

  return (
    <div data-context="trainer">
      {children}
      <TrainerCommandMenu exercises={exercises} archivedExercises={archivedExercises} tags={tags} />
      <Toaster />
    </div>
  );
}
