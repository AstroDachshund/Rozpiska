// app/(auth)/login/page.tsx
'use client';
import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  signInWithPasswordAction,
  signInWithOtpAction,
  type AuthActionState,
} from '@/lib/auth/actions';

const initial: AuthActionState = {};

export default function LoginPage() {
  const [mode, setMode] = useState<'magic' | 'password'>('magic');
  const [magicState, magicAction, magicPending] = useActionState(signInWithOtpAction, initial);
  const [pwState, pwAction, pwPending] = useActionState(signInWithPasswordAction, initial);

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h1 className="font-display text-2xl font-semibold text-foreground">Zaloguj się</h1>
      <p className="mt-1 text-sm text-muted-foreground">Rozpiska — trener ↔ podopieczny</p>

      {mode === 'magic' ? (
        magicState.sentTo ? (
          <p role="status" className="mt-6 text-sm text-foreground">
            Sprawdź skrzynkę <strong>{magicState.sentTo}</strong> — wysłaliśmy link do logowania.
          </p>
        ) : (
          <form action={magicAction} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="magic-email">E-mail</Label>
              <Input
                id="magic-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="ty@przyklad.pl"
              />
            </div>
            {magicState.error && (
              <p role="alert" className="text-sm text-destructive">
                {magicState.error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={magicPending}>
              {magicPending ? 'Wysyłanie…' : 'Wyślij link do logowania'}
            </Button>
          </form>
        )
      ) : (
        <form action={pwAction} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pw-email">E-mail</Label>
            <Input id="pw-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw-password">Hasło</Label>
            <Input
              id="pw-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {pwState.error && (
            <p role="alert" className="text-sm text-destructive">
              {pwState.error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pwPending}>
            {pwPending ? 'Logowanie…' : 'Zaloguj się'}
          </Button>
        </form>
      )}

      <Button
        type="button"
        variant="link"
        className="mt-4 h-auto p-0 text-sm"
        onClick={() => setMode(mode === 'magic' ? 'password' : 'magic')}
      >
        {mode === 'magic' ? 'Zaloguj się hasłem' : 'Zaloguj się linkiem e-mail'}
      </Button>
    </div>
  );
}
