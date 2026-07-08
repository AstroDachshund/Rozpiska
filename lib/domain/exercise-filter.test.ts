import { describe, expect, it } from 'vitest';
import { matchesTagFilter, normalizeForSearch } from '@/lib/domain/exercise-filter';

describe('matchesTagFilter', () => {
  it('matches everything when no tags are selected', () => {
    expect(matchesTagFilter([], [])).toBe(true);
    expect(matchesTagFilter([{ id: 'a' }], [])).toBe(true);
  });
  it('matches when the exercise has the single selected tag', () => {
    expect(matchesTagFilter([{ id: 'a' }, { id: 'b' }], ['a'])).toBe(true);
  });
  it('rejects when a selected tag is missing (AND semantics)', () => {
    expect(matchesTagFilter([{ id: 'a' }], ['a', 'b'])).toBe(false);
  });
  it('matches when all selected tags are present, in any order', () => {
    expect(matchesTagFilter([{ id: 'c' }, { id: 'a' }, { id: 'b' }], ['b', 'a'])).toBe(true);
  });
  it('handles duplicate selected ids without changing the result', () => {
    expect(matchesTagFilter([{ id: 'a' }], ['a', 'a'])).toBe(true);
    expect(matchesTagFilter([], ['a', 'a'])).toBe(false);
  });
  it('rejects when the exercise has no tags but tags are selected', () => {
    expect(matchesTagFilter([], ['a'])).toBe(false);
  });
});

describe('normalizeForSearch', () => {
  it('lowercases and strips standard combining diacritics', () => {
    expect(normalizeForSearch('Ćwiczenie')).toBe('cwiczenie');
    expect(normalizeForSearch('Wąż')).toBe('waz');
    expect(normalizeForSearch('Śruba')).toBe('sruba');
  });
  it('handles ł/Ł, which has no NFD decomposition', () => {
    expect(normalizeForSearch('Łopatki')).toBe('lopatki');
    expect(normalizeForSearch('Wiosłowanie')).toBe('wioslowanie');
  });
  it('reproduces the exact live-caught regression case', () => {
    expect(normalizeForSearch('Wiosłowanie sztangą w opadzie')).toBe(
      'wioslowanie sztanga w opadzie'
    );
    expect(normalizeForSearch('wioslowanie')).toBe('wioslowanie');
  });
  it('is a no-op on already-plain text', () => {
    expect(normalizeForSearch('Sztanga')).toBe('sztanga');
  });
});
