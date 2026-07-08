'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExerciseCommand } from '@/components/exercise-command';
import type { ExerciseListItem, TagRow } from '@/lib/exercises/queries';

type Props = {
  exercises: ExerciseListItem[];
  archivedExercises: ExerciseListItem[];
  tags: TagRow[];
};

export function TrainerCommandMenu({ exercises, archivedExercises, tags }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="fixed right-4 bottom-4 z-40 shadow-md"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" strokeWidth={1.75} />
        Szukaj ćwiczeń (⌘K)
      </Button>
      <ExerciseCommand
        open={open}
        onOpenChange={setOpen}
        exercises={exercises}
        archivedExercises={archivedExercises}
        tags={tags}
        onSelect={(exercise) => {
          setOpen(false);
          router.push(`/exercises/${exercise.id}/edit`);
        }}
      />
    </>
  );
}
