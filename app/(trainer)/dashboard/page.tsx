import { getSessionContext } from '@/lib/auth/session';
import { SignOutButton } from '@/components/sign-out-button';

export default async function DashboardPage() {
  const ctx = await getSessionContext();
  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Panel trenera</h1>
        <SignOutButton />
      </div>
      <p className="mt-2 text-muted-foreground">
        Zalogowano jako {ctx?.fullName ?? '—'} ({ctx?.role ?? '—'}).
      </p>
    </main>
  );
}
