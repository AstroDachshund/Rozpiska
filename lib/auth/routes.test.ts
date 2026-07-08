import { describe, expect, it } from 'vitest';
import { requiredRole, resolveRouteAction } from '@/lib/auth/routes';

describe('requiredRole', () => {
  it('maps trainer routes', () => {
    expect(requiredRole('/dashboard')).toBe('trainer');
    expect(requiredRole('/dashboard/anything')).toBe('trainer');
  });
  it('maps client routes', () => {
    expect(requiredRole('/today')).toBe('client');
    expect(requiredRole('/today/x')).toBe('client');
  });
  it('treats auth/invite/root/statics as public', () => {
    for (const p of ['/', '/login', '/invite/abc', '/auth/confirm']) {
      expect(requiredRole(p)).toBeNull();
    }
  });
});

describe('resolveRouteAction', () => {
  it('passes public paths regardless of auth', () => {
    expect(resolveRouteAction({ pathname: '/login', isAuthed: false, role: null })).toEqual({
      kind: 'pass',
    });
    expect(resolveRouteAction({ pathname: '/invite/x', isAuthed: true, role: 'client' })).toEqual({
      kind: 'pass',
    });
  });
  it('sends authed users off the root to their home', () => {
    expect(resolveRouteAction({ pathname: '/', isAuthed: true, role: 'trainer' })).toEqual({
      kind: 'redirect',
      to: '/dashboard',
    });
    expect(resolveRouteAction({ pathname: '/', isAuthed: true, role: 'client' })).toEqual({
      kind: 'redirect',
      to: '/today',
    });
  });
  it('leaves anonymous users on the root', () => {
    expect(resolveRouteAction({ pathname: '/', isAuthed: false, role: null })).toEqual({
      kind: 'pass',
    });
  });
  it('redirects unauthenticated users off protected paths to /login?next=', () => {
    expect(resolveRouteAction({ pathname: '/dashboard', isAuthed: false, role: null })).toEqual({
      kind: 'redirect',
      to: '/login?next=%2Fdashboard',
    });
    expect(resolveRouteAction({ pathname: '/today', isAuthed: false, role: null })).toEqual({
      kind: 'redirect',
      to: '/login?next=%2Ftoday',
    });
  });
  it('redirects a user in the wrong group to their own home', () => {
    expect(resolveRouteAction({ pathname: '/dashboard', isAuthed: true, role: 'client' })).toEqual({
      kind: 'redirect',
      to: '/today',
    });
    expect(resolveRouteAction({ pathname: '/today', isAuthed: true, role: 'trainer' })).toEqual({
      kind: 'redirect',
      to: '/dashboard',
    });
  });
  it('passes a user in the correct group', () => {
    expect(resolveRouteAction({ pathname: '/dashboard', isAuthed: true, role: 'trainer' })).toEqual(
      { kind: 'pass' }
    );
    expect(resolveRouteAction({ pathname: '/today', isAuthed: true, role: 'client' })).toEqual({
      kind: 'pass',
    });
  });
  it('redirects an authenticated user with no known role to /login', () => {
    expect(resolveRouteAction({ pathname: '/dashboard', isAuthed: true, role: null })).toEqual({
      kind: 'redirect',
      to: '/login',
    });
    expect(resolveRouteAction({ pathname: '/today', isAuthed: true, role: null })).toEqual({
      kind: 'redirect',
      to: '/login',
    });
  });
});
