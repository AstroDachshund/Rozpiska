// Czysta logika filtra tagów dla wyszukiwarki ćwiczeń (Command). Semantyka AND:
// ćwiczenie musi mieć WSZYSTKIE zaznaczone tagi. Wyszukiwanie tekstowe robi cmdk.
export function matchesTagFilter(tags: { id: string }[], selectedTagIds: string[]): boolean {
  if (selectedTagIds.length === 0) return true;
  const tagIds = new Set(tags.map((t) => t.id));
  return selectedTagIds.every((id) => tagIds.has(id));
}

// Normalizuje tekst do porównań wyszukiwania: małe litery + usunięcie polskich
// znaków diakrytycznych. Uwaga: „ł"/"Ł" NIE ma dekompozycji NFD w Unicode (to
// odrębny kształt litery, nie akcent), więc wymaga jawnej podmiany PRZED NFD —
// inaczej wyszukiwanie bez ogonków/kresek nie trafi w nazwy zawierające „ł"
// (np. „wioslowanie" nie znajdzie „Wiosłowanie").
export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
