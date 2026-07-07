# Design system — Rozpiska (kontrakt MVP)

Wersja: 1.0 · Źródło decyzji wizualnych: `architektura-wizualna.md` (ten plik jej nie zastępuje — operacjonalizuje §3–§8 do postaci implementowalnej).
Status: kontrakt między torem Design a torem Code. Rozbieżność prototyp ↔ implementacja rozstrzyga ten plik; zmiana tego pliku = commit z uzasadnieniem.

---

## 1. Zasady

1. Zero kolorów, rozmiarów i fontów poza tokenami z §2–§3. Hardcoded hex w komponencie = bug.
2. Jeden zestaw tokenów, dwa motywy: layout `(client)` ustawia `class="dark"` na kontenerze (default), layout `(trainer)` — jasny default. Nigdy fork komponentu per kontekst.
3. Komponenty bazowe shadcn/ui bez modyfikacji stylów: Button, Input, Dialog, DropdownMenu, Tabs, Sheet, Sonner, Command, Badge, Separator. Customizacja wyłącznie przez tokeny i `className`.
4. Kolor nigdy nie jest jedynym nośnikiem znaczenia (ikona/etykieta zawsze towarzyszy).
5. Liczby treningowe zawsze w IBM Plex Mono z `tabular-nums` (`font-data`).

## 2. Tokeny — implementacja (Tailwind CSS 4)

Wzorzec zgodny z oficjalnym theming shadcn dla Tailwind v4: wartości w `:root`/`.dark`, ekspozycja przez `@theme inline`. Docelowa zawartość `app/globals.css` (fragment normatywny):

```css
:root {
  --background: #FAFBFC;
  --foreground: #16181B;
  --card: #FFFFFF;
  --card-foreground: #16181B;
  --surface-raised: #F2F4F6;
  --border: #E3E6EA;
  --input: #E3E6EA;
  --muted: #F2F4F6;
  --muted-foreground: #5C6470;
  --primary: #2353D9;
  --primary-foreground: #FFFFFF;
  --destructive: #D23B33;
  --success: #2E9E5B;
  --warning: #E8930C;
  --gold: #F0B429;
  --ring: #2353D9;
  --radius: 8px;
  /* paleta danych „Talerze" — identyczna w obu motywach */
  --plate-25: #D23B33;
  --plate-20: #2353D9;
  --plate-15: #E8B21A;
  --plate-10: #2E9E5B;
  --plate-5:  #E9EDF1;
}

.dark {
  --background: #101214;
  --foreground: #EDEFF2;
  --card: #17191C;
  --card-foreground: #EDEFF2;
  --surface-raised: #1E2126;
  --border: #26292E;
  --input: #26292E;
  --muted: #1E2126;
  --muted-foreground: #8A919B;
  --primary: #3B6AF0;
  --primary-foreground: #FFFFFF;
  --ring: #3B6AF0;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-surface-raised: var(--surface-raised);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-destructive: var(--destructive);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-gold: var(--gold);
  --color-plate-25: var(--plate-25);
  --color-plate-20: var(--plate-20);
  --color-plate-15: var(--plate-15);
  --color-plate-10: var(--plate-10);
  --color-plate-5:  var(--plate-5);
  --radius-sm: calc(var(--radius) - 2px);   /* 6px */
  --radius-md: var(--radius);               /* 8px — inputy, przyciski */
  --radius-lg: calc(var(--radius) + 4px);   /* 12px — karty */
  --font-display: var(--font-barlow-condensed);
  --font-sans: var(--font-manrope);
  --font-data: var(--font-ibm-plex-mono);
}
```

Reguły użycia (dyscyplina z architektura-wizualna §2–§3):

| Token | Wolno | Nie wolno |
|---|---|---|
| `primary` | CTA, aktywne stany, focus ring, kropka „trenuje teraz" | tła dekoracyjne, nagłówki |
| `gold` | wyłącznie moment PR (impuls + toast) | cokolwiek innego |
| `plate-*` | TagChip, PlateBar, przyszłe wykresy | dekoracja, stany semantyczne |
| `warning` | offline, niezapisane | — |
| `success` | seria ukończona, sync OK | — |
| cień | light: `0 1px 3px rgb(22 24 27 / 0.08)`, maks. 2 poziomy | cienie w dark (elewacja przez `surface-raised`) |

## 3. Typografia i przestrzeń

Fonty przez `next/font` (zmienne `--font-barlow-condensed`, `--font-manrope`, `--font-ibm-plex-mono`); subset `latin-ext` (polskie diakrytyki — obowiązkowo).

| Rola | Klasa bazowa | Użycie |
|---|---|---|
| Display | `font-display font-semibold` | nagłówki ekranów, „PUSH A", licznik timera |
| UI | `font-sans` (400/500/700) | całość interfejsu |
| Dane | `font-data font-medium tabular-nums` | każdy ciężar, powtórzenie, RPE, `80 × 8` |

