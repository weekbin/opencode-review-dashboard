# R22 Plan — Reset-restore search-history (feature) + skipLink i18n fix (polish)

> **Generated**: 2026-06-30 by Architect (lead-direct per v5.3.3)
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md + planner.md
> **Branch**: `team-dev-loop-round-22-reset-and-i18n-fix`
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-22`
> **Pre-dev sanity check**: `git rev-parse --show-toplevel` MUST = `/Users/yangweibin/.worktrees/team-dev-loop-round-22`

## 1. Goal

Close 2 GH issues in 2 atomic commits:
- **#45 Reset-restore search-history button (feature)** — add Clear button to Recent Searches dropdown
- **#46 Fix skipLink i18n test fail (polish)** — 1-character fix in i18n.ts that eliminates persistent test fail since R19

## 2. Non-goals

- NO new dependencies (vanilla button + toast, no React/Vue)
- NO schema changes (localStorage key unchanged)
- NO server changes (mock-server still on port 8890)
- NO bulk delete (separate multi-select UI, deferred to R23+)
- NO settings-modal entry for search-history-max (existing toolbar control sufficient)
- NO undo for Clear action (GitHub/VS Code also don't offer undo)

## 3. AC trace (acceptance criteria, testable)

### Issue #46 — Fix skipLink i18n test fail

| AC | Description | Test type | File |
|---|---|---|---|
| 6.1 | `bun test src/ui/i18n.test.ts` passes 21/21 (was 20/21) | unit | `src/ui/i18n.test.ts` |
| 6.2 | `bun test` passes 504/504 (was 503/504) | suite | `bun test` |
| 6.3 | i18n.ts:104 key is quoted: `"skipLink": {` | inspection | `src/ui/i18n.ts` |

### Issue #45 — Reset-restore search-history

| AC | Description | Test type | File |
|---|---|---|---|
| 5.1 | Clear button visible in Recent Searches dropdown (right of title) | unit + DOM | `src/ui/app.ts` |
| 5.2 | Click Clear → localStorage[`diff-review:recent-searches`] = `[]` | unit | `src/ui/app.test.ts` |
| 5.3 | Click Clear → dropdown re-renders showing empty state | unit + DOM | `src/ui/app.test.ts` |
| 5.4 | Click Clear → toast confirmation appears ("Recent searches cleared") | unit + DOM | `src/ui/app.test.ts` |
| 5.5 | localStorage key unchanged (`diff-review:recent-searches`) | unit | `src/ui/search-history.test.ts` |
| 5.6 | max 5 cap + R21 debounce preserved (no regression) | unit | `src/ui/search-history.test.ts` |

**Total ACs**: 9 (3 + 6)

## 4. Files

### Issue #46 (atomic commit 1)
- `src/ui/i18n.ts:104` — change `skipLink: {` to `"skipLink": {` (1-char)
- 1 file, 1 LOC

### Issue #45 (atomic commit 2)
- `src/ui/search-history.ts` — add public `clearRecentSearches()` exported fn (currently only `__testonlyClearRecentSearches`)
- `src/ui/app.ts` — add Clear button render + click handler + toast
- `src/ui/i18n.ts` — add 2 STRINGS keys (search.recent.clear + search.recent.clear.confirm)
- `src/ui/search-history.test.ts` — add `clearRecentSearches` unit test
- `src/ui/app.test.ts` (or new `src/ui/recent-searches.test.ts`) — add 5 UI tests
- 4-5 file touches, ~60 LOC

## 5. Strategy & approach

### #46 — skipLink i18n fix
- Trivial: change 1 character in `src/ui/i18n.ts:104` from `skipLink: {` to `"skipLink": {`
- Verify test passes
- No functional change

### #45 — Reset-restore search-history

**Pattern A (preferred): Add public `clearRecentSearches()` in search-history.ts**
```typescript
export function clearRecentSearches(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SEARCH_HISTORY_KEY, "[]");
  // Also cancel any pending debounce commit (R21 surface)
  cancelPendingCommit();
}
```

**Pattern B: UI button rendering**
- In app.ts where Recent Searches dropdown is rendered (around line 925+), add Clear button next to title
- Button: `<button class="diff-search-history-clear" data-i18n="search.recent.clear">Clear</button>`
- Click handler: calls `clearRecentSearches()` + re-renders dropdown + shows toast

**Pattern C: Toast integration**
- Use existing toast system (R14 #24)
- Toast message via `t("search.recent.clear.confirm")`
- Toast type: `info` (not error)

### STRINGS table additions (issue #45)
- `search.recent.clear` (en: "Clear", zh-CN: "清空")
- `search.recent.clear.confirm` (en: "Recent searches cleared", zh-CN: "最近搜索已清空")

## 6. STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `search.recent.clear` | "Clear" | "清空" | Clear button label |
| `search.recent.clear.confirm` | "Recent searches cleared" | "最近搜索已清空" | Toast confirmation |

**Total**: 2 keys, both `en` + `zh-CN` required, validated by `src/ui/i18n.test.ts` regression guard (R20 retro AC1.2 pattern).

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| #45 — clearRecentSearches could cancel in-flight debounce | Call `cancelPendingCommit()` (existing R21 fn) after clear to prevent race |
| #45 — Clear button too prominent (accidental clicks) | Use button (not link), no destructive confirm needed (GitHub/VS Code don't either) |
| #45 — toast integration broken | Use existing R14 toast system; verify by unit test |
| #45 — i18n key collision (existing keys reused) | grep STRINGS table before add |
| #46 — test still fails after fix (typo in escape) | verify with `grep '"skipLink":' src/ui/i18n.ts` before commit |
| both — out of worktree dir | SG.R19.4 sanity check BEFORE first git op |
| both — R3-style fabricated audit | git cat-file -e on every SHA in Phase 2.5 |

## 8. PASS criteria (Phase 3)

- 9 ACs total: 3 PASS for #46 + 6 PASS for #45 = 9/9
- Phase 3a review-lens × 5 + Phase 3b diff + Phase 3c Playwright (Gap #14 layer): all PASS or explicit SHIP-WITH-NOTES
- i18n regression-guard test passes with skipLink fix + 2 new keys
- Full suite: 504 pass / 0 fail (was 503 pass / 1 fail)
- mock-server still serves http://localhost:8890 (Phase 2.5 sanity check)
- dist/ rebuilds successfully (Phase 2.6 SG.R20.1 step 2)
- Pre-commit audit: 2 SHAs verified + 3 fast gates (i18n parity, no untracked files, mock-server health)
- GH issues #45 + #46 auto-closed by Phase 4.9

## 9. Out-of-scope (deferred to R23+ backlog)

- Bulk delete recent-searches (multi-select UI)
- Diff virtualization for 1000+ line files
- Settings modal entry for search-history-max
- Per-finding "delete from history" (single-entry delete)

## 10. References

- brief.md: `.omo/round-22/brief.md`
- competitor-landscape.md: `.omo/round-22/competitor-landscape.md`
- pm-manager-review.md: `.omo/round-22/pm-manager-review.md`
- planner.md: `.omo/round-22/planner.md`
- R21 debounce pattern: `src/ui/search-history.ts` (commitRecentSearch + cancelPendingCommit)
- R14 toast system: `src/ui/app.ts` (showToast helper)
- R20 i18n regression-guard pattern: `src/ui/i18n.test.ts` (AC1.2 tests)
- R+ retro patches: `.opencode/skills/team-dev-loop/SKILL.md` (SG.R19.x + SG.R20.1)
- Pre-commit audit spec: `.opencode/skills/team-dev-loop/references/pre-commit-audit-spec.md`