import { describe, it, expect } from 'vitest';
import { resolveHomePath, safeRedirectPath } from './paths';

describe('resolveHomePath', () => {
  it('routes trainer to /dashboard', () => expect(resolveHomePath('trainer')).toBe('/dashboard'));
  it('routes client to /today', () => expect(resolveHomePath('client')).toBe('/today'));
});

describe('safeRedirectPath', () => {
  it('allows a same-origin relative path', () => expect(safeRedirectPath('/plan')).toBe('/plan'));
  it('returns null for empty/nullish', () => {
    expect(safeRedirectPath(null)).toBeNull();
    expect(safeRedirectPath('')).toBeNull();
  });
  it('rejects protocol-relative //evil.com', () => expect(safeRedirectPath('//evil.com')).toBeNull());
  it('rejects absolute URLs', () => expect(safeRedirectPath('http://evil.com')).toBeNull());
  it('rejects backslash tricks', () => expect(safeRedirectPath('/\\evil.com')).toBeNull());
  it('rejects paths not starting with /', () => expect(safeRedirectPath('plan')).toBeNull());
  it('rejects control characters', () => expect(safeRedirectPath('/a\nb')).toBeNull());
});
