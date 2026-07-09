import Link from 'next/link';
import type { TemplateRow } from '@/lib/plan-builder/templates';

export function TemplateList({ templates }: { templates: TemplateRow[] }) {
  if (templates.length === 0) {
    return (
      <p className="mt-8 text-sm text-muted-foreground">
        Nie masz jeszcze żadnego szablonu. Utwórz pierwszy.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
      {templates.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-4 p-4">
          <Link
            href={`/templates/${t.id}`}
            className="font-medium text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {t.name}
          </Link>
          <span className="text-sm text-muted-foreground">
            {new Date(t.created_at).toLocaleDateString('pl-PL')}
          </span>
        </li>
      ))}
    </ul>
  );
}
