import { describe, expect, it } from 'vitest';
import {
  weekInputSchema,
  dayInputSchema,
  sectionInputSchema,
  planExerciseInputSchema,
  setInputSchema,
} from '@/lib/plan-builder/schemas';

describe('weekInputSchema', () => {
  it('accepts a minimal valid week', () => {
    expect(weekInputSchema.parse({ week_number: 1 }).week_number).toBe(1);
  });
  it('rejects a non-positive week_number', () => {
    expect(weekInputSchema.safeParse({ week_number: 0 }).success).toBe(false);
  });
});

describe('dayInputSchema', () => {
  it('accepts a valid day', () => {
    const r = dayInputSchema.parse({
      week_id: '11111111-1111-1111-1111-111111111111',
      name: ' Push A ',
    });
    expect(r.name).toBe('Push A');
  });
  it('rejects an empty name', () => {
    expect(
      dayInputSchema.safeParse({ week_id: '11111111-1111-1111-1111-111111111111', name: '  ' })
        .success
    ).toBe(false);
  });
  it('rejects a non-uuid week_id', () => {
    expect(dayInputSchema.safeParse({ week_id: 'nope', name: 'Push A' }).success).toBe(false);
  });
});

describe('sectionInputSchema', () => {
  it('accepts a valid section type', () => {
    expect(
      sectionInputSchema.safeParse({
        day_id: '11111111-1111-1111-1111-111111111111',
        section_type: 'main',
      }).success
    ).toBe(true);
  });
  it('rejects an unknown section type', () => {
    expect(
      sectionInputSchema.safeParse({
        day_id: '11111111-1111-1111-1111-111111111111',
        section_type: 'cardio',
      }).success
    ).toBe(false);
  });
});

describe('planExerciseInputSchema', () => {
  it('accepts a valid plan exercise', () => {
    const r = planExerciseInputSchema.parse({
      section_id: '11111111-1111-1111-1111-111111111111',
      exercise_id: '22222222-2222-2222-2222-222222222222',
      exercise_name: 'Przysiad ze sztangą',
    });
    expect(r.exercise_name).toBe('Przysiad ze sztangą');
  });
  it('rejects a missing exercise_name', () => {
    expect(
      planExerciseInputSchema.safeParse({
        section_id: '11111111-1111-1111-1111-111111111111',
        exercise_id: '22222222-2222-2222-2222-222222222222',
        exercise_name: '',
      }).success
    ).toBe(false);
  });
});

describe('setInputSchema', () => {
  const base = { plan_exercise_id: '11111111-1111-1111-1111-111111111111', set_number: 1 };
  it('accepts a minimal valid set', () => {
    expect(setInputSchema.safeParse(base).success).toBe(true);
  });
  it('accepts a valid reps range', () => {
    expect(setInputSchema.safeParse({ ...base, reps_min: 8, reps_max: 10 }).success).toBe(true);
  });
  it('rejects reps_max below reps_min', () => {
    expect(setInputSchema.safeParse({ ...base, reps_min: 10, reps_max: 8 }).success).toBe(false);
  });
  it('rejects a non-positive set_number', () => {
    expect(setInputSchema.safeParse({ ...base, set_number: 0 }).success).toBe(false);
  });
});
