import { describe, expect, it } from 'vitest';
import { matchesTagFilter } from '@/lib/domain/exercise-filter';

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
