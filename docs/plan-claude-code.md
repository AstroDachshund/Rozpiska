# Plan działania — Claude Code (MVP, M2–M8)

Wersja: 1.0 · Stan wyjściowy: **M1 Foundation ukończone** (7 migracji, 16 tabel z RLS, 37 policy, macierz izolacji tenantów zielona — decyzje §9.9–9.11 arch. technicznej).
Dokument komplementarny do: `plan-claude-design.md` (tor wizualny) i `design-system.md` (specyfikacja komponentów).

---

## 1. Rytm pracy (obowiązuje każdą sesję)

1 sesja Claude Code = 1 zadanie = 1 branch = 1 PR. Sesja zaczyna się od przeczytania `CLAUDE.md` + sekcji docs wskazanych w polu „Kontekst". Sesja kończy się self-review diffa względem `CLAUDE.md`/docs, `typecheck → lint → vitest` na zielono i otwartym PR-em.

Twarde reguły (skrót z CLAUDE.md, powtórzone bo łamane najczęściej):

- Nowe zachowanie = test w tym samym PR; migracja dotykająca policy = test RLS w tym samym PR.
- Po każdej migracji `supabase gen types typescript` i commit typów.
- Operacje wieloetapowe = funkcja Postgres (RPC), nigdy sekwencja zapytań z klienta.
- UI wyłącznie na tokenach z `design-system.md` — nigdy domyślna paleta shadcn.
- Ekrany klienta weryfikowane na viewport 380px, screenshot w opisie PR.

**Punkty synchronizacji z torem Design** — sesja NIE startuje bez gotowego wejścia:

| Sesja Code | Wymagane wejście z toru Design |
|---|---|
| S2.2 (ekrany auth) | D1 — tokeny + motywy zaimplementowane w `globals.css` |
| S4.2 (kreator UI) | D3 — prototyp `PlanBuilderTree` |
| S6.1 (widoki klienta) | D2 — prototypy `/today` i `/plan` |
| S7.2 (SetRow) | D2 — prototyp trybu treningu (`SetRow`, `PlateBar`, `RestTimer`) |

---

## 2. M2 — Auth i zaproszenia (3 sesje)

### S2.1 `feat/m2-auth-foundation`
- **Cel:** działające logowanie magic link (default) + hasło (fallback), sesja SSR, wylogowanie.
- **Kontekst:** arch. techniczna §5, decyzja §9.6.
- **Zakres:** klienty Supabase (browser/server) w `lib/supabase/`, strony `(auth)/login`, obsługa callbacku magic link, odczyt roli z `profiles`.
- **Poza zakresem:** zaproszenia, middleware ról, Google OAuth.
- **DoD:** logowanie oboma metodami działa lokalnie; testy jednostkowe helperów sesji.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-techniczna.md §5. Zaimplementuj auth Supabase: magic link jako domyślna metoda, hasło jako fallback. Klienty browser/server w lib/supabase/, strony w app/(auth)/. Bez middleware ról i bez zaproszeń — to następne sesje. Branch feat/m2-auth-foundation."

### S2.2 `feat/m2-invites`
- **Cel:** pełny flow zaproszenia: trener tworzy invite → tokenizowany link → rejestracja pod tokenem tworzy `profile(role=client)` i aktywuje `trainer_clients`.
- **Kontekst:** arch. techniczna §5; tabele `invites`/`trainer_clients` już istnieją (M1).
- **Zakres:** RPC `accept_invite` (atomowo: walidacja tokenu + expires_at, profil, aktywacja relacji), UI trenera „Dodaj podopiecznego" (link do skopiowania — kanał Messenger!), strona rejestracji z tokenem.
- **DoD:** test RLS/integracyjny funkcji `accept_invite` (token zużyty, przeterminowany, cudzy); typy przegenerowane.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-techniczna.md §5. Zbuduj flow zaproszeń na istniejących tabelach invites/trainer_clients: funkcja Postgres accept_invite (RPC, atomowa), UI trenera do generowania linku, rejestracja klienta pod tokenem. Testy funkcji w tym samym PR. Branch feat/m2-invites."

