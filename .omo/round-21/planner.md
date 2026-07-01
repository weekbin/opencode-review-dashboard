# R21 Planner — Scope Selection

> **Generated**: 2026-06-30
> **Round**: 21
> **Inputs**: brief.md + competitor-landscape.md + pm-manager-review.md
> **Decision**: Both candidates SELECTED (within caps)

## Composite scoring

Each candidate scored on 4 axes (1-5 each, max 20). User-value weight ×2, Risk inverse.

| Issue | Title | User-value (×2) | Defensible gap (×1) | Risk (×2, inverse) | Testability (×1) | **Total** | Profile |
|---|---|---|---|---|---|---|---|
| #43 | Search history debounce | 5×2 = **10** | 3 | 5×2 = **10** (vanilla timer, low risk) | 4 | **27/35** | polish |
| #44 | Settings page | 3×2 = **6** | 4 (5/7 competitors) | 3×2 = **6** (new modal, i18n, moderate) | 4 | **20/35** | feature |

## Caps check

| Cap | Limit | R21 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (settings) + 1 polish counted under feature for planning | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (debounce) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## Backlog freshness gate

Stale issues: #12 Bulk actions (aged_rounds=6), #13 Live file-watcher (aged_rounds=6). Total = 2.
- Boundary: 2 is at boundary. Per R12 retro rule, fresh-investigation triggers at 3+.
- R21 candidates (#43, #44) are NOT from stale backlog — both are fresh from R20 retro follow-up + R21+ FEATURE self-investigation.
- Decision: **Do NOT fresh-investigate**. #12 + #13 will be CLOSED in decision.md ## Stale backlog section per retro convention (no separate commit, no scoping action).

## Selected scope

**R21 SHIP SCOPE**:
1. **#43 Search history debounce (polish)** — 30-50 LOC, vanilla setTimeout, no new dep. AC: typing fast (debounce kicks in), Enter keypress (immediate commit), empty query (still no-op), max 5 preserved.
2. **#44 Settings page (feature)** — 200-350 LOC, 15 new STRINGS keys, installModalA11y helper, role=dialog/aria-modal/focus-trap/Escape. AC: opens via ⚙ button, 4 sections render, all 6 localStorage keys read/write, Reset restores defaults, modal a11y works (focus trap, Escape close, return focus).

## Order rationale

**#43 FIRST, #44 SECOND**:
- #43 is a tiny atomic polish (1 file change + 1 test). Fast win, unblocks search UX before settings.
- #44 is bigger (new modal + 15 i18n keys + 4 sections). Should land on stable search history.
- R20 retro order (auto-pick #1 first, #2 second) generalizes here.

## Risk note

- #44 (settings modal) interacts with existing toolbar controls (theme, layout, ignore-ws, language, filter-unread). Must NOT duplicate; settings modal becomes the canonical edit, toolbar controls become shortcuts OR are removed (decision: KEEP both, modal is canonical edit, toolbar = quick toggles).
- #43 (debounce) modifies existing call site (app.ts:883). R20 unit test `src/ui/search-history.test.ts` should continue passing — verify in pre-commit audit.

## 0 rejected items

Both candidates within caps. Zero candidates rejected.

## Branch + worktree

- Branch: `team-dev-loop-round-21-settings-and-search-polish`
- Worktree path: `$HOME/.worktrees/team-dev-loop-round-21`
- Subagent MUST verify `pwd` is worktree BEFORE `git add/commit` (SG.R19.4)

## Pre-dev sanity check

```bash
git rev-parse --abbrev-ref HEAD  # should NOT be main
git rev-parse --show-toplevel    # should be /Users/yangweibin/.worktrees/team-dev-loop-round-21
```

If either fails, STOP. Subagent is in wrong directory.

## Files expected to touch

**#43**:
- `src/ui/app.ts` (modify addRecentSearch call site ~883)
- `src/ui/search-history.ts` (add debounce primitive)
- `src/ui/search-history.test.ts` (add debounce test)
- ~1-2 files src + 1 test

**#44**:
- `src/ui/review.html` (add ⚙ button + settings modal markup)
- `src/ui/app.ts` (wire settings open/close + 6 key handlers)
- `src/ui/i18n.ts` (add 15 STRINGS keys: en + zh-CN)
- `src/ui/app.test.ts` OR new `src/ui/settings.test.ts`
- ~2-3 files src + 2 tests

## Subagent budget

Per v5.3.6, 5-20 min per subagent. R21 has 2 subagent calls (one per atomic commit). Decompose if either takes >20 min.

## PASS criteria for Phase 3

- 15 ACs total (estimated: 6 for #43 + 9 for #44)
- All ACs PASS or explicitly noted as partial in SHIP-WITH-NOTES
- Phase 3c Playwright Gap #14 covers: settings modal opens, theme change persists across reload, search debounce does not commit intermediate keystrokes
- i18n regression-guard test (`src/ui/i18n.test.ts`) passes with all 15 new keys
- mock-server still serves at http://localhost:8890

## OK to proceed

✓ All caps honored. ✓ Risk reasonable. ✓ ACs testable. ✓ i18n plan complete. Branch + worktree pre-declared.