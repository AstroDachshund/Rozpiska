import { notFound } from 'next/navigation';
import { PlanBuilderTree } from '@/components/plan-builder/plan-builder-tree';
import { getTemplate } from '@/lib/plan-builder/templates';
import { listExercises, listTags } from '@/lib/exercises/queries';

export default async function TemplateBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [template, exercises, archivedExercises, tags] = await Promise.all([
    getTemplate(id),
    listExercises(false),
    listExercises(true),
    listTags(),
  ]);
  if (!template) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="font-display text-2xl font-semibold">{template.name}</h1>
      <PlanBuilderTree
        context={{ kind: 'template', templateId: template.id }}
        exercises={exercises}
        archivedExercises={archivedExercises}
        tags={tags}
      />
    </main>
  );
}
