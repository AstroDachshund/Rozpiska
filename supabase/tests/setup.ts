// Ładuje zmienne środowiskowe dla testów RLS.
// Lokalnie: `.env.test.local` (gitignore) generowany z `supabase status -o env`.
// CI: zmienne eksportowane bezpośrednio po `supabase start`.
import { config } from 'dotenv';

config({ path: '.env.test.local' });
config(); // fallback do .env

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Brak zmiennych środowiskowych dla testów RLS: ${missing.join(', ')}.\n` +
      'Uruchom `npm run db:start`, a następnie `supabase status -o env > .env.test.local`.'
  );
}
