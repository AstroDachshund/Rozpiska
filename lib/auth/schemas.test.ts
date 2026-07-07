import { describe, it, expect } from 'vitest';
import { emailSchema, passwordLoginSchema, magicLinkSchema } from './schemas';

describe('emailSchema', () => {
  it('trims and lowercases a valid email', () => {
    expect(emailSchema.parse('  Trener@Rozpiska.LOCAL ')).toBe('trener@rozpiska.local');
  });
  it('rejects a malformed email with a Polish message', () => {
    const r = emailSchema.safeParse('nie-email');
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]!.message).toMatch(/adres e-mail/i);
  });
});

describe('passwordLoginSchema', () => {
  it('accepts a 6+ char password', () => {
    expect(passwordLoginSchema.parse({ email: 'a@b.pl', password: '123456' })).toEqual({
      email: 'a@b.pl',
      password: '123456',
    });
  });
  it('rejects a short password with a Polish message', () => {
    const r = passwordLoginSchema.safeParse({ email: 'a@b.pl', password: '12' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]!.message).toMatch(/co najmniej 6/i);
  });
});

describe('magicLinkSchema', () => {
  it('accepts an email-only payload', () => {
    expect(magicLinkSchema.parse({ email: 'A@B.pl' })).toEqual({ email: 'a@b.pl' });
  });
});
