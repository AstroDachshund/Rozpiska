-- M1 Foundation — kontenery planów: szablon (trener) i instancja (kopia dla klienta).
-- Głęboka kopia szablon→instancja to funkcja copy_template_to_assignment w M5.
-- Tu tylko tabele-korzenie + RLS; drzewo struktury w kolejnej migracji.

-- ─────────────────────────────────────────────────────────────────────────────
-- plan_templates — wielorazowe szablony trenera. NIEWIDOCZNE dla klientów.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.plan_templates (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index plan_templates_trainer_idx on public.plan_templates (trainer_id);

create trigger plan_templates_set_updated_at
  before update on public.plan_templates
  for each row execute function public.set_updated_at();

alter table public.plan_templates enable row level security;

-- Tylko trener-właściciel. Brak jakiejkolwiek polityki dla klienta = szablony niewidoczne.
create policy "plan_templates_trainer_all"
  on public.plan_templates for all
  to authenticated
  using ((select auth.uid()) = trainer_id)
  with check ((select auth.uid()) = trainer_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- assigned_plans — plan przypisany klientowi (głęboka kopia szablonu).
-- source_template_id to WYŁĄCZNIE metadana proweniencji (nie referencja strukturalna).
-- ─────────────────────────────────────────────────────────────────────────────

create table public.assigned_plans (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  source_template_id uuid references public.plan_templates (id) on delete set null,
  name text not null,
  status public.assigned_plan_status not null default 'active',
  starts_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.assigned_plans.source_template_id is 'Tylko proweniencja; struktura instancji jest niezależną kopią.';

create index assigned_plans_trainer_idx on public.assigned_plans (trainer_id);
create index assigned_plans_client_idx on public.assigned_plans (client_id);

create trigger assigned_plans_set_updated_at
  before update on public.assigned_plans
  for each row execute function public.set_updated_at();

alter table public.assigned_plans enable row level security;

-- Trener: pełen dostęp do przypisań swoich klientów (edycja "w locie").
create policy "assigned_plans_trainer_all"
  on public.assigned_plans for all
  to authenticated
  using ((select auth.uid()) = trainer_id)
  with check ((select auth.uid()) = trainer_id);

-- Klient: odczyt własnych planów (także status 'archived' — read-only, decyzja §9.4).
create policy "assigned_plans_client_select_own"
  on public.assigned_plans for select
  to authenticated
  using ((select auth.uid()) = client_id);
