import { describe, expect, it } from 'vitest';
import { positionBetween, rebalance, STEP } from '@/lib/domain/position';

describe('positionBetween', () => {
  it('returns STEP for the first item in an empty list', () => {
    expect(positionBetween(null, null)).toBe(STEP);
  });
  it('appends after the last item when after is null', () => {
    expect(positionBetween(1000, null)).toBe(2000);
  });
  it('prepends before the first item when before is null', () => {
    expect(positionBetween(null, 1000)).toBe(0);
  });
  it('splits the midpoint between two siblings', () => {
    expect(positionBetween(1000, 2000)).toBe(1500);
  });
  it('keeps splitting as the gap shrinks, until it degenerates to null', () => {
    const before = 1000;
    const after = 1000.0000002; // gap = 2e-7, just above MIN_GAP
    const mid = positionBetween(before, after);
    expect(mid).not.toBeNull();

    // A gap already at/under the threshold must degenerate.
    expect(positionBetween(1000, 1000 + 1e-8)).toBeNull();
  });
});

describe('rebalance', () => {
  it('returns an empty array for count 0', () => {
    expect(rebalance(0)).toEqual([]);
  });
  it('returns a single STEP for count 1', () => {
    expect(rebalance(1)).toEqual([STEP]);
  });
  it('returns evenly-spaced ascending positions for count > 1', () => {
    expect(rebalance(4)).toEqual([1000, 2000, 3000, 4000]);
  });
});
