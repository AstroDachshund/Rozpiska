# Platforma trener ↔ podopieczny — walidacja problemów i etapy developmentu

Data: lipiec 2026 · Status: Research → Define

---

## 1. Metodologia

Research oparty na: materiałach i danych publikowanych przez istniejące platformy (TrueCoach, ABC Trainerize, Everfit, My PT Hub, Hevy Coach, PT Distinction), agregatorach recenzji (Capterra, G2), analizach cenowych rynku 2026, oraz przeglądzie polskich konkurentów (CoachGuru, Coach Mate, TreningLab, Indefit, treneiro, grafitly, Fitebo, Caldis). Uwaga: część źródeł to content marketing samych platform — traktowane jako sygnał, że problem jest na tyle realny, że cała branża buduje wokół niego komunikację, a nie jako dowód naukowy.

Ważne zastrzeżenie: ten research to walidacja wtórna (desk research). Przed rozpoczęciem developmentu warto zrobić walidację pierwotną: 5–10 rozmów z trenerami (w tym Twoim) + krótka ankieta wśród podopiecznych. To jedyny sposób, żeby zweryfikować problemy specyficzne dla polskiego rynku (BLIK, gotówka, dokumentacja).

---

## 2. Walidacja problemów — TRENERZY

Legenda: ✅ potwierdzony rynkowo · ⚠️ realny, ale nie na start / wymaga własnej walidacji · ❌ ryzykowne założenie ("widzi mi się" lub pułapka)

| Problem | Werdykt | Uzasadnienie |
|---|---|---|
| Wiele narzędzi naraz (Excel + kalendarz + komunikator + YouTube + notatnik + płatności) | ✅ | Najsilniej potwierdzony problem w całej branży. Praktycznie każda platforma (My PT Hub, Trainerize, Trainero, polski CoachGuru) buduje cały marketing wokół "koniec z Excelem i 5 narzędziami". Typowy opis: trener z 15 klientami ma Google Sheets do planów, osobną apkę do płatności, SMS-y i notes do notatek. Szacunki branżowe: 6–8 h/tydzień na samą administrację. |
| Excel do planów jest nieczytelny / nie skaluje się | ✅ | Punkt krytyczny to ok. 10 klientów — duplikacja plików, brak wersjonowania, brak powiadomień, klient wypełnia dane "gdzieś indziej". To dokładnie Twoje doświadczenie jako podopiecznego — potwierdzone globalnie i lokalnie (CoachGuru wprost cytuje trenera: "Byłem przyzwyczajony do Excela..."). |
| Utrudnione trackowanie progresu podopiecznych | ✅ | Potwierdzone: niespójne metody (jeden klient loguje w notatkach, drugi SMS-em, trzeci wcale). Automatyczne PR-y, compliance rate (ukończone vs pominięte treningi) to standardowe funkcje konkurencji — bo problem jest realny. |
| Brak centralnej bazy ćwiczeń (+ filmiki instruktażowe) | ✅ | Standard rynkowy: TrueCoach ~1200 filmów, CoachGuru 1200 ćwiczeń + własne, Fitebo 2000+. Kluczowy insight: trenerzy chcą MOŻLIWOŚCI dodawania własnych ćwiczeń i linkowania YouTube — nie musisz budować własnej biblioteki wideo na start. |
| Opóźniona komunikacja / zmiany terminów przez komunikatory | ✅ | Potwierdzone (grafitly zbudowało cały produkt na samym kalendarzu i rezerwacjach; Caldis podobnie). Ale uwaga: komunikacja to też najtrudniejsza rzecz do wygrania — WhatsApp/Messenger są "wystarczająco dobre" i nawyk jest silny. Chat w apce często jest ignorowany na rzecz Messengera. |
| Płatności BLIK/gotówka + dokumentacja | ⚠️ | Problem realny (globalne odpowiedniki: "chasing Venmo payments"), ale to NIE jest MVP. Integracja płatności = Stripe/P24, prowizje (TrueCoach pobiera 5% i trenerzy są wściekli — to wprost okazja, żeby tego NIE robić źle), obowiązki regulacyjne, KSeF. W Polsce treneiro już oferuje BLIK/P24 przez Stripe. Zostaw na później; na start wystarczy pole "status płatności" przy kliencie (ręczne oznaczanie). |
| Statystyki / zarządzanie podopiecznymi (CRM) | ⚠️ | Realne, ale wtórne wobec core (plany + logi). Podstawowa lista klientów z notatkami = MVP. Analityka przychodów i retencji (jak TreningLab) = później. |
| Reklamowanie się, oceny, social proof, wyszukiwarka trenerów | ❌ | To jest dwustronny marketplace — klasyczna pułapka cold start: podopieczni nie przyjdą bez trenerów, trenerzy bez podopiecznych. Matematycznie marketplace potrzebuje ~2,5× więcej użytkowników niż produkt jednostronny, żeby osiągnąć tę samą wartość sieci. Większość marketplace'ów upada, próbując rozwiązać obie strony naraz. Twój model na start to SaaS B2B (trener płaci, przyprowadza własnych podopiecznych) — trener jest kanałem dystrybucji. Marketplace ma sens dopiero przy setkach aktywnych trenerów. |
| Upselling, forsowanie zasad, informacja o kosztach | ❌ na start | Pochodne marketplace'u / płatności. Odkładasz razem z nimi. |
| Kalkulatory i konwertery w jednym miejscu | ⚠️ | Miły dodatek (1RM, kg↔lb, %1RM), tani w implementacji, ale nikt nie kupi apki dla kalkulatora. Wrzucić jako "quick win" po MVP. |
| Zamienniki ćwiczeń | ✅ (uproszczone) | Realna potrzeba obu stron. W MVP wystarczy tagowanie ćwiczeń (partia mięśniowa, sprzęt, wzorzec ruchowy) + ręczne podpięcie zamienników przez trenera. Automatyczne sugestie = później. |
| Real-time insights od podopiecznych | ✅ | To jest wprost core loop: podopieczny loguje ciężar → trener widzi od razu. Konkurencja potwierdza (Trainerize: "instant notifications"). Wchodzi w MVP naturalnie, bez osobnej funkcji. |

