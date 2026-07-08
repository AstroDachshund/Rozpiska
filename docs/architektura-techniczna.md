# Architektura techniczna — platforma trener ↔ podopieczny

Wersja: 0.1 (draft do iteracji) · Zakres: MVP (Etap 1) z myślą o Etapach 2–4
Konwencja: nazwy w kodzie i schemacie po angielsku, dokumentacja po polsku.

---

## 1. Założenia i wymagania niefunkcjonalne

Wymagania wyprowadzone z dokumentu researchowego:

- **Solo developer + Claude Code** → stack musi minimalizować liczbę ruchomych części (jeden język, jeden framework, backend "kupiony", nie pisany).
- **Real-time**: trener widzi logi podopiecznego bez odświeżania; zmiany w planie widoczne u klienta od razu.
- **Mobile-first dla podopiecznego, desktop-first dla trenera** — jeden codebase, dwa konteksty UX.
- **Offline-tolerance**: logowanie serii na siłowni z kiepskim zasięgiem nie może gubić danych (to najczęstszy powód złych recenzji konkurencji: "straciłem cały wypełniony trening").
- **Multi-tenancy**: dane trenera A niewidoczne dla trenera B; podopieczny widzi tylko swoje.
- **RODO**: dane o treningu/samopoczuciu mogą być danymi o zdrowiu → hosting w UE, prawo do usunięcia konta, minimalizacja danych.
- **Koszt stały bliski zera** do momentu pierwszych płacących trenerów.
- **Ścieżka rozwoju**: PWA teraz, bez zamykania drogi do apki natywnej (Etap 4) — stąd cała logika w API/bazie, nie w kliencie.

---

## 2. Stack — decyzje i uzasadnienie

| Warstwa | Decyzja | Uzasadnienie / odrzucone alternatywy |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Jeden projekt = frontend + API routes + SSR. Świetnie wspierany przez Claude Code i shadcn/ui (komponenty są pisane pod React Server Components). Alternatywa Vite+SPA+osobny backend odrzucona: dwa deploye, dwa repo-konteksty, więcej pracy solo. |
| UI | **shadcn/ui + Tailwind CSS 4** | Zgodnie z założeniem projektu (Claude Design). Komponenty kopiowane do repo = pełna kontrola, brak lock-inu. |
| Backend / baza | **Supabase (Postgres + Auth + Realtime + Storage), region EU (Frankfurt)** | Załatwia jednym produktem: auth z rolami, Row Level Security (multi-tenancy na poziomie bazy), realtime (subskrypcje na zmiany w tabelach → "real-time insights" za darmo), storage (media w Etapie 3). Free tier wystarczy na MVP i pilotaż. Alternatywy: własny backend Nest/Fastify (za dużo utrzymania solo), Firebase (NoSQL utrudnia relacyjny model planów, gorzej z RODO/EU). |
| ORM / dostęp do danych | **Supabase JS client + typy generowane z bazy** (`supabase gen types`) | Mniej warstw niż Prisma/Drizzle; RLS wymusza bezpieczeństwo nawet przy zapytaniach z klienta. Drizzle można dodać później, jeśli zapytania się skomplikują. |
| Stan / dane po stronie klienta | **TanStack Query** + subskrypcje Supabase Realtime | Cache, retry, optimistic updates (kluczowe dla logowania serii), invalidacja po evencie realtime. |
| Offline | **Dexie.js (IndexedDB) jako kolejka zapisu** dla trybu treningu | Szczegóły w §7. Świadomie NIE robimy pełnego offline-first całej aplikacji — tylko krytycznej ścieżki (aktywny trening). |
| PWA | next-pwa / Serwis Worker: precache shellu + manifest | Instalowalna na telefonie podopiecznego; push notifications (Web Push) dopiero w Etapie 2. |
| Walidacja | **Zod** (schematy współdzielone między formularzami a API) | Jedno źródło prawdy dla typów wejściowych. |
| Hosting frontu | **Vercel** (free/hobby na start) | Naturalny dla Next.js; alternatywnie Cloudflare Pages, jeśli zależy na EU-only edge. |
| Monitoring | Sentry (free tier) + logi Supabase | Od pierwszego dnia — solo developer nie ma czasu na debugowanie w ciemno. |
| Testy | Vitest (logika: progresja, 1RM, mapowanie planu) + Playwright (2–3 krytyczne ścieżki E2E) | Minimalny, ale realny zestaw. |

