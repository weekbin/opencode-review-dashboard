# R22 PM Triage — Brief

> **Generated**: 2026-06-30 (RALPH LOOP iteration 3, R22)
> **Inputs**: R21 retro (`/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-21/retro.md`) + sync-report.md
> **Source**: lead-direct synthesis (v5.3.6 spec — no user pick)

## Round context

R21 SHIP landed clean (search history debounce #43 + settings page #44). All R+ retro patches held up perfectly. R21 retro surfaced 4 follow-up candidates for R22+. Sync confirms main HEAD `0c30daf` in sync with origin, 0 open issues, clean working tree, macOS cleanup gate clean.

## R22 candidates (from R21 retro + R20 retro carryover)

| # | Source | Title | Profile | LOC | Risk | User-value |
|---|---|---|---|---|---|---|
| 1 | R21 retro follow-up | **Reset-restore search-history button** in Recent Searches dropdown | feature | 50-80 | LOW | 3/5 |
| 2 | R20 retro carryover | Diff virtualization for 1000+ line files | feature | 200-400 | MEDIUM-HIGH | 4/5 |
| 3 | R21 retro follow-up | Bulk delete recent-searches (multi-select) | polish | 30-50 | LOW | 2/5 |
| 4 | R20 retro | Toast screenshots (R19/R20 toast sections still text-only) | polish (docs) | 10-20 | LOW | 2/5 |
| 5 | R19 carryover | **Fix pre-existing skipLink i18n test fail** (1-char fix: quote key in STRINGS) | polish (cleanup) | 1-2 | LOW | 1/5 |

## Backlog freshness check

Stale issues: **0** (R21 closed all pm-manager-approved issues #12, #13, #43, #44). R22 candidates are all fresh from R21/R20 retros, none from stale backlog.

## Candidate validation per PM product-value gate

### #1 Reset-restore search-history (R21 follow-up)
- **README 缺段?** No — README mentions "Recent searches" but doesn't mention reset/clear control. ✓ honest
- **Non-developer visible?** Yes — button in Recent Searches dropdown is user-facing. ✓
- **竞品已有?** Yes (GitHub: cmd+K → "Clear all", VS Code: search-history → "Clear", Chrome: history → "Clear browsing data"). ✓ defensible gap-fill
- **Scope**: New "Clear" button in Recent Searches dropdown (mirrors GitHub/VS Code pattern). 1-click empties `diff-review:recent-searches` localStorage + hides dropdown. R21 debounce work means we have stable test surface to extend.
- **STRINGS**: 2 new keys needed (`search.recent.clear` label, `search.recent.clear.confirm` toast)
- **VERDICT**: SELECT

### #5 Fix skipLink i18n test fail (R19 carryover)
- **README 缺段?** No — README doesn't mention this internal test artifact. ✓
- **Non-developer visible?** No — internal test fix. But it's the kind of fix that makes test output clean (504 → 504 pass, 0 fail). ✓ developer-experience
- **竞品已有?** N/A (test-only artifact)
- **Scope**: 1-character change in `src/ui/i18n.ts`: `skipLink: {` → `"skipLink": {` (quote the key to match test assertion). No functional change. Just makes the test that asserts "every data-i18n key exists in STRINGS table" pass.
- **VERDICT**: SELECT (cleanup + developer-experience)

### #2 Diff virtualization (deferred)
- **Why deferred**: Larger LOC, MEDIUM-HIGH risk (new rendering logic, intersection observer, virtualization library or vanilla windowing), would consume entire budget if solo. Better as standalone R23+ round.
- **Carry forward**: To R23+ backlog.

### #3 Bulk delete recent-searches (deferred)
- **Why deferred**: Polish quota already used by #5. Multi-select UI is non-trivial (checkboxes, partial state, etc.). Better as standalone R23+ polish.

### #4 Toast screenshots (deferred)
- **Why deferred**: Polish quota already used by #5. Lower user-value (docs only). Carry to R23+.

## R22 SHIP SCOPE

| # | Issue (to open) | Profile | LOC | Atomic commit |
|---|---|---|---|---|
| 1 | Reset-restore search-history button | feature | 50-80 | 1 |
| 2 | Fix skipLink i18n test fail | polish (cleanup) | 1-2 | 1 |
| **TOTAL** | | | **51-82** | **2 atomic commits** |

## Caps check

| Cap | Limit | R22 plan | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (reset-restore) + 1 polish (skipLink) | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (skipLink fix) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## STRINGS_USAGE_PLAN (mandatory for i18n scope per SG.R19.3)

| Key | en | zh-CN | Used in |
|---|---|---|---|
| `search.recent.clear` | "Clear" | "清空" | Clear button label |
| `search.recent.clear.confirm` | "Recent searches cleared" | "最近搜索已清空" | Toast confirmation |

Total: 2 keys × 2 locales = 4 STRINGS entries. Both required for AC verification.

## Out-of-scope (deferred to R23+)

- Diff virtualization (need standalone round)
- Bulk delete recent-searches (multi-select UI complexity)
- Toast screenshots (docs polish)
- Any other R+ follow-ups

## Branch + worktree pre-declaration

- Branch: `team-dev-loop-round-22-reset-and-i18n-fix`
- Worktree path: `$HOME/.worktrees/team-dev-loop-round-22`
- Subagent MUST verify `pwd` is worktree BEFORE git add/commit (SG.R19.4)

## OK to proceed

✓ All caps honored. ✓ Risk reasonable (LOW for both). ✓ ACs testable. ✓ i18n plan complete (2 keys). Branch + worktree pre-declared. Both candidates within subagent 5-20 min budget.