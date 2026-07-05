# CLAUDE.md — Rozpiska

Platform connecting personal trainers with their clients (podopieczni). Trainer builds training plans from his own exercise bank and assigns them to clients; clients view the plan and log actual weights/reps during workouts. Polish market, Polish UI copy, English code.

## Source of truth

Read these before non-trivial work — they contain all decisions and rationale:

- `docs/architektura-techniczna.md` — stack, data model, RLS, offline strategy, decision log (§9)
- `docs/architektura-wizualna.md` — design tokens, two UX contexts, key screen states
- `docs/research-i-mvp-platforma-trenerska.md` — MVP scope; anything not in Etap 1 is OUT of scope unless Piotr says otherwise

If a task conflicts with these docs, stop and ask instead of improvising. If we make a new architectural decision in a session, append it to the decision log in `docs/architektura-techniczna.md` §9.

## Stack

Next.js 15 (App Router) + TypeScript strict · shadcn/ui + Tailwind CSS 4 · Supabase (Postgres, Auth, Realtime; region EU/Frankfurt) · TanStack Query · Zod · Dexie.js (offline queue, workout mode only) · Vitest + Playwright · Deploy: Vercel.

## Domain glossary (critical — mistakes here corrupt the data model)

- **Template vs assigned plan**: `plan_templates` are the trainer's reusable plans. Assigning a plan to a client performs a **deep copy** into `assigned_plans` (+ its whole tree) via a single Postgres function/transaction. Never reference template structure from an assignment. Editing an assignment must never touch the template or other clients.
- **plan_sets vs set_logs**: `plan_sets` = what was prescribed ("3 × 8–10 @ 80 kg"). `set_logs` = what actually happened. Separate tables, linked by optional `plan_set_id`. Extra sets → log without plan row; skipped sets → plan row without log. Compliance = comparison of the two.
- **set_logs are self-contained**: always store `exercise_id` + denormalized exercise name, weight, reps. History/charts read only from `set_logs` and must survive deletion/renaming of plans and exercises.
- Plan structure tree: plan → `plan_weeks` → `plan_days` → `plan_sections` (warmup | main | cooldown) → `plan_exercises` → `plan_sets`. Structure tables carry `template_id` XOR `assigned_plan_id` (CHECK constraint).
- Roles: `trainer` and `client` (one role per account in MVP). One client belongs to exactly one trainer (DB constraint). Archived client keeps **read-only** access to own history.

## Hard conventions

- **RLS-first**: every table gets Row Level Security policies in the same migration that creates it. Tenant isolation lives in Postgres, not in app code. Every migration that touches policies gets an RLS test.
- Migrations only as SQL files in `supabase/migrations/` — never via dashboard. After schema changes run `supabase gen types typescript` and commit the generated types.
- IDs: uuid v7, generated client-side where offline matters (set_logs during workouts).
- Soft delete via `archived_at` for exercises and plans; never hard-delete anything referenced by `set_logs`.
- Ordering via `position` (float) — reorder without rewriting siblings.
- Reps stored as `reps_min`/`reps_max` (equal when fixed). Units: kg only; `profiles.unit_preference` exists with default `'kg'`, no UI switch.
- `superset_group` column exists in schema; no builder UI for it in MVP.
- Multi-step writes (template→assignment copy, session completion) = Postgres functions called via RPC, atomic.
- `service_role` key: server-side only (route handlers / edge functions). Never in client bundles.
- Zod schemas are the single source for input validation, shared between forms and server.
- Domain logic (e1RM, compliance, plate math for PlateBar) lives in `lib/domain/` as pure functions with Vitest tests.

## UI rules (see docs/architektura-wizualna.md for full tokens)

- Two contexts: `(trainer)` routes = desktop-first, light default; `(client)` routes = mobile-first, **dark default**. Same token set, themed via shadcn CSS variables; never fork components per context.
- Design tokens from architektura-wizualna §3 go into globals (`:root` / `.dark`) — do not use default shadcn palette. Accent `--primary: #2353D9` (dark: `#3B6AF0`); plate data palette `plate-25/20/15/10/5`; `--gold` only for PR moments.
- Fonts: Barlow Condensed (display), Manrope (UI), IBM Plex Mono with `tabular-nums` for all workout numbers.
- Workout mode hard rules: touch targets ≥56px for set completion, inputs prefilled with last result, ±2.5 kg stepper, rest timer auto-starts on set completion, whole workout on one scrollable screen, offline banner never blocks (warning bar + per-log SyncBadge).
- Polish UI copy, "ty" form, no coach-speak, buttons name the action ("Zapisz serię", not "OK").
- Every interactive element keyboard-accessible with visible focus; color never the only signal.

## Build order (work milestone by milestone; do not skip ahead)

