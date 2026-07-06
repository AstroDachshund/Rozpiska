-- M1 Foundation — relacja trener↔podopieczny oraz zaproszenia.
-- Aktywacja relacji przy rejestracji klienta (walidacja tokenu) należy do M2 (RPC).
-- W M1: tabele + RLS; seed relacji przez service_role.

-- ─────────────────────────────────────────────────────────────────────────────
-- trainer_clients — jeden klient należy do dokładnie jednego trenera (UNIQUE client_id).
-- ─────────────────────────────────────────────────────────────────────────────

create table public.trainer_clients (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  status public.trainer_client_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainer_clients_unique_client unique (client_id),
  constraint trainer_clients_no_self check (trainer_id <> client_id)
);

comment on table public.trainer_clients is 'Relacja trener↔podopieczny; klient zarchiwizowany zachowuje read-only dostęp (decyzja §9.4).';

create index trainer_clients_trainer_idx on public.trainer_clients (trainer_id);

create trigger trainer_clients_set_updated_at
  before update on public.trainer_clients
  for each row execute function public.set_updated_at();

alter table public.trainer_clients enable row level security;

-- Trener zarządza swoimi relacjami (odczyt + archiwizacja).
create policy "trainer_clients_trainer_all"
  on public.trainer_clients for all
  to authenticated
  using ((select auth.uid()) = trainer_id)
  with check ((select auth.uid()) = trainer_id);

-- Klient widzi własną relację (żeby poznać trenera i swój status).
create policy "trainer_clients_client_select_own"
  on public.trainer_clients for select
  to authenticated
  using ((select auth.uid()) = client_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- invites — zaproszenia tokenowe (pre-signup). Walidacja tokenu w M2 przez RPC.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.invites (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  email text not null,
  token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index invites_trainer_idx on public.invites (trainer_id);

alter table public.invites enable row level security;

-- Tylko trener widzi i zarządza swoimi zaproszeniami.
-- Odczyt po tokenie przy rejestracji (anon) obsłuży SECURITY DEFINER RPC w M2 — nie RLS.
create policy "invites_trainer_all"
  on public.invites for all
  to authenticated
  using ((select auth.uid()) = trainer_id)
  with check ((select auth.uid()) = trainer_id);
