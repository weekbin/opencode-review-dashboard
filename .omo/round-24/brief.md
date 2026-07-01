# R24 PM Triage — Brief

> **Generated**: 2026-06-30 (RALPH LOOP iteration 5, R24)
> **Inputs**: R23 retro (`/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-23/retro.md`) + sync-report.md
> **Source**: lead-direct synthesis (v5.3.7 spec — no user pick)

## Round context

R23 SHIP landed clean (NET POSITIVE: 538/538 tests, 0 open issues). R23-gap-fix applied in-round per SG.R19.8 (SKILL.md now v5.3.7 with SG.R20.1 + SG.R22.1 + SG.R22.2 embedded). Sync confirms main HEAD `7cdc3fc` in sync with origin, 0 open issues, clean working tree, macOS cleanup gate clean.

## R24 candidates (from R23 retro + R22/R20/R19 carryover)

| # | Source | Title | Profile | LOC | Risk | User-value |
|---|---|---|---|---|---|---|
| 1 | R23 retro | **Per-hunk diff expand/collapse** (extends R23 virtualization) | feature | 200-350 | MEDIUM | 4/5 |
| 2 | R23 retro | Diff virtualization toggle in settings | feature | 100-150 | LOW-MEDIUM | 3/5 |
| 3 | R23 retro | Bulk delete in sidebar review progress | polish | 30-50 | LOW | 2/5 |
| 4 | R19/R20 retro | **Toast screenshots** (R19/R20 toast sections still text-only) | polish (docs) | 10-20 | LOW | 2/5 |
| 5 | R22 carryover | tsc PATH investigation | tooling | 5-15 | LOW | 0/5 (internal) |
| 6 | R23 retro | Subagent prompt improvements (WRITE TO WORKTREE, heredoc commit) | skill-patch | 0 (already in v5.3.7 SG.R22.2) | — | — |

## Backlog freshness check

Stale issues: **0** (R22 + R23 closed all pm-manager-approved). R24 candidates all fresh from R23 retro + R19/R20/R22 carryover.

## Candidate validation per PM product-value gate

### #1 Per-hunk diff expand/collapse (R23 follow-up)
- **README 缺段?** No — README doesn't mention per-hunk expand/collapse. ✓ honest
- **Non-developer visible?** Yes — each hunk has expand/collapse button. ✓ user-visible
- **竞品已有?** Yes (GitHub per-file "Expand all" / "Collapse all" + per-hunk expand on click; Phabricator has inline +/- per hunk). ✓ defensible gap-fill
- **Scope**: Each diff hunk gets a header with expand/collapse button. Collapsed hunks skip rendering (extends R23 virtualization). R23 #47 already virtualizes off-screen hunks; this adds user control for in-view hunks.
- **STRINGS**: 1 new key (`diff.hunk.collapse` + `diff.hunk.expand` = 2 keys actually)
- **VERDICT**: SELECT

### #4 Toast screenshots (R19/R20 carryover)
- **README 缺段?** Yes — README sections "Toast notifications" (R19) and "Auto-save indicator" (R14) are text-only. Screenshots would close the visual gap. ✓
- **Non-developer visible?** Yes — toast UI is user-facing. ✓ user-visible
- **竞品已有?** Yes (every modern app has toast screenshots in docs). ✓ defensible
- **Scope**: Capture 4 toast screenshots (added review, copied permalink, copied finding as MD, submitted review) → save to docs/screenshots/r24-s*.png → reference in README sections.
- **STRINGS**: 0 new keys (just images)
- **VERDICT**: SELECT

### #2 Diff virtualization toggle in settings (deferred)
- **Why deferred**: R23 #47 shipped virtualization unconditionally. Adding toggle means settings UI changes, R22 settings modal extension. Bigger scope than R24 budget allows.

### #3 Bulk delete in sidebar review progress (deferred)
- **Why deferred**: polish quota already used by #4. Similar pattern to R23 #48 but in sidebar instead of recent searches.

### #5 tsc PATH investigation (deferred)
- **Why deferred**: tooling, not user-facing. Carry to R25+ or backport to skill file.

### #6 Subagent prompt improvements (already in v5.3.7)
- **Status**: Already embedded in SKILL.md via R23-gap-fix (SG.R22.2 includes worktree env check at Phase -0). Subagent prompts can reference SG.R22.2 / SG.R22.1 / SG.R20.1 sections.

## R24 SHIP SCOPE

| # | Issue (to open) | Profile | LOC | Atomic commit |
|---|---|---|---|---|
| 1 | Per-hunk diff expand/collapse | feature | 200-350 | 1 |
| 2 | Toast screenshots (R19/R20 carryover) | polish (docs) | 10-20 | 1 |
| **TOTAL** | | | **210-370** | **2 atomic commits** |

## Caps check

| Cap | Limit | R24 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (per-hunk expand/collapse) + 1 polish (toast screenshots) | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (toast screenshots) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3 + SG.R22.1)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `diff.hunk.collapse` | "Collapse hunk" | "折叠 hunk" | Collapse button aria-label |
| `diff.hunk.expand` | "Expand hunk" | "展开 hunk" | Expand button aria-label |

Total: 2 keys × 2 locales = 4 STRINGS entries. Both required for AC verification.

## Out-of-scope (deferred to R25+)

- Diff virtualization toggle in settings (R23 retro, feature)
- Bulk delete in sidebar review progress (R23 retro, polish)
- tsc PATH investigation (R22 carryover)
- Per-finding "delete from history" (R23 retro)

## Branch + worktree pre-declaration

- Branch: `team-dev-loop-round-24-hunk-expand-and-toast-shots`
- Worktree path: `$HOME/.worktrees/team-dev-loop-round-24`
- Subagent MUST verify `pwd` is worktree + `node_modules` exists BEFORE git op (SG.R19.4 + SG.R22.2)

## OK to proceed

✓ All caps honored. ✓ Risk reasonable (LOW + MEDIUM). ✓ ACs testable. ✓ i18n plan complete (2 keys). Branch + worktree pre-declared. SG.R22.2 applied at Phase -0. v5.3.7 skill durable.