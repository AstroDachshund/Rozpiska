-- M1 Foundation — wspólne drzewo struktury planu (szablon XOR instancja).
-- plan_weeks → plan_days → plan_sections → plan_exercises → plan_sets.
--
-- Decyzja §9.9: każdy wiersz niesie zdenormalizowany trainer_id (NOT NULL) i
-- client_id (NULL dla szablonu, ustawiony dla instancji). Dzięki temu RLS to
-- prosta równość zamiast wspinaczki joinami po drzewie (gorąca ścieżka treningu).
-- Spójność wymuszają TRIGGERY (nie kod aplikacji):
--   * BEFORE INSERT — dziedziczy trainer_id/client_id/template_id/assigned_plan_id
--     z rodzica; jawnie podana, niezgodna wartość → wyjątek.
--   * BEFORE UPDATE — te kolumny są niezmienne.

-- ─────────────────────────────────────────────────────────────────────────────
-- Funkcje triggerów
-- ─────────────────────────────────────────────────────────────────────────────

-- Korzeń drzewa (plan_weeks): właściciel z plan_templates XOR assigned_plans.
create or replace function private.plan_weeks_inherit_ownership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_trainer uuid;
  p_client uuid;
begin
  if (new.template_id is not null) = (new.assigned_plan_id is not null) then
    raise exception 'plan_weeks: wymagany dokładnie jeden z template_id / assigned_plan_id';
  end if;

  if new.template_id is not null then
    select trainer_id into p_trainer from public.plan_templates where id = new.template_id;
    if not found then
      raise exception 'plan_weeks: szablon % nie istnieje', new.template_id;
    end if;
    p_client := null;
  else
    select trainer_id, client_id into p_trainer, p_client
    from public.assigned_plans where id = new.assigned_plan_id;
    if not found then
      raise exception 'plan_weeks: przypisanie % nie istnieje', new.assigned_plan_id;
    end if;
  end if;

  if new.trainer_id is null then
    new.trainer_id := p_trainer;
  elsif new.trainer_id <> p_trainer then
    raise exception 'plan_weeks: trainer_id % niezgodny z właścicielem planu %', new.trainer_id, p_trainer;
  end if;

  if new.client_id is null then
    new.client_id := p_client;
  elsif new.client_id is distinct from p_client then
    raise exception 'plan_weeks: client_id niezgodny z właścicielem planu';
  end if;

  return new;
end;
$$;

-- Węzły potomne (day/section/exercise/set): właściciel dziedziczony z rodzica.
-- TG_ARGV[0] = tabela rodzica, TG_ARGV[1] = kolumna FK w NEW.
create or replace function private.plan_structure_inherit_ownership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_table text := tg_argv[0];
  parent_fk_col text := tg_argv[1];
  parent_id uuid;
  p_trainer uuid;
  p_client uuid;
  p_template uuid;
  p_assigned uuid;
begin
  parent_id := (to_jsonb(new) ->> parent_fk_col)::uuid;
  if parent_id is null then
    raise exception 'plan_structure: brak wartości klucza obcego %', parent_fk_col;
  end if;

  execute format(
    'select trainer_id, client_id, template_id, assigned_plan_id from public.%I where id = $1',
    parent_table
  )
  into p_trainer, p_client, p_template, p_assigned
  using parent_id;

  if p_trainer is null then
    raise exception 'plan_structure: rodzic %.% nie istnieje', parent_table, parent_id;
  end if;

  if new.trainer_id is null then
    new.trainer_id := p_trainer;
  elsif new.trainer_id <> p_trainer then
    raise exception 'plan_structure: trainer_id % niezgodny z rodzicem %', new.trainer_id, p_trainer;
  end if;

  if new.client_id is null then
    new.client_id := p_client;
  elsif new.client_id is distinct from p_client then
    raise exception 'plan_structure: client_id % niezgodny z rodzicem %', new.client_id, p_client;
  end if;

  if new.template_id is null then
    new.template_id := p_template;
  elsif new.template_id is distinct from p_template then
    raise exception 'plan_structure: template_id niezgodny z rodzicem';
  end if;

  if new.assigned_plan_id is null then
    new.assigned_plan_id := p_assigned;
  elsif new.assigned_plan_id is distinct from p_assigned then
    raise exception 'plan_structure: assigned_plan_id niezgodny z rodzicem';
  end if;

  return new;
end;
$$;

