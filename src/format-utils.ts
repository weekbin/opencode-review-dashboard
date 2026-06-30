// R14 #24: pure formatting helpers for the auto-save indicator.
// Kept off the UI module so unit tests can import without triggering
// the browser-only window.* initializers at the top of src/ui/app.ts.

export const SAVE_INDICATOR_HIDE_AFTER_MS = 60_000;
export const SAVE_INDICATOR_TICK_MS = 5_000;

export function formatRelativeSeconds(ms: number): string {
  if (ms < 1_500) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
