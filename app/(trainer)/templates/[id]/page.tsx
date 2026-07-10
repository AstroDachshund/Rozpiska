import { notFound } from 'next/navigation';
import { PlanBuilderTree } from '@/components/plan-builder/plan-builder-tree';
import { getTemplate } from '@/lib/plan-builder/templates';

export default async function TemplateBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="font-display text-2xl font-semibold">{template.name}</h1>
      <PlanBuilderTree context={{ kind: 'template', templateId: template.id }} />
    </main>
  );
}
