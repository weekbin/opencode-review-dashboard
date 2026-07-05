# R126 Research — CSS for reconcile badges + listing popup

## Files involved

- `src/ui/review.html` — append CSS rules before `</style>` at L3185
- `src/r126-reconcile-css.test.ts` — NEW file, 10 structural regex tests

## Existing patterns to reuse

**review.html `<style>` block**: 1 block at L7-L3185 (3178 lines of CSS already).

**No new JS changes**: all DOM elements (`.reconcile-overlay-banner`, `.card-reconcile-strip`, `.reconcile-badge`, `.reconcile-hunk-badge`, `.reconcile-listing`, etc.) are created via `className = "..."` in app.ts.

## Simplest change

Append ~60 lines of CSS to the existing `<style>` block in review.html (just before `</style>` at L3185). No JS edits.

## Test convention

Structural regex per project standard. 10 tests, 10 ACs — each verifies a single CSS class selector exists in review.html.

## v6 compliance

- 0 features ≤3 ✓
- 0 bugfix ≤5 ✓
- 1 polish ≤1 ✓
- 1 total ≤8 ✓