**Estymowany koszt stały MVP: 0 zł/mies.** (free tiery) → ~25 USD/mies. po przejściu na Supabase Pro (potrzebny m.in. dla codziennych backupów i braku pauzowania projektu).

---

## 3. Model danych (serce systemu)

### 3.1 Kluczowa decyzja: szablon vs instancja planu

Największy błąd projektowy, jaki można tu popełnić, to jedna tabela "plans" współdzielona przez szablony i plany przypisane. Rozdzielamy:

- **Szablon** (`plan_templates` + struktura) — własność trenera, wielokrotnego użytku, edycja nie dotyka klientów.
- **Instancja** (`assigned_plans` + struktura) — **głęboka kopia** szablonu w momencie przypisania do podopiecznego. Trener edytuje instancję "w locie" bez wpływu na szablon i innych klientów.

Kopiowanie (a nie referencja) kosztuje trochę miejsca, ale eliminuje całą klasę bugów ("zmieniłem plan Kasi i rozjechało się Tomkowi") i upraszcza wersjonowanie. Miejsce w Postgresie jest tanie.

Ta sama zasada dotyczy ćwiczeń w planie: wiersz planu trzyma **referencję do ćwiczenia** (`exercise_id`) dla historii/statystyk, ale też **snapshot nazwy** — żeby zmiana nazwy ćwiczenia w banku nie przepisywała historii treningów.

### 3.2 Encje

```
profiles            – 1:1 z auth.users; role: 'trainer' | 'client'
trainer_clients     – relacja trener↔podopieczny (status: invited/active/archived)
invites             – zaproszenia (token, e-mail, expires_at)

exercises           – bank ćwiczeń trenera
exercise_tags       – tagi (partia mięśniowa, sprzęt, wzorzec ruchowy)
exercise_tag_links  – M:N ćwiczenie↔tag

plan_templates      – szablony planów (trener)
assigned_plans      – plany przypisane (kopia; klient, daty, status)
plan_weeks          – tygodnie (należą do szablonu LUB instancji – patrz 3.4)
plan_days           – dni treningowe w tygodniu (nazwa: "Push A", kolejność)
plan_sections       – sekcje dnia: warmup / main / cooldown (kolejność)
plan_exercises      – ćwiczenie w sekcji: exercise_id, snapshot nazwy,
                      kolejność, notatka trenera, superset_group
plan_sets           – zaplanowane serie: numer, reps (lub zakres "8–10"),
                      target_weight?, target_rpe?, rest_seconds?

workout_sessions    – rozpoczęty/ukończony trening klienta
                      (assigned_plan_day_id, started_at, completed_at, notatka, samopoczucie)
set_logs            – FAKTYCZNIE wykonana seria: plan_set_id?, exercise_id,
                      weight, reps, rpe?, completed_at, notatka
personal_records    – (Etap 2, ale warto mieć od razu) exercise_id, typ (max weight / e1RM), wartość, data
```

### 3.3 Zasady projektowe

1. **Plan mówi "co miało być", log mówi "co było".** `plan_sets` (target) i `set_logs` (actual) to osobne tabele połączone opcjonalnym `plan_set_id`. Dzięki temu: klient może zrobić dodatkową serię (log bez planu), pominąć serię (plan bez loga), a compliance liczy się prostym porównaniem.
2. **`set_logs` zawsze ma `exercise_id` i wartości zdenormalizowane** (nazwa, ciężar, powtórzenia) — historia i wykresy progresu (Etap 2) czytają wyłącznie z `set_logs`, niezależnie od tego, czy plan/ćwiczenie jeszcze istnieje.
3. **Reps jako para `reps_min`/`reps_max`** (dla "8–10"), przy stałej wartości min=max. Prostsze niż parsowanie stringów, gotowe pod przyszłe programowanie procentowe.
4. **Soft delete** (`archived_at`) dla ćwiczeń i planów — nic, do czego odwołuje się historia, nie znika fizycznie.
5. **Kolejność przez kolumnę `position` (float lub int z przerwami)** — drag&drop w kreatorze bez przepisywania całej listy.
6. **ID: uuid v7** (sortowalne czasowo) — ułatwia offline: klient generuje ID lokalnie, brak konfliktów przy synchronizacji.

