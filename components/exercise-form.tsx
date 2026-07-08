'use client';
import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagChip } from '@/components/tag-chip';
import {
  createExerciseAction,
  updateExerciseAction,
  createTagAction,
  type ExerciseFormState,
} from '@/lib/exercises/actions';
import type { TagRow } from '@/lib/exercises/queries';
import type { TagCategory } from '@/lib/exercises/schemas';

const initial: ExerciseFormState = {};

const CATEGORY_LABELS: Record<TagCategory, string> = {
  muscle_group: 'Partia mięśniowa',
  equipment: 'Sprzęt',
  movement_pattern: 'Wzorzec ruchu',
};

type Props = {
  allTags: TagRow[];
  exercise?: {
    id: string;
    name: string;
    technique_note: string | null;
    youtube_url: string | null;
    tagIds: string[];
  };
};

export function ExerciseForm({ allTags, exercise }: Props) {
  const isEdit = Boolean(exercise);
  const [state, action, pending] = useActionState(
    isEdit ? updateExerciseAction : createExerciseAction,
    initial
  );
  const [tags, setTags] = useState<TagRow[]>(allTags);
  const [selected, setSelected] = useState<Set<string>>(new Set(exercise?.tagIds ?? []));
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<TagCategory>('muscle_group');
  const [tagError, setTagError] = useState<string>();

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  async function addTag() {
    const name = newName.trim();
    if (!name) return;
    const fd = new FormData();
    fd.set('category', newCategory);
    fd.set('name', name);
    const res = await createTagAction({}, fd);
    if (res.error || !res.tag) {
      setTagError(res.error ?? 'Nie udało się utworzyć tagu.');
      return;
    }
    setTagError(undefined);
    setTags((prev) => (prev.some((t) => t.id === res.tag!.id) ? prev : [...prev, res.tag!]));
    setSelected((prev) => new Set(prev).add(res.tag!.id));
    setNewName('');
  }

  const byCategory = (cat: TagCategory) => tags.filter((t) => t.category === cat);

  return (
    <form action={action} className="mt-6 space-y-6">
      {isEdit && <input type="hidden" name="id" value={exercise!.id} />}
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="tag_ids" value={id} />
      ))}

      <div className="space-y-2">
        <Label htmlFor="name">Nazwa ćwiczenia</Label>
        <Input id="name" name="name" required defaultValue={exercise?.name ?? ''} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtube_url">Link YouTube (opcjonalnie)</Label>
        <Input
          id="youtube_url"
          name="youtube_url"
          type="url"
          placeholder="https://youtu.be/…"
          defaultValue={exercise?.youtube_url ?? ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="technique_note">Notatka techniczna (opcjonalnie)</Label>
        <Textarea
          id="technique_note"
          name="technique_note"
          defaultValue={exercise?.technique_note ?? ''}
        />
      </div>

      <div className="space-y-3">
        <span className="text-sm font-medium">Tagi</span>
        {(['muscle_group', 'equipment', 'movement_pattern'] as TagCategory[]).map((cat) => (
          <div key={cat} className="space-y-1.5">
            <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
            <div className="flex flex-wrap gap-1.5">
              {byCategory(cat).map((t) => (
                <TagChip
                  key={t.id}
                  label={t.name}
                  category={t.category}
                  name={t.name}
                  selectable
                  selected={selected.has(t.id)}
                  onToggle={() => toggle(t.id)}
                />
              ))}
              {byCategory(cat).length === 0 && (
                <span className="text-xs text-muted-foreground">— brak —</span>
              )}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
          <div className="space-y-1">
            <Label htmlFor="new-tag" className="text-xs">
              Nowy tag
            </Label>
            <Input
              id="new-tag"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="np. Kettlebell"
              className="w-40"
            />
          </div>
          <select
            aria-label="Kategoria nowego tagu"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as TagCategory)}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          >
            <option value="muscle_group">Partia mięśniowa</option>
            <option value="equipment">Sprzęt</option>
            <option value="movement_pattern">Wzorzec ruchu</option>
          </select>
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            Dodaj tag
          </Button>
        </div>
        {tagError && (
          <p role="alert" className="text-sm text-destructive">
            {tagError}
          </p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Zapisywanie…' : 'Zapisz ćwiczenie'}
      </Button>
    </form>
  );
}