Skala (mobile/desktop, px): caption 13/14 · body 15/15 · emphasized 17/16 · h3 22/20 · h2 28/24 · display 40/32. Line-height: body 1.5, dane 1.2. Font danych nigdy < 15px na mobile.

Spacing: siatka 4px; gęstość trenera krok 8, klienta krok 12–16. Ikony Lucide, stroke 1.75, rozmiar 20 (trener) / 24 (klient). Radius: 8 (kontrolki), 12 (karty), 999 (chipy).

## 4. Ruch

Wyłącznie trzy zaprojektowane momenty: odhaczenie serii 150 ms ease-out · impuls PR 400 ms jednorazowy · wejście timera spring 200 ms. Zero animacji list i przejść ekranów. `prefers-reduced-motion`: wszystko poza zmianą koloru wyłączone.

---

## 5. Komponenty własne

Wspólne dla wszystkich: widoczny focus (`ring-2 ring-ring ring-offset-2`), pełna obsługa klawiatury, stany nie tylko kolorem.

### 5.1 SetRow — wiersz serii w trybie treningu

Najważniejszy komponent produktu. Jeden wiersz = jedna seria: `[nr] [cel: 8–10 @ 80 kg] [input kg] [input reps] [✓]`.

| Prop | Typ | Default | Opis |
|---|---|---|---|
| `planSet` | `PlanSet \| null` | — | `null` = seria dodatkowa (log bez planu) |
| `lastResult` | `{ weight, reps } \| null` | — | prefill inputów + źródło „ostatnio" |
| `log` | `SetLog \| null` | `null` | istniejący log (seria już odhaczona) |
| `syncState` | `'synced' \| 'pending' \| 'offline'` | `'synced'` | przekazywane do `SyncBadge` |
| `onComplete` | `(weight, reps) => void` | — | odhaczenie; optimistic |
| `onUncheck` | `() => void` | — | cofnięcie odhaczenia |

Stany: **default** — cel w `font-data`, inputy prefillowane `lastResult` (najczęstszy przypadek = 1 tap); **active** (bieżąca seria) — tło `surface-raised`, pod ciężarem `PlateBar`; **completed** — wiersz przygasa (opacity), znacznik ✓ `success`, haptyka `vibrate(10)`, auto-start `RestTimer`; **PR** — jednorazowy złoty impuls 400 ms + toast „Nowy rekord: 85 kg × 8" (`gold`); **skipped** — plan bez loga, wizualnie wyszarzony z etykietą.

Wymiary twarde: target odhaczenia ≥ 56×56px, odstępy między wierszami ≥ 12px, stepper ±2,5 kg przy polu ciężaru (klawiatura numeryczna jako fallback: `inputmode="decimal"`).

A11y: wiersz jako `group` z etykietą „Seria 2 z 3, cel 8–10 powtórzeń przy 80 kg"; ✓ to `button` z `aria-pressed`; stepper: przyciski z `aria-label="Zwiększ o 2,5 kg"`.

Nie: modal do edycji · konfetti · blokowanie wiersza podczas sync (optimistic zawsze).

### 5.2 PlateBar — sygnatura produktu

Ciężar renderowany jako miniaturowy załadowany gryf (kolory talerzy IPF z `plate-*`). Dane z czystej funkcji `lib/domain/plate-math.ts` (gryf 20 kg, talerze 25/20/15/10/5/2.5/1.25 na stronę).

| Prop | Typ | Default | Opis |
|---|---|---|---|
| `weightKg` | `number` | — | ciężar całkowity |
| `barKg` | `number` | `20` | waga gryfu |
| `expandable` | `boolean` | `true` | tap → rozpiska talerzy na stronę tekstem |

