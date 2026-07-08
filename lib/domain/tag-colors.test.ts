import { describe, expect, it } from 'vitest';
import { tagDotColor } from '@/lib/domain/tag-colors';

describe('tagDotColor', () => {
  it('returns a plate CSS var for known muscle groups', () => {
    expect(tagDotColor('muscle_group', 'Klatka')).toBe('var(--plate-25)');
    expect(tagDotColor('muscle_group', 'Nogi')).toBe('var(--plate-10)');
  });
  it('returns null for non-muscle categories', () => {
    expect(tagDotColor('equipment', 'Sztanga')).toBeNull();
    expect(tagDotColor('movement_pattern', 'Przysiad')).toBeNull();
  });
  it('falls back to a neutral plate for an unknown muscle group', () => {
    expect(tagDotColor('muscle_group', 'Nietypowa partia')).toBe('var(--plate-5)');
  });
});
