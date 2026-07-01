# R25 PM Triage — Brief

> **Generated**: 2026-06-30 (RALPH LOOP iteration 6, R25)
> **Inputs**: R24 retro (`/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-24/retro.md`) + sync-report.md
> **Source**: lead-direct synthesis (v5.3.8 spec — no user pick)

## Round context

R24 SHIP landed clean (4th NET POSITIVE: 555/555 tests, 0 open issues). R24-gap-fix applied in-round per SG.R19.8 (SKILL.md now v5.3.8 with SG.R24.1 subagent double-write prevention). Sync confirms main HEAD `40909fe` in sync with origin, 0 open issues, clean working tree, macOS cleanup gate clean, 555/555 tests baseline.

## R25 candidates (from R24 retro + R23 retro + R22 carryover)

| # | Source | Title | Profile | LOC | Risk | User-value |
|---|---|---|---|---|---|---|
| 1 | R23 retro | **Diff virtualization toggle in settings** (extends R22 settings modal) | feature | 100-150 | LOW-MEDIUM | 3/5 |
| 2 | R23 retro | Per-finding "delete from history" | feature | 50-80 | LOW | 2/5 |
| 3 | R23 retro | **Bulk delete in sidebar review progress** | polish | 30-50 | LOW | 2/5 |
| 4 | R22 carryover | tsc PATH investigation | tooling | 5-15 | LOW | 0/5 (internal) |

## Backlog freshness check

Stale issues: **0** (R22 + R23 + R24 closed all pm-manager-approved). R25 candidates all fresh from R24/R23 retros.

## Candidate validation per PM product-value gate

### #1 Diff virtualization toggle in settings (R23 retro)
- **README 缺段?** No — README doesn't mention settings toggle for virtualization. ✓ honest
- **Non-developer visible?** Yes — adds toggle in settings modal (R22 added modal). ✓ user-visible
- **竞品已有?** Yes (GitHub: prefers-reduced-motion disables animations; VS Code: editor.codeLens toggle; Phabricator: chunked diffs setting). ✓ defensible gap-fill
- **Scope**: Add "Diff virtualization" toggle in settings modal (extends R22 #44). Toggle ON by default. When OFF, render all hunks eagerly (no IntersectionObserver). R24 #49 per-hunk collapse still works (independent of virtualization).
- **STRINGS**: 2 new keys (`settings.virtualization.label` + `settings.virtualization.description`)
- **VERDICT**: SELECT

### #3 Bulk delete in sidebar review progress (R23 retro)
- **README 缺段?** No — README mentions review progress but not bulk delete. ✓ honest
- **Non-developer visible?** Yes — multi-select checkboxes in sidebar file cards. ✓ user-visible
- **竞品已有?** Yes (GitHub PR file tree multi-select; VS Code explorer multi-select). ✓ defensible gap-fill
- **Scope**: Per-file-card checkbox in sidebar + bulk delete button (mirrors R23 #48 recent-searches bulk delete pattern).
- **STRINGS**: 2 new keys (`sidebar.bulkDelete` + `sidebar.selected`)
- **VERDICT**: SELECT

### #2 Per-finding "delete from history" (deferred)
- **Why deferred**: polish quota already used by #3. Per-finding delete is similar pattern to bulk delete but lower impact.

### #4 tsc PATH investigation (deferred)
- **Why deferred**: tooling, not user-facing. Carry to R26+.

## R25 SHIP SCOPE

| # | Issue (to open) | Profile | LOC | Atomic commit |
|---|---|---|---|---|
| 1 | Diff virtualization toggle in settings | feature | 100-150 | 1 |
| 2 | Bulk delete in sidebar review progress | polish | 30-50 | 1 |
| **TOTAL** | | | **130-200** | **2 atomic commits** |

## Caps check

| Cap | Limit | R25 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (diff virt toggle) + 1 polish (sidebar bulk delete) | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (sidebar bulk delete) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3 + SG.R22.1)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `settings.virtualization.label` | "Diff virtualization" | "Diff 虚拟化" | Settings toggle label |
| `settings.virtualization.description` | "Render only visible hunks for faster scrolling on large diffs" | "仅渲染可见 hunk，加快大 diff 滚动速度" | Settings toggle description |
| `sidebar.bulkDelete` | "Delete selected files" | "删除选中文件" | Bulk delete button label |
| `sidebar.selected` | "Selected" | "已选" | Selected count badge |

Total: 4 keys × 2 locales = 8 STRINGS entries. All required for AC verification.

## Out-of-scope (deferred to R26+)

- Per-finding "delete from history" (R23 retro)
- tsc PATH investigation (R22 carryover)
- Subagent prompt improvements (already in v5.3.8 SG.R24.1)

## Branch + worktree pre-declaration

- Branch: `team-dev-loop-round-25-diff-virt-toggle-and-sidebar-bulk-delete`
- Worktree path: `$HOME/.worktrees/team-dev-loop-round-25`
- Subagent MUST verify `pwd` is worktree + `node_modules` exists BEFORE git op (SG.R19.4 + SG.R22.2)
- Subagent MUST verify `pwd == worktree` AFTER every Write/Edit (SG.R24.1 — NEW)

## OK to proceed

✓ All caps honored. ✓ Risk reasonable (LOW + LOW-MEDIUM). ✓ ACs testable. ✓ i18n plan complete (4 keys). Branch + worktree pre-declared. SG.R22.2 applied at Phase -0. SG.R24.1 will apply at Phase 2 subagent prompts.