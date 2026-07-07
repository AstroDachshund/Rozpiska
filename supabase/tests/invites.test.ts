// Testy integracyjne accept_invite — to testy BEZPIECZEŃSTWA (email-lock, single-use).
// Uruchamiane jako role API (nie superuser): świeżo zalogowany klient woła RPC w schemacie app.
import { afterAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { admin, cleanupUsers, createUser, createUnprofiledUser, createInvite } from './helpers';

const emailFor = () => `client-${randomUUID()}@test.rozpiska.local`;

afterAll(async () => {
  await cleanupUsers();
});

describe('accept_invite — happy path', () => {
  it('tworzy profil klienta i aktywuje trainer_clients, zużywa token', async () => {
    const trainer = await createUser('trainer', 'Trener Zapraszający');
    const email = emailFor();
    const { id: inviteId, token } = await createInvite(trainer.userId, email);
    const client = await createUnprofiledUser(email);

    const { error } = await client.client.schema('app').rpc('accept_invite', { p_token: token });
    expect(error).toBeNull();

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', client.userId)
      .single();
    expect(profile?.role).toBe('client');

    const { data: link } = await admin
      .from('trainer_clients')
      .select('status, trainer_id')
      .eq('client_id', client.userId)
      .single();
    expect(link?.status).toBe('active');
    expect(link?.trainer_id).toBe(trainer.userId);

    const { data: invite } = await admin
      .from('invites')
      .select('accepted_at')
      .eq('id', inviteId)
      .single();
    expect(invite?.accepted_at).not.toBeNull();
  });
});

describe('accept_invite — odrzucenia', () => {
  it('odmawia dla zużytego tokenu', async () => {
    const trainer = await createUser('trainer', 'Trener');
    const email = emailFor();
    const { token } = await createInvite(trainer.userId, email, { accepted: true });
    const client = await createUnprofiledUser(email);

    const { error } = await client.client.schema('app').rpc('accept_invite', { p_token: token });
    expect(error).not.toBeNull();
  });

  it('odmawia dla przeterminowanego tokenu', async () => {
    const trainer = await createUser('trainer', 'Trener');
    const email = emailFor();
    const { token } = await createInvite(trainer.userId, email, { expiresInMs: -1000 });
    const client = await createUnprofiledUser(email);

    const { error } = await client.client.schema('app').rpc('accept_invite', { p_token: token });
    expect(error).not.toBeNull();
  });

  it('odmawia, gdy e-mail konta ≠ e-mail zaproszenia (email-lock)', async () => {
    const trainer = await createUser('trainer', 'Trener');
    const { token } = await createInvite(trainer.userId, emailFor());
    const other = await createUnprofiledUser(emailFor()); // inny adres

    const { error } = await other.client.schema('app').rpc('accept_invite', { p_token: token });
    expect(error).not.toBeNull();

    // profil NIE powstał
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', other.userId)
      .maybeSingle();
    expect(profile).toBeNull();
  });

  it('odmawia dla nieistniejącego tokenu', async () => {
    const client = await createUnprofiledUser(emailFor());
    const { error } = await client.client
      .schema('app')
      .rpc('accept_invite', { p_token: randomUUID() });
    expect(error).not.toBeNull();
  });
});

describe('accept_invite — guard roli', () => {
  it('odmawia trenerowi próbującemu zaakceptować własne zaproszenie', async () => {
    const trainer = await createUser('trainer', 'Trener Sam Siebie');
    const { token } = await createInvite(trainer.userId, trainer.email);

    const { error } = await trainer.client.schema('app').rpc('accept_invite', { p_token: token });
    expect(error).not.toBeNull();

    const { data: link } = await admin
      .from('trainer_clients')
      .select('id')
      .eq('client_id', trainer.userId)
      .maybeSingle();
    expect(link).toBeNull();

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', trainer.userId)
      .single();
    expect(profile?.role).toBe('trainer');
  });
});

describe('invites — tylko trener tworzy', () => {
  it('odmawia klientowi tworzącemu zaproszenie (RLS with check, nawet dla trainer_id = własne uid)', async () => {
    const client = await createUser('client', 'Klient RLS');

    const { error } = await client.client.from('invites').insert({
      trainer_id: client.userId,
      email: emailFor(),
      token: randomUUID(),
      expires_at: new Date(Date.now() + 7 * 864e5).toISOString(),
    });
    expect(error).not.toBeNull();
  });

  it('pozwala trenerowi utworzyć zaproszenie dla siebie', async () => {
    const trainer = await createUser('trainer', 'Trener RLS');

    const { error } = await trainer.client.from('invites').insert({
      trainer_id: trainer.userId,
      email: emailFor(),
      token: randomUUID(),
      expires_at: new Date(Date.now() + 7 * 864e5).toISOString(),
    });
    expect(error).toBeNull();
  });
});
