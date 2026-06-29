/**
 * R8 #1: pure utility for in-tab search filtering.
 * Kept browser-safe (no DOM access) so it can be imported by both
 * `src/ui/app.ts` and `src/search-filter.test.ts` without dragging in
 * the DOM-coupled `app.ts` module globals (which reference `location`,
 * `IntersectionObserver`, etc. at module evaluation time).
 */

export function filterByQuery<T>(items: T[], query: string, pickKey: (item: T) => string): T[] {
  if (!query.trim()) return items;
  const needle = query.toLowerCase();
  return items.filter((item) => pickKey(item).toLowerCase().includes(needle));
}
