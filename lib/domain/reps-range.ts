// Parser/formatter dla pola "zakres powtórzeń" w wierszu serii (np. "8" albo "8–10").
// Akceptuje zarówno zwykły myślnik ("-"), jak i en dash ("–") jako separator zakresu —
// klawiatura wpisuje zwykle "-", ale wyświetlamy "–" (formatRepsRange), zgodnie z
// przykładami copy w architektura-wizualna.
const RANGE_SEPARATOR = /[-–]/;

export function parseRepsRange(input: string): { reps_min: number; reps_max: number } | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;

  const parts = trimmed.split(RANGE_SEPARATOR).map((p) => p.trim());

  if (parts.length === 1) {
    const value = Number(parts[0]);
    if (!Number.isInteger(value) || value <= 0) return null;
    return { reps_min: value, reps_max: value };
  }

  if (parts.length === 2) {
    const min = Number(parts[0]);
    const max = Number(parts[1]);
    if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max <= 0) return null;
    if (max < min) return null;
    return { reps_min: min, reps_max: max };
  }

  return null;
}

export function formatRepsRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return '';
  if (min === null || max === null) return String(min ?? max);
  if (min === max) return String(min);
  return `${min}–${max}`;
}
