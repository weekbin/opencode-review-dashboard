# R26 PM Triage — Brief

> **Generated**: 2026-06-30 (RALPH LOOP iteration 7, R26)
> **Inputs**: R25 retro (`/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-25/retro.md`) + sync-report.md
> **Source**: lead-direct synthesis (v5.3.8 spec — no user pick)

## Round context

R25 SHIP landed clean (5th NET POSITIVE: 580/580 tests, 0 open issues). R25-gap-fix applied in-round per SG.R19.8 (Oracle caught 2 missing visual sections, fixed in commit 52e6a3a + 9c9d072). Sync confirms main HEAD `9c9d072` in sync with origin, 0 open issues, clean working tree, macOS cleanup gate clean, 580/580 tests baseline.

## R26 candidates (from R25 retro + R23 retro + R22 carryover)

| # | Source | Title | Profile | LOC | Risk | User-value |
|---|---|---|---|---|---|---|
| 1 | R23 retro | **Per-finding "delete from history"** (extends R25 #48 bulk delete pattern) | feature | 100-150 | LOW | 3/5 |
| 2 | R25 retro | **Bulk delete in conversation tab** (multi-select for findings, mirrors R25 #52 sidebar bulk delete) | polish | 30-50 | LOW | 2/5 |
| 3 | R22 carryover | tsc PATH investigation | tooling | 5-15 | LOW | 0/5 (internal) |
| 4 | R25 retro | SG.R25.1 candidate — pre-commit SG.R22.1 verify mandatory gate | skill-patch | 5-10 | LOW | 0/5 (internal) |

## Backlog freshness check

Stale issues: **0** (R21-R25 closed all pm-manager-approved). R26 candidates all fresh from R25/R23 retros.

## Candidate validation per PM product-value gate

### #1 Per-finding "delete from history" (R23 retro)
- **README 缺段?** No — README doesn't mention per-finding delete from history. ✓ honest
- **Non-developer visible?** Yes — delete button on each history entry. ✓ user-visible
- **竞品已有?** Yes (GitHub: per-PR hide; VS Code: per-file delete; Chrome: per-entry delete from history). ✓ defensible gap-fill
- **Scope**: Per-finding delete button in Recent Searches dropdown. Extends R25 #48 bulk delete pattern. R22 #45 Clear button stays as "Clear all".
- **STRINGS**: 2 new keys (`search.recent.delete` + `search.recent.delete.confirm`)
- **VERDICT**: SELECT

### #2 Bulk delete in conversation tab (R25 retro)
- **README 缺段?** No — README mentions conversation tab but not bulk delete. ✓ honest
- **Non-developer visible?** Yes — per-finding checkbox in Conversation tab + bulk delete button. ✓ user-visible
- **竞品已有?** Yes (GitHub PR comments multi-select; VS Code problems panel multi-select). ✓ defensible gap-fill
- **Scope**: Per-finding checkbox in Conversation tab + bulk "Delete selected" button. Reuses R25 #52 sidebar bulk delete pattern (multi-select + Set tracking).
- **STRINGS**: 2 new keys (`conversation.bulkDelete` + `conversation.selected`)
- **VERDICT**: SELECT

### #3 tsc PATH investigation (deferred)
- **Why deferred**: tooling, not user-facing. Carry to R27+.

### #4 SG.R25.1 candidate (deferred)
- **Why deferred**: skill patch is internal. v5.3.8 embed is working well; SG.R25.1 can wait until R27+.

## R26 SHIP SCOPE

| # | Issue (to open) | Profile | LOC | Atomic commit |
|---|---|---|---|---|
| 1 | Per-finding "delete from history" | feature | 100-150 | 1 |
| 2 | Bulk delete in conversation tab | polish | 30-50 | 1 |
| **TOTAL** | | | **130-200** | **2 atomic commits** |

## Caps check

| Cap | Limit | R26 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (per-finding delete) + 1 polish (bulk delete conversation) | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (bulk delete conversation) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3 + SG.R22.1)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `search.recent.delete` | "Delete from history" | "从历史中删除" | Per-finding delete button |
| `search.recent.delete.confirm` | "Removed from history" | "已从历史中移除" | Toast confirmation |
| `conversation.bulkDelete` | "Delete selected findings" | "删除选中的 finding" | Bulk delete button |
| `conversation.selected` | "Selected" | "已选" | Selected count badge |

Total: 4 keys × 2 locales = 8 STRINGS entries. All required for AC verification.

## Out-of-scope (deferred to R27+)

- tsc PATH investigation (R22 carryover)
- SG.R25.1 — pre-commit SG.R22.1 verify mandatory gate (R25 retro candidate)
- Subagent prompt improvements (already in v5.3.8 SG.R24.1)

## Branch + worktree pre-declaration

- Branch: `team-dev-loop-round-26-per-finding-delete-and-conv-bulk-delete`
- Worktree path: `$HOME/.worktrees/team-dev-loop-round-26`
- Subagent MUST verify `pwd` is worktree + `node_modules` exists BEFORE git op (SG.R19.4 + SG.R22.2)
- Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (SG.R24.1 — v5.3.8 embed working)

## OK to proceed

✓ All caps honored. ✓ Risk reasonable (LOW + LOW). ✓ ACs testable. ✓ i18n plan complete (4 keys). Branch + worktree pre-declared. SG.R22.2 applied at Phase -0. SG.R24.1 will apply at Phase 2 subagent prompts.