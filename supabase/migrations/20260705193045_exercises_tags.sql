-- M1 Foundation — bank ćwiczeń trenera + tagi. Pełny CRUD to M3; tu schemat + RLS.
-- Soft delete przez archived_at (nic, do czego odwołuje się historia, nie znika).

-- ─────────────────────────────────────────────────────────────────────────────
-- exercises
-- ─────────────────────────────────────────────────────────────────────────────

create table public.exercises (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  technique_note text,
  youtube_url text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exercises_trainer_idx on public.exercises (trainer_id);

create trigger exercises_set_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

alter table public.exercises enable row level security;

-- Trener: pełny CRUD na swoich ćwiczeniach.
create policy "exercises_trainer_all"
  on public.exercises for all
  to authenticated
  using ((select auth.uid()) = trainer_id)
  with check ((select auth.uid()) = trainer_id);

-- Klient: odczyt ćwiczeń swojego trenera (podgląd wideo/notatki technicznej,
-- także dla ćwiczeń zarchiwizowanych obecnych w starszych planach).
create policy "exercises_client_select_trainer_bank"
  on public.exercises for select
  to authenticated
  using (trainer_id = private.my_trainer_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- exercise_tags — tagi trenera (partia mięśniowa / sprzęt / wzorzec ruchowy).
-- ─────────────────────────────────────────────────────────────────────────────

create table public.exercise_tags (
  id uuid primary key default public.uuid_generate_v7(),
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('muscle_group', 'equipment', 'movement_pattern')),
  name text not null,
  created_at timestamptz not null default now(),
  constraint exercise_tags_unique unique (trainer_id, category, name)
);

create index exercise_tags_trainer_idx on public.exercise_tags (trainer_id);

alter table public.exercise_tags enable row level security;

create policy "exercise_tags_trainer_all"
  on public.exercise_tags for all
  to authenticated
  using ((select auth.uid()) = trainer_id)
  with check ((select auth.uid()) = trainer_id);

create policy "exercise_tags_client_select_trainer"
  on public.exercise_tags for select
  to authenticated
  using (trainer_id = private.my_trainer_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- exercise_tag_links — M:N ćwiczenie↔tag. Właściciel wynika z rodzica (exercises).
-- ─────────────────────────────────────────────────────────────────────────────

create table public.exercise_tag_links (
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  tag_id uuid not null references public.exercise_tags (id) on delete cascade,
  primary key (exercise_id, tag_id)
);

create index exercise_tag_links_tag_idx on public.exercise_tag_links (tag_id);

alter table public.exercise_tag_links enable row level security;

-- Trener zarządza powiązaniami swoich ćwiczeń (własność przez rodzica).
create policy "exercise_tag_links_trainer_all"
  on public.exercise_tag_links for all
  to authenticated
  using (
    exists (
      select 1 from public.exercises e
      where e.id = exercise_tag_links.exercise_id
        and e.trainer_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.exercises e
      where e.id = exercise_tag_links.exercise_id
        and e.trainer_id = (select auth.uid())
    )
  );

-- Klient: odczyt powiązań ćwiczeń swojego trenera (render chipów tagów).
create policy "exercise_tag_links_client_select"
  on public.exercise_tag_links for select
  to authenticated
  using (
    exists (
      select 1 from public.exercises e
      where e.id = exercise_tag_links.exercise_id
        and e.trainer_id = private.my_trainer_id()
    )
  );