---

## 3. Walidacja problemów — PODOPIECZNI

| Problem | Werdykt | Uzasadnienie |
|---|---|---|
| Przejrzysty interfejs do podglądu planu i logowania ciężarów | ✅ | Rdzeń wszystkiego. Recenzje konkurencji pokazują, że "clean client app" to główny wyróżnik (Everfit wygrywa ease-of-use 4.8/5; Hevy Coach 4.9/5 — najwyżej w kategorii, mimo że robi najmniej). Wniosek strategiczny: prostota wygrywa z liczbą funkcji. |
| Zapisywanie progresu, historia ciężarów, auto-PR | ✅ | Standard i realny driver retencji — klienci, którzy trackują, są bardziej konsekwentni. Auto-wykrywanie rekordów przy logowaniu = tanie i bardzo satysfakcjonujące. |
| Timer przerw / długość treningu | ✅ | Standard w każdej apce klienckiej (TreningLab chwali się "inteligentnymi timerami" + Live Activities na iOS). Niski koszt, wysoka wartość odczuwalna. Do MVP lub tuż po. |
| Tipy/filmiki do ćwiczeń ("na czym się skupić") | ✅ | Realny brak wiedzy podopiecznych — rozwiązanie: notatka trenera + link wideo przy ćwiczeniu. Nie budujesz kontentu edukacyjnego, dajesz trenerowi miejsce na jego kontent. |
| Notatki (do ćwiczeń, treningu, samopoczucia) | ✅ | Tanie, standardowe, ważne dla trenera (kontekst: "bolało kolano"). MVP-friendly. |
| Kompatybilność z RPE / %1RM / auto 1RM | ⚠️ | Realne dla zaawansowanych i trenerów siłowych (TrueCoach wygrywa w segmencie S&C właśnie tym). Ale to komplikuje kreator planów. MVP: sety × powtórzenia × ciężar + pole RPE jako opcjonalna kolumna. Pełne programowanie procentowe = v2. |
| Cele/targety, progresja ciężarów, plateau | ⚠️ | Cele proste (np. "przysiad 100 kg") — tak, później. Automatyczne rozwiązywanie plateau / sugestie progresji = de facto AI coaching, poza zakresem na długo. To robota trenera — Twoja apka ma mu tylko pokazać dane. |
| Ustawianie dni treningowych w tygodniu | ✅ | Podstawa struktury planu (plan → tydzień → dzień → ćwiczenia). Wchodzi w kreator planów z definicji. |
| Rozgrzewka, aktywacje, post-workout (stretching, rolowanie) | ⚠️ | Rozwiązanie w MVP: sekcje w ramach jednostki treningowej (rozgrzewka / część główna / cooldown) — czyli feature struktury planu, nie osobny moduł kontentowy. |
| Dostępność multi-platform (watch, PC) | ❌ na start | Web app responsywna (PWA) pokrywa telefon + PC jednym kodem. Apple Watch = osobny, drogi development o marginalnym zasięgu. Nie w pierwszym roku. |
| Integracje: Notion, Google Cal, Apple Health | ❌ na start | Nawet u wielkich graczy integracje są niedopracowane (recenzje TrueCoach: "no api support to Notion or Google", "syncing with MyFitnessPal wasn't smooth"). Każda integracja to stały koszt utrzymania. Apple Health/Google Fit — dopiero gdy będzie natywna apka mobilna. |
| Marketplace planów | ❌ | Ta sama pułapka co wyszukiwarka trenerów + dodatkowo kanibalizuje model biznesowy trenera (po co ma płacić za apkę, która sprzedaje plany obok niego?). Jeśli kiedykolwiek — bardzo ostrożnie. |
| Baza ćwiczeń "co wybrać i jak złożyć" (samodzielne układanie) | ❌ | To inny produkt (apka self-coached typu Hevy/Strong — rynek zajęty, Hevy jest darmowe). Twój podopieczny dostaje plan OD TRENERA. Nie mieszaj tych dwóch produktów. |
| Dodawanie zdjęć/filmików (np. nagrania techniki dla trenera) | ⚠️ | Bardzo wartościowe (form check to realny workflow — dziś leci przez Messengera), ale storage i upload wideo to spory koszt techniczny. v1.5, nie MVP. Na start: pole na link (klient wrzuca na dysk/YT unlisted). |
| "Harassment <3" (przypomnienia/accountability od trenera) | ✅ | Zakładam, że chodzi o nudges/przypomnienia 😄 Potwierdzone: automatyczne przypomnienia to jeden z głównych argumentów sprzedażowych (grafitly: "+20% zrealizowanych treningów"). Push notifications = po MVP (wymagają PWA push lub apki natywnej). |

