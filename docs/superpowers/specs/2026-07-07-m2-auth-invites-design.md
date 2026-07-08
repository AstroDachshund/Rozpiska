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
- **`next` (deep-link po logowaniu) dla magic linka odłożone do S2.3.** W S2.1 nie istnieje producent `next` (middleware roli, które przekierowuje niezalogowanych na `/login?next=…`, powstaje w S2.3), a przeniesienie `next` przez e-mail wymaga threadingu `{{ .RedirectTo }}` w szablonie (do zweryfikowania empirycznie). W S2.1 magic link ląduje na stronie roli; `next` w akcji hasła działa w tym samym żądaniu i zostaje. Pełny `next` + E2E domyka S2.3.
- **D1 (tokeny)**: `app/globals.css` ma już tokeny design-system (primary `#2353D9`, `plate-*`, `@theme inline`). **Brakuje**: podpięcia fontów przez `next/font` (Barlow Condensed / Manrope / IBM Plex Mono, subset `latin-ext`) i strony weryfikacji kontrastów. Fonty można dopiąć w S2.1 (ekrany auth) albo osobnym D1-finish. Ekrany auth nie są zablokowane na fontach — tokeny wystarczą do startu.
- **Kolejność (plan §2)**: S2.1 (auth-foundation) → S2.2 (invites) → S2.3 (role-middleware). Każda = własny branch + PR (rytm planu „1 sesja = 1 zadanie = 1 branch = 1 PR").
- Po każdej migracji (`accept_invite`, ew. schemat pod middleware): `supabase gen types typescript` + commit typów.

## 6a. S2.2 — rozstrzygnięcia dopięte przy starcie sesji (2026-07-07)

Dopełnienie §1–§3 o decyzje, których nie dało się rozstrzygnąć przed S2.2. Kanon flow: **cookie + magic link** (zatwierdzone przez Piotra).

- **Przetrwanie tokenu przez rejestrację (kluczowe)**: nowy klient nie ma konta, więc token zaproszenia musi przeżyć utworzenie konta. Threading `next`/`{{ .RedirectTo }}` jest odłożony do S2.3 (§5), więc S2.2 **nie** opiera się na nim. Zamiast tego:
  1. `/invite/[token]` (server component) waliduje token przez `preview_invite(token)` i ustawia **httpOnly cookie `invite_token`**.
  2. Akcja rejestracji woła `signInWithOtp({ email: <email z zaproszenia, zablokowany>, options: { shouldCreateUser: true, emailRedirectTo: <origin>/auth/confirm } })`. (S2.1 `signInWithOtpAction` ma `shouldCreateUser:false` — zaproszenia potrzebują własnej akcji z `true`.)
  3. Magic link → `/auth/confirm` → `verifyOtp` ustawia sesję → **jeśli cookie `invite_token` obecne**: `accept_invite(token)`, wyczyść cookie, redirect `/today`. Bez cookie — zachowanie z S2.1 (login). Sprzężenie invite↔confirm jest bramkowane obecnością cookie.
  - Zalety: zgodne z „magic link jako domyślne", bez hasła, token nigdy nie trafia do URL-a w mailu, niezależne od threadingu z S2.3.
- **Schemat funkcji (reconcile §2)**: `accept_invite` musi być wołalne przez klienta, więc nie może leżeć w nieeksponowanym `private` (tam są helpery RLS, których NIE eksponujemy). Tworzymy **dedykowany, eksponowany** schemat `app` (dodany do `config.toml [api].schemas`), `grant execute` wąsko: `accept_invite` → tylko `authenticated`; `preview_invite` → `anon` (odczyt przed logowaniem). Ochrona i tak jest wewnątrz funkcji (walidacja tokenu, `auth.uid()`, `auth.jwt() email`). To honoruje „nie w `public`" z §2, pozostając wołalnym.
- **`preview_invite(token)`** (`SECURITY DEFINER`, schemat `app`, grant `anon`): zwraca e-mail zaproszenia + flagę ważności (`valid` = istnieje ∧ `expires_at > now()` ∧ `accepted_at is null`) do wyświetlenia zablokowanego e-maila i komunikatu o zużytym/przeterminowanym linku. Tokeny to sekrety — brak dodatkowej ochrony przed enumeracją poza losowością tokenu.
- **Tworzenie zaproszenia**: **Server Action** wstawiający do `invites` (RLS z M1 już pozwala trenerowi: `invites_trainer_all`). Token: `crypto.randomUUID()`; `expires_at = now() + 7 dni`. Bez nowego RPC do tworzenia. UI trenera zwraca link `<origin>/invite/<token>` do skopiowania.
- **Po aktywacji**: redirect na `/today` (dom klienta wg `resolveHomePath('client')`).
- **Testy `accept_invite`** (§2, ten sam PR): happy / zużyty / przeterminowany / cudzy e-mail / nieistniejący — jako role API (nie superuser, lekcja M1 §9.12).

## 6b. S2.3 — rozstrzygnięcia dopięte przy starcie sesji (2026-07-08)

Dopełnienie §4 o decyzje zakresu (zatwierdzone przez Piotra). S2.3 = **middleware routingu po roli + producent `next` + pierwszy E2E Playwright**; motywy grup już zrobione w layoutach w S2.1 (client=`dark`, trainer=jasny) — bez zmian, tylko asercja w E2E.

- **Egzekwowanie roli: middleware** (spec §4). `middleware.ts`/`lib/supabase/middleware.ts` zachowuje kanoniczny refresh sesji (nic między `createServerClient` a `getUser`). Po `getUser`, tylko dla **ścieżek chronionych**: brak usera → redirect `/login?next=<ścieżka>`; user → **jeden lookup PK `profiles.role`** (RLS `profiles_select_own` wystarcza); rola ≠ wymagana → redirect `resolveHomePath(role)`. Zalogowany na `/` → dom roli. **Cookies odświeżonej sesji MUSZĄ być skopiowane na każdą odpowiedź redirect** (kanoniczny gotcha middleware — goły `NextResponse.redirect` je gubi, ta sama klasa błędu co confirm-route w S2.1). Koszt: jeden indeksowany lookup PK na nawigację chronioną — akceptowalne w MVP. Odrzucone alternatywy: (a) rola w custom JWT claim (auth hook) — szybsze, ale dodatkowa infra poza zakresem; (b) guard w layoutach grup — prostsze, ale spec mówi middleware i chcemy egzekwowanie przed renderem.
- **Mapa ścieżka→rola**: `lib/auth/routes.ts` — czysta `requiredRole(pathname): 'trainer' | 'client' | null` (null = publiczne: `/login`, `/invite/*`, `/auth/*`, `/`, statyki). Bieżąca mapa: `/dashboard`→trainer, `/today`→client; rozszerzalna per milestone. Testowana Vitest.
- **`next`: producent + ścieżka hasła** (świadome zawężenie). Middleware produkuje `next` (niezalogowany → `/login?next=…`); logowanie hasłem już go konsumuje (`safeRedirectPath`). **`next` dla magic linka pozostaje best-effort/odłożony** — link ląduje na domu roli, middleware doprowadza do właściwej grupy; bez zmiany szablonu `magic_link.html`. Threading `{{ .RedirectTo }}` (spec §5, empirycznie niepewny) NIE jest blokerem DoD (DoD: zaproszenie→rejestracja→klient w `(client)` nie wymaga deep-linka).
- **E2E Playwright** (`playwright.config.ts` + `e2e/` + fixture admin). Config: własny `webServer`, port-agnostyczny (test buduje URL `/auth/confirm?token_hash=…&type=magiclink` względem `baseURL`, więc port appki nie musi = `site_url`), `reuseExistingServer: !CI`, env admina z `.env.test.local`. Krok magic-linka domykany **fixture'em `admin.generateLink`** (deterministyczny, jak live smoke S2.2 — bez scrapowania Mailpita). Test 1 (DoD): `/invite/[token]` → e-mail zablokowany → submit (tworzy usera) → `generateLink` → wizyta confirm → ląduje na `/today` w kontekście `(client)` (`data-context="client"`/klasa `dark`). Test 2 (granice): zalogowany klient na `/dashboard` → odbity na `/today`; zalogowany trener na `/today` → odbity na `/dashboard`. Sprzątanie userów. Uwaga: lokalny port 3000 bywa zajęty (inna apka) — E2E to głównie brama CI (czysty env); lokalnie webServer może wziąć inny port.

## 6. Poza zakresem M2

Google OAuth (nice-to-have), publiczna rejestracja trenera, trigger `handle_new_user`, relacja M:N klient↔trener, „usuń konto"/RODO (przed pilotażem, nie w M2).
