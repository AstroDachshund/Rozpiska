-- M1 Foundation — profile użytkowników (1:1 z auth.users).
-- Tworzenie profilu przy rejestracji (invite flow) należy do M2 — tu tylko tabela + RLS.
-- W M1 seedujemy profile przez service_role (bypass RLS).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  unit_preference text not null default 'kg' check (unit_preference in ('kg', 'lb')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil 1:1 z auth.users; jedna rola na konto w MVP.';
comment on column public.profiles.unit_preference is 'MVP: tylko kg (brak UI przełącznika); kolumna pod przyszłe lb.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Rola jest niezmienna po utworzeniu — inaczej klient mógłby przez UPDATE własnego
-- profilu awansować się na trenera (eskalacja uprawnień). Zmiana roli tylko przez
-- migrację / bezpośredni dostęp DBA.
create or replace function public.profiles_role_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'profiles.role jest niezmienne (próba zmiany % -> %)', old.role, new.role;
  end if;
  return new;
end;
$$;

create trigger profiles_role_immutable
  before update on public.profiles
  for each row execute function public.profiles_role_immutable();

alter table public.profiles enable row level security;

-- SELECT: własny profil.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- SELECT: trener widzi profile swoich podopiecznych.
create policy "profiles_select_trainer_reads_clients"
  on public.profiles for select
  to authenticated
  using (private.is_trainer_of(id));

-- SELECT: klient widzi profil swojego trenera (imię przy planie).
create policy "profiles_select_client_reads_trainer"
  on public.profiles for select
  to authenticated
  using (id = private.my_trainer_id());

-- UPDATE: własny profil (bez zmiany id).
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Brak polityk INSERT/DELETE dla authenticated: tworzenie profilu odbywa się
-- przez service_role / SECURITY DEFINER RPC w M2 (invite flow).
