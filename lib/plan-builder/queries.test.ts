import { describe, expect, it } from 'vitest';
import {
  mapRawTreeToPlanWeeks,
  getWeekDays,
  getDaySections,
  getSectionExercises,
  getExerciseSets,
} from '@/lib/plan-builder/queries';

const rawTree = [
  {
    id: 'w2',
    week_number: 2,
    notes: null,
    position: 2000,
    plan_days: [{ id: 'd2', name: 'Day B', position: 2000, plan_sections: [] }],
  },
  {
    id: 'w1',
    week_number: 1,
    notes: 'first week',
    position: 1000,
    plan_days: [
      {
        id: 'd1',
        name: 'Day A',
        position: 1000,
        plan_sections: [
          {
            id: 's1',
            section_type: 'main' as const,
            position: 1000,
            plan_exercises: [
              {
                id: 'e1',
                exercise_id: 'ex1',
                exercise_name: 'Przysiad',
                trainer_note: null,
                superset_group: null,
                position: 1000,
                plan_sets: [
                  {
                    id: 'set2',
                    set_number: 2,
                    reps_min: 8,
                    reps_max: 10,
                    target_weight: 80,
                    target_rpe: null,
                    rest_seconds: 120,
                    position: 2000,
                  },
                  {
                    id: 'set1',
                    set_number: 1,
                    reps_min: 8,
                    reps_max: 10,
                    target_weight: 80,
                    target_rpe: null,
                    rest_seconds: 120,
                    position: 1000,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('mapRawTreeToPlanWeeks', () => {
  it('sorts weeks by position and renames nested keys', () => {
    const weeks = mapRawTreeToPlanWeeks(rawTree);
    expect(weeks.map((w) => w.id)).toEqual(['w1', 'w2']); // w1 (1000) before w2 (2000)
    expect(weeks[0]!.days[0]!.name).toBe('Day A');
  });
  it('sorts every nested level by position', () => {
    const weeks = mapRawTreeToPlanWeeks(rawTree);
    const sets = weeks[0]!.days[0]!.sections[0]!.exercises[0]!.sets;
    expect(sets.map((s) => s.id)).toEqual(['set1', 'set2']); // 1000 before 2000
  });
  it('returns an empty array for an empty tree', () => {
    expect(mapRawTreeToPlanWeeks([])).toEqual([]);
  });
});

describe('sibling lookup helpers', () => {
  const weeks = mapRawTreeToPlanWeeks(rawTree);

  it('getWeekDays returns the days of the given week', () => {
    expect(getWeekDays(weeks, 'w1').map((d) => d.id)).toEqual(['d1']);
    expect(getWeekDays(weeks, 'w2').map((d) => d.id)).toEqual(['d2']);
  });
  it('getDaySections returns the sections of the given day', () => {
    expect(getDaySections(weeks, 'd1').map((s) => s.id)).toEqual(['s1']);
    expect(getDaySections(weeks, 'd2')).toEqual([]);
  });
  it('getSectionExercises returns the exercises of the given section', () => {
    expect(getSectionExercises(weeks, 's1').map((e) => e.id)).toEqual(['e1']);
  });
  it('getExerciseSets returns the sets of the given exercise', () => {
    expect(getExerciseSets(weeks, 'e1').map((s) => s.id)).toEqual(['set1', 'set2']);
  });
  it('returns an empty array for an unknown id at any level', () => {
    expect(getWeekDays(weeks, 'nope')).toEqual([]);
    expect(getDaySections(weeks, 'nope')).toEqual([]);
    expect(getSectionExercises(weeks, 'nope')).toEqual([]);
    expect(getExerciseSets(weeks, 'nope')).toEqual([]);
  });
});
