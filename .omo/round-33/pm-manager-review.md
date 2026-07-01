# Phase 0.5 PM Manager — Round 33

**Date**: 2026-07-01 (lead-direct)
**Verdict**: APPROVE (4 of 8 issues selected for this round's polish quota)

## Validated for next round (R33 PM-Direct Pick — 4 items)

| Issue | Title | Type | User-value | File count | LOC est | Why in R33 |
|---|---|---|---|---|---|---|
| **#66** | Plugin HTTP server uses port: 0 — random port per restart breaks localStorage persistence | bugfix | high (silent data loss) | 1 (`src/index.ts`) | ~15 | 1-line config + EADDRINUSE fallback; fixes 13+ localStorage keys失效 |
| **#68** | Submit dialog shows "0 open findings will be submitted" when user actually has open findings | bugfix | high (data correctness) | 1 (`src/ui/app.ts`) | ~6 | 3-line schema add `status: "open"` to 2 push sites |
| **#70** | Post-submit close-tab overlay: no backdrop, content below shows through with 0.3 opacity (visual 错位) | bugfix | medium (visual) | 1 (`src/ui/review.html`) | ~6 | 3-line CSS fix `.post-submit` + add visibility hidden to body rule |
| **#71** | Toolbar "Ignore ws" button has poor discoverability — label cryptic, title attribute hardcoded English, no aria-label | bugfix | medium (a11y/i18n) | 2 (`src/ui/i18n.ts` + `src/ui/app.ts`) | ~80 | i18n 3 keys + button className/data-i18n-title/aria + active CSS + settings panel toggle |

**Total R33 LOC**: ~107 insertions across 4 files (within ≤5 bugfix per round cap).

## Verdict rationale

PM Manager passes all 4 candidate issues through 3-test gate (README·no / user-visible·yes / no-existing-competitor-impl):

| Test | #66 | #68 | #70 | #71 |
|---|---|---|---|---|
| README 缺段说明 | ✓ #66 docs mention localStorage keys | ✓ #68 docs not affected | ✓ #70 docs not affected | ✓ #71 i18n keys added to i18n.ts |
| 用户可见的 | ✓ silent failure | ✓ visible wrong count | ✓ visible 错位 | ✓ discoverable via aria/i18n |
| 竞品已有 | ✓ cross-verify | ✓ internal schema bug | ✓ isolated overlay | ✓ i18n best practice pattern exists |

All 4 → APPROVED for R33.

## Deferred to R34 (4 items NOT in scope this round)

| Issue | Title | Why deferred |
|---|---|---|
| #65 | Settings panel 3 bugs + i18n + CSS layout | Largest of 8; needs separate round with user-gating on modal close semantics |
| #67 | Conversation panel 4 UX | 4 sub-issues touching different code paths; safer in dedicated round |
| #69 | Previously discussed tab layout | Full redesign (1-2h); needs user input on preferred design |
| #72 | Worktree branch copy button (enhancement) | New feature; needs user input on position |

**R34 will pick from these 4 + stale-worktree housekeeping** (R33 follow-up: 12 orphan worktrees to remove).

## Candidate provenance

All 8 issues (#65-#72) were filed by the user during this session at:
- #65 ~03:38 UTC (Round 1+2 user feedback)
- #66 ~03:42 UTC (Round 3)
- #67 ~03:49 UTC (Round 4)
- #68+#69 ~03:55 UTC (Round 5 — 2 issues in one round)
- #70 ~04:01 UTC (Round 6)
- #71 ~04:06 UTC (Round 7)
- #72 ~04:07 UTC (Round 8 — enhancement, not bug)

PM Triage + PM Manager folded these 8 into 1 polish round's worth of work (4 of 8 picked per R33 cap).

## Pre_check PASS

- ✓ No drift between brief.md and PM Manager verdict
- ✓ Hard caps respected (≤5 bugfix per round → 4 selected)
- ✓ Polish quota respected (≤1 polish per round → 1 polish, R33)
- ✓ All 4 candidates have valid file:line budget

## Phase 0.5 verdict

**APPROVE** — 4 candidates pass 3-test gate + cap. Phase 0.75 Planner can proceed.
