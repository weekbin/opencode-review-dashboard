# R123 Brief — Click-to-expand reconcile badge listing (R117.2)

## Goal

When user clicks a reconcile badge (green/amber/red) showing a count > 1, instead of jumping to ONLY the first finding, show a popup listing ALL finding IDs in that category for that file. Each ID in the list is clickable to jump directly to that specific finding. Mirrors GitHub PR file-tree "X issues" → "list of issue titles" dropdown pattern.

## Why

R117 retro listed this as R117.2 risk-surfaced-no-action. R118/R119/R120/R121/R122 retros all mentioned it as still-deferred. 6 rounds deferred is at the v6 NO DEFERRAL threshold.

User-facing bug: User sees "5 still open" amber badge → clicks → jumps to ONE specific finding (not necessarily the one they care about). User has to scroll the conversation panel to find the right one.

## Scope

### 1. `src/ui/app.ts` — popup renderer + click handler

**New function** `showReconcileListing(badge: HTMLElement, findings: Finding[]): void`:
- Creates a `<div class="reconcile-listing">` overlay positioned next to the badge
- Renders list of `<button>` items, one per finding
- Each button shows `{file}:{start_line} — {severity} — {category} — {first 60 chars of comment}`
- Click on item → calls `jumpToFindingById(id)` + dismiss popup
- Click outside → dismiss popup

**Modified** reconcile badge click handler at L6782-6789:
- If badge has only 1 finding → existing behavior (jump to first)
- If badge has ≥2 findings → show popup listing
- Determine count via `findings.filter(...).length` — already computed in renderReconcileOverlay

### 2. `src/ui/i18n.ts` — 1 new key × 2 locales

```typescript
"reconcile.listing.heading": { en: "Findings in this file", "zh-CN": "本文件中的审查项" },
```

### 3. Tests (src/r123-reconcile-listing.test.ts — NEW)

10 structural regex tests:

- AC1: `showReconcileListing` function exists in app.ts
- AC2: reconcile badge click handler checks for finding count ≥2 before jumping
- AC3: showReconcileListing creates `<div class="reconcile-listing">` element
- AC4: listing contains one `<button>` per finding in array
- AC5: each listing button has data-finding-id attribute
- AC6: listing button click handler delegates to jumpToFindingById
- AC7: i18n has `reconcile.listing.heading` in en
- AC8: i18n has `reconcile.listing.heading` in zh-CN
- AC9: existing R117 reconcile badge wiring preserved (data-finding-id on badge, jumpToFindingById still called)
- AC10: regression — R117 + R118 + R119 + R120 + R121 + R122 tests still pass

## Risk Register

| Risk | Mitigation |
|------|------------|
| Popup positioning breaks on mobile | Use absolute positioning relative to badge — pure CSS handles |
| Click outside doesn't dismiss | Add document-level click listener inside showReconcileListing that closes if click target not inside listing |
| Listing is too long for >20 findings | Add scroll overflow-y auto + max-height |
| Pre-existing R117 reconcile badge wiring broken | AC9 explicit regression test |
| aria-modal not set on popup | Set role="dialog" + aria-modal="true" + focus trap |

## Round Profile

- Feature: 1 (R117.2 click-to-expand listing)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~100 (1 popup renderer + 1 click handler + 1 dismissal handler + 1 i18n key × 2 + 10 tests)

## Acceptance

- Pre-commit 8/8 PASS
- All 10 R123 tests GREEN
- 0 regressions in R117 + R118-R122 (94 prior tests)
- Bug visibly fixed: click badge with count > 1 → listing shows ALL finding IDs, each clickable

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓
- ≤8 total ✓ (1)