Stany: default (pasek) · expanded (lista „na stronę: 25 + 5 + 2,5"). Ciężar niemożliwy do złożenia (np. 81 kg) → pasek najbliższej kombinacji + tekstowa reszta. Każdy talerz ma etykietę kg przy expanded (kolor nie jest jedynym nośnikiem).

A11y: `role="img"`, `aria-label="80 kg: na stronę 25 i 5"`; expand to `button` z `aria-expanded`.

Nie: używanie poza kontekstem ciężaru (to nie dekoracja) · animowanie talerzy.

### 5.3 RestTimer — timer przerwy

| Prop | Typ | Default | Opis |
|---|---|---|---|
| `seconds` | `number` | — | z `rest_seconds` planu; brak → nie startuje |
| `autoStart` | `boolean` | `true` | start po odhaczeniu serii |
| `onFinish` | `() => void` | — | koniec przerwy |

Stany: **running** — pełnoekranowy licznik `font-display` ≥40px, przycisk „Pomiń" i „+30 s"; **finished** — sygnał (haptyka + opcjonalny dźwięk), auto-zamknięcie; **hidden**. Wejście: spring 200 ms. Wake lock aktywny przez całą sesję (nie tylko timer), zwalniany przy zakończeniu/opuszczeniu.

A11y: `role="timer"`, `aria-live="polite"` co 30 s (nie co sekundę); „Pomiń" osiągalny klawiaturą i ≥56px.

### 5.4 ExerciseCard — ćwiczenie w widoku klienta

Karta w `/today`, `/plan` i trybie treningu: nazwa (snapshot!), tagi, notatka trenera, link YouTube, „Ostatnio: 80 × 8" (`font-data text-muted-foreground`), lista `SetRow` w trybie treningu.

| Prop | Typ | Opis |
|---|---|---|
| `planExercise` | `PlanExercise` | ze snapshotem nazwy |
| `lastLog` | `string \| null` | sformatowane „80 × 8" |
| `mode` | `'preview' \| 'workout'` | preview: bez inputów |

Stany: default · completed (wszystkie serie odhaczone — nagłówek przygasa) · superset (etykieta z notatki trenera — brak UI grupowania w MVP). Link YouTube otwiera się w nowej karcie z ikoną i etykietą „Technika (wideo)".

### 5.5 PlanBuilderTree — kreator (trener, light, desktop-first)

Drzewo tydzień → dzień → sekcja (rozgrzewka/główna/cooldown) → ćwiczenie → serie. Jeden komponent dla szablonu i instancji (kontekst przez props — nigdy fork).

| Prop | Typ | Opis |
|---|---|---|
| `rootId` | `string` | id szablonu lub instancji |
| `context` | `'template' \| 'assigned'` | steruje mutacjami, nie wyglądem |

Zasady interakcji: dodanie ćwiczenia przez `Command` (enter dodaje — ręce na klawiaturze); edycja serii inline w wierszu (zero modali); duplikuj serię/dzień/tydzień jednym przyciskiem przy węźle; dnd z uchwytem (`GripVertical`), fallback klawiaturowy „przenieś w górę/dół"; Tab/Enter/Esc w całym drzewie.

Stany węzła: default · editing (inline) · dragging (`surface-raised` + cień light) · drop-target (linia `primary`). Pusty dzień: „Dodaj ćwiczenie" (Command). Zapis: autosave per mutacja + dyskretny wskaźnik „Zapisano".

A11y: drzewo `role="tree"`/`treeitem` + `aria-expanded`; dnd zawsze z alternatywą klawiaturową.

### 5.6 TagChip — tag ćwiczenia

Chip `radius-999`, kolor z palety talerzy wg partii mięśniowej (mapowanie stałe, zdefiniowane raz w `lib/domain/tag-colors.ts`), zawsze z tekstową etykietą.

| Prop | Typ | Opis |
|---|---|---|
| `tag` | `ExerciseTag` | nazwa + kategoria (partia/sprzęt/wzorzec) |
| `interactive` | `boolean` | filtr (klik) vs prezentacja |

Stany: default · selected (wypełnienie zamiast obrysu) · interactive:hover. Kategorie sprzęt/wzorzec: neutralne (`muted`), tylko partia mięśniowa dostaje kolor talerza.

### 5.7 SyncBadge — status synchronizacji loga

| Prop | Typ | Opis |
|---|---|---|
| `state` | `'synced' \| 'pending' \| 'offline' \| 'error'` | — |

Wizualnie: synced — nic (brak szumu w happy path) · pending — dyskretna ikona obrotu `muted-foreground` · offline — ikona + `warning` · error — ikona + `destructive` + akcja „Ponów". Zawsze ikona + tooltip/etykieta, nigdy sam kolor. Towarzyszy globalny pasek: `warning` „Offline — zapisujemy lokalnie" / `success` „Zsynchronizowano" (toast, znika). Nigdy modal blokujący.

A11y: `role="status"`, zmiana stanu ogłaszana `aria-live="polite"` tylko przy przejściu do offline/error.

---

## 6. Stany ekranów (normatywne, z architektura-wizualna §6)

Puste stany: klient bez planu — „Twój trener jeszcze nie przypisał Ci planu." bez CTA; pusty bank ćwiczeń — „Dodaj pierwsze ćwiczenie" + przycisk. Klient zarchiwizowany: baner + read-only. Błędy: co się stało + co zrobić, bez kodów błędów i przepraszania. Copy: polski, forma „ty", przyciski nazywają czynność („Zapisz serię").

## 7. Checklist dostępności (gate w design QA, D4)

- [ ] Kontrast ≥ 4.5:1 na obu motywach (uwaga na `muted-foreground` na `surface-raised`)
- [ ] Focus widoczny na każdym elemencie interaktywnym (ring `primary`, offset 2px)
- [ ] Targety ≥ 56px (tryb treningu) / ≥ 44px (reszta); odstępy ≥ 12px
- [ ] Kolor + ikona/etykieta wszędzie (✓, talerze, sync, tagi)
- [ ] Kreator w pełni klawiaturowy; dnd ma alternatywę
- [ ] `prefers-reduced-motion` respektowane
- [ ] Font danych ≥ 15px na mobile
