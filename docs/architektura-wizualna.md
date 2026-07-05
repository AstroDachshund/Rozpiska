# Architektura wizualna — Rozpiska

Wersja: 0.1 (draft do iteracji) · Zakres: MVP · Implementacja: shadcn/ui + Tailwind CSS 4
Dokument komplementarny do: architektura-techniczna.md (§4 — struktura aplikacji)

---

## 1. Punkt wyjścia

Rozpiska to dwa produkty w jednej aplikacji, używane w skrajnie różnych warunkach:

| | Panel trenera | Tryb podopiecznego |
|---|---|---|
| Urządzenie | laptop/desktop, mysz | telefon, kciuk, często jedną ręką |
| Otoczenie | biurko, spokój | siłownia: hałas, pot, przerwa 90 s między seriami |
| Zadanie | tworzyć i analizować (gęstość informacji) | odczytać i odhaczyć (zero tarcia) |
| Sesja | 20–60 min skupienia | 30-sekundowe zerknięcia × 25 razy |
| Motyw | jasny (default) + ciemny | **ciemny (default)** + jasny |

Jeden system tokenów, dwa "tryby gęstości". Błąd, którego unikamy: projektowanie jednego uniwersalnego UI, który jest za gęsty na siłownię i za rzadki do pracy trenera.

**Zasada nadrzędna:** liczby są materiałem tego produktu. `3 × 8–10 @ 80 kg` to nasz odpowiednik zdjęcia produktu w sklepie — typografia danych treningowych dostaje pierwszą klasę, nie jest zwykłym tekstem w tabeli.

---

## 2. Kierunek wizualny: „Stal i magnezja"

Świat produktu to siłownia: stal gryfu, moletowanie, magnezja, kolorowe talerze kalibrowane. Stąd wynika wszystko poniżej — zamiast generycznego "fitness-gradientu" (neony, zdjęcia sylwetek, agresywny lime).

