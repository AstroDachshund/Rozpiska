// Algorytm pozycji rodzeństwa w drzewie kreatora (float między sąsiadami).
// Odstęp startowy STEP daje duży zapas przed degeneracją floatów przy
// wielokrotnym wstawianiu; gdy odstęp spadnie poniżej MIN_GAP, positionBetween
// zwraca null — sygnał, że caller musi najpierw zrebalansować całe rodzeństwo.
export const STEP = 1000;
const MIN_GAP = 1e-7;

export function positionBetween(before: number | null, after: number | null): number | null {
  if (before === null && after === null) return STEP;
  if (before === null) return after! - STEP;
  if (after === null) return before + STEP;
  if (after - before < MIN_GAP) return null;
  return (before + after) / 2;
}

/** Świeże, równo rozstawione pozycje (1000, 2000, ...) zachowujące kolejność. */
export function rebalance(count: number): number[] {
  return Array.from({ length: count }, (_, i) => STEP * (i + 1));
}
