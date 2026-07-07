-- M1 — jawne nadanie rolom API dostępu do tabel w schemacie public.
--
-- Dlaczego: na hostowanym Supabase domyślne przywileje (ALTER DEFAULT PRIVILEGES)
-- roli `postgres` nadają anon/authenticated/service_role pełne DML. Lokalny stack CLI
-- konfiguruje ADP inaczej — dla roli `postgres` nadaje tym rolom tylko `Dxtm`
-- (TRUNCATE/REFERENCES/TRIGGER/MAINTAIN), BEZ SELECT/INSERT/UPDATE/DELETE. Tabele w M1
-- należą do `postgres`, więc lokalnie/CI service_role (i authenticated) dostawał
-- "permission denied for table profiles". Nadajemy przywileje jawnie, żeby schemat był
-- przenośny między środowiskami. RLS pozostaje jedynym strażnikiem WIERSZY — dostęp do
-- tabeli nie omija polityk (anon nadal nie ma żadnej policy → 0 wierszy).

-- Istniejące tabele (M1).
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- Tabele tworzone w kolejnych migracjach (M2+) — dopełniamy ADP bieżącej roli tak,
-- by nowe tabele od razu były dostępne dla ról API bez powtarzania grantów.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