-- Niezmienność kolumn właścicielskich przy UPDATE (wspólna dla wszystkich 6 tabel).
create or replace function public.plan_ownership_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.trainer_id is distinct from old.trainer_id
     or new.client_id is distinct from old.client_id
     or new.template_id is distinct from old.template_id
     or new.assigned_plan_id is distinct from old.assigned_plan_id then
    raise exception 'kolumny właścicielskie (trainer_id/client_id/template_id/assigned_plan_id) są niezmienne';
  end if;
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Wspólne fragmenty: kolumny właścicielskie + CHECK-i XOR i spójności klienta.
-- (Powtórzone inline w każdej tabeli — Postgres nie ma dziedziczenia kolumn tu sensownego.)
-- ─────────────────────────────────────────────────────────────────────────────

-- plan_weeks ──────────────────────────────────────────────────────────────────
create table public.plan_weeks (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid references public.profiles (id) on delete cascade,
  template_id uuid references public.plan_templates (id) on delete cascade,
  assigned_plan_id uuid references public.assigned_plans (id) on delete cascade,
  week_number integer not null,
  position double precision not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_weeks_parent_xor check ((template_id is not null) <> (assigned_plan_id is not null)),
  constraint plan_weeks_client_consistency check (
    (template_id is not null and client_id is null)
    or (assigned_plan_id is not null and client_id is not null)
  )
);
create index plan_weeks_template_idx on public.plan_weeks (template_id);
create index plan_weeks_assigned_idx on public.plan_weeks (assigned_plan_id);
create index plan_weeks_trainer_idx on public.plan_weeks (trainer_id);
create index plan_weeks_client_idx on public.plan_weeks (client_id);

create trigger plan_weeks_inherit_ownership
  before insert on public.plan_weeks
  for each row execute function private.plan_weeks_inherit_ownership();
create trigger plan_weeks_ownership_immutable
  before update on public.plan_weeks
  for each row execute function public.plan_ownership_immutable();
create trigger plan_weeks_set_updated_at
  before update on public.plan_weeks
  for each row execute function public.set_updated_at();

-- plan_days ───────────────────────────────────────────────────────────────────
create table public.plan_days (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid references public.profiles (id) on delete cascade,
  template_id uuid references public.plan_templates (id) on delete cascade,
  assigned_plan_id uuid references public.assigned_plans (id) on delete cascade,
  week_id uuid not null references public.plan_weeks (id) on delete cascade,
  name text not null,
  position double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_days_parent_xor check ((template_id is not null) <> (assigned_plan_id is not null)),
  constraint plan_days_client_consistency check (
    (template_id is not null and client_id is null)
    or (assigned_plan_id is not null and client_id is not null)
  )
);
create index plan_days_week_idx on public.plan_days (week_id);
create index plan_days_trainer_idx on public.plan_days (trainer_id);
create index plan_days_client_idx on public.plan_days (client_id);

create trigger plan_days_inherit_ownership
  before insert on public.plan_days
  for each row execute function private.plan_structure_inherit_ownership('plan_weeks', 'week_id');
create trigger plan_days_ownership_immutable
  before update on public.plan_days
  for each row execute function public.plan_ownership_immutable();
create trigger plan_days_set_updated_at
  before update on public.plan_days
  for each row execute function public.set_updated_at();

-- plan_sections ───────────────────────────────────────────────────────────────
create table public.plan_sections (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid references public.profiles (id) on delete cascade,
  template_id uuid references public.plan_templates (id) on delete cascade,
  assigned_plan_id uuid references public.assigned_plans (id) on delete cascade,
  day_id uuid not null references public.plan_days (id) on delete cascade,
  section_type public.plan_section_type not null,
  position double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_sections_parent_xor check ((template_id is not null) <> (assigned_plan_id is not null)),
  constraint plan_sections_client_consistency check (
    (template_id is not null and client_id is null)
    or (assigned_plan_id is not null and client_id is not null)
  )
);
create index plan_sections_day_idx on public.plan_sections (day_id);
create index plan_sections_trainer_idx on public.plan_sections (trainer_id);
create index plan_sections_client_idx on public.plan_sections (client_id);

create trigger plan_sections_inherit_ownership
  before insert on public.plan_sections
  for each row execute function private.plan_structure_inherit_ownership('plan_days', 'day_id');
