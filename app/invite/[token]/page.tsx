import { createClient } from '@/lib/supabase/server';
import { InviteAcceptForm } from '@/components/invite-accept-form';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: preview } = await supabase
    .schema('app')
    .rpc('preview_invite', { p_token: token })
    .maybeSingle();

  const valid = Boolean(preview?.valid);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-foreground">Zaproszenie</h1>
        {valid ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Twój trener zaprasza Cię do Rozpiski.
            </p>
            <InviteAcceptForm token={token} email={preview!.email} />
          </>
        ) : (
          <p className="mt-4 text-sm text-foreground">
            Ten link zaproszenia jest nieprawidłowy, został już użyty lub wygasł. Poproś trenera o
            nowy.
          </p>
        )}
      </div>
    </main>
  );
}
