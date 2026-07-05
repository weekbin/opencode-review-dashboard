# R130 Research — Dark mode CSS variants for reconcile UI

## Files involved

- `src/ui/review.html` — append `@media (prefers-color-scheme: dark)` block to existing `<style>` block (after R126 CSS)
- `src/r130-dark-mode-css.test.ts` — NEW file, 10 structural regex tests

## Existing patterns to reuse

**R126 reconcile CSS** (L3185 area in review.html):
- `.reconcile-overlay-banner` { background: #fff8c5; ... }
- `.reconcile-badge` + variants (green/amber/red) with light pastels
- `.reconcile-listing` white card with shadow
- `.reconcile-hunk-badge` blue tint

**Existing @media usage** in review.html (4 occurrences at L604, L731, L746, L835):
- All use `@media (min-width: 1200px)` for responsive layout
- No dark mode media queries exist yet (R130 is first)

**App-level dark mode** (app.ts:1611-1613):
- `resolvedTheme()` checks `prefers-color-scheme: dark` media query
- `<body>` gets class `theme-dark` or `theme-light`
- Most UI components use these classes for dark mode

But: `.reconcile-*` CSS uses `@media (prefers-color-scheme: dark)` directly (preferred for media query approach, which also handles user-agent dark mode without needing JS).

## Simplest change (R130 fact sheet)

Append `@media (prefers-color-scheme: dark) { ... }` block to review.html's `<style>` block (before `</style>` at L3185). Block contains 8 selectors overriding R126 colors.

## Risk assessment

- **Low**: @media syntax is standard CSS
- **Low**: 8 selectors override R126 colors, no impact on light mode
- **Low**: structural test (regex) verifies @media block exists
- **Medium**: hardcoded dark colors might not match app's other dark mode colors — would need to align with existing dark theme

## Test convention

Structural regex per project standard. 10 tests, 10 ACs.

## v6 compliance

- 0 features ≤3 ✓
- 0 bugfix ≤5 ✓
- 1 polish ≤1 ✓
- 1 total ≤8 ✓