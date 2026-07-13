'use client';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseRepsRange, formatRepsRange } from '@/lib/domain/reps-range';
import { useUpdatePlanSet, useDeletePlanSet } from '@/lib/plan-builder/mutations/use-sets';
import type { PlanContext, PlanSet } from '@/lib/plan-builder/types';

export function SetRow({ context, set }: { context: PlanContext; set: PlanSet }) {
  const updateSet = useUpdatePlanSet(context);
  const deleteSet = useDeletePlanSet(context);

  // Stan lokalny (draft) na każde z 4 pól — resynchronizuje się tylko przy zamontowaniu
  // nowego wiersza (nowe set.id przez key= u rodzica), nie na każdym zewnętrznym refetchu.
  // W tej sesji nic poza własnymi handlerami commit* tego wiersza nie zapisuje pól TEJ
  // serii, więc jest to bezpieczne — ten sam kompromis co InlineEditableText (S4.2).
  const [repsDraft, setRepsDraft] = useState(formatRepsRange(set.reps_min, set.reps_max));
  const [weightDraft, setWeightDraft] = useState(set.target_weight?.toString() ?? '');
  const [rpeDraft, setRpeDraft] = useState(set.target_rpe?.toString() ?? '');
  const [restDraft, setRestDraft] = useState(set.rest_seconds?.toString() ?? '');

  function handleDelete() {
    if (!confirm(`Usunąć serię ${set.set_number}?`)) return;
    deleteSet.mutate(set.id, {
      onError: () => toast.error('Nie udało się usunąć serii.'),
    });
  }

  function commitReps() {
    const trimmed = repsDraft.trim();
    if (trimmed.length === 0) {
      if (set.reps_min === null && set.reps_max === null) return;
      updateSet.mutate(
        { id: set.id, reps_min: null, reps_max: null },
        { onError: () => toast.error('Nie udało się zapisać powtórzeń.') }
      );
      return;
    }
    const parsed = parseRepsRange(trimmed);
    if (parsed === null) {
      setRepsDraft(formatRepsRange(set.reps_min, set.reps_max));
      return;
    }
    if (parsed.reps_min === set.reps_min && parsed.reps_max === set.reps_max) return;
    updateSet.mutate(
      { id: set.id, reps_min: parsed.reps_min, reps_max: parsed.reps_max },
      { onError: () => toast.error('Nie udało się zapisać powtórzeń.') }
    );
  }

  function commitWeight() {
    const trimmed = weightDraft.trim();
    if (trimmed.length === 0) {
      if (set.target_weight === null) return;
      updateSet.mutate(
        { id: set.id, target_weight: null },
        { onError: () => toast.error('Nie udało się zapisać ciężaru.') }
      );
      return;
    }
    const value = Number(trimmed);
    if (!Number.isFinite(value) || value <= 0) {
      setWeightDraft(set.target_weight?.toString() ?? '');
      return;
    }
    if (value === set.target_weight) return;
    updateSet.mutate(
      { id: set.id, target_weight: value },
      { onError: () => toast.error('Nie udało się zapisać ciężaru.') }
    );
  }

  function commitRpe() {
    const trimmed = rpeDraft.trim();
    if (trimmed.length === 0) {
      if (set.target_rpe === null) return;
      updateSet.mutate(
        { id: set.id, target_rpe: null },
        { onError: () => toast.error('Nie udało się zapisać RPE.') }
      );
      return;
    }
    const value = Number(trimmed);
    if (!Number.isFinite(value) || value < 1 || value > 10) {
      setRpeDraft(set.target_rpe?.toString() ?? '');
      return;
    }
    if (value === set.target_rpe) return;
    updateSet.mutate(
      { id: set.id, target_rpe: value },
      { onError: () => toast.error('Nie udało się zapisać RPE.') }
    );
  }

  function commitRest() {
    const trimmed = restDraft.trim();
    if (trimmed.length === 0) {
      if (set.rest_seconds === null) return;
      updateSet.mutate(
        { id: set.id, rest_seconds: null },
        { onError: () => toast.error('Nie udało się zapisać przerwy.') }
      );
      return;
    }
    const value = Number(trimmed);
    if (!Number.isInteger(value) || value < 0) {
      setRestDraft(set.rest_seconds?.toString() ?? '');
      return;
    }
    if (value === set.rest_seconds) return;
    updateSet.mutate(
      { id: set.id, rest_seconds: value },
      { onError: () => toast.error('Nie udało się zapisać przerwy.') }
    );
  }

  return (
    <li className="flex items-center gap-2 text-sm">
      <span className="w-16 shrink-0 font-data text-muted-foreground tabular-nums">
        Seria {set.set_number}
      </span>
      <Input
        value={repsDraft}
        onChange={(e) => setRepsDraft(e.target.value)}
        onBlur={commitReps}
        aria-label={`Powtórzenia, seria ${set.set_number}`}
        placeholder="8–10"
        className="w-20 font-data tabular-nums"
      />
      <Input
        value={weightDraft}
        onChange={(e) => setWeightDraft(e.target.value)}
        onBlur={commitWeight}
        aria-label={`Ciężar (kg), seria ${set.set_number}`}
        placeholder="kg"
        inputMode="decimal"
        className="w-20 font-data tabular-nums"
      />
      <Input
        value={rpeDraft}
        onChange={(e) => setRpeDraft(e.target.value)}
        onBlur={commitRpe}
        aria-label={`RPE, seria ${set.set_number}`}
        placeholder="RPE"
        inputMode="decimal"
        className="w-16 font-data tabular-nums"
      />
      <Input
        value={restDraft}
        onChange={(e) => setRestDraft(e.target.value)}
        onBlur={commitRest}
        aria-label={`Przerwa (s), seria ${set.set_number}`}
        placeholder="s"
        inputMode="numeric"
        className="w-16 font-data tabular-nums"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Usuń serię ${set.set_number}`}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" strokeWidth={1.75} />
      </Button>
    </li>
  );
}
