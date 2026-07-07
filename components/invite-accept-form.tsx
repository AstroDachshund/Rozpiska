'use client';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendInviteMagicLinkAction, type InviteMagicState } from '@/lib/invites/actions';

const initial: InviteMagicState = {};

export function InviteAcceptForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState(sendInviteMagicLinkAction, initial);

  if (state.sentTo) {
    return (
      <p role="status" className="mt-6 text-sm text-foreground">
        Sprawdź skrzynkę <strong>{state.sentTo}</strong> — wysłaliśmy link, który dokończy
        rejestrację i przypisze Cię do trenera.
      </p>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="invite-email">Twój e-mail</Label>
        <Input id="invite-email" type="email" value={email} readOnly aria-readonly />
        <p className="text-xs text-muted-foreground">
          Konto powstanie na tym adresie — zaproszenie jest do niego przypisane.
        </p>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Wysyłanie…' : 'Dołącz do trenera'}
      </Button>
    </form>
  );
}
