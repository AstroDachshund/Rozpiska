// Czysta logika filtra tagów dla wyszukiwarki ćwiczeń (Command). Semantyka AND:
// ćwiczenie musi mieć WSZYSTKIE zaznaczone tagi. Wyszukiwanie tekstowe robi cmdk.
export function matchesTagFilter(tags: { id: string }[], selectedTagIds: string[]): boolean {
  if (selectedTagIds.length === 0) return true;
  const tagIds = new Set(tags.map((t) => t.id));
  return selectedTagIds.every((id) => tagIds.has(id));
}
