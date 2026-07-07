# M2 — Auth & zaproszenia — design (spec)

Data: 2026-07-07 · Status: zatwierdzony w brainstormingu (Piotr) · Milestone: **M2**

Ten dokument **nie zastępuje** `docs/plan-claude-code.md §2` — plan jest kanonem i dzieli M2 na sesje S2.1/S2.2/S2.3. Spec dokłada rozstrzygnięcia, których plan nie dopina: model zaproszenia, kontrakt RPC `accept_invite`, sposób tworzenia profilu, konfigurację e-mail. Rozbieżność spec↔plan rozstrzyga plan (kanon); rozbieżność w szczegółach technicznych rozstrzyga ten spec.

## 1. Rozstrzygnięcia (z brainstormingu)

- **Trenerzy: seedowani** — brak publicznej rejestracji trenera w MVP. Konta trenerów tworzone przez seed/`service_role` (`auth.users` + `profiles(role='trainer')`). Publiczna rejestracja poza zakresem, do czasu popytu.
- **Logowanie**: magic link jako domyślne, hasło jako fallback (decyzja arch. §9.6). Dostawca e-mail: **Resend** przez `[auth.email.smtp]` w `config.toml`; klucz `RESEND_API_KEY` wyłącznie jako sekret (GitHub/Vercel/`.env.local`), nigdy w repo.
- **Model zaproszenia: „email-locked + link do skopiowania"** (świadomy kompromis względem czystego email-only). Trener generuje tokenizowany link `/invite/[token]` (kanał Messenger z planu ✓); strona rejestracji pokazuje e-mail z zaproszenia **zablokowany**; `accept_invite` odmawia aktywacji, jeśli e-mail konta ≠ e-mail zaproszenia. Kompromis: link jest przekazywalny (możliwy forward), ale konto zawsze powstaje na zaproszonym adresie.

## 2. Kontrakt `accept_invite` (S2.2)

Funkcja Postgres `SECURITY DEFINER`, w **schemacie nieeksponowanym** (nie `public` — reguła Supabase: DEFINER w `public` jest wołalny przez `anon`/`authenticated` przez `/rpc`). Wywoływana przez świeżo zalogowanego klienta. Atomowo (jedna transakcja):

1. `select` invite po `token` → musi istnieć, `expires_at > now()`, `accepted_at is null` (inaczej wyjątek — zużyty/przeterminowany).
2. **Wymuszenie e-maila**: `(select auth.jwt() ->> 'email')` = `invite.email` (case-insensitive) — inaczej wyjątek (cudzy adres).
3. `insert into public.profiles (id, role, full_name) values (auth.uid(), 'client', …)` — DEFINER omija brak polityki INSERT na `profiles` (zamierzone; §M1).
4. `trainer_clients`: rekord dla `(trainer_id = invite.trainer_id, client_id = auth.uid())` → status `active` (insert lub update z `invited`).
5. `update invites set accepted_at = now()` (single-use).

Grant `execute` tylko dla `authenticated` (nie `anon` — klient musi być zalogowany, żeby mieć `auth.uid()`/email). Walidacja e-maila w kroku 2 zapewnia, że token nie wystarczy bez konta na właściwym adresie.

**Testy (ten sam PR)**: happy path (aktywacja); token zużyty; przeterminowany; e-mail konta ≠ zaproszenie; token nieistniejący. Testy jako role API (lokalnie OrbStack / w CI) — nie tylko symulacja SQL (lekcja z M1 §9.12: superuser omija granty/RLS).

## 3. Tworzenie profilu

- **Klient**: wyłącznie przez `accept_invite` (krok 3). Brak polityki INSERT na `profiles` pozostaje — profil nie powstaje „samo z siebie" przy signupie.
- **Trener**: seed/`service_role`.
- **Bez triggera `handle_new_user` na `auth.users`** w MVP — tworzenie profilu jest jawne i kontekstowe (klient: przez zaproszenie; trener: przez seed). Trigger rozważymy, jeśli pojawi się self-signup.

## 4. Routing i motywy (S2.3)

Middleware czyta rolę z sesji (`profiles.role`) i pilnuje granicy `(trainer)`/`(client)` (redirect przy złej grupie). Layouty grup ustawiają motyw klasą: `(client)` = `dark` default, `(trainer)` = jasny (design-system §2). E2E Playwright: zaproszenie → rejestracja → klient w `(client)`; trener nie wejdzie do `(client)` i odwrotnie (DoD zamykające M2).

## 5. Zależności i uwagi

- **Weryfikacja magic linka / linka zaproszenia: flow token-hash (`verifyOtp({ token_hash, type })`), nie PKCE `?code=`.** Route handler `/auth/confirm` wymienia token na sesję i przekierowuje na bezpieczny `next` lub stronę roli. Powód: token-hash działa, gdy link zostanie otwarty w innej przeglądarce / na innym urządzeniu niż go zamówiono (PKCE wymaga cookie `code_verifier` w tej samej przeglądarce). Kluczowe dla linków zaproszeń przekazywanych Messengerem (§1) i spójne dla obu ścieżek (login S2.1, zaproszenie S2.2). Szablony e-mail (potwierdzenie / zaproszenie) w `config.toml` muszą celować w `/auth/confirm?token_hash=…&type=…&next=…`. Lokalnie dostawcą e-mail jest wbudowany Inbucket/Mailpit (`:54324`); Resend dopiero na staging/prod.
- **Zapisy auth przez Server Actions** (`signInWithPassword`, `signInWithOtp`, `signOut`) — cookies ustawiane po stronie serwera, walidacja Zod na serwerze (jedno źródło schematu). Strona logowania to komponent kliencki wołający akcje.
- **D1 (tokeny)**: `app/globals.css` ma już tokeny design-system (primary `#2353D9`, `plate-*`, `@theme inline`). **Brakuje**: podpięcia fontów przez `next/font` (Barlow Condensed / Manrope / IBM Plex Mono, subset `latin-ext`) i strony weryfikacji kontrastów. Fonty można dopiąć w S2.1 (ekrany auth) albo osobnym D1-finish. Ekrany auth nie są zablokowane na fontach — tokeny wystarczą do startu.
- **Kolejność (plan §2)**: S2.1 (auth-foundation) → S2.2 (invites) → S2.3 (role-middleware). Każda = własny branch + PR (rytm planu „1 sesja = 1 zadanie = 1 branch = 1 PR").
- Po każdej migracji (`accept_invite`, ew. schemat pod middleware): `supabase gen types typescript` + commit typów.

## 6. Poza zakresem M2

Google OAuth (nice-to-have), publiczna rejestracja trenera, trigger `handle_new_user`, relacja M:N klient↔trener, „usuń konto"/RODO (przed pilotażem, nie w M2).