create trigger plan_sections_ownership_immutable
  before update on public.plan_sections
  for each row execute function public.plan_ownership_immutable();
create trigger plan_sections_set_updated_at
  before update on public.plan_sections
  for each row execute function public.set_updated_at();

-- plan_exercises ──────────────────────────────────────────────────────────────
create table public.plan_exercises (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid references public.profiles (id) on delete cascade,
  template_id uuid references public.plan_templates (id) on delete cascade,
  assigned_plan_id uuid references public.assigned_plans (id) on delete cascade,
  section_id uuid not null references public.plan_sections (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  exercise_name text not null,
  trainer_note text,
  superset_group integer,
  position double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_exercises_parent_xor check ((template_id is not null) <> (assigned_plan_id is not null)),
  constraint plan_exercises_client_consistency check (
    (template_id is not null and client_id is null)
    or (assigned_plan_id is not null and client_id is not null)
  )
);
comment on column public.plan_exercises.exercise_name is 'Snapshot nazwy — zmiana nazwy w banku nie przepisuje planu.';
comment on column public.plan_exercises.superset_group is 'Kolumna w schemacie od M1; UI grupowania supersetów w Etapie 2 (§9.7).';
create index plan_exercises_section_idx on public.plan_exercises (section_id);
create index plan_exercises_exercise_idx on public.plan_exercises (exercise_id);
create index plan_exercises_trainer_idx on public.plan_exercises (trainer_id);
create index plan_exercises_client_idx on public.plan_exercises (client_id);

create trigger plan_exercises_inherit_ownership
  before insert on public.plan_exercises
  for each row execute function private.plan_structure_inherit_ownership('plan_sections', 'section_id');
create trigger plan_exercises_ownership_immutable
  before update on public.plan_exercises
  for each row execute function public.plan_ownership_immutable();
create trigger plan_exercises_set_updated_at
  before update on public.plan_exercises
  for each row execute function public.set_updated_at();

-- plan_sets ───────────────────────────────────────────────────────────────────
create table public.plan_sets (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid references public.profiles (id) on delete cascade,
  template_id uuid references public.plan_templates (id) on delete cascade,
  assigned_plan_id uuid references public.assigned_plans (id) on delete cascade,
  plan_exercise_id uuid not null references public.plan_exercises (id) on delete cascade,
  set_number integer not null,
  reps_min smallint,
  reps_max smallint,
  target_weight numeric(6, 2),
  target_rpe numeric(3, 1),
  rest_seconds integer,
  position double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_sets_parent_xor check ((template_id is not null) <> (assigned_plan_id is not null)),
  constraint plan_sets_client_consistency check (
    (template_id is not null and client_id is null)
    or (assigned_plan_id is not null and client_id is not null)
  ),
  constraint plan_sets_reps_order check (reps_min is null or reps_max is null or reps_max >= reps_min)
);
comment on column public.plan_sets.reps_min is 'Para reps_min/reps_max: równe przy stałej wartości ("8" = 8/8), różne przy zakresie ("8–10").';
create index plan_sets_exercise_idx on public.plan_sets (plan_exercise_id);
create index plan_sets_trainer_idx on public.plan_sets (trainer_id);
create index plan_sets_client_idx on public.plan_sets (client_id);

create trigger plan_sets_inherit_ownership
  before insert on public.plan_sets
  for each row execute function private.plan_structure_inherit_ownership('plan_exercises', 'plan_exercise_id');
create trigger plan_sets_ownership_immutable
  before update on public.plan_sets
  for each row execute function public.plan_ownership_immutable();
create trigger plan_sets_set_updated_at
  before update on public.plan_sets
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — jednolite dla całego drzewa dzięki denormalizacji.
-- Trener: pełen dostęp do swojego drzewa. Klient: odczyt tylko wierszy instancji
-- (client_id = uid); wiersze szablonu mają client_id = NULL → niewidoczne dla klienta.
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array['plan_weeks', 'plan_days', 'plan_sections', 'plan_exercises', 'plan_sets']
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format($p$
      create policy "%1$s_trainer_all" on public.%1$I
        for all to authenticated
        using ((select auth.uid()) = trainer_id)
        with check ((select auth.uid()) = trainer_id)
    $p$, t);

    execute format($p$
      create policy "%1$s_client_select" on public.%1$I
        for select to authenticated
        using ((select auth.uid()) = client_id)
    $p$, t);
  end loop;
end;
$$;