### 3.4 Szablon vs instancja — implementacja

Dwie opcje; rekomendacja: **opcja A**.

- **Opcja A (rekomendowana): wspólne tabele struktury** (`plan_weeks/days/sections/exercises/sets`) z parą kolumn `template_id` XOR `assigned_plan_id` (CHECK constraint: dokładnie jedna wypełniona). Jedna logika kreatora obsługuje oba konteksty — kreator to najdroższy UI w projekcie, nie chcemy go pisać dwa razy. Przypisanie planu = funkcja Postgres (`copy_template_to_assignment`) wykonująca głęboką kopię w jednej transakcji.
- Opcja B: całkowicie osobne drzewa tabel — czystsza teoretycznie, ale duplikuje kreator i zapytania. Odrzucona.

### 3.5 Multi-tenancy: Row Level Security

Cała izolacja danych w RLS na poziomie Postgresa (nie w kodzie aplikacji):

- Trener: pełny dostęp do wierszy, gdzie `trainer_id = auth.uid()`.
- Podopieczny: `SELECT` na swoich `assigned_plans` (+ struktura przez join), `INSERT/UPDATE` na własnych `workout_sessions` i `set_logs`, `SELECT` na ćwiczeniach swojego trenera (potrzebny podgląd wideo/notatek).
- Podopieczny **nie widzi**: szablonów, innych klientów, notatek trenera oznaczonych jako prywatne (`is_private` na notatkach klienta u trenera).

Testy RLS jako testy integracyjne od pierwszej migracji — to fundament bezpieczeństwa, a bug tutaj = incydent RODO.

---

## 4. Architektura aplikacji

### 4.1 Struktura (jedno repo, jedna apka Next.js)

```
/app
  /(auth)          – login, rejestracja, akceptacja zaproszenia
  /(trainer)       – panel trenera (desktop-first)
    /clients, /clients/[id]
    /exercises
    /templates, /templates/[id]/edit   ← kreator
    /plans/[id]/edit                   ← edycja instancji (ten sam kreator)
  /(client)        – apka podopiecznego (mobile-first)
    /plan          – podgląd całego planu
    /today         – dzisiejszy trening
    /workout/[sessionId] – tryb treningu (offline-capable)
    /history
/components
  /ui              – shadcn/ui
  /plan-builder    – kreator (współdzielony szablon/instancja)
  /workout         – tryb treningu, timer, logger serii
/lib
  /supabase        – klienty (browser/server), typy generowane
  /domain          – czysta logika: e1RM, compliance, progresja (testowana Vitest)
  /offline         – kolejka Dexie + sync
/supabase
  /migrations      – SQL, wersjonowane w git
  /tests           – testy RLS
```

Routing po roli: middleware czyta rolę z sesji i pilnuje granicy `(trainer)`/`(client)`. Jedno konto = jedna rola w MVP (trener, który sam trenuje u kogoś — edge case, odkładamy; w razie czego drugie konto).

### 4.2 Przepływ danych

- Odczyt: Server Components + TanStack Query na kliencie tam, gdzie dane żyją (tryb treningu, dashboard trenera).
- Zapis: mutacje przez Supabase client (RLS chroni), operacje wieloetapowe (kopiowanie szablonu, zakończenie sesji) przez funkcje Postgres (RPC) — atomowość w jednej transakcji.
- Realtime: subskrypcja `set_logs`/`workout_sessions` per klient w panelu trenera ("Kasia właśnie trenuje — żywy podgląd"), subskrypcja struktury planu u klienta (zmiany trenera "w locie"). Fallback: refetch on focus — realtime jest nice-to-have, nie może być single point of failure.

### 4.3 Tryb treningu — najważniejszy ekran produktu

Wymagania: działa przy słabym zasięgu, duże przyciski, zero utraty danych.

Mechanika: start sesji tworzy `workout_session` i pobiera cały plan dnia + ostatnie logi ("ostatnio: 80 kg × 8") do stanu lokalnego. Każde odhaczenie serii: zapis natychmiast do Dexie (kolejka) → próba wysyłki do Supabase → sukces oznacza wpis jako zsynchronizowany. UI zawsze odpowiada natychmiast (optimistic). Wskaźnik "offline — dane zapisane lokalnie" zamiast blokowania.

---

