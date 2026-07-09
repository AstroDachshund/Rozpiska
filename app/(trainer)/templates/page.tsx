import { TemplateList } from '@/components/plan-builder/template-list';
import { TemplateCreateForm } from '@/components/plan-builder/template-create-form';
import { listTemplates } from '@/lib/plan-builder/templates';

export default async function TemplatesPage() {
  const templates = await listTemplates();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="font-display text-2xl font-semibold">Szablony planów</h1>

      <div className="mt-4">
        <TemplateCreateForm />
      </div>

      <TemplateList templates={templates} />
    </main>
  );
}