### S2.3 `feat/m2-role-middleware`
- **Cel:** middleware pilnujący granicy `(trainer)`/`(client)` + E2E happy path.
- **Zakres:** middleware czytający rolę z sesji, redirecty, layouty obu grup (motyw: client=dark default, trainer=light — klasa na layoutach wg design-system.md §2).
- **DoD (zamyka M2):** Playwright: zaproszenie → rejestracja → klient ląduje w `(client)`, trener nie wejdzie do `(client)` i odwrotnie.
- **Prompt startowy:** „Przeczytaj CLAUDE.md. Dodaj middleware routingu po roli (trainer/client) i layouty grup tras z motywami wg docs/design-system.md §1–§2. Test Playwright pełnej ścieżki zaproszenie→rejestracja→routing. Branch feat/m2-role-middleware."

---

## 3. M3 — Bank ćwiczeń (2 sesje)

### S3.1 `feat/m3-exercises-crud`
- **Cel:** CRUD ćwiczeń z tagami (partia/sprzęt/wzorzec), notatką techniczną i linkiem YouTube.
- **Kontekst:** research §2 (zamienniki = tagowanie), tabele z M1.
- **Zakres:** schematy Zod (jedno źródło: formularz + serwer), lista + formularz w `(trainer)/exercises`, `TagChip` wg design-system.md, soft delete (`archived_at`).
- **DoD:** testy Zod schemas; RLS bez zmian (tabele z M1 już pokryte); seed z realnymi polskimi ćwiczeniami.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/design-system.md (TagChip). Zbuduj CRUD banku ćwiczeń: Zod schemas współdzielone, tagi M:N, link YouTube + notatka techniczna, archiwizacja przez archived_at. Seed: realne polskie ćwiczenia. Branch feat/m3-exercises-crud."

### S3.2 `feat/m3-exercise-search`
- **Cel:** wyszukiwarka Command (⌘K) z filtrowaniem po tagach — ten sam komponent posłuży w kreatorze (M4).
- **Zakres:** `Command` shadcn, filtr tagów, obsługa w pełni klawiaturowa (enter dodaje/wybiera), widok zarchiwizowanych.
- **DoD:** wyszukiwarka wyekstrahowana jako komponent wielokrotnego użytku (`components/exercise-command.tsx`); pełna obsługa klawiatury.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-wizualna.md §5.1. Zbuduj wyszukiwarkę ćwiczeń na Command shadcn z filtrami tagów, w pełni klawiaturową, jako komponent wielokrotnego użytku — użyje jej kreator planów w M4. Branch feat/m3-exercise-search."

---

## 4. M4 — Kreator planów / szablony (4 sesje — najdroższy UI projektu)

### S4.1 `feat/m4-builder-data-layer`
- **Cel:** warstwa danych drzewa plan → weeks → days → sections → exercises → sets, bez UI.
- **Kontekst:** arch. techniczna §3.4 (wspólne tabele struktury, `template_id` XOR `assigned_plan_id`), §9.9 (denormalizacja właściciela — triggery same dziedziczą, ale funkcja kopiująca w M5 musi być zdyscyplinowana).
- **Zakres:** hooki TanStack Query (odczyt drzewa jednym zapytaniem, mutacje per węzeł), `lib/domain/position.ts` (float między sąsiadami + strategia rebalansu), schematy Zod dla wszystkich węzłów.
- **DoD:** Vitest dla `position.ts` (wstawianie, przenoszenie, degeneracja floatów) i schematów; zero komponentów UI w PR.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-techniczna.md §3. Zbuduj warstwę danych kreatora: hooki TanStack Query dla drzewa planu (wspólne dla szablonu i instancji — parametr kontekstu), lib/domain/position.ts z testami, schematy Zod. Bez UI. Branch feat/m4-builder-data-layer."

### S4.2 `feat/m4-builder-tree`
- **Cel:** edytor drzewa: tygodnie → dni → sekcje, dodawanie/nazywanie/usuwanie.
- **Wejście:** prototyp D3 z toru Design (`PlanBuilderTree`).
- **Zakres:** `components/plan-builder/` — komponent przyjmuje kontekst (szablon|instancja) przez propsy, lista szablonów `(trainer)/templates`, tworzenie szablonu.
- **DoD:** drzewo edytowalne do poziomu sekcji; nawigacja Tab/Enter/Esc; zgodność z prototypem D3.
- **Prompt startowy:** „Przeczytaj CLAUDE.md, docs/design-system.md §PlanBuilderTree i prototyp z docs/prototypes/. Zbuduj edytor drzewa tygodnie→dni→sekcje na warstwie danych z S4.1. Komponent musi być agnostyczny wobec szablon/instancja. Pełna obsługa klawiatury. Branch feat/m4-builder-tree."