## 5. Autentykacja, zaproszenia, cykl życia klienta

- Supabase Auth: e-mail+hasło oraz magic link (podopieczni nie-techniczni). Google OAuth — nice-to-have.
- Onboarding podopiecznego: trener dodaje klienta → rekord `invites` z tokenem → link (e-mail lub skopiowany do Messengera — realny kanał!) → rejestracja pod tokenem tworzy `profile(role=client)` + aktywuje `trainer_clients`.
- Archiwizacja klienta: koniec współpracy → `archived` (dane zostają, dostęp klienta do planu read-only lub odcięty — decyzja produktowa, patrz §9).
- MVP: 1 podopieczny ↔ 1 trener (constraint w bazie). Relacja M:N (klient z dwoma trenerami) to komplikacja, na którą nie ma dowodu popytu.

---

## 6. Web push / powiadomienia (Etap 2 — projektujemy z wyprzedzeniem)

Web Push API działa w PWA na Androidzie i od iOS 16.4 na iPhonie (wymaga instalacji na ekranie głównym). Tabela `push_subscriptions` + wysyłka z funkcji Edge (cron: przypomnienie o treningu). W MVP jedynie projekt tabeli — zero implementacji.

## 7. Offline — zakres świadomie ograniczony

Offline-first całej aplikacji to pułapka złożoności (konflikty edycji planu itd.). Zakres offline w MVP wyłącznie:

1. **Aktywny trening** (opisany w §4.3) — pełne wsparcie.
2. Cache ostatnio otwartego planu (stale-while-revalidate) — podgląd działa w piwnicy siłowni.

Kreator planów trenera: tylko online. Konflikt "trener edytował dzień, który klient właśnie trenuje": logi odnoszą się do snapshotu pobranego przy starcie sesji — sesja dokańcza się na starej wersji, kolejna pobierze nową. Zero merge'owania.

## 8. Bezpieczeństwo i RODO

- Region danych: EU (Supabase Frankfurt). Vercel: funkcje w regionie fra1.
- Dane minimalne: e-mail, imię, dane treningowe. Bez PESEL, bez danych medycznych jako pól strukturalnych (notatka wolnotekstowa "boli kolano" i tak może być daną zdrowotną → traktujemy całość jak dane wrażliwe: TLS, RLS, backupy szyfrowane).
- Prawo do usunięcia: funkcja "usuń konto" od MVP (kaskadowe usunięcie / anonimizacja logów, których trener potrzebuje do statystyk — do decyzji z prawnikiem przy komercjalizacji).
- Role service_role key wyłącznie po stronie serwera (API routes/Edge Functions), nigdy w kliencie.
- Rejestr czynności przetwarzania + polityka prywatności — przed wpuszczeniem pierwszego obcego trenera (nie przed pilotażem z własnym trenerem).

## 9. Dziennik decyzji (rozstrzygnięte 07.2026)

