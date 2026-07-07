-- M2 S2.2 — RPC zaproszeń w dedykowanym, eksponowanym schemacie `app`.
-- Dlaczego `app`, nie `public`/`private`: DEFINER w `public` jest publicznym API dla
-- anon/authenticated (spec §2 unika tego), a `private` trzyma helpery RLS, których NIE
-- eksponujemy. `app` jest w [api].schemas (config.toml), więc funkcje są wołalne przez
-- klienta, a ochrona siedzi WEWNĄTRZ funkcji (ważność tokenu, auth.uid(), auth.jwt() email).

create schema if not exists app;
grant usage on schema app to anon, authenticated;

-- preview_invite: odczyt przed logowaniem (anon) — e-mail zaproszenia + flaga ważności
-- do wyświetlenia zablokowanego pola i komunikatu o zużytym/przeterminowanym linku.
create or replace function app.preview_invite(p_token text)
returns table (email text, valid boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select i.email,
         (i.expires_at > now() and i.accepted_at is null) as valid
  from public.invites i
  where i.token = p_token;
$$;

-- accept_invite: atomowa aktywacja przez świeżo zalogowanego klienta.
-- DEFINER (owner = postgres = właściciel tabel) omija brak polityki INSERT na profiles
-- (zamierzone, §M1). `for update` na wierszu invite blokuje wyścig podwójnej akceptacji.
create or replace function app.accept_invite(p_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite public.invites;
  v_uid uuid := (select auth.uid());
  v_email text := lower((select auth.jwt() ->> 'email'));
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select * into v_invite from public.invites where token = p_token for update;
  if not found then
    raise exception 'invite not found' using errcode = 'P0002';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'invite already used' using errcode = 'P0001';
  end if;
  if v_invite.expires_at <= now() then
    raise exception 'invite expired' using errcode = 'P0001';
  end if;
  if lower(v_invite.email) is distinct from v_email then
    raise exception 'invite email mismatch' using errcode = 'P0001';
  end if;

  -- Jedna rola na konto: trener nigdy nie może stać się klientem (model danych).
  if exists (select 1 from public.profiles where id = v_uid and role <> 'client') then
    raise exception 'account already registered with a non-client role' using errcode = 'P0001';
  end if;

  insert into public.profiles (id, role, full_name)
  values (v_uid, 'client', split_part(v_email, '@', 1))
  on conflict (id) do nothing;

  insert into public.trainer_clients (trainer_id, client_id, status)
  values (v_invite.trainer_id, v_uid, 'active')
  on conflict (client_id) do update
    set trainer_id = excluded.trainer_id, status = 'active', updated_at = now();

  update public.invites set accepted_at = now() where id = v_invite.id;
end;
$$;

-- Granty wąsko: preview dla anon (przed logowaniem), accept tylko dla zalogowanych.
revoke all on function app.preview_invite(text) from public;
revoke all on function app.accept_invite(text) from public;
grant execute on function app.preview_invite(text) to anon, authenticated;
grant execute on function app.accept_invite(text) to authenticated;
