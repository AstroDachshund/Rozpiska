// Stałe mapowanie partii mięśniowej → kolor talerza (design-system §5.6).
// Zwraca string CSS var (do inline style dot-a) albo null (kategorie nie-mięśniowe).
// Uwaga: NIE budujemy dynamicznych klas Tailwind (`bg-${x}`) — kompilator ich nie widzi.
const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Klatka: 'var(--plate-25)',
  Plecy: 'var(--plate-20)',
  Nogi: 'var(--plate-10)',
  Barki: 'var(--plate-15)',
  Biceps: 'var(--plate-25)',
  Triceps: 'var(--plate-20)',
  Brzuch: 'var(--plate-10)',
  Pośladki: 'var(--plate-15)',
};

const NEUTRAL = 'var(--plate-5)';

export function tagDotColor(category: string, name: string): string | null {
  if (category !== 'muscle_group') return null;
  return MUSCLE_GROUP_COLORS[name] ?? NEUTRAL;
}
