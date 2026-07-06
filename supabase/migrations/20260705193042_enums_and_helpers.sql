-- M1 Foundation — enumy, funkcje pomocnicze i helpery RLS.
-- Postgres 17 (patrz supabase/config.toml) nie ma natywnego uuidv7() → definiujemy własny.
-- Helpery RLS trzymamy w NIEEKSPONOWANYM schemacie `private` (nie w `public`),
-- bo funkcje SECURITY DEFINER w `public` są publicznym API dla anon/authenticated.

-- ─────────────────────────────────────────────────────────────────────────────
-- Enumy domenowe
-- ─────────────────────────────────────────────────────────────────────────────

create type public.user_role as enum ('trainer', 'client');
create type public.trainer_client_status as enum ('invited', 'active', 'archived');
create type public.plan_section_type as enum ('warmup', 'main', 'cooldown');
create type public.assigned_plan_status as enum ('active', 'archived');
create type public.pr_type as enum ('max_weight', 'e1rm');

-- ─────────────────────────────────────────────────────────────────────────────
-- uuid_generate_v7() — UUID v7 (48-bitowy timestamp ms + losowość, sortowalny czasowo)
-- Wersja i variant ustawiane bitowo na bazie gen_random_uuid() (v4).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.uuid_generate_v7()
returns uuid
language sql
volatile
set search_path = ''
as $$
  select encode(
    set_bit(
      set_bit(
        overlay(
          uuid_send(gen_random_uuid())
          placing substring(int8send((extract(epoch from clock_timestamp()) * 1000)::bigint) from 3)
          from 1 for 6
        ),
        50, 1   -- nibble wersji: 0100 -> 0110
      ),
      51, 1     -- 0110 -> 0111 = wersja 7
    ),
    'hex'
  )::uuid;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Generyczny trigger set_updated_at
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Schemat prywatny na helpery RLS — niedostępny przez Data API (PostgREST),
-- ale wywoływalny z wyrażeń polityk RLS przez authenticated/anon.
-- ─────────────────────────────────────────────────────────────────────────────

create schema if not exists private;

-- Helpery odwołują się do tabel (profiles, trainer_clients) tworzonych w KOLEJNYCH
-- migracjach. Funkcje `language sql` są walidowane przy CREATE (check_function_bodies),
-- więc bez tego wyłączenia migracja nie zaaplikuje się od zera. Referencje rozwiążą się
-- w czasie wykonania, gdy tabele już istnieją. `set local` = zasięg tej transakcji migracji.
set local check_function_bodies = off;

-- current_user_role(): rola zalogowanego użytkownika (z profiles).
create or replace function private.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

-- my_trainer_id(): trener zalogowanego klienta (przez trainer_clients).
create or replace function private.my_trainer_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select trainer_id from public.trainer_clients where client_id = (select auth.uid());
$$;

-- my_client_status(): status relacji zalogowanego klienta (active/archived/invited).
create or replace function private.my_client_status()
returns public.trainer_client_status
language sql
stable
security definer
set search_path = ''
as $$
  select status from public.trainer_clients where client_id = (select auth.uid());
$$;

-- is_trainer_of(client): czy zalogowany trener prowadzi danego klienta.
create or replace function private.is_trainer_of(target_client uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trainer_clients
    where trainer_id = (select auth.uid())
      and client_id = target_client
  );
$$;

-- Schemat `private` nie jest eksponowany przez API, ale role muszą móc wykonać
-- helpery wewnątrz wyrażeń RLS.
grant usage on schema private to authenticated, anon;
grant execute on function private.current_user_role() to authenticated, anon;
grant execute on function private.my_trainer_id() to authenticated, anon;
grant execute on function private.my_client_status() to authenticated, anon;
grant execute on function private.is_trainer_of(uuid) to authenticated, anon;
