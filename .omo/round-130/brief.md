# R130 Brief — Dark mode CSS variants for reconcile UI (R126 retro flag)

## Goal

Add `@media (prefers-color-scheme: dark)` overrides for R126's reconcile CSS rules so reconcile badges, banner, strip, listing popup, and hunk badge all render correctly in dark mode.

## Why

R126 retro flagged "no dark mode CSS variants" as a forward-looking concern. R117 + R123 + R125 + R126 all shipped light-mode-only styles. When user has `themeMode = "dark"` (or "auto" with system dark preference), the reconcile UI elements are unreadable: white card popup on dark background, pastel green/amber/red badges on dark background = no contrast.

## Scope

### 1. `src/ui/review.html` — append dark mode CSS after R126 rules

```css
@media (prefers-color-scheme: dark) {
  .reconcile-overlay-banner {
    background: #3d3a1a;
    border-bottom-color: #6b5300;
    color: #fff8c5;
  }
  .card-reconcile-strip {
    background: rgba(255, 255, 255, 0.05);
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }
  .reconcile-green { background: #1a3d24; color: #b5f0c5; }
  .reconcile-amber { background: #3d2e0a; color: #ffe9b3; }
  .reconcile-red   { background: #3d1818; color: #ffd4d4; }
  .reconcile-hunk-badge {
    background: rgba(74, 158, 255, 0.25);
    border-color: rgba(74, 158, 255, 0.5);
    color: #b3d9ff;
  }
  .reconcile-listing {
    background: #1e1e1e;
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
  .reconcile-listing-heading { color: #aaa; }
  .reconcile-listing-item { color: #ddd; }
  .reconcile-listing-item:hover {
    background: rgba(74, 158, 255, 0.2);
    border-color: rgba(74, 158, 255, 0.4);
  }
}
```

### 2. No JS changes
### 3. No i18n changes

## Tests (src/r130-dark-mode-css.test.ts — NEW)

10 structural regex tests:
- AC1: `@media (prefers-color-scheme: dark)` block in review.html
- AC2: `.reconcile-overlay-banner` dark variant
- AC3: `.card-reconcile-strip` dark variant
- AC4: `.reconcile-green` dark variant
- AC5: `.reconcile-amber` dark variant
- AC6: `.reconcile-red` dark variant
- AC7: `.reconcile-hunk-badge` dark variant
- AC8: `.reconcile-listing` dark variant
- AC9: `.reconcile-listing-item:hover` dark variant
- AC10: regression — R117 + R118-R129 tests still pass

## Risk Register

| Risk | Mitigation |
|------|------------|
| Dark mode contrast ratio fails WCAG | Use higher contrast colors (e.g., #b5f0c5 on #1a3d24) |
| @media block syntax error | Use proper CSS structure with closing brace |
| Existing light-mode CSS broken by new @media | @media block is scoped to its own selector, no conflict |

## Round Profile

- Feature: 0
- Bugfix: 0
- Polish: 1 (R126 retro flag: dark mode CSS)
- Total: 1
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~30 (1 @media block + 8 selectors)

## Acceptance

- Pre-commit 8/8 PASS
- All 10 R130 tests GREEN
- 0 regressions in R117-R129 tests (115 prior tests)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓ (1)
- ≤8 total ✓ (1)