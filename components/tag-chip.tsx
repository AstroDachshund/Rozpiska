'use client';
import { cn } from '@/lib/utils';
import { tagDotColor } from '@/lib/domain/tag-colors';
import { Check } from 'lucide-react';

type TagChipProps = {
  label: string;
  category?: string;
  name?: string;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
};

function Dot({ color }: { color: string | null }) {
  if (!color) return null;
  return <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: color }} />;
}

export function TagChip({ label, category, name, selectable, selected, onToggle }: TagChipProps) {
  const color = category && name ? tagDotColor(category, name) : null;
  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm transition-colors';

  if (!selectable) {
    return (
      <span className={cn(base, 'border-border bg-muted text-foreground')}>
        <Dot color={color} />
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        base,
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        selected
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
      )}
    >
      {selected ? <Check aria-hidden className="size-3.5 text-primary" /> : <Dot color={color} />}
      {label}
    </button>
  );
}
