# Rozpiska — brand i copy marketingowy

Wersja: 0.2 · Do użycia: po zamknięciu MVP, przy otwarciu pilotażu na zewnętrznych trenerów
Dokument komplementarny do: architektura-wizualna.md (§2 kierunek „Stal i magnezja", §9 głos)
Zmiany 0.2 (konfrontacja z docs, 07.2026): copy dociągnięte do zakresu MVP — usunięte obietnice zamienników ćwiczeń i rekordów PR (wracają do copy w Etapie 2), compliance opisane per klient (nie jako dashboard zbiorczy), bio IG bez emoji, doprecyzowane zależności przed publikacją landing (§7).

---

## 1. Pozycjonowanie

**Kim jesteśmy:** narzędzie pracy trenera personalnego — plany, bank ćwiczeń i postępy podopiecznych w jednym miejscu, zamiast Excela i pięciu aplikacji.

**Dla kogo (kupujący):** trener personalny w Polsce, 5–30 podopiecznych, dziś rozpisuje plany w Excelu/Arkuszach i ogarnia resztę Messengerem. To on płaci i on przyprowadza podopiecznych.

**Dla kogo (użytkownik):** podopieczny — dostaje apkę za darmo od swojego trenera. Nie sprzedajemy mu nic; sprzedajemy trenerowi to, że jego podopieczni wreszcie mają porządne narzędzie.

**Przeciwko czemu gramy:** nie przeciwko innym aplikacjom — przeciwko Excelowi, notatkom w telefonie i chaosowi na Messengerze. (W komunikacji nigdy nie wymieniamy konkurencji z nazwy.)

**Trzy filary przewagi (z researchu, każdy musi być prawdziwy w produkcie):**
1. **Prostota** — podopieczni faktycznie otwierają apkę, bo tryb treningu to jeden ekran, duże przyciski, zero szukania.
2. **Uczciwy, przewidywalny cennik** — bez skoków ceny co kilku podopiecznych i bez prowizji od Twoich pieniędzy. (Dokładny model cenowy: decyzja przed pilotażem; komunikacyjnie zobowiązujemy się do "flat, bez prowizji".)
3. **Po polsku i dla polskich realiów** — język, kilogramy, sposób pracy polskich trenerów.

**Czym NIE jesteśmy (dyscyplina komunikacji):** nie jesteśmy apką do samodzielnego treningu, marketplace'em trenerów, apką dietetyczną ani "AI coachem". Każde z tych słów przyciąga niewłaściwe oczekiwania.

---

## 2. Tożsamość marki

**Nazwa:** Rozpiska — słowo, którym trenerzy i podopieczni naprawdę nazywają plan ("wyślę ci rozpiskę"). Zapis: zawsze wielką literą, bez cudzysłowu; odmieniamy naturalnie (Rozpiski, w Rozpisce).

**Tagline (rekomendacja + warianty):**
- ⭐ **„Rozpiska. Plany, które podopieczni naprawdę otwierają."**
- „Cała robota trenera w jednym miejscu."
- „Koniec z Excelem. Serio."
- Wariant funkcjonalny (App Store/SEO): „Plany treningowe i postępy podopiecznych — w jednym miejscu."

**Osobowość marki:** doświadczony partner z siłowni — konkretny, spokojny, kompetentny; zero motywacyjnego krzyku. Marka mówi jak dobry trener: krótko, rzeczowo, z szacunkiem do czyjejś roboty.

**Głos — zasady (spójne z arch. wizualną §9):**
- Po polsku, forma "ty", czasowniki zamiast rzeczowników odczasownikowych ("rozpisujesz plan" zamiast "kreacja planów treningowych").
- Konkret zamiast przymiotników: nie "innowacyjna platforma", tylko "plan, bank ćwiczeń i logi ciężarów w jednym miejscu".
- Zakazane: "rewolucja", "AI-powered", "zmiażdż trening", "najlepsza apka", emoji 💪🔥, anglicyzmy tam, gdzie jest polskie słowo.
- Dozwolony żargon siłowni (rozpiska, superset, obwód, PR) — to język odbiorcy, nie ozdobnik.
- Liczby zawsze zapisem treningowym: `3 × 8–10 @ 80 kg` (mono w UI, normalnie w tekstach marketingowych).

**Identyfikacja wizualna (kierunek dla Claude Design):**
- Logo: logotyp "Rozpiska" w Barlow Condensed SemiBold + sygnet z sygnatury produktu — przekrój gryfu z talerzami (koła w kolorach `plate-*`), działający też jako favicon/ikona PWA w wersji monochromatycznej.
- Kolory i typografia: 1:1 z tokenami arch. wizualnej §3 (marketing nie dostaje osobnej palety — landing wygląda jak produkt, to buduje zaufanie).
- Materiały: zrzuty prawdziwego UI na ciemnym tle "stal" zamiast stockowych zdjęć siłowni; jeśli zdjęcia — detale (gryf, magnezja, dłoń z telefonem), nigdy pozowane sylwetki.

---

## 3. Architektura komunikatów

**One-liner:** Rozpiska to narzędzie dla trenerów personalnych: rozpisujesz plany z własnego banku ćwiczeń, podopieczny loguje ciężary w prostej apce, a ty widzisz jego postępy na bieżąco.

**Elevator pitch (30 s, na rozmowy z trenerami):** "Znasz to: plany w Excelu, filmiki na YouTube, wyniki na Messengerze, notatki w telefonie. Rozpiska zbiera to w jedno. Rozpisujesz plan raz — z własnej bazy ćwiczeń, z twoimi filmikami i wskazówkami. Podopieczny dostaje czytelną apkę: widzi co ma zrobić, odhacza serie, wpisuje ciężary — nawet bez zasięgu na siłowni. A ty widzisz na żywo, kto trenuje i jakie robi postępy."

**Wartości → dowody (trener):**

| Obietnica | Dowód w produkcie |
|---|---|
| Rozpisujesz szybciej niż w Excelu | szablony, duplikowanie serii/dni/tygodni, wyszukiwarka ćwiczeń z klawiatury |
| Twoja wiedza w jednym miejscu | własny bank ćwiczeń: notatki techniczne, filmiki, tagi (partia, sprzęt, wzorzec ruchowy) |
| Wiesz, co się dzieje | podgląd na żywo, historia sesji, zrealizowane vs pominięte treningi |
| Zmieniasz plan bez wysyłania plików | edycja "w locie" — podopieczny widzi zmiany od razu |
| Bez niespodzianek w cenniku | flat pricing, zero prowizji od płatności |

**Wartości → dowody (podopieczny):**

| Obietnica | Dowód |
|---|---|
| Zawsze wiesz, co masz zrobić | ekran "Dziś": plan dnia, wskazówki i filmik od twojego trenera |
| Logujesz w 2 tapnięcia między seriami | podpowiedź "ostatnio: 80 × 8", stepper ±2,5 kg, auto-timer przerwy |
| Nic nie ginie | działa offline na siłowni, historia każdej serii na zawsze |
| Widzisz swój progres | historia sesji i zapisanych ciężarów |

> Poza copy do Etapu 2 (nie obiecujemy w MVP): rekordy (PR) i auto-detekcja, zamienniki ćwiczeń, wykresy progresu, przypomnienia push. Wracają do tej tabeli, gdy wejdą do produktu.

---

## 4. Copy: strona główna (landing)

> Konwencja: [S#] = sekcja, kolejność = kolejność na stronie. Placeholdery w «nawiasach» — do uzupełnienia realnymi danymi z pilotażu. ŻADNYCH zmyślonych opinii i liczb.

**[S1 Hero]**
H1: **Plany, które podopieczni naprawdę otwierają.**
Sub: Rozpiska to jedno miejsce na całą twoją robotę trenerską: plany treningowe, bank ćwiczeń i postępy podopiecznych — zamiast Excela, Messengera i notatek w telefonie.
CTA główne: **Dołącz do pilotażu** · CTA drugie: Zobacz, jak działa
Wizual: telefon z trybem treningu (dark) obok laptopa z kreatorem (light).

**[S2 Problem — sekcja "Znasz to?"]**
Nagłówek: Excel był dobry na początek.
Tekst: Plan w arkuszu, który rozjeżdża się na telefonie. Wyniki wklejane na Messengerze — albo wcale. Filmik instruktażowy gdzieś w historii czatu. Przy piątym podopiecznym to jest niewygodne. Przy piętnastym — to jest twój drugi etat.
Zamknięcie: Rozpisywanie planów to twoja praca. Szukanie ich po plikach — już nie.

**[S3 Dla trenera — 4 karty funkcji]**
Nagłówek sekcji: Twój warsztat w jednym miejscu.
- **Kreator planów** — Tygodnie, dni, rozgrzewka i część główna. Duplikujesz serie, dni i całe tygodnie zamiast klikać od zera. Plan zapisujesz jako szablon i przypisujesz kolejnym osobom jednym ruchem.
- **Twój bank ćwiczeń** — Twoje ćwiczenia, twoje wskazówki, twoje filmiki. Otagowane partiami mięśniowymi i sprzętem — żebyś nie tłumaczył tego samego dziesiąty raz.
- **Postępy na bieżąco** — Podopieczny odhacza serię na siłowni, ty widzisz to u siebie. Które treningi zrobione, które pominięte, jakie ciężary poszły w górę — bez pytania "i jak było?".
- **Zmiany bez wysyłania plików** — Poprawiasz plan, podopieczny widzi nową wersję od razu. Koniec z "wysłałem ci nowy plik, ten stary skasuj".

**[S4 Dla podopiecznego]**
Nagłówek: Twoi podopieczni dostają apkę, nie arkusz.
Tekst: Ekran "Dziś" pokazuje dokładnie to, co trener rozpisał: ćwiczenia, serie, wskazówki i filmik do techniki. Odhaczasz serię, wpisujesz ciężar — apka podpowiada, co robiłeś ostatnio, i sama odlicza przerwę. Działa nawet w piwnicy bez zasięgu; wyniki dosyłają się same.
Dopisek: Podopieczni nie płacą za Rozpiskę nic.

**[S5 Jak to działa — 3 kroki]**
1. **Dodajesz ćwiczenia** — swoje, ze swoimi filmikami i wskazówkami.
2. **Rozpisujesz plan i przypisujesz podopiecznemu** — z szablonu albo od zera.
3. **Prowadzisz ludzi, nie pliki** — postępy, historia i notatki spływają same.

**[S6 Zaufanie / pilotaż]** *(wersja przed społecznym dowodem — uczciwa)*
Nagłówek: Budowane z trenerami, nie dla trenerów.
Tekst: Rozpiska powstała z frustracji podopiecznego, który dostawał plany w Excelu — i jest rozwijana ramię w ramię z trenerami, którzy używają jej codziennie. Dołączając do pilotażu, dostajesz pełny dostęp «warunki pilotażu» i realny wpływ na to, co powstanie dalej.
«Po pilotażu: 2–3 cytaty trenerów z imieniem, miastem i liczbą podopiecznych + liczby: zalogowane serie, ukończone treningi.»

**[S7 Cennik — filozofia (przed ustaleniem cen)]**
Nagłówek: Prosty cennik. Obiecujemy.
Tekst: Jedna cena, wszyscy twoi podopieczni — bez progów "do 10 klientów" i bez skoków ceny, gdy twój biznes rośnie. Zero prowizji od twoich rozliczeń z podopiecznymi. Konkretne kwoty ogłosimy po pilotażu; uczestnicy pilotażu dostaną «warunki specjalne».

**[S8 FAQ]**
- **Czy moi podopieczni muszą płacić?** Nie. Płaci tylko trener; podopieczni korzystają za darmo.
- **Czy muszę instalować aplikację?** Rozpiska działa w przeglądarce na telefonie i komputerze; na telefonie dodasz ją do ekranu głównego jak zwykłą apkę.
- **Co jeśli na siłowni nie ma zasięgu?** Trening logujesz normalnie — wyniki zapisują się na telefonie i dosyłają, gdy wróci internet.
- **Czy mogę dodać własne ćwiczenia i filmiki?** Tak — bank ćwiczeń budujesz sam: nazwy, wskazówki, linki do twoich filmów.
- **Czy Rozpiska obsługuje płatności / kalendarz / dietę?** Jeszcze nie. Zaczynamy od tego, co najważniejsze: planów i postępów. Kolejne moduły będą powstawać z trenerami z pilotażu.
- **Co z moimi danymi i danymi podopiecznych?** Dane są przechowywane na serwerach w Unii Europejskiej, dostęp ma tylko trener i jego podopieczny. Konto można usunąć w każdej chwili.

**[S9 CTA końcowe]**
H2: Rozpisz pierwszy plan jeszcze dziś.
Sub: Pilotaż dla ograniczonej grupy trenerów — «liczba miejsc/termin».
CTA: **Dołącz do pilotażu**

**[Stopka]** Rozpiska · Kontakt: «e-mail» · Polityka prywatności · Regulamin · «dane firmy»

---

## 5. Copy: pozostałe materiały

**Bio Instagram (trenerski kanał nr 1):**
"Rozpiska — plany treningowe i postępy podopiecznych w jednym miejscu. Dla trenerów, którym Excel już nie wystarcza. Pilotaż — link poniżej."

**Wiadomość do trenera (DM/mail — zaproszenie do pilotażu):**
"Cześć «imię», buduję Rozpiskę — narzędzie, które zastępuje Excela w pracy trenera: kreator planów, własny bank ćwiczeń z filmikami i apka dla podopiecznych do logowania ciężarów (działa offline na siłowni). Szukam «liczba» trenerów do pilotażu: pełny dostęp «warunki», w zamian szczery feedback raz na dwa tygodnie. Twoi podopieczni nie płacą nic. Wchodzisz? Mogę pokazać 10-minutowe demo."

**E-mail powitalny (trener, po założeniu konta):**
Temat: Twoja Rozpiska jest gotowa
"Cześć «imię», trzy kroki na start: 1) Dodaj kilka swoich ćwiczeń (z linkami do filmików — podopieczni to kochają). 2) Rozpisz pierwszy plan albo zapisz go od razu jako szablon. 3) Zaproś podopiecznego linkiem — zaloguje się bez hasła. Odpisz na tego maila, jeśli cokolwiek zgrzyta: czytam wszystko. — Piotr, Rozpiska"

**E-mail powitalny (podopieczny, po zaproszeniu):**
Temat: «Trener» przygotował ci plan w Rozpisce
"Twój plan czeka. Otwórz, dodaj do ekranu głównego i tyle — na siłowni odhaczasz serie i wpisujesz ciężary, apka podpowie, co robiłeś ostatnio, i odliczy przerwę. Powodzenia na pierwszym treningu 🏋️" *(jedyne dozwolone emoji w całym systemie: sztanga, tylko tutaj)*

**Meta description (SEO):** "Rozpiska — aplikacja dla trenerów personalnych: kreator planów treningowych, bank ćwiczeń i postępy podopiecznych w jednym miejscu. Zamiast Excela."

---

## 6. Zasady uczciwości komunikacji (nienegocjowalne)

1. Zero zmyślonych opinii, liczb użytkowników i "★★★★★" przed zebraniem prawdziwych — sekcja S6 ma uczciwą wersję pilotażową.
2. Nie obiecujemy funkcji spoza MVP (płatności, kalendarz, dieta, a także: rekordy PR, zamienniki ćwiczeń, wykresy, push — Etap 2) — FAQ mówi wprost "jeszcze nie".
3. "Działa offline" zawsze doprecyzowane do logowania treningu — nie całej aplikacji.
4. Obietnica cenowa (flat, bez prowizji) wchodzi do copy dopiero, gdy potwierdzisz ją jako wiążącą decyzję biznesową — bo cofnięcie jej po publikacji kosztuje zaufanie. Decyzja trafia do dziennika decyzji (arch. techniczna §9).
5. Przed publikacją landing z FAQ muszą istnieć w produkcie: manifest PWA ("dodasz do ekranu głównego") i funkcja usunięcia konta ("konto można usunąć w każdej chwili") — oba w checkliście po M8 (plan-claude-code §9).

## 7. Kolejne kroki (po zamknięciu MVP)

1. Decyzja cenowa (S7 na nią czeka) + warunki pilotażu (miejsca, czas, zniżka) — wpis do dziennika decyzji arch. technicznej §9.
2. Weryfikacja nazwy: domena, Instagram, UPRP/EUIPO (dziennik decyzji §9 pkt 8 arch. technicznej).
3. Domknięcie zależności FAQ: manifest PWA + ikony, funkcja "usuń konto" (checklist po M8, plan-claude-code §9).
4. Landing w Claude Design na tokenach z arch. wizualnej + copy z §4 (jedna strona, formularz zapisu do pilotażu — e-mail + liczba podopiecznych).
5. Sygnet logo (przekrój gryfu) — 3 warianty do wyboru.
6. Po 4–6 tygodniach pilotażu: wymiana placeholderów «» na realne cytaty i liczby; gdy Etap 2 dowiezie PR/zamienniki/wykresy — aktualizacja §3 i S3.