---

## 4. Kluczowe wnioski strategiczne

**1. Problem jest w 100% realny — ale rynek NIE jest pusty.** Globalnie: TrueCoach, Trainerize, Everfit, My PT Hub, Hevy Coach i ~10 innych. Lokalnie: CoachGuru, Coach Mate, TreningLab, Indefit, treneiro, Fitebo. To dobra i zła wiadomość: walidacja problemu jest darmowa (zrobili ją za Ciebie), ale musisz mieć odpowiedź na pytanie "czemu nie CoachGuru / czemu nie darmowy Hevy Coach?".

**2. Realne szczeliny rynkowe (potencjalne wyróżniki):**
- **Cena i model.** Główny ból trenerów u konkurencji: pricing rosnący skokowo z liczbą klientów (TrueCoach: 12→22 klientów = skok z $58 na $137/mies.) + ukryte prowizje od płatności (5% u TrueCoach). Flat pricing bez limitu klientów to sprawdzony wyróżnik. Polski benchmark cenowy jest niski: Indefit bierze 15 zł/mies.
- **Prostota.** Najwyżej oceniana apka w kategorii (Hevy Coach, 4.9/5 ease-of-use) robi najmniej. Trainerize/Everfit przytłaczają. Twoja teza "czysty interfejs dla podopiecznego" jest zgodna z danymi.
- **Polski rynek**: język, BLIK (docelowo), lokalne realia rozliczeń. Polska konkurencja istnieje, ale żaden gracz nie jest dominujący.

**3. Pułapki, których unikasz w pierwszej wersji:** marketplace/wyszukiwarka trenerów (cold start), płatności (prowizje, regulacje), integracje zewnętrzne (koszt utrzymania), nutrition (osobny, ogromny moduł), własna biblioteka wideo (koszt kontentu), apki natywne + watch (koszt developmentu).

**4. Model dystrybucji:** SaaS dla trenera. Trener płaci (lub jest w darmowym trialu), podopieczni mają za darmo — to standard całej branży i rozwiązuje cold start, bo każdy trener przyprowadza 10–30 użytkowników.

---

## 5. Etapy developmentu

### Etap 0 — Walidacja przed kodem (1–2 tyg.)
- 5–10 rozmów z trenerami (zacznij od swojego). Pytania: czego używasz, ile czasu schodzi na rozpisywanie, co byś zapłacił, co musi być, żebyś porzucił Excela.
- Dokument **architektura techniczna** (patrz sekcja 6).
- Dokument **architektura wizualna** (patrz sekcja 6).

### Etap 1 — MVP (cel: Twój trener + 2–4 innych używa tego zamiast Excela)

Definicja sukcesu MVP: trener rozpisuje plan szybciej niż w Excelu, podopieczny loguje ciężary w trakcie treningu bez frustracji.