1. **Stack**: Next.js + Supabase (EU) — ZATWIERDZONE.
2. **Szablon → instancja jako głęboka kopia** — ZATWIERDZONE.
3. **Offline ograniczony do aktywnego treningu** — ZATWIERDZONE.
4. **Archiwizowany klient**: zachowuje dostęp **read-only** do swojej historii i planów (RLS: SELECT dozwolony przy statusie `archived`, INSERT/UPDATE na sesjach i logach zablokowany).
5. **Jednostki**: wyłącznie **kg** w MVP. Pole `unit_preference` w `profiles` dodane od razu (default `kg`), UI przełącznika brak.
6. **Magic link** jako domyślna metoda logowania podopiecznego (hasło jako fallback). Do obserwacji na pilotażu.
7. **Superset**: kolumna `superset_group` w schemacie od pierwszej migracji; UI grupowania w kreatorze — Etap 2. (Trener może tymczasowo oznaczyć superset w notatce do ćwiczenia.)
8. **Nazwa robocza: „Rozpiska"** (do weryfikacji domeny, Instagrama i znaku towarowego UPRP/EUIPO przed deployem pilotażu). Repo, manifest PWA i konfiguracja dev jadą pod tą nazwą; zmiana przed publicznym startem to koszt ~1 h (rename + redirect URLs).
9. **Denormalizacja właściciela na drzewie struktury i logach** (rozstrzygnięte w M1) — tabele `plan_weeks/days/sections/exercises/sets` oraz `set_logs` niosą zdenormalizowany `trainer_id` (NOT NULL) i `client_id` (nullable: NULL dla wierszy szablonu, ustawiony dla instancji/logów). Motyw: polityki RLS w gorącej ścieżce trybu treningu to prosta równość zamiast wspinaczki joinami po drzewie do korzenia. **Spójność wymuszają triggery Postgres, nie kod aplikacji**: trigger `BEFORE INSERT` dziedziczy `trainer_id`/`client_id` z rodzica (lub z `plan_templates`/`assigned_plans` dla korzenia drzewa) i odrzuca wiersz, jeśli podane wartości są niezgodne z rodzicem; trigger `BEFORE UPDATE` zabrania zmiany tych kolumn (immutable ownership). Koszt: nieco miejsca + dyscyplina w funkcji kopiującej (M5). Odrzucona alternatywa: helpery `SECURITY DEFINER` wspinające się po drzewie — czystszy schemat, ale wolniejsze RLS na najczęstszym zapytaniu produktu.
10. **`push_subscriptions` całkowicie poza MVP** (korekta §6) — w M1 nie tworzymy nawet szkieletu tabeli. §6 opisuje docelowy projekt na Etap 2; tabela powstanie migracją dopiero wtedy, razem z implementacją Web Push. Powód: zero martwego schematu w bazie, którego nikt w MVP nie dotyka.
11. **`check_function_bodies = off` dla helperów RLS z forward-referencją** (rozstrzygnięte przy weryfikacji M1) — helpery RLS w schemacie `private` (`current_user_role`, `my_trainer_id`, `my_client_status`, `is_trainer_of`) są `language sql` i odwołują się do tabel `public.profiles`/`public.trainer_clients`, które powstają w **kolejnych** migracjach. Domyślne `check_function_bodies = on` waliduje ciało funkcji `sql` przy `CREATE`, więc pierwsza migracja (`20260705193042_enums_and_helpers.sql`) nie aplikowała się od zera (`relation "public.profiles" does not exist`). Rozwiązanie: `set local check_function_bodies = off;` przed definicjami tych funkcji — referencje rozwiążą się w runtime, gdy tabele już istnieją, a `set local` ogranicza zmianę do transakcji migracji (CLI opakowuje każdy plik w transakcję). Odrzucone alternatywy: (a) reorder migracji — niemożliwy, bo polityki RLS `profiles` (mig. 43) wołają helpery, które czytają `trainer_clients` (mig. 44), a `trainer_clients` ma FK do `profiles` — cykliczna zależność; (b) przepisanie helperów na `plpgsql` — `plpgsql` odracza rozwiązywanie nazw do runtime, ale traci walidację i czytelność. Uwaga: dotyczy tylko funkcji `language sql`; triggery `plpgsql` (dziedziczenie właściciela) forward-referencji nie wymagają wyłączenia. Wynik weryfikacji M1 (2026-07-06, Postgres 17.6): 7 migracji aplikuje się od zera, 16 tabel z RLS (37 policy), pełna macierz izolacji tenantów przechodzi. Dodatkowo (hardening po `get_advisors`): wszystkie funkcje w `public` (`uuid_generate_v7`, `set_updated_at`, 4 triggery `*_immutable`) dostały `set search_path = ''` — spójnie z helperami `private.*`; jedyny pozostały WARN dotyczy `public.rls_auto_enable()`, preexisting event-triggera projektu spoza M1.
12. **Jawne granty ról API zamiast polegania na domyślnych przywilejach hosta** (rozstrzygnięte przy uruchamianiu suite RLS w CI) — tabele w `public` należą do roli `postgres`. Hostowany Supabase konfiguruje ADP (`ALTER DEFAULT PRIVILEGES`) roli `postgres` tak, że nowe tabele od razu dają `anon/authenticated/service_role` pełne DML. **Lokalny stack CLI robi to inaczej**: ADP roli `postgres` nadaje tym rolom tylko `Dxtm` (TRUNCATE/REFERENCES/TRIGGER/MAINTAIN), bez SELECT/INSERT/UPDATE/DELETE (pełne DML ma dopiero ADP roli `supabase_admin`). Efekt: lokalnie i w CI `service_role` (oraz `authenticated`) dostawał `permission denied for table profiles` — schemat milcząco zależał od konfiguracji tylko-hostowanej. Rozwiązanie: migracja `20260707065729_grant_api_roles.sql` nadaje granty jawnie (`grant all on all tables/sequences in schema public to anon, authenticated, service_role` + ADP na przyszłe tabele). RLS pozostaje jedynym strażnikiem wierszy (anon bez policy = 0 wierszy). **Lekcja procesowa**: weryfikacja RLS przez `execute_sql` po stronie MCP działa jako superuser i omija granty — nie łapie tej klasy błędów; łapie ją dopiero suite vitest uruchomiona jako role API (lokalnie przez Docker/OrbStack albo w CI). Od M2 każda migracja tworząca tabelę dziedziczy granty z ustawionego tu ADP.
13. **`@supabase/ssr` podniesiony do `^0.12.0`** (rozstrzygnięte w S2.1, M2 — pierwsze realne typowane zapytanie klienta) — M1 przypiął `@supabase/ssr ^0.5.2` obok `@supabase/supabase-js ^2.48.1`, ale zainstalowany `supabase-js` rozwiązuje się do 2.110. `createServerClient`/`createBrowserClient` z 0.5.2 deklarują zwrot w **starej kolejności 3 generyków** (`SupabaseClient<Database, SchemaName, Schema>`); nowsza sygnatura `supabase-js` 2.x reinterpretuje 3. argument pozycyjny, przez co **każdy `.from(...).select(...)` typuje się jako `never`**. W M1 problem był utajony — dopiero `getSessionContext()` i odczyt roli w akcji logowania (S2.1) wykonują pierwsze typowane zapytanie i go ujawniły. Rozwiązanie: podniesienie `@supabase/ssr` do `0.12.0` (peer `@supabase/supabase-js ^2.108.0`, zgodny z zainstalowanym 2.110) — generyki się zgadzają, `server.ts` i `client.ts` typują się bez żadnego rzutowania. Odrzucone alternatywy: (a) rzutowanie `as unknown as SupabaseClient<Database>` — plaster, wymagałby powielenia w obu klientach i maskuje typy; (b) przypięcie `supabase-js` w dół do ~2.49 — zamraża pakiet, traci poprawki i kłóci się z zakresem `^2.48.1` oraz `supabase-js` używanym przez CLI. API cookies (`getAll`/`setAll`), którego używamy, jest niezmienione między 0.5 a 0.12. Weryfikacja: typecheck + 29/29 vitest + `next build` zielone; audyt prod bez high/critical (pozostaje preexisting moderate `postcss` przez `next`).

