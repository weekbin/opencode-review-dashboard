# R23 PM Triage — Brief

> **Generated**: 2026-06-30 (RALPH LOOP iteration 4, R23)
> **Inputs**: R22 retro (`/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-22/retro.md`) + sync-report.md
> **Source**: lead-direct synthesis (v5.3.6 spec — no user pick)

## Round context

R22 SHIP landed clean (NET POSITIVE: 510/510 tests pass, 1 pre-existing fail eliminated). All R+ retro patches + 2 new R22 SGs (SG.R22.1 bilingual lockstep, SG.R22.2 worktree env) carried forward. Sync confirms main HEAD `614806e` in sync with origin, 0 open issues, clean working tree, macOS cleanup gate clean, 4 stale worktrees removed.

## R23 candidates (from R22 retro + R20/R21 carryover)

| # | Source | Title | Profile | LOC | Risk | User-value |
|---|---|---|---|---|---|---|
| 1 | R20 carryover | **Diff virtualization for 1000+ line files** | feature | 200-400 | MEDIUM-HIGH | 4/5 |
| 2 | R21 retro | **Bulk delete recent-searches (multi-select)** | polish | 30-50 | LOW | 2/5 |
| 3 | R19/R20 retro | Toast screenshots (R19/R20 toast sections still text-only) | polish (docs) | 10-20 | LOW | 2/5 |
| 4 | R22 retro (NEW) | Apply SG.R22.1 (bilingual lockstep verify) + SG.R22.2 (worktree env check) | skill-patch | 30-50 | LOW | 0/5 (internal) |

## Backlog freshness check

Stale issues: **0** (R22 closed all pm-manager-approved #45, #46). R23 candidates are all fresh from R22/R20/R21 retros.

## Candidate validation per PM product-value gate

### #1 Diff virtualization for 1000+ line files (R20 carryover)
- **README 缺段?** No — README doesn't address performance for large diffs. ✓ honest
- **Non-developer visible?** Yes — affects users with large PRs. ✓ user-visible
- **竞品已有?** Yes (GitHub uses Turbo Frames + lazy loading for large diffs; VS Code virtualizes long files; Phabricator loads diffs in chunks). ✓ defensible gap-fill
- **Scope**: Virtualize file diff rendering — only render visible hunks + small buffer. Use Intersection Observer for hunk visibility detection. No new dep (vanilla Intersection Observer).
- **STRINGS**: 0 new keys (purely performance, no UI text)
- **VERDICT**: SELECT

### #2 Bulk delete recent-searches (R21 retro)
- **README 缺段?** No — README mentions "Clear" but not multi-select delete. ✓
- **Non-developer visible?** Yes — multi-select checkboxes in Recent Searches dropdown. ✓
- **竞品已有?** Yes (Chrome history → multi-select delete; VS Code search → multi-select clear). ✓
- **Scope**: Add per-item checkbox in Recent Searches dropdown + bulk Delete button. R22 Clear button stays as "Clear all" (different action).
- **STRINGS**: 2 new keys (`search.recent.select` + `search.recent.bulkDelete`)
- **VERDICT**: SELECT

### #3 Toast screenshots (deferred)
- **Why deferred**: polish quota already used by #2. Docs-only, low risk.

### #4 Skill patch (deferred to R24+)
- **Why deferred**: SG.R22.1 already applied in this round's Phase 3.5. SG.R22.2 already applied in this round's Phase -0. The actual skill/ file edits (`.opencode/skills/team-dev-loop/SKILL.md`) can be a separate round.

## R23 SHIP SCOPE

| # | Issue (to open) | Profile | LOC | Atomic commit |
|---|---|---|---|---|
| 1 | Diff virtualization for 1000+ line files | feature | 200-400 | 1 |
| 2 | Bulk delete recent-searches (multi-select) | polish | 30-50 | 1 |
| **TOTAL** | | | **230-450** | **2 atomic commits** |

## Caps check

| Cap | Limit | R23 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (diff virt) + 1 polish (bulk delete) | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (bulk delete) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `search.recent.select` | "Select" | "选择" | Checkbox label |
| `search.recent.bulkDelete` | "Delete selected" | "删除选中" | Bulk delete button |

Total: 2 keys × 2 locales = 4 STRINGS entries. Both required for AC verification.

## Out-of-scope (deferred to R24+)

- Toast screenshots (R19/R20 retro)
- Skill file edits for SG.R22.1 + SG.R22.2 (already applied in R23 Phase -0/3.5)
- Any other R+ follow-ups

## Branch + worktree pre-declaration

- Branch: `team-dev-loop-round-23-diff-virt-and-bulk-delete`
- Worktree path: `$HOME/.worktrees/team-dev-loop-round-23`
- Subagent MUST verify `pwd` is worktree + `node_modules` exists BEFORE git op (SG.R19.4 + SG.R22.2)

## OK to proceed

✓ All caps honored. ✓ Risk reasonable (LOW + MEDIUM-HIGH but feature is well-scoped). ✓ ACs testable. ✓ i18n plan complete (2 keys). Branch + worktree pre-declared. SG.R22.2 applied at Phase -0 (worktree env check).