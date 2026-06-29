/**
 * R8 #2: pure utilities for sidebar tab keyboard navigation.
 * Kept browser-safe (no DOM access) so they can be unit-tested without
 * importing the DOM-coupled `src/ui/app.ts`.
 */

export const TAB_ORDER = ["files", "commits", "conversation", "previously"] as const;
export type TabKey = (typeof TAB_ORDER)[number];

/**
 * R8 #2: cycle the active tab index in either direction, wrapping.
 * Pure helper used by the navbarTabs keydown listener.
 */
export function cycleTab(activeIndex: number, direction: 1 | -1, total: number): number {
  return (activeIndex + direction + total) % total;
}

/**
 * R8 #2: roving tabindex pattern — only the active tab gets
 * `tabindex="0"`, the rest get `tabindex="-1"`. Returns the
 * 4-element array of stringified tabindex values for the 4 tabs.
 */
export function tabIndexFor(activeIndex: number, total: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < total; i++) {
    out.push(i === activeIndex ? "0" : "-1");
  }
  return out;
}
