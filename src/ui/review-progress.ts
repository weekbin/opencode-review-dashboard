/**
 * R20 #40 — Sidebar review progress helper.
 *
 * Pure, dependency-free formatter used by `src/ui/app.ts` to render the
 * sidebar header counter (text + visual bar width) showing how many of
 * the loaded files the reviewer has marked as read.
 *
 * Splitting the formatting into its own module — instead of inlining the
 * math into `app.ts` — keeps the renderer deterministic and unit-
 * testable (R16 SG.14 add-only rule: never modify existing helpers in
 * `app.ts`, add new ones alongside).
 *
 * The text itself is composed in `app.ts` via
 * `t("sidebar.reviewProgress", { count, total, percent })` so this
 * module never touches i18n — translation lives one layer up.
 *
 * Public surface:
 *   - `formatReviewProgress(readCount, totalCount)` returns
 *     `{ count, total, percent, widthPct, complete }`. `percent` is
 *     0..100 rounded. `widthPct` is the same value as a CSS string
 *     (`"0%".."100%"`) ready for `style="width: <widthPct>"`.
 */

export type ReviewProgress = {
  /** Clamped read count (never exceeds `total`). */
  count: number;
  /** Total file count after clamping (>= 0). */
  total: number;
  /** Numeric percent in [0, 100]. */
  percent: number;
  /** CSS-ready width string, e.g. `"42%"`. */
  widthPct: string;
  /** True iff every file is marked read (count === total > 0). */
  complete: boolean;
};

/**
 * Build the progress payload for the sidebar header.
 *
 * Edge-case contract (verified by `review-progress.test.ts`):
 *   - `totalCount === 0` → percent 0, widthPct `"0%"`, complete false,
 *     count 0, total 0 (nothing to review yet).
 *   - `readCount === 0, totalCount > 0` → percent 0, complete false.
 *   - `readCount === totalCount > 0` → percent 100, complete true.
 *   - `readCount > totalCount` (defensive) → treated as equal,
 *     clamped to 100%.
 *   - Negative or NaN inputs collapse to 0 (no throws at render time).
 *
 * The caller (`src/ui/app.ts`) composes the visible text with
 * `t("sidebar.reviewProgress", { count, total, percent })` — i18n is
 * never reached inside this pure helper so unit tests stay hermetic.
 */
export function formatReviewProgress(readCount: number, totalCount: number): ReviewProgress {
  // Defensive normalization — callers sometimes pass `state.read.size`
  // and a stale total. Treat negative or NaN inputs as zero so the
  // helper never throws at render time.
  const total = Math.max(0, Number.isFinite(totalCount) ? totalCount : 0);
  const raw = Math.max(0, Number.isFinite(readCount) ? readCount : 0);

  if (total === 0) {
    return { count: 0, total: 0, percent: 0, widthPct: "0%", complete: false };
  }

  // Clamp read to total (defensive — toggling race shouldn't push it past)
  const count = Math.min(raw, total);
  const percent = Math.round((count / total) * 100);
  const widthPct = `${percent}%`;
  const complete = count === total;

  return { count, total, percent, widthPct, complete };
}