### S4.3 `feat/m4-builder-sets-inline`
- **Cel:** ćwiczenia w sekcjach (przez wyszukiwarkę z S3.2) + edycja serii inline w wierszu — bez modali.
- **Zakres:** dodanie ćwiczenia Commandem (enter dodaje, ręce nie schodzą z klawiatury), wiersz serii: numer, reps_min/max (pole „8–10"), target_weight?, target_rpe?, rest_seconds?; snapshot nazwy ćwiczenia przy dodaniu.
- **DoD:** parsowanie zakresu powtórzeń w `lib/domain/` z testami; edycja inline działa klawiaturą.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-wizualna.md §5.1. Dodaj do kreatora: wstawianie ćwiczeń przez exercise-command, edycję serii inline (zero modali), reps jako para min/max z parserem w lib/domain/ + testy. Pamiętaj o snapshocie nazwy ćwiczenia. Branch feat/m4-builder-sets-inline."

### S4.4 `feat/m4-builder-duplicate-dnd`
- **Cel:** duplikowanie serii/dnia/tygodnia jednym przyciskiem + drag&drop z uchwytem.
- **Zakres:** duplikacja przez RPC (głęboka kopia poddrzewa — ta sama dyscyplina co przyszła funkcja M5), dnd na `position` float, uchwyty, fallback klawiaturowy (przenieś w górę/dół).
- **DoD (zamyka M4):** test funkcji duplikującej; trener układa kompletny plan „Push A" bez dotykania myszy poza dnd.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-techniczna.md §3.3. Dodaj duplikowanie serii/dnia/tygodnia (funkcja Postgres, głęboka kopia poddrzewa, test) i drag&drop na position float z fallbackiem klawiaturowym. Branch feat/m4-builder-duplicate-dnd."

---

## 5. M5 — Przypisanie planu (2 sesje)

### S5.1 `feat/m5-copy-function`
- **Cel:** `copy_template_to_assignment` — głęboka kopia całego drzewa w jednej transakcji.
- **Kontekst:** arch. techniczna §3.1, §3.4, §9.9 (funkcja MUSI poprawnie ustawić zdenormalizowane `trainer_id`/`client_id` na każdym węźle — triggery to zweryfikują).
- **Zakres:** funkcja Postgres + migracja, regeneracja typów.
- **DoD:** testy integracyjne: kopia 1:1 (struktura, positions, snapshoty nazw), edycja kopii nie dotyka szablonu, RLS — klient widzi instancję, nie widzi szablonu.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-techniczna.md §3 + §9.9. Napisz funkcję Postgres copy_template_to_assignment (jedna transakcja, głęboka kopia drzewa, poprawne trainer_id/client_id na każdym poziomie). Testy: wierność kopii, izolacja szablon↔instancja, RLS klienta. Branch feat/m5-copy-function."

### S5.2 `feat/m5-assign-flow`
- **Cel:** UI przypisania planu klientowi + edycja instancji TYM SAMYM kreatorem.
- **Zakres:** akcja „Przypisz plan" (wybór klienta, daty), `(trainer)/plans/[id]/edit` renderujący `plan-builder` w kontekście instancji, toast „Plan przypisany".
- **DoD (zamyka M5):** Playwright: utwórz szablon → przypisz → edytuj instancję → szablon nietknięty.
- **Prompt startowy:** „Przeczytaj CLAUDE.md. Zbuduj flow przypisania: UI wyboru klienta + wywołanie copy_template_to_assignment, edycja instancji przez istniejący plan-builder (kontekst przez propsy, zero forka). E2E Playwright szablon→przypisanie→edycja. Branch feat/m5-assign-flow."

---

## 6. M6 — Widoki planu klienta (2 sesje)

### S6.1 `feat/m6-client-plan-views`
- **Cel:** `/plan` (cały plan) i `/today` (najbliższy trening) — read-only, dark, mobile-first.
- **Wejście:** prototypy D2 z toru Design.
- **Zakres:** dolna nawigacja (Dziś / Plan / Historia — Historia jako placeholder do M7), `ExerciseCard` z notatką trenera i linkiem YouTube, „ostatnio: 80 × 8" (mono, muted) jeśli są logi.
- **DoD:** działa na 380px; puste stany wg architektura-wizualna §6 („Twój trener jeszcze nie przypisał Ci planu.").
- **Prompt startowy:** „Przeczytaj CLAUDE.md, docs/architektura-wizualna.md §5.2 i §6 oraz prototypy z docs/prototypes/. Zbuduj (client)/plan i (client)/today: read-only, dark default, dolny pasek nawigacji, ExerciseCard wg design-system.md. Weryfikacja 380px. Branch feat/m6-client-plan-views."

### S6.2 `feat/m6-client-cache`
- **Cel:** cache ostatnio otwartego planu (stale-while-revalidate) — podgląd działa bez sieci.
- **Kontekst:** arch. techniczna §7 pkt 2.
- **DoD (zamyka M6):** plan otwiera się offline z cache; wskaźnik świeżości danych nieinwazyjny.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-techniczna.md §7. Dodaj cache SWR ostatnio otwartego planu klienta (TanStack Query persist), tak by /plan i /today otwierały się offline. Branch feat/m6-client-cache."

---

## 7. M7 — Tryb treningu (5 sesji — najważniejszy ekran produktu)

### S7.1 `feat/m7-session-start`
- **Cel:** start sesji: `workout_session` + snapshot dnia planu + ostatnie logi do stanu lokalnego.
- **Kontekst:** arch. techniczna §4.3, §7 (sesja dokańcza się na snapshocie — zero merge'owania).
- **Zakres:** RPC/zapytanie startu (dzień planu + per ćwiczenie ostatni wynik z `set_logs`), stan sesji w kliencie, ekran `(client)/workout/[sessionId]` — szkielet listy (jeden przewijany ekran, zero nawigacji).
- **DoD:** test logiki „ostatni wynik per ćwiczenie"; sesja odporna na równoległą edycję planu przez trenera.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-techniczna.md §4.3 + §7. Zbuduj start sesji treningowej: utworzenie workout_session, pobranie snapshotu dnia + ostatnich logów per ćwiczenie, szkielet ekranu workout/[sessionId] jako jednej przewijanej listy. Branch feat/m7-session-start."

### S7.2 `feat/m7-setrow-logging`
- **Cel:** `SetRow` — logowanie serii z optimistic UI.
- **Wejście:** prototyp D2 (`SetRow`, `PlateBar`).
- **Zakres:** wiersz `[nr] [cel] [kg] [reps] [✓]`, prefill ostatnim wynikiem, stepper ±2,5 kg, cele dotykowe ≥56px, uuid v7 generowany lokalnie, seria dodatkowa (log bez plan_set) i pominięta (plan_set bez loga), `PlateBar` pod ciężarem bieżącej serii, haptyka.
- **DoD:** `lib/domain/plate-math.ts` z testami (rozkład talerzy na stronę); odhaczenie = jeden tap w najczęstszym przypadku.
- **Prompt startowy:** „Przeczytaj CLAUDE.md, docs/design-system.md (SetRow, PlateBar) i docs/architektura-wizualna.md §5.2. Zbuduj SetRow z optimistic UI: prefill, stepper ±2.5 kg, targety ≥56px, uuid v7 lokalnie, serie dodatkowe/pominięte, PlateBar na lib/domain/plate-math.ts z testami. Branch feat/m7-setrow-logging."

### S7.3 `feat/m7-offline-queue`
- **Cel:** kolejka Dexie + sync — zero utraty danych.
- **Kontekst:** arch. techniczna §4.3, §7.
- **Zakres:** `lib/offline/` — zapis każdego loga najpierw do Dexie, wysyłka z retry, `SyncBadge` per log, pasek `--warning` offline / `--success` po synchronizacji (nigdy modal), flush przy powrocie sieci i przy starcie apki.
- **DoD:** test scenariusza: 10 logów offline → powrót sieci → wszystko w Postgresie, bez duplikatów (idempotencja po uuid).
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-techniczna.md §4.3 + §7. Zbuduj kolejkę offline w lib/offline/ na Dexie: zapis lokalny przed wysyłką, retry, idempotencja po uuid v7, SyncBadge i pasek offline wg design-system.md. Test replay po odzyskaniu sieci. Branch feat/m7-offline-queue."

### S7.4 `feat/m7-rest-timer`
- **Cel:** timer przerw auto-startujący po odhaczeniu + wake lock.
- **Zakres:** `RestTimer` (czas z `rest_seconds`), pełnoekranowy licznik Barlow Condensed 40px+, wake lock na czas aktywnej sesji, `prefers-reduced-motion`.
- **DoD:** timer startuje automatycznie; wake lock zwalniany po zakończeniu sesji.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/design-system.md (RestTimer). Zbuduj RestTimer: auto-start po odhaczeniu serii, czas z rest_seconds, pełnoekranowy licznik, wake lock podczas sesji, obsługa prefers-reduced-motion. Branch feat/m7-rest-timer."

### S7.5 `feat/m7-session-summary`
- **Cel:** zakończenie sesji + podsumowanie + E2E całości.
- **Zakres:** RPC zakończenia sesji (atomowe: completed_at, notatka, samopoczucie 1–5), ekran podsumowania (czas, tonaż, serie ukończone/plan), `lib/domain/` tonaż + compliance z testami, `/history` — prosta lista sesji.
- **DoD (zamyka M7):** Playwright: pełny trening z symulacją offline i replayem — najważniejszy test E2E w projekcie.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-wizualna.md §6. Zbuduj zakończenie sesji (RPC atomowe, notatka + samopoczucie 1–5), ekran podsumowania (czas, tonaż, ukończone/plan — funkcje w lib/domain/ z testami) i prostą /history. E2E Playwright: pełny trening z offline replay. Branch feat/m7-session-summary."

---

## 8. M8 — Widok klienta u trenera (2 sesje)

### S8.1 `feat/m8-client-history`
- **Cel:** per-klient: historia sesji, compliance (ukończone/pominięte), logi, notatki.
- **Zakres:** `(trainer)/clients/[id]` — nagłówek z compliance („3/4 w tym tygodniu"), oś czasu sesji, notatki trenera o kliencie (`is_private`), obsługa klienta zarchiwizowanego (read-only, baner).
- **DoD:** compliance liczone w `lib/domain/` (porównanie plan_sets↔set_logs) z testami.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-wizualna.md §5.1. Zbuduj widok klienta u trenera: compliance z lib/domain/ (testy), oś czasu sesji, notatki z is_private, stan zarchiwizowany read-only. Branch feat/m8-client-history."

### S8.2 `feat/m8-realtime`
- **Cel:** żywy podgląd „trenuje teraz" + domknięcie MVP.
- **Kontekst:** arch. techniczna §4.2 — realtime jest nice-to-have, fallback refetch-on-focus obowiązkowy.
- **Zakres:** subskrypcja `set_logs`/`workout_sessions` per klient, kropka `--primary` „trenuje teraz", refetch-on-focus jako fallback; subskrypcja zmian planu u klienta.
- **DoD (zamyka M8 i MVP):** log klienta pojawia się u trenera bez odświeżania; wyłączenie realtime nie psuje niczego. Pełna suita + E2E zielona.
- **Prompt startowy:** „Przeczytaj CLAUDE.md i docs/architektura-techniczna.md §4.2. Dodaj Realtime: subskrypcja logów per klient w panelu trenera (kropka 'trenuje teraz'), subskrypcja planu u klienta, fallback refetch-on-focus. Realtime nie może być single point of failure. Branch feat/m8-realtime."

---

## 9. Po M8 — wyjście na pilotaż (poza zakresem tego planu, checklist)

Deploy produkcyjny (Vercel + Supabase EU, migracje przez dedykowaną Action), Sentry, manifest PWA + ikony, funkcja „usuń konto" (RODO — wymóg od MVP, arch. techniczna §8), weryfikacja nazwy „Rozpiska" (decyzja §9.8), test na siłowni jedną ręką (architektura-wizualna §10.4), tag `v0.1.0` + CHANGELOG.
