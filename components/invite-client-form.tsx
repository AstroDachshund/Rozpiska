'use client';
import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createInviteAction, type InviteActionState } from '@/lib/invites/actions';

const initial: InviteActionState = {};

export function InviteClientForm() {
  const [state, action, pending] = useActionState(createInviteAction, initial);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!state.link) return;
    await navigator.clipboard.writeText(state.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="mt-8 rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">Dodaj podopiecznego</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Wygeneruj link zaproszenia i wyślij go podopiecznemu (np. Messengerem).
      </p>

      <form action={action} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="invite-email">E-mail podopiecznego</Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            autoComplete="off"
            required
            placeholder="podopieczny@przyklad.pl"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Generowanie…' : 'Wygeneruj link'}
        </Button>
      </form>

      {state.error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      {state.link && (
        <div className="mt-4 space-y-2">
          <Label htmlFor="invite-link">Link zaproszenia</Label>
          <div className="flex gap-2">
            <Input id="invite-link" readOnly value={state.link} className="font-mono text-xs" />
            <Button type="button" variant="outline" onClick={copy}>
              {copied ? 'Skopiowano' : 'Skopiuj link'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Link wygasa po 7 dniach.</p>
        </div>
      )}
    </section>
  );
}