1. **M1 Foundation**: Next.js scaffold, Supabase project (EU), all core migrations + RLS + RLS integration tests, generated types, CI running tests.
2. **M2 Auth & invites**: magic link (default for clients) + password fallback, roles in `profiles`, invite flow (trainer creates invite → tokenized link → client signup activates `trainer_clients`), role-based routing middleware.
3. **M3 Exercise bank**: CRUD, tags (muscle group / equipment / movement pattern), YouTube link + technique note, Command-palette search, archive (soft delete).
4. **M4 Plan builder (templates)**: tree editor weeks→days→sections→exercises→sets, inline set editing (no modals), duplicate set/day/week, drag & drop via `position`.
5. **M5 Assignment**: `copy_template_to_assignment` Postgres function + tests, assign to client, edit assigned plan with the SAME builder component.
6. **M6 Client plan views**: `/plan` (full plan), `/today` (next workout), read-only, dark mobile UI.
7. **M7 Workout mode**: session start (snapshot + last logs), SetRow logging with optimistic UI, Dexie offline queue + sync, rest timer + wake lock, session summary (notes, mood 1–5). This is the most important screen in the product.
8. **M8 Trainer client view**: per-client history, compliance (done/missed), client notes, Realtime subscription ("training now" live view) with refetch-on-focus fallback.

Definition of done per milestone: migrations+RLS tests green, happy path covered by at least one Playwright test (M2, M5, M7), UI matches architektura-wizualna, Polish copy reviewed, works on 380px viewport (client screens).

## Commands

```
npm run dev              # local dev
npx supabase start       # local Supabase stack
npx supabase db reset    # re-run all migrations + seed
npx supabase gen types typescript --local > lib/supabase/types.ts
npm run test             # Vitest (domain + RLS)
npm run test:e2e         # Playwright
```

## Engineering workflow (universal rules)

### Git & branches

- `main` is protected and always deployable. Never commit directly to `main`, never force-push it.
- One short-lived branch per task: `feat/m4-plan-builder-dnd`, `fix/set-log-sync`, `chore/ci-playwright`. Branch from fresh `main`, merge within days, delete after merge. No long-lived develop branch.
- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, with milestone scope where useful (`feat(m7): offline queue flush on reconnect`). Small, atomic commits — one logical change each; commit message explains *why*, not just *what*.
- Every change lands through a PR, even solo: PR = CI gate + review checkpoint. PR description: what/why, how tested, screenshot or clip for UI changes (client screens at 380px). Before opening a PR, Claude Code performs a self-review of the diff against this file and `/docs`.
- Never commit: secrets, `.env*` (except `.env.example`), local Supabase state. Do commit: migrations, generated `lib/supabase/types.ts`, lockfile.

### Testing policy

- Test pyramid for this project: (1) Vitest unit tests for everything in `lib/domain/` — pure functions, aim high coverage here; (2) RLS integration tests for every table/policy (run against local Supabase) — these are security tests, they never get skipped; (3) Playwright E2E only for critical journeys: invite→signup, template→assignment copy, full workout logging incl. offline replay.
- New behavior ships with its test in the same PR. Bug fixes start with a failing test reproducing the bug.
- Before any commit run: `typecheck → lint → vitest`. Before merging a milestone: full suite including E2E. Never weaken or delete a failing test to make CI green — fix the code or explicitly discuss with Piotr.
- Flaky test = bug. Quarantine it in the same PR that discovers it and open a follow-up task; don't retry-loop CI.

### CI/CD (GitHub Actions + Vercel + Supabase)

- CI on every PR: install → `tsc --noEmit` → ESLint + Prettier check → Vitest → spin up `supabase start` → run migrations from scratch (`db reset`) → RLS tests. Playwright job runs on PRs labeled `e2e` and always before a production release.
- CI must prove migrations apply cleanly from zero — the migration chain is the schema's source of truth.
- CD: Vercel Preview deployment per PR (against a staging Supabase project), production deploy on merge to `main`.
- Database migration deploys are explicit, never implicit: a dedicated GitHub Action applies `supabase db push` to production **before** the app deploy that depends on it. Migrations must be backward-compatible with the currently deployed app (expand → migrate → contract pattern); destructive changes (drop/rename) require a two-step release.
- Environments: `local` (supabase start) → `staging` (preview) → `production` (EU project). Secrets live in GitHub/Vercel env settings only; `.env.example` documents every required variable.
- Versioning: tag production releases (`v0.x.y`) and keep a short human-readable CHANGELOG entry per release — it doubles as the update note for pilot trainers.

### When things break

- Production bug: branch from `main`, failing test first, minimal fix, fast-track PR. Rollback = redeploy previous Vercel build; DB rollbacks are forward-only (write a new corrective migration, never edit an applied one).
- Never edit a migration file that has been applied to staging/production. Local-only migrations may be squashed before first push.

## Working style

- Prefer small vertical slices (schema → RLS → query → UI) over horizontal layers.
- Seed data: realistic Polish strength-training content (e.g. "Przysiad ze sztangą", "Wiosłowanie hantlem", plan "Push A"), never lorem ipsum.
- When something is ambiguous and not covered by `/docs`, ask Piotr — do not invent product decisions (payments, chat, calendar, marketplace, integrations are explicitly out of MVP).