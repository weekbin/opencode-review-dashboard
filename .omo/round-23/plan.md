# R23 Plan — Diff virtualization (feature) + Bulk delete recent-searches (polish)

> **Generated**: 2026-06-30 by Architect (lead-direct per v5.3.3)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md + planner.md
> **Branch**: `team-dev-loop-round-23-diff-virt-and-bulk-delete`
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-23`
> **Pre-dev sanity check**: `pwd` MUST = `/Users/yangweibin/.worktrees/team-dev-loop-round-23` AND `node_modules` must exist (SG.R19.4 + SG.R22.2)

## 1. Goal

Close 2 GH issues in 2 atomic commits:
- **#48 Bulk delete recent-searches (polish)** — multi-select checkboxes + bulk delete button in Recent Searches dropdown
- **#47 Diff virtualization for 1000+ line files (feature)** — IntersectionObserver-based hunk virtualization

## 2. Non-goals

- NO new dependencies (vanilla IntersectionObserver + checkbox + button)
- NO schema changes (localStorage keys preserved)
- NO server changes (mock-server still on port 8890)
- NO existing rendering rewrite (only ADD virtualization layer)
- NO R22 Clear button removal (stays as "Clear all")
- NO scrollSpy changes (existing IntersectionObserver pattern at app.ts:3101)

## 3. AC trace (acceptance criteria, testable)

### Issue #48 — Bulk delete recent-searches

| AC | Description | Test type | File |
|---|---|---|---|
| 8.1 | Per-item checkbox visible in Recent Searches dropdown | unit + DOM | `src/ui/app.ts` |
| 8.2 | Click checkbox → item marked selected (visual + state) | unit | `src/ui/app.test.ts` |
| 8.3 | ≥1 selected → "Delete selected" button visible (replaces Clear) | unit + DOM | `src/ui/app.test.ts` |
| 8.4 | Click Delete selected → selected entries removed from localStorage + dropdown re-renders | unit | `src/ui/app.test.ts` |
| 8.5 | R22 Clear button still works as "Clear all" | unit | `src/ui/app.test.ts` |
| 8.6 | localStorage key unchanged (`diff-review:recent-searches`) | unit | `src/ui/search-history.test.ts` |

### Issue #47 — Diff virtualization

| AC | Description | Test type | File |
|---|---|---|---|
| 7.1 | Visible hunks render normally (full DOM) | unit + DOM | `src/ui/diff-virtualization.test.ts` |
| 7.2 | Off-screen hunks collapse to placeholder (`<div data-hunk-placeholder>`) | unit | `src/ui/diff-virtualization.test.ts` |
| 7.3 | IntersectionObserver setup at render time, teardown on unmount | unit | `src/ui/diff-virtualization.test.ts` |
| 7.4 | Scroll into hunk → placeholder replaced with full DOM | unit | `src/ui/diff-virtualization.test.ts` |
| 7.5 | 1000+ line file scroll remains smooth (no full re-render) | integration | `src/ui/app.test.ts` |
| 7.6 | Existing scrollSpy IntersectionObserver pattern not broken | regression | `src/ui/app.test.ts` |

**Total ACs**: 12 (6 + 6)

## 4. Files

### Issue #48 (atomic commit 1)
- `src/ui/search-history.ts` — add public `removeRecentSearches(queries: string[])` exported fn
- `src/ui/app.ts` — modify renderRecentSearches to add per-item checkbox + bulk delete button
- `src/ui/i18n.ts` — add 2 STRINGS keys (search.recent.select + search.recent.bulkDelete)
- `src/ui/search-history.test.ts` — add bulk delete unit tests
- `src/ui/app.test.ts` (or new `src/ui/recent-searches-bulk.test.ts`) — add UI tests
- 4-5 file touches, ~50 LOC

### Issue #47 (atomic commit 2)
- `src/ui/diff-virtualization.ts` — new file with virtualization logic + types
- `src/ui/app.ts` — wire IntersectionObserver for diff hunks
- `src/ui/diff-virtualization.test.ts` — new file with virtualization unit tests
- `src/ui/app.test.ts` — add regression test for scrollSpy coexistence
- 3-4 file touches, ~300 LOC

## 5. Strategy & approach

### #48 — Bulk delete pattern

**Pattern A (preferred): Add public `removeRecentSearches(queries: string[])` in search-history.ts**
```typescript
export function removeRecentSearches(queries: string[]): string[] {
  if (typeof localStorage === "undefined") return getRecentSearches();
  const toRemove = new Set(queries);
  const current = getRecentSearches().filter((q) => !toRemove.has(q));
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(current));
  return current;
}
```

**Pattern B: UI checkbox + bulk delete button**
- In app.ts renderRecentSearches (around line 951), add `<input type="checkbox" class="diff-search-history-checkbox">` per item
- Track selected queries in module-level Set
- Show "Delete selected (N)" button when Set.size > 0, hides "Clear" button
- Click handler: `removeRecentSearches(Array.from(selected))` + re-render + clear selection

**Pattern C: Clear button coexistence**
- When ≥1 selected: show "Delete selected" button only
- When 0 selected: show "Clear" button only (R22 behavior)
- Two buttons never visible simultaneously

### #47 — Diff virtualization pattern

**Pattern A: IntersectionObserver setup**
- Reuse existing IntersectionObserver pattern from scrollSpy (app.ts:3101)
- New observer on `[data-hunk]` elements
- Threshold: 0 (any pixel visible triggers render)
- Root margin: 200px buffer above/below viewport

**Pattern B: Hunk placeholder**
```html
<!-- Off-screen hunk -->
<div data-hunk-placeholder data-file="src/foo.ts" data-hunk="42-50"></div>
<!-- Visible hunk -->
<div data-hunk data-file="src/foo.ts" data-hunk="42-50">
  <!-- full diff content -->
