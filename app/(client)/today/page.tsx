import { getSessionContext } from '@/lib/auth/session';
import { SignOutButton } from '@/components/sign-out-button';

export default async function TodayPage() {
  const ctx = await getSessionContext();
  return (
    <main className="min-h-dvh bg-background p-6 text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Dziś</h1>
        <SignOutButton />
      </div>
      <p className="mt-2 text-muted-foreground">
        Cześć, {ctx?.fullName ?? '—'}.
      </p>
    </main>
  );
}
