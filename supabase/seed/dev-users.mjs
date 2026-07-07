// supabase/seed/dev-users.mjs
// Lokalny seed kont do logowania (S2.1). Uruchom po `npm run db:reset`:
//   npm run db:seed:users
// Wymaga SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (z .env.test.local, service_role omija RLS).
// Uwaga: klient normalnie powstaje przez accept_invite (S2.2) — tu seedujemy go wprost
// wyłącznie dla wygody dev-testów logowania w S2.1.
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.test.local' });
config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error(
    'Brak SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Uruchom `npm run db:start` i `supabase status -o env > .env.test.local`.'
  );
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { email: 'trener@rozpiska.local', password: 'trener-123456', role: 'trainer', fullName: 'Michał Trener' },
  { email: 'klient@rozpiska.local', password: 'klient-123456', role: 'client', fullName: 'Kasia Podopieczna' },
];

async function findUserByEmail(email) {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;
  return data.users.find((u) => u.email === email) ?? null;
}

async function upsertUser({ email, password, role, fullName }) {
  let user = await findUserByEmail(email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
    console.log(`+ auth.users: ${email}`);
  } else {
    console.log(`= auth.users istnieje: ${email}`);
  }
  const { error: pErr } = await admin
    .from('profiles')
    .upsert({ id: user.id, role, full_name: fullName }, { onConflict: 'id' });
  if (pErr) throw pErr;
  return user.id;
}

const trainerId = await upsertUser(users[0]);
const clientId = await upsertUser(users[1]);

const { error: linkErr } = await admin
  .from('trainer_clients')
  .upsert(
    { trainer_id: trainerId, client_id: clientId, status: 'active' },
    { onConflict: 'client_id' }
  );
if (linkErr) throw linkErr;

console.log('✓ Seed gotowy: trener@rozpiska.local / trener-123456, klient@rozpiska.local / klient-123456');