</div>
```

**Pattern C: Coexistence with scrollSpy**
- scrollSpy observes `[data-file-card]` for sidebar progress
- New diff observer observes `[data-hunk]` for diff rendering
- Two observers, different targets, no conflict

### STRINGS table additions (issue #48)
- `search.recent.select` (en: "Select", zh-CN: "选择")
- `search.recent.bulkDelete` (en: "Delete selected", zh-CN: "删除选中")

## 6. STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `search.recent.select` | "Select" | "选择" | Checkbox label |
| `search.recent.bulkDelete` | "Delete selected" | "删除选中" | Bulk delete button |

**Total**: 2 keys, both `en` + `zh-CN` required, validated by `src/ui/i18n.test.ts` regression guard (R20 retro AC1.2 pattern).

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| #47 — IntersectionObserver setup fails in jsdom test env | Mock IntersectionObserver in test setup (existing scrollSpy test pattern) |
| #47 — Off-screen hunk collapse breaks scroll position | Use placeholder with same height as rendered hunk |
| #47 — Two IntersectionObservers conflict | Different targets (scrollSpy: `[data-file-card]`, new: `[data-hunk]`) |
| #48 — Bulk delete + Clear button confusion | Mutually exclusive buttons (delete when selected > 0, clear when 0) |
| #48 — Checkbox state desync with re-render | Module-level Set, reset on re-render |
| #48 — Selected items survive dropdown close | Clear selection when dropdown closes |
| both — out of worktree dir | SG.R19.4 sanity check BEFORE first git op |
| both — missing node_modules in worktree | SG.R22.2 symlink from main BEFORE first test run |
| both — bilingual lockstep violation | SG.R22.1 pre-commit `grep -c` verify on both READMEs |
| both — R3-style fabricated audit | git cat-file -e on every SHA in Phase 2.5 |

## 8. PASS criteria (Phase 3)

- 12 ACs total: 6 PASS for #48 + 6 PASS for #47 = 12/12
- Phase 3a review-lens × 5 + Phase 3b diff + Phase 3c Playwright (Gap #14 layer): all PASS or explicit SHIP-WITH-NOTES
- i18n regression-guard test passes with 2 new keys (510 → 512)
- Full suite: 512 pass / 0 fail (was 510/0 post-R22, +2 from #48)
- mock-server still serves http://localhost:8890 (Phase 2.5 sanity check)
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates + SG.R22.1 bilingual lockstep verify
- GH issues #47 + #48 auto-closed by Phase 4.9

## 9. Out-of-scope (deferred to R24+ backlog)

- Toast screenshots (R19/R20 retro)
- Skill file edits for SG.R22.1 + SG.R22.2 (already applied at Phase -0 / Phase 3.5)
- Per-finding "delete from history" (single-entry delete already covered by #48 bulk)
- Settings modal entry for virtualization toggle

## 10. References

- brief.md: `.omo/round-23/brief.md`
- competitor-landscape.md: `.omo/round-23/competitor-landscape.md`
- pm-manager-review.md: `.omo/round-23/pm-manager-review.md`
- planner.md: `.omo/round-23/planner.md`
- R22 Clear button pattern: `src/ui/app.ts:938` (.diff-search-history-clear)
- R21 debounce pattern: `src/ui/search-history.ts` (commitRecentSearch + cancelPendingCommit)
- Existing IntersectionObserver pattern: `src/ui/app.ts:3101` (scrollSpy)
- R20 i18n regression-guard pattern: `src/ui/i18n.test.ts` (AC1.2 tests)
- R+ retro patches: `.opencode/skills/team-dev-loop/SKILL.md` (SG.R19.x + SG.R20.1 + SG.R22.1 + SG.R22.2)
- Pre-commit audit spec: `.opencode/skills/team-dev-loop/references/pre-commit-audit-spec.md`