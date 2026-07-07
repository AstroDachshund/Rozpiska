// Reguły routingu po roli. Czysta logika (bez I/O) — middleware tylko ją wywołuje.
import { resolveHomePath, type Role } from '@/lib/auth/paths';

/** Prefiksy tras chronionych per rola. Bieżące trasy MVP; rozszerzać per milestone. */
const TRAINER_PREFIXES = ['/dashboard'];
const CLIENT_PREFIXES = ['/today'];

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/** Rola wymagana przez ścieżkę, albo null dla tras publicznych (/login, /invite, /auth, /, statyki). */
export function requiredRole(pathname: string): Role | null {
  if (matches(pathname, TRAINER_PREFIXES)) return 'trainer';
  if (matches(pathname, CLIENT_PREFIXES)) return 'client';
  return null;
}

export type RouteAction = { kind: 'pass' } | { kind: 'redirect'; to: string };

/**
 * Decyzja routingu. `role` = null oznacza niezalogowanego (lub rolę nieznaną).
 * Caller (middleware) dostarcza `role` po lookupie, gdy user istnieje.
 */
export function resolveRouteAction({
  pathname,
  isAuthed,
  role,
}: {
  pathname: string;
  isAuthed: boolean;
  role: Role | null;
}): RouteAction {
  // Korzeń: zalogowanego prowadzimy do domu roli; anonim zostaje na landingu.
  if (pathname === '/') {
    return isAuthed && role ? { kind: 'redirect', to: resolveHomePath(role) } : { kind: 'pass' };
  }

  const req = requiredRole(pathname);
  if (req === null) return { kind: 'pass' }; // publiczne
  if (!isAuthed) return { kind: 'redirect', to: `/login?next=${encodeURIComponent(pathname)}` };
  if (role === null) return { kind: 'redirect', to: '/login' }; // zalogowany bez profilu/roli — niekompletna rejestracja
  if (role !== req) return { kind: 'redirect', to: resolveHomePath(role) };
  return { kind: 'pass' };
}