- **Baza**: chłodne grafity i stal — ciemne tło nie jest czystą czernią (#000), tylko grafitem z niebieskim podtonem, jak oksydowana stal. Jasny motyw: chłodna biel papieru, bez kremu.
- **Akcent główny — „Dwudziestka"**: kobaltowy błękit talerza kalibrowanego 20 kg (i wagi samego gryfu). Jeden akcent, używany z dyscypliną: akcje główne, aktywne stany, linki.
- **Paleta danych — kolory talerzy IPF**: czerwień 25 / błękit 20 / żółć 15 / zieleń 10 / biel 5. Używana WYŁĄCZNIE do znaczenia (tagi, wizualizacja ciężaru, wykresy w Etapie 2) — nigdy dekoracyjnie.
- **Sygnatura produktu — „pasek talerzy"**: ciężar w trybie treningu renderowany jako miniaturowy załadowany gryf (np. 80 kg = gryf + 25+5 na stronę, w kolorach talerzy). To nie ozdoba: podopieczni realnie liczą w głowie, co nałożyć na gryf — sygnatura ma użyteczność. Jedno miejsce odwagi; reszta interfejsu pozostaje cicha.

Czego świadomie NIE robimy: zdjęć stockowych ludzi na siłowni, gradientów neonowych, ilustracji maskotek, czystej czerni z jednym kwaśnym zielonym akcentem (najczęstszy "AI-look" ciemnych appek).

---

## 3. Design tokens

### 3.1 Kolor (hex; mapowane na zmienne CSS shadcn/ui)

**Neutralne — skala „Stal":**

| Token | Dark (default klienta) | Light (default trenera) |
|---|---|---|
| `--background` | `#101214` | `#FAFBFC` |
| `--card` / `--surface` | `#17191C` | `#FFFFFF` |
| `--surface-raised` (aktywna seria, modale) | `#1E2126` | `#F2F4F6` |
| `--border` | `#26292E` | `#E3E6EA` |
| `--muted-foreground` | `#8A919B` | `#5C6470` |
| `--foreground` | `#EDEFF2` | `#16181B` |

**Akcent i semantyka:**

| Token | Wartość | Rola |
|---|---|---|
| `--primary` „Dwudziestka" | `#2353D9` (dark: rozjaśniony `#3B6AF0`) | CTA, aktywne stany, focus |
| `--success` | `#2E9E5B` | seria ukończona, sync OK |
| `--destructive` | `#D23B33` | błędy, usuwanie |
| `--warning` | `#E8930C` | offline, niezapisane |
| `--gold` (PR) | `#F0B429` | wyłącznie moment rekordu |

**Paleta danych „Talerze"** (chipy tagów, pasek talerzy, przyszłe wykresy): `plate-25: #D23B33`, `plate-20: #2353D9`, `plate-15: #E8B21A`, `plate-10: #2E9E5B`, `plate-5: #E9EDF1`. Uwaga dyscyplinarna: czerwień 25 dzieli barwę z `--destructive` — dozwolone, bo talerz zawsze występuje jako chip z etykietą/kształtem, nigdy jako pełnoekranowy stan błędu; kolor nigdy nie jest jedynym nośnikiem znaczenia (dostępność, §8).

### 3.2 Typografia

| Rola | Krój | Zastosowanie |
|---|---|---|
| Display | **Barlow Condensed** SemiBold | nagłówki ekranów, nazwy dni ("PUSH A"), liczniki timera. Energia plakatu siłowego; kondensacja oszczędza szerokość na mobile. Pełne polskie diakrytyki. |
| UI / body | **Manrope** (400/500/700) | cały interfejs, opisy, formularze. |
| Dane | **IBM Plex Mono** Medium, `tabular-nums` | ciężary, powtórzenia, RPE, historia serii. Monospace wyrównuje kolumny logów bez tabel i czyni zapis `80 × 8` rozpoznawalnym znakiem produktu. |

Skala (mobile → desktop): 13/14 (caption), 15/15 (body), 17/16 (emphasized), 22/20 (h3), 28/24 (h2), 40/32 (display — licznik timera, ciężar w aktywnej serii). Line-height body 1.5; dane 1.2.

### 3.3 Kształt, przestrzeń, elewacja

- Radius: `8px` (inputy, przyciski), `12px` (karty), `999px` (chipy tagów). Bez ostrych 0px (broadsheet-look) i bez 24px+ (toy-look).
- Spacing: siatka 4px; gęstość trenera bazuje na kroku 8, gęstość klienta na kroku 12–16.
- Elewacja w dark mode przez rozjaśnienie powierzchni (tabela wyżej), nie przez cienie; w light mode cień `0 1px 3px rgb(22 24 27 / 0.08)` maks. dwa poziomy.
- Ikony: Lucide (spójne z shadcn/ui), stroke 1.75, rozmiar 20 (trener) / 24 (klient).

---

## 4. Mapowanie na shadcn/ui

- Tokeny z §3.1 wchodzą 1:1 w zmienne `:root` / `.dark` shadcn (`--background`, `--primary`, `--destructive` itd.); paleta talerzy i `--gold` jako rozszerzenie w `@theme` Tailwinda (`--color-plate-25` …).
- Motyw per kontekst: layout `(client)` ustawia `class="dark"` domyślnie (przełącznik w profilu), layout `(trainer)` domyślnie jasny. Ten sam zestaw tokenów — zero forków komponentów.
- Komponenty bazowe bez modyfikacji: Button, Input, Dialog, DropdownMenu, Tabs, Sheet, Sonner (toasty), Command (paleta wyszukiwania ćwiczeń!).
- Komponenty własne do zbudowania (na prymitywach shadcn): `SetRow` (wiersz serii z logowaniem), `PlateBar` (sygnatura — pasek talerzy), `RestTimer`, `ExerciseCard`, `PlanBuilderTree` (kreator), `TagChip` (kolor z palety talerzy wg partii mięśniowej), `SyncBadge` (online/offline/pending).

---

## 5. Dwa konteksty — zasady projektowe

### 5.1 Panel trenera (desktop-first, jasny)

- Layout: stały sidebar nawigacji (Klienci / Ćwiczenia / Szablony), obszar roboczy maks. 1200px, gęste tabele z `tabular-nums`.
- **Kreator planu = najdroższy UI projektu.** Struktura drzewa: tydzień → dzień → sekcja (rozgrzewka/główna/cooldown) → ćwiczenie → serie. Zasady: dodanie ćwiczenia przez `Command` (wyszukiwarka z tagami, enter dodaje — ręce nie schodzą z klawiatury); edycja serii inline w wierszu (bez modali!); duplikowanie serii/dnia/tygodnia jednym przyciskiem (trenerzy programują przez kopiowanie); drag&drop z uchwytem, `position` float (zgodnie z arch. techniczną §3.3).
- Widok klienta u trenera: nagłówek z compliance ("3/4 w tym tygodniu"), oś czasu sesji, żywa kropka "trenuje teraz" (realtime) w kolorze `--primary`.
- Klawiatura: pełna obsługa Tab/Enter/Esc w kreatorze; skróty (D — duplikuj serię) w Etapie 2.

### 5.2 Aplikacja podopiecznego (mobile-first, ciemny)

- Nawigacja: dolny pasek 3 pozycje (Dziś / Plan / Historia) w strefie kciuka; brak hamburgera.
- **Tryb treningu — reguły twarde:**
  - Cele dotykowe min. **56×56px** dla odhaczenia serii (standard 44 to za mało dla spoconych rąk), odstępy min. 12px.
  - Jedna seria = jeden wiersz `SetRow`: `[nr] [cel: 8–10 @ 80 kg] [input kg] [input reps] [✓]`. Inputy prefillowane ostatnim wynikiem — najczęstszy przypadek ("tak samo jak ostatnio") to jeden tap.
  - Stepper ±2,5 kg przy polu ciężaru (najmniejszy realny skok talerzy) zamiast samej klawiatury.
  - "Ostatnio: 80 × 8" zawsze widoczne przy ćwiczeniu (mono, muted).
  - `PlateBar` pod ciężarem bieżącej serii (sygnatura, §2) — z tapnięciem pokazującym rozpiskę talerzy na stronę.
  - Timer przerwy startuje automatycznie po odhaczeniu serii (czas z `rest_seconds` planu); pełnoekranowy licznik Barlow Condensed 40px+, działa przy zgaszonym ekranie o tyle, o ile pozwala PWA (wake lock podczas aktywnej sesji).
  - Zero nawigacji wymaganej w trakcie: cały trening to jeden przewijany ekran.

---

## 6. Kluczowe ekrany i stany

| Ekran / stan | Zachowanie |
|---|---|
| Seria odhaczona | wiersz przygasa, znacznik `--success`, haptyka (vibrate 10 ms), timer startuje. Bez konfetti. |
| **Rekord (PR)** | jedyny „głośny" moment: krótki złoty impuls na wierszu + toast "Nowy rekord: 85 kg × 8" (`--gold`). Etap 2: zapis do `personal_records`. |
| Trening ukończony | ekran podsumowania: czas, tonaż, serie ukończone/plan, pole notatki + samopoczucie (1–5). |
| Offline | pasek `--warning` "Offline — zapisujemy lokalnie" + `SyncBadge` przy każdym niesynchronizowanym logu; po powrocie sieci pasek `--success` "Zsynchronizowano". Nigdy modal blokujący. |
| Pusty stan: brak planu (klient) | "Twój trener jeszcze nie przypisał Ci planu." + nic więcej — bez CTA donikąd. |
| Pusty stan: bank ćwiczeń (trener) | zaproszenie do działania: "Dodaj pierwsze ćwiczenie" + przycisk; opcjonalnie import startowy (decyzja produktowa poza MVP). |
| Klient zarchiwizowany | baner informacyjny + całość read-only (spójnie z decyzją nr 4 arch. technicznej). |
| Błędy | komunikat mówi co się stało i co zrobić ("Nie udało się zapisać planu — sprawdź połączenie i spróbuj ponownie"); bez przepraszania, bez kodów błędów w UI. |

## 7. Ruch

Trzy zaprojektowane momenty, nic więcej: (1) odhaczenie serii — 150 ms ease-out; (2) impuls PR — 400 ms, jednorazowy; (3) przejście timera — licznik pojawia się spring 200 ms. Zero animacji na wejściu list i ekranów. `prefers-reduced-motion` wyłącza wszystko poza zmianą koloru.

## 8. Dostępność (poziom minimum, nienegocjowalny)

- Kontrast tekstu ≥ 4.5:1 na obu motywach (tokeny z §3.1 są pod to dobrane; sprawdzić `--muted-foreground` na `--surface-raised`).
- Kolor nigdy jedynym nośnikiem: seria ukończona = kolor + ikona ✓; talerze = kolor + etykieta kg.
- Widoczny focus (`--primary`, 2px offset) na każdym elemencie interaktywnym — kreator musi być w pełni klawiaturowy.
- Cele dotykowe: §5.2. Font danych nie mniejszy niż 15px na mobile.

## 9. Głos i copy

Polski, bezpośredni, forma "ty", zerowy coach-speak ("Zmiażdżyłeś to! 💪" — nie). Trener: rejestr narzędzia pracy ("Przypisz plan", "Zarchiwizuj klienta"). Klient: rejestr partnera treningowego — konkretny, spokojny ("Ostatnio: 80 × 8", "Przerwa: 90 s", "Nowy rekord: 85 kg"). Przyciski nazywają czynność: "Zapisz serię", nie "OK". Ta sama nazwa akcji przez cały flow (przycisk "Przypisz plan" → toast "Plan przypisany").

## 10. Proces z Claude Design / Claude Code

1. Ten dokument + architektura techniczna trafiają do repo (`/docs`) i są linkowane w `CLAUDE.md` — każda sesja generowania UI zaczyna z tokenami z §3, nie z domyślnym stylem shadcn.
2. Kolejność projektowania (zgodna z kolejnością budowy z arch. techn. §10): tokeny + motywy → `SetRow` i tryb treningu (najpierw najtrudniejszy ekran — on testuje system) → kreator → reszta.
3. Prototypy ekranów jako artefakty React na realnych danych treningowych (Twój własny plan to idealny materiał testowy), nie na lorem ipsum.
4. Po pierwszym działającym trybie treningu: test na siłowni, jedną ręką, w przerwie między seriami — to jest właściwe "code review" tego ekranu.