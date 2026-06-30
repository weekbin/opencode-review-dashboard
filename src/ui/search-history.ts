/**
 * R20 #42 — Search history (recent searches) helper.
 *
 * Pure localStorage-backed MRU (most-recently-used) list used by
 * `src/ui/app.ts` to populate the "Recent searches" dropdown when the
 * `.diff-search-bar` is focused. Kept separate from `app.ts` per
 * R16 SG.14 add-only rule: never modify existing helpers, add new
 * ones alongside so they're testable in isolation.
 *
 * Public surface:
 *   - `getRecentSearches()` → returns up to `MAX_RECENT` (5) most-recent
 *     searches, newest first. Empty array when storage is missing,
 *     empty, or `localStorage` is unavailable (private mode, SSR, tests
 *     without the shim).
 *   - `addRecentSearch(query)` → push `query` to the front; dedupe
 *     against earlier entries (case-sensitive, EXACT match — matches
 *     the user's verbatim query they typed); cap to `MAX_RECENT`;
 *     persist the updated list back to localStorage. Empty/whitespace
 *     queries are no-ops (we don't store junk).
 *
 * Storage format: JSON array of strings, newest first. Five queries
 * × ≤ 50 chars each ≈ 250 bytes — trivial vs the ~5 MB quota.
 */

export const RECENT_SEARCHES_KEY = "diff-review:recent-searches";
export const MAX_RECENT = 5;

/** Read the persisted recent-searches list, newest first. */
export function getRecentSearches(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Defensive: keep only string entries (in case a future schema change
    // leaves stale entries behind).
    return parsed.filter((q): q is string => typeof q === "string");
  } catch {
    // Malformed JSON or storage access failure — return empty array.
    return [];
  }
}

/**
 * Push `query` onto the front of the recent-searches list.
 *
 * Behavior:
 *   - Trim leading/trailing whitespace; treat empty result as a no-op
 *     (we never store blank history entries).
 *   - Dedupe against existing entries by EXACT match (case-sensitive).
 *     A re-typed identical query moves to the front; it does NOT
 *     appear twice.
 *   - Cap to `MAX_RECENT` (5) — older entries fall off.
 *   - Persist back to localStorage as a JSON array.
 *
 * Returns the new list (so callers can update UI without an extra
 * `getRecentSearches()` round-trip).
 */
export function addRecentSearch(query: string): string[] {
  const trimmed = (query ?? "").trim();
  if (!trimmed) return getRecentSearches();

  const current = getRecentSearches().filter((q) => q !== trimmed);
  current.unshift(trimmed);
  const next = current.slice(0, MAX_RECENT);

  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
      // Storage access failure — silently ignore. The in-memory `next`
      // array is still returned so the UI can update optimistically.
    }
  }
  return next;
}

/** Test-only escape hatch — clears the storage key without touching other entries. */
export function __testonlyClearRecentSearches(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}