14. **Flow zaproszeń: schemat `app` + cookie na token + RLS role-gate na `invites`** (rozstrzygnięte w S2.2, M2). Trzy decyzje domykające zaproszenia:
    - **RPC klienta w dedykowanym, eksponowanym schemacie `app`** (`preview_invite`, `accept_invite`), NIE w `public` ani `private`. Reguła Supabase: `SECURITY DEFINER` w `public` jest publicznym API dla `anon`/`authenticated` przez `/rpc` — czego dla helperów nie chcemy; a `private` (helpery RLS) świadomie NIE eksponujemy. Klient musi jednak móc wołać te dwie funkcje, więc powstaje trzeci schemat `app` dodany do `config.toml [api].schemas`, z wąskimi grantami (`preview_invite` → `anon, authenticated`; `accept_invite` → `authenticated`). Ochrona siedzi WEWNĄTRZ funkcji: ważność tokenu, `for update` (single-use, wyścig podwójnej akceptacji), email-lock `lower(auth.jwt() email) is distinct from invite.email` (null-safe), oraz strażnik roli (konto z rolą ≠ `client` odrzucone — trener nie staje się podopiecznym). Uwaga: `app` daje `usage` tylko `anon, authenticated` (nie `service_role`) — `service_role` nie jest wołającym; drobna niespójność wobec §9.12, świadoma.
    - **Token zaproszenia przeżywa utworzenie konta przez httpOnly cookie**, NIE przez threading `next`/`{{ .RedirectTo }}` (odłożony do S2.3). Strona `/invite/[token]` waliduje token (`preview_invite`), a akcja magic-linka (`shouldCreateUser: true`, e-mail zablokowany na adresie z zaproszenia) zapisuje token w cookie `invite_token`; `/auth/confirm` po `verifyOtp` czyta cookie, woła `accept_invite`, czyści cookie i przekierowuje na `/today`. Powód: niezależność od niezweryfikowanego threadingu z S2.3, token nigdy nie trafia do URL-a w mailu, spójny token-hash flow. Redirecty w `/auth/confirm` MUSZĄ używać `redirect()` z `next/navigation` (lekcja S2.1 — inaczej giną cookies sesji z `verifyOtp`).
    - **Tworzenie zaproszeń tylko przez trenera — wymuszone w RLS, nie tylko w akcji** (znalezione w finalnym review S2.2). Polityka M1 `invites_trainer_all` miała `with check (auth.uid() = trainer_id)` bez predykatu roli — a `createInviteAction` (server action = POST, wołalny mimo UI tylko dla trenera) sprawdzał tylko sesję. Klient mógł więc sfałszować zaproszenie z `trainer_id = własne uid` i po akceptacji zdobyć podopiecznego (naruszenie RLS-first i „jeden klient ↔ jeden trener"). Migracja `20260707130000_invites_trainer_role_rls.sql` zaostrza `with check` o `private.current_user_role() = 'trainer'` (`using` bez zmian — klient i tak nie ma wierszy do odczytu; helper zwraca NULL dla konta bez profilu → `NULL = 'trainer'` = NULL → fail-closed). Akcja dodatkowo odrzuca nie-trenera przez `getSessionContext()` (defense-in-depth). Test RLS: klient nie wstawi zaproszenia, trener wstawi. Lekcja: „RLS-first" znaczy predykat w polityce, nie w kodzie akcji — sam `getUser()` w server action to za mało.

15. **Routing po roli w middleware + producent `next` + pierwszy E2E** (rozstrzygnięte w S2.3, M2 — domyka M2). Reguły routingu żyją w czystej, testowanej funkcji `resolveRouteAction` (`lib/auth/routes.ts`); middleware to cienki wrapper I/O: kanoniczny refresh sesji (nic między `createServerClient` a `getUser`), lookup `profiles.role` tylko gdy potrzebny (jest user ∧ ścieżka chroniona lub `/`), decyzja, redirect. **Cookies odświeżonej sesji kopiowane na każdą odpowiedź redirect** (goły `NextResponse.redirect` je gubi — ta sama klasa błędu co confirm-route S2.1). Zalogowany bez profilu/roli (np. nieudane `accept_invite`) → `/login` (nie cichy misroute na `/today`). `next`: middleware produkuje (`/login?next=<enc>`), logowanie hasłem konsumuje (`safeRedirectPath`); magic-link `next` best-effort/odłożony (bez zmiany szablonu). Motywy grup były już w layoutach (S2.1) — tylko asercja w E2E. E2E Playwright (`webServer` na 3100, port-agnostyczny; magic link domknięty `admin.generateLink`, bez Mailpita): DoD zaproszenie→rejestracja→klient w `(client)` + granice grup (klient nie wejdzie do `(trainer)` i odwrotnie). Odrzucone: rola w JWT claim (auth hook — poza zakresem), guard w layoutach (spec mówi middleware). Koszt: jeden lookup PK na nawigację chronioną. Uwaga: E2E to brama CI (label `e2e`); lokalnie port 3000 bywa zajęty, dlatego webServer bierze 3100.

## 10. Workflow z Claude Code

- **CLAUDE.md w repo** z: opisem domeny (słowniczek: szablon vs instancja, plan_set vs set_log), konwencjami (RLS-first, uuid v7, position float), komendami (test, migracje, gen types).
- Migracje wyłącznie przez pliki SQL w `/supabase/migrations` (nigdy ręcznie w dashboardzie) — Claude Code widzi pełną historię schematu.
- Po każdej migracji: `supabase gen types typescript` → typy w repo → Claude Code zawsze pracuje na aktualnym schemacie.
- Kolejność budowy MVP (sugerowana): ①migracje+RLS+testy RLS → ②auth+zaproszenia → ③bank ćwiczeń → ④kreator szablonów → ⑤przypisanie (funkcja kopiująca) → ⑥widok planu klienta → ⑦tryb treningu+offline → ⑧widok klienta u trenera+realtime.
- Osobno: dokument **architektura wizualna** przed punktem ④ — kreator i tryb treningu to 80% wartości UI.