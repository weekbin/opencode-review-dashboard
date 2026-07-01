# R21 Review — Context Mining

> **Generated**: 2026-06-30
> **Lens**: L5 — Context mining (decisions, alternatives, deferred items)
> **Round**: 21 · **Merge SHA**: `7a4c045`

## Decision rationale trace

### Decision 1: Polish first, then feature
- **Why**: #43 (debounce) is a tiny atomic polish (~50 LOC). #44 (settings) is a larger feature (~250 LOC). Polish first = fast win + unblocks #44 by ensuring search history is stable.
- **Source**: planner.md § Order rationale
- **Alternative considered**: Feature first, polish second. Rejected because: (a) R20 retro promoted polish to R21 follow-up, so polish is user-promised; (b) faster ROA on smaller atomic commit.

### Decision 2: 300ms debounce duration
- **Why**: GitHub + VS Code + Phabricator all use 200-350ms. 300ms is in the sweet spot — fast enough to feel responsive, slow enough to skip intermediate keystrokes.
- **Source**: brief.md (competitor analysis §)
- **Alternative considered**: 200ms (faster but catches more keystrokes), 500ms (slower but feels sluggish). Rejected as outliers.

### Decision 3: Settings modal vs drawer vs page
- **Why**: Modal with overlay matches R19 modal-a11y pattern. Reuses `installModalA11y` helper. Drawer would require new a11y code. Page would require navigation state.
- **Source**: brief.md (decision tree §)
- **Alternative considered**: drawer (more code, no R19 reuse); page (breaks flow, requires back-button UX). Rejected.

### Decision 4: Toolbar controls STAY (not removed)
- **Why**: Power users want quick shortcuts. Settings modal is canonical view. Both call same handlers (no logic duplication).
- **Source**: plan.md §5
- **Alternative considered**: Remove toolbar controls in favor of settings only. Rejected: regressions on muscle memory for existing users.

### Decision 5: 15 STRINGS keys (vs less or more)
- **Why**: All 15 keys are user-facing labels in the settings modal. Cannot reuse existing keys because each setting has unique context (Appearance vs Layout vs Search vs Language).
- **Source**: plan.md §6 STRINGS_USAGE_PLAN
- **Alternative considered**: 9 keys (reuse some). Rejected because modal has 4 sections × 2-3 labels each, all context-specific.

### Decision 6: GH auto-close pattern
- **Why**: Lead-direct merge (not PR). #44 auto-closed by GitHub via commit message reference; #43 did not auto-close because commit message says "feat(search-history): #43" — issue numbers in commit messages DO auto-close, but timing of GitHub webhook matters.
- **Workaround**: manual close of #43 with reference comment. ✓
- **Source**: SG.R20.1 + GH auto-close behavior
- **Alternative considered**: Open PR instead of direct merge. Rejected: requires PR review + slows loop.

## Deferred items (R21+ backlog)

1. **Reset-restore search-history** — single-button reset for search history (separate from global Reset). Deferred because scope creep.
2. **Bulk delete recent-searches** — multi-select delete. Deferred because R22+ feature.
3. **Settings profile export/import** — JSON download/upload. Deferred because use case unclear.
4. **Per-section "Restore defaults"** — only global Reset button in R21. Deferred per-section restore.
5. **Settings search** — Cmd+F to find a setting. Deferred (settings is small enough that search is unnecessary).
6. **Settings tabs / accordion** — currently 4 sections in flat layout. Deferred (R21 size constraint).

## Stale backlog status

- **#12 Bulk actions** (aged_rounds=6, STALE) → CLOSED in R21 decision.md § Stale backlog
- **#13 Live file-watcher** (aged_rounds=6, STALE) → CLOSED in R21 decision.md § Stale backlog
- Total stale: 0 (after R21 closure)

## Open issues after R21

- (none related to R21 scope; all PM-approved candidates closed)
- Round-21 label used on #43 + #44 (now both closed)

## Verdict

**PASS** — all decisions documented with rationale. Deferred items scoped out of R21 with explicit reasoning. Stale backlog cleared.