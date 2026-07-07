-- M1 Foundation — sesje treningowe i logi serii (tryb treningu to M7; tu schemat + RLS).
-- set_logs są SAMOWYSTARCZALNE: niosą exercise_id + zdenormalizowaną nazwę/ciężar/reps,
-- więc historia przeżywa usunięcie/zmianę planów i ćwiczeń.
-- Klient zarchiwizowany: SELECT tak, INSERT/UPDATE/DELETE nie (decyzja §9.4).

-- ─────────────────────────────────────────────────────────────────────────────
-- Triggery dziedziczenia i niezmienności właściciela
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function private.workout_session_inherit_ownership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_trainer uuid;
  p_client uuid;
begin
  select trainer_id, client_id into p_trainer, p_client
  from public.assigned_plans where id = new.assigned_plan_id;
  if not found then
    raise exception 'workout_session: przypisanie % nie istnieje', new.assigned_plan_id;
  end if;

  if new.trainer_id is null then
    new.trainer_id := p_trainer;
  elsif new.trainer_id <> p_trainer then
    raise exception 'workout_session: trainer_id niezgodny z planem';
  end if;

  if new.client_id is null then
    new.client_id := p_client;
  elsif new.client_id <> p_client then
    raise exception 'workout_session: client_id niezgodny z planem';
  end if;

  return new;
end;
$$;

create or replace function public.workout_session_ownership_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.trainer_id is distinct from old.trainer_id
     or new.client_id is distinct from old.client_id
     or new.assigned_plan_id is distinct from old.assigned_plan_id then
    raise exception 'workout_session: trainer_id/client_id/assigned_plan_id są niezmienne';
  end if;
  return new;
end;
$$;

create or replace function private.set_log_inherit_ownership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_trainer uuid;
  p_client uuid;
begin
  select trainer_id, client_id into p_trainer, p_client
  from public.workout_sessions where id = new.workout_session_id;
  if not found then
    raise exception 'set_log: sesja % nie istnieje', new.workout_session_id;
  end if;

  if new.trainer_id is null then
    new.trainer_id := p_trainer;
  elsif new.trainer_id <> p_trainer then
    raise exception 'set_log: trainer_id niezgodny z sesją';
  end if;

  if new.client_id is null then
    new.client_id := p_client;
  elsif new.client_id <> p_client then
    raise exception 'set_log: client_id niezgodny z sesją';
  end if;

  return new;
end;
$$;

create or replace function public.set_log_ownership_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.trainer_id is distinct from old.trainer_id
     or new.client_id is distinct from old.client_id
     or new.workout_session_id is distinct from old.workout_session_id then
    raise exception 'set_log: trainer_id/client_id/workout_session_id są niezmienne';
  end if;
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- workout_sessions
-- ─────────────────────────────────────────────────────────────────────────────

create table public.workout_sessions (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  assigned_plan_id uuid not null references public.assigned_plans (id) on delete cascade,
  assigned_plan_day_id uuid references public.plan_days (id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  mood smallint check (mood between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workout_sessions_client_idx on public.workout_sessions (client_id);
create index workout_sessions_trainer_idx on public.workout_sessions (trainer_id);
create index workout_sessions_plan_idx on public.workout_sessions (assigned_plan_id);

create trigger workout_sessions_inherit_ownership
  before insert on public.workout_sessions
  for each row execute function private.workout_session_inherit_ownership();
create trigger workout_sessions_ownership_immutable
  before update on public.workout_sessions
  for each row execute function public.workout_session_ownership_immutable();
create trigger workout_sessions_set_updated_at
  before update on public.workout_sessions
  for each row execute function public.set_updated_at();

alter table public.workout_sessions enable row level security;

create policy "workout_sessions_trainer_select"
  on public.workout_sessions for select
  to authenticated
  using ((select auth.uid()) = trainer_id);

create policy "workout_sessions_client_select_own"
  on public.workout_sessions for select
  to authenticated
  using ((select auth.uid()) = client_id);

create policy "workout_sessions_client_insert"
  on public.workout_sessions for insert
  to authenticated
  with check (
    (select auth.uid()) = client_id
    and private.my_client_status() = 'active'
  );

create policy "workout_sessions_client_update_own"
  on public.workout_sessions for update
  to authenticated
  using (
    (select auth.uid()) = client_id
    and private.my_client_status() = 'active'
  )
  with check (
    (select auth.uid()) = client_id
    and private.my_client_status() = 'active'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- set_logs — faktycznie wykonane serie. id generowany po stronie klienta (uuid v7, offline).
-- ─────────────────────────────────────────────────────────────────────────────

create table public.set_logs (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  workout_session_id uuid not null references public.workout_sessions (id) on delete cascade,
  plan_set_id uuid references public.plan_sets (id) on delete set null,
  exercise_id uuid references public.exercises (id) on delete set null,
  exercise_name text not null,
  weight numeric(6, 2),
  reps smallint,
  rpe numeric(3, 1),
  is_completed boolean not null default true,
  completed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);
comment on table public.set_logs is 'Samowystarczalne: historia/wykresy czytają wyłącznie stąd, niezależnie od planów i ćwiczeń.';
create index set_logs_session_idx on public.set_logs (workout_session_id);
create index set_logs_client_idx on public.set_logs (client_id);
create index set_logs_trainer_idx on public.set_logs (trainer_id);
create index set_logs_exercise_idx on public.set_logs (exercise_id);

create trigger set_logs_inherit_ownership
  before insert on public.set_logs
  for each row execute function private.set_log_inherit_ownership();
create trigger set_logs_ownership_immutable
  before update on public.set_logs
  for each row execute function public.set_log_ownership_immutable();

alter table public.set_logs enable row level security;

create policy "set_logs_trainer_select"
  on public.set_logs for select
  to authenticated
  using ((select auth.uid()) = trainer_id);

create policy "set_logs_client_select_own"
  on public.set_logs for select
  to authenticated
  using ((select auth.uid()) = client_id);

create policy "set_logs_client_insert"
  on public.set_logs for insert
  to authenticated
  with check (
    (select auth.uid()) = client_id
    and private.my_client_status() = 'active'
  );

create policy "set_logs_client_update_own"
  on public.set_logs for update
  to authenticated
  using (
    (select auth.uid()) = client_id
    and private.my_client_status() = 'active'
  )
  with check (
    (select auth.uid()) = client_id
    and private.my_client_status() = 'active'
  );

create policy "set_logs_client_delete_own"
  on public.set_logs for delete
  to authenticated
  using (
    (select auth.uid()) = client_id
    and private.my_client_status() = 'active'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- personal_records — SZKIELET pod Etap 2 (auto-detekcja PR). Bez logiki w M1.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.personal_records (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  exercise_id uuid references public.exercises (id) on delete set null,
  exercise_name text not null,
  record_type public.pr_type not null,
  value numeric(6, 2) not null,
  achieved_at timestamptz not null default now(),
  set_log_id uuid references public.set_logs (id) on delete set null,
  created_at timestamptz not null default now()
);
create index personal_records_client_idx on public.personal_records (client_id);
create index personal_records_trainer_idx on public.personal_records (trainer_id);

alter table public.personal_records enable row level security;

-- Odczyt: klient własne, trener swoich klientów. Zapis dopiero w Etapie 2 (system/RPC).
create policy "personal_records_client_select_own"
  on public.personal_records for select
  to authenticated
  using ((select auth.uid()) = client_id);

create policy "personal_records_trainer_select"
  on public.personal_records for select
  to authenticated
  using ((select auth.uid()) = trainer_id);
