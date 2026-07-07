# Plan działania — Claude Design (MVP)

Wersja: 1.0 · Dokument komplementarny do: `plan-claude-code.md`, `design-system.md`, `architektura-wizualna.md`.

---

## 1. Rekomendacja: ile Claude Design w tym projekcie

**Wniosek: Claude Design jest potrzebny punktowo, nie ciągle — ok. 15–20% pracy nad MVP, skoncentrowane na początku (design system) i przy trzech ekranach, które niosą 80% wartości UI.**

Uzasadnienie:

- Kierunek wizualny już istnieje i jest rozstrzygnięty (`architektura-wizualna.md`: „Stal i magnezja", tokeny, typografia, twarde reguły trybu treningu). Claude Design nie robi eksploracji od zera — jego rola to **materializacja** tego dokumentu: tokeny w kodzie, specyfikacja komponentów, prototypy na realnych danych.
- Trzy ekrany uzasadniają dedykowaną pracę projektową: **tryb treningu** (najważniejszy ekran produktu, testuje cały system), **kreator planów** (najdroższy UI) i **widoki klienta** (/today, /plan). Reszta MVP (auth, bank ćwiczeń, listy, widok klienta u trenera) to standardowe wzorce shadcn/ui — Claude Code zbuduje je bezpośrednio z `design-system.md`, bez osobnego etapu projektowego.
- Design System — **tak, ale w wersji „kontrakt", nie „produkt"**: jeden plik `design-system.md` (tokeny → zmienne shadcn/Tailwind 4 + specyfikacja 7 komponentów własnych ze stanami) zamiast rozbudowanej biblioteki dokumentacji. Pełny design system z showcase'em i wersjonowaniem komponentów to koszt bez zwrotu przy jednym produkcie i jednym deweloperze. Rozbudowa — dopiero gdy Etap 2 (wykresy, dashboard compliance) tego zażąda.
- Stały, tani element: **design QA** na końcu każdego milestone'u UI (skille design-critique i accessibility-review na screenshotach z PR-ów). To godziny, nie dni, a pilnuje dryfu od tokenów i reguł dostępności.

Czego NIE zlecamy Claude Design: eksploracja brandu (rozstrzygnięte), ekrany CRUD, copywriting całości (reguły głosu są w architektura-wizualna §9 — wystarczy review), logo/marketing (poza MVP).

---

## 2. Zasady pracy toru Design

- Każda sesja startuje z `architektura-wizualna.md` §3 (tokeny) i `design-system.md` — nigdy z domyślnego stylu shadcn.
- Prototypy jako artefakty React na **realnych danych treningowych** (plan Piotra, „Przysiad ze sztangą 3 × 8–10 @ 80 kg"), nie lorem ipsum. Zapis do `docs/prototypes/` — to wejście dla sesji Claude Code.
- Konektor shadcn/docs służy do weryfikacji API komponentów (Command, Sheet, Sonner) przed specyfikowaniem — specyfikacja nie może wymyślać propsów, których biblioteka nie ma.
- Prototyp ≠ implementacja: kod prototypu jest referencją wizualną i behawioralną; Claude Code przepisuje go na architekturę produkcyjną (TanStack Query, Zod, offline). Rozbieżność prototyp↔implementacja rozstrzyga `design-system.md`.
- Ekrany klienta projektowane i oceniane na 380px.

---

## 3. Zlecenia (D1–D5) i punkty synchronizacji

| # | Zlecenie | Wyjście | Odblokowuje sesję Code | Kiedy |
|---|---|---|---|---|
| D1 | Tokeny + motywy | `design-system.md` (gotowe) + `app/globals.css` z pełnym mapowaniem `:root`/`.dark` + strona testowa kontrastów | S2.2+ (wszystkie UI) | teraz |
| D2a | Tryb treningu | prototyp: `SetRow` (wszystkie stany), `PlateBar`, `RestTimer`, pasek offline + `SyncBadge`, ekran podsumowania, moment PR | S7.2–S7.5 | przed M7, realnie równolegle z M4–M5 |
| D2b | Widoki klienta | prototyp `/today` i `/plan` + dolna nawigacja + puste stany | S6.1 | razem z D2a (jeden kontekst wizualny) |
| D3 | Kreator planów | prototyp `PlanBuilderTree`: drzewo, edycja serii inline, duplikacja, dnd, stany klawiatury/focus | S4.2–S4.4 | przed S4.2 |
| D4 | Design QA per milestone | krytyka screenshotów z PR (skill design-critique) + audyt a11y (skill accessibility-review): kontrasty, focus, targety ≥56px, kolor-nie-jedyny-nośnik | gate przed merge milestone'u | M3, M4, M6, M7, M8 |
| D5 | Review copy PL | przegląd wszystkich stringów UI pod architektura-wizualna §9 (forma „ty", przyciski nazywają czynność, zero coach-speaku) | przed pilotażem | po M7 |

Kolejność celowo zgodna z architektura-wizualna §10.2: **tokeny → tryb treningu → kreator → reszta**. Najtrudniejszy ekran najpierw — on testuje system; jeśli tokeny i `SetRow` działają na siłowni, reszta interfejsu to pochodna.

Uwaga do harmonogramu: D3 jest potrzebne wcześniej w kalendarzu (M4) niż D2 (M6–M7), ale D2 projektujemy pierwsze, bo waliduje system. W praktyce: D1 → D2a/D2b → D3 → potem tor Code wchodzi w M4 z gotowym D3, a D2 czeka na M6/M7.

---

## 4. Definicja ukończenia zlecenia projektowego

- Prototyp renderuje się na realnych danych, w obu motywach tam, gdzie dotyczy (kreator: light; tryb treningu: dark).
- Wszystkie stany z architektura-wizualna §6 pokryte (nie tylko happy path: offline, pusty stan, zarchiwizowany, błąd).
- Kontrast ≥ 4.5:1 zweryfikowany; focus widoczny; targety zmierzone.
- Każdy komponent z prototypu ma odpowiadającą sekcję w `design-system.md` (props, warianty, stany) — jeśli prototyp wymusił zmianę specyfikacji, `design-system.md` jest zaktualizowany w tym samym zleceniu.
