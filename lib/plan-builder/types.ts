// Kontekst szablon|instancja — jeden dyskryminowany typ używany przez odczyt i mutacje.
export type PlanContext =
  { kind: 'template'; templateId: string } | { kind: 'assigned'; assignedPlanId: string };

export type PlanSet = {
  id: string;
  set_number: number;
  reps_min: number | null;
  reps_max: number | null;
  target_weight: number | null;
  target_rpe: number | null;
  rest_seconds: number | null;
  position: number;
};

export type PlanExercise = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  trainer_note: string | null;
  superset_group: number | null;
  position: number;
  sets: PlanSet[];
};

export type PlanSection = {
  id: string;
  section_type: 'warmup' | 'main' | 'cooldown';
  position: number;
  exercises: PlanExercise[];
};

export type PlanDay = {
  id: string;
  name: string;
  position: number;
  sections: PlanSection[];
};

export type PlanWeek = {
  id: string;
  week_number: number;
  notes: string | null;
  position: number;
  days: PlanDay[];
};
