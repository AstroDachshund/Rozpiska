import { describe, expect, it } from 'vitest';
import { parseRepsRange, formatRepsRange } from '@/lib/domain/reps-range';

describe('parseRepsRange', () => {
  it('parses a fixed value', () => {
    expect(parseRepsRange('8')).toEqual({ reps_min: 8, reps_max: 8 });
  });
  it('parses a range with a hyphen', () => {
    expect(parseRepsRange('8-10')).toEqual({ reps_min: 8, reps_max: 10 });
  });
  it('parses a range with an en dash', () => {
    expect(parseRepsRange('8–10')).toEqual({ reps_min: 8, reps_max: 10 });
  });
  it('trims surrounding whitespace around each part', () => {
    expect(parseRepsRange(' 8 - 10 ')).toEqual({ reps_min: 8, reps_max: 10 });
  });
  it('rejects a range where max is below min', () => {
    expect(parseRepsRange('10-8')).toBeNull();
  });
  it('rejects non-numeric input', () => {
    expect(parseRepsRange('abc')).toBeNull();
  });
  it('rejects an empty string', () => {
    expect(parseRepsRange('')).toBeNull();
  });
  it('rejects zero', () => {
    expect(parseRepsRange('0')).toBeNull();
  });
  it('rejects a negative number', () => {
    expect(parseRepsRange('-5')).toBeNull();
  });
  it('rejects more than two dash-separated parts', () => {
    expect(parseRepsRange('5-8-10')).toBeNull();
  });
});

describe('formatRepsRange', () => {
  it('formats a fixed value without a dash', () => {
    expect(formatRepsRange(8, 8)).toBe('8');
  });
  it('formats a range with an en dash', () => {
    expect(formatRepsRange(8, 10)).toBe('8–10');
  });
  it('formats both-null as an empty string', () => {
    expect(formatRepsRange(null, null)).toBe('');
  });
});