**Trener (panel web):**
1. Konta i role (trener / podopieczny), zapraszanie podopiecznego linkiem/e-mailem
2. Bank ćwiczeń: własne ćwiczenia + nazwa, tagi (partia, sprzęt), notatka techniczna, link do wideo (YouTube)
3. Kreator planów: plan → tygodnie → dni treningowe → ćwiczenia (serie × powtórzenia × ciężar/RPE opcjonalnie, tempo/przerwa jako pola opcjonalne, sekcje: rozgrzewka/główna/cooldown)
4. Szablony planów (zapisz plan jako szablon, przypisz kopię klientowi)
5. Przypisanie planu do podopiecznego + edycja "w locie" (zmiany widoczne u klienta od razu)
6. Widok klienta: historia treningów, co ukończone/pominięte, logi ciężarów, notatki klienta

**Podopieczny (mobile-first web/PWA):**
1. Podgląd całego planu + widok "dzisiejszy trening"
2. Tryb treningu: odhaczanie serii, wpisywanie ciężaru i powtórzeń, podgląd "ostatnio: 80 kg × 8"
3. Notatka do ćwiczenia/treningu
4. Timer przerw
5. Podgląd wideo/notatki technicznej od trenera

**Świadomie POZA MVP:** płatności, chat, kalendarz/rezerwacje, marketplace, wykresy statystyk, integracje, push notifications, apki natywne, nutrition, auto-1RM.

### Etap 2 — v1.0 "Retencja" (po feedbacku z MVP)
- Wykresy progresu (ciężar w czasie per ćwiczenie), auto-detekcja PR
- Kalkulator 1RM + estymowane %1RM w kreatorze
- Compliance dashboard trenera (kto trenuje, kto znika)
- Statusy płatności (ręczne oznaczanie — bez procesora płatności)
- PWA push notifications (przypomnienia o treningu)
- Zamienniki ćwiczeń (ręczne przypisanie przez trenera na bazie tagów)

### Etap 3 — v1.5 "Komunikacja i media"
- Chat trener↔podopieczny w kontekście treningu/ćwiczenia (komentarze zamiast pełnego komunikatora — łatwiej wygrać z Messengerem)
- Upload wideo techniki przez podopiecznego (form check)
- Zdjęcia sylwetki / pomiary ciała
- Prosty kalendarz treningów personalnych + przypomnienia

### Etap 4 — v2.0 "Biznes trenera"
- Płatności online (Stripe → BLIK/P24), pakiety, faktury — dopiero tu, i bez prowizji od transakcji jako wyróżnik
- Rezerwacje terminów (self-booking jak grafitly)
- Programowanie procentowe / pełne wsparcie metodologii (RPE targets, %1RM w planie)
- Analityka biznesowa (przychody, retencja)
- Apki natywne (iOS/Android), integracje Health

### Etap 5 — opcjonalnie, przy skali
- Profil publiczny trenera → dopiero potem wyszukiwarka/marketplace
- Marketplace planów, integracje (Google Cal, Notion), wearables

---

## 6. Dwa dokumenty do przygotowania (następny krok)

**Architektura techniczna** — powinna rozstrzygnąć: model danych (User, Trainer, Client, Exercise, Plan, Week, Day, WorkoutSession, SetLog — to serce produktu, warto poświęcić temu najwięcej uwagi, zwłaszcza relację szablon vs instancja planu przypisana klientowi), stack (sugestia spójna z Twoim doświadczeniem: React + TypeScript + Vite lub Next.js, shadcn/ui + Tailwind, Postgres np. przez Supabase — auth i realtime out of the box, co załatwia "real-time insights"), PWA/offline (logowanie ciężarów na siłowni z kiepskim zasięgiem = realny wymóg), hosting i koszty, multi-tenancy (izolacja danych między trenerami), RODO (dane zdrowotne podopiecznych!).

**Architektura wizualna** — powinna rozstrzygnąć: dwa odrębne konteksty UX (panel trenera = gęsty, desktop-first, tabele i kreator; apka podopiecznego = mobile-first, duże tapy, minimalizm, użyteczna w trakcie treningu spoconymi rękami), design tokens na bazie shadcn/ui (uwaga: biblioteka nazywa się shadcn/ui, nie ShadCDN), tryb ciemny (siłownia!), stany kluczowych ekranów (trening aktywny, seria odhaczona, PR), system tagów ćwiczeń wizualnie.

Oba dokumenty mogę przygotować w kolejnych krokach — najlepiej zaczynając od modelu danych, bo od niego zależy i technika, i UI kreatora.
