'use client';
import { useState } from 'react';

type Props = {
  value: string;
  onCommit: (value: string) => void;
  ariaLabel: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

const INPUT_CLASS =
  'h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * Klik/focus -> input. Enter/blur zatwierdza, Esc cofa do poprzedniej wartości.
 * `required=true` blokuje zatwierdzenie pustej wartości (zamiast tego wraca do poprzedniej).
 * `autoFocus=true` startuje od razu w trybie edycji — używane przy tworzeniu węzła
 * z nazwą-placeholderem (np. nowy dzień "Dzień N").
 */
export function InlineEditableText({
  value,
  onCommit,
  ariaLabel,
  required = false,
  placeholder = 'Dodaj notatkę',
  className,
  autoFocus = false,
}: Props) {
  const [editing, setEditing] = useState(autoFocus);
  const [draft, setDraft] = useState(value);

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  function commit() {
    const trimmed = draft.trim();
    if (required && trimmed.length === 0) {
      setEditing(false);
      return;
    }
    setEditing(false);
    if (trimmed !== value) onCommit(trimmed);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        aria-label={ariaLabel}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
          }
        }}
        className={className ?? INPUT_CLASS}
      />
    );
  }

  return (
    <button type="button" onClick={startEditing} aria-label={ariaLabel} className={className}>
      {value || `+ ${placeholder}`}
    </button>
  );
}
