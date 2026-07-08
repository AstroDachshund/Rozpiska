import { describe, expect, it } from 'vitest';
import { exerciseInputSchema, tagInputSchema } from '@/lib/exercises/schemas';

describe('exerciseInputSchema', () => {
  it('accepts a minimal valid exercise', () => {
    const r = exerciseInputSchema.parse({ name: '  Przysiad  ', tag_ids: [] });
    expect(r.name).toBe('Przysiad'); // trimmed
    expect(r.tag_ids).toEqual([]);
  });
  it('rejects an empty name', () => {
    expect(exerciseInputSchema.safeParse({ name: '   ' }).success).toBe(false);
  });
  it('defaults tag_ids to []', () => {
    expect(exerciseInputSchema.parse({ name: 'Martwy ciąg' }).tag_ids).toEqual([]);
  });
  it('accepts an empty youtube_url as undefined', () => {
    expect(exerciseInputSchema.parse({ name: 'X', youtube_url: '' }).youtube_url).toBeUndefined();
  });
  it('accepts a valid youtube url', () => {
    const r = exerciseInputSchema.parse({ name: 'X', youtube_url: 'https://youtu.be/abc123' });
    expect(r.youtube_url).toBe('https://youtu.be/abc123');
  });
  it('rejects a non-url youtube_url', () => {
    expect(exerciseInputSchema.safeParse({ name: 'X', youtube_url: 'not a url' }).success).toBe(
      false
    );
  });
  it('rejects a non-youtube url', () => {
    expect(
      exerciseInputSchema.safeParse({ name: 'X', youtube_url: 'https://vimeo.com/1' }).success
    ).toBe(false);
  });
  it('rejects non-uuid tag ids', () => {
    expect(exerciseInputSchema.safeParse({ name: 'X', tag_ids: ['nope'] }).success).toBe(false);
  });
  it('accepts www. and m. youtube hosts', () => {
    expect(
      exerciseInputSchema.safeParse({
        name: 'X',
        youtube_url: 'https://www.youtube.com/watch?v=abc',
      }).success
    ).toBe(true);
    expect(
      exerciseInputSchema.safeParse({ name: 'X', youtube_url: 'https://m.youtube.com/watch?v=abc' })
        .success
    ).toBe(true);
  });
  it('rejects a spoofed youtube host', () => {
    expect(
      exerciseInputSchema.safeParse({ name: 'X', youtube_url: 'https://youtube.com.evil.com/x' })
        .success
    ).toBe(false);
  });
  it('rejects non-http(s) protocols on a youtube host', () => {
    expect(
      exerciseInputSchema.safeParse({ name: 'X', youtube_url: 'ftp://youtube.com/x' }).success
    ).toBe(false);
  });
});

describe('tagInputSchema', () => {
  it('accepts a valid tag', () => {
    expect(tagInputSchema.parse({ category: 'equipment', name: ' Sztanga ' }).name).toBe('Sztanga');
  });
  it('rejects an unknown category', () => {
    expect(tagInputSchema.safeParse({ category: 'nope', name: 'X' }).success).toBe(false);
  });
  it('rejects an empty name', () => {
    expect(tagInputSchema.safeParse({ category: 'equipment', name: '' }).success).toBe(false);
  });
});
