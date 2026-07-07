export type Role = 'trainer' | 'client';

/** Post-login landing per role. Formal enforcement lands in S2.3 middleware. */
export function resolveHomePath(role: Role): string {
  return role === 'trainer' ? '/dashboard' : '/today';
}

/** Open-redirect guard: allow only same-origin absolute paths ("/…"). */
export function safeRedirectPath(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith('/')) return null; // must be a rooted relative path
  if (next.startsWith('//') || next.startsWith('/\\')) return null; // protocol-relative / backslash
  if (/[\u0000-\u001f]/.test(next)) return null; // control chars (e.g. newline)
  return next;
}
