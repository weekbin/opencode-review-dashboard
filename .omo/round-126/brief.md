# R126 Brief — CSS for reconcile badges + listing popup (R123 retro flag)

## Goal

Add CSS rules in `src/ui/review.html` for all reconcile-related elements shipped unstyled by R117/R123/R125. Closes a 2-round-old retro flag from R123.

## Why

R117 retro + R123 retro + R125 retro all flagged that the reconcile-mode elements were rendering with browser-default styling (badges look like text, popup looks like a block). User scanning the diff couldn't visually distinguish resolved vs open vs new counts.

R126 ships the missing CSS — pure polish round.

## Scope

### 1. `src/ui/review.html` — add CSS rules before `</style>` (L3185)

```css
.reconcile-overlay-banner {
  background: #fff8c5;
  border-bottom: 1px solid #d4a017;
  padding: 8px 16px;
  font-size: 13px;
  color: #6b5300;
}
.card-reconcile-strip {
  display: flex;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.reconcile-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.reconcile-green { background: #d4f4dd; color: #1a6e36; }
.reconcile-amber { background: #ffe9b3; color: #7a4f00; }
.reconcile-red   { background: #ffd4d4; color: #7a1818; }
.reconcile-badge:hover { filter: brightness(0.95); }
.reconcile-hunk-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: rgba(74, 158, 255, 0.12);
  color: #1a4f8a;
  cursor: pointer;
  font-family: inherit;
}
.reconcile-hunk-badge:hover { background: rgba(74, 158, 255, 0.22); }
.reconcile-listing {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 6px;
  min-width: 220px;
  max-height: 320px;
  overflow-y: auto;
}
.reconcile-listing-heading {
  font-size: 11px;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}
.reconcile-listing-list { display: flex; flex-direction: column; gap: 2px; }
.reconcile-listing-item {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}
.reconcile-listing-item:hover { background: rgba(74, 158, 255, 0.1); border-color: rgba(74, 158, 255, 0.3); }
```

### 2. No i18n changes
### 3. No JS changes

## Tests (src/r126-reconcile-css.test.ts — NEW)

10 structural regex tests:
- AC1: `.reconcile-overlay-banner` rule in review.html
- AC2: `.card-reconcile-strip` rule in review.html
- AC3: `.reconcile-badge` rule in review.html (base styles)
- AC4: `.reconcile-green` rule in review.html
- AC5: `.reconcile-amber` rule in review.html
- AC6: `.reconcile-red` rule in review.html
- AC7: `.reconcile-listing` rule in review.html (popup base)
- AC8: `.reconcile-listing-item` rule in review.html
- AC9: `.reconcile-hunk-badge` rule in review.html (R125 element)
- AC10: regression — R117 + R118-R125 tests still pass

## Risk Register

| Risk | Mitigation |
|------|------------|
| CSS conflicts with existing rules | Use unique `.reconcile-*` prefix already established |
| Hardcoded colors don't match theme | Use low-saturation colors; structural test verifies rule existence |
| Existing `.reconcile-listing` positioning (inline-styled z-index) breaks | Keep inline positioning, CSS only adds box-shadow/bg/border |

## Round Profile

- Polish: 1 (R123 retro flag: reconcile CSS)
- Total: 1
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~60 (CSS rules)

## Acceptance

- Pre-commit 8/8 PASS
- All 10 R126 tests GREEN
- 0 regressions in R117-R125 tests

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓ (1)
- ≤8 total ✓ (1)