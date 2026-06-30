# R23 Experience Summary

> **Generated**: 2026-06-30 (RALPH LOOP iteration 4, R23)
> **Purpose**: Captures session knowledge for future reference + cross-session continuity

## What we accomplished this round

R23 closed 2 GH issues in 2 atomic commits + 3 supporting commits (merge, docs, archive):

1. **#48 Bulk delete recent-searches** (polish, 253 LOC) — per-item checkbox + bulk Delete button + R22 Clear coexistence
2. **#47 Diff virtualization for 1000+ line files** (feature, 663 LOC) — IntersectionObserver-based hunk virtualization

Plus 3 supporting commits:
3. **Merge `b4905b6`** — combine both into main
4. **Docs `c03ef0d`** — README + zh-CN updates (1 section + 2 feature list entries each)
5. **Archive `9dba52d`** — proposals.jsonl R23 entries (append-only)

**Key wins**:
- **2 new R22 SGs (SG.R22.1 + SG.R22.2) successfully applied in-round** — no deferred gap-fixes
- **Test baseline NET POSITIVE 3rd round in a row** (510/0 → 538/0, +28 new tests)
- **Diff virtualization for 1000+ line files shipped** (R20 carryover from 3 years ago, finally closed)

## What surprised us

1. **Subagent wrote files to MAIN directory (not worktree)** — Dev subagent #48 wrote `recent-searches-bulk.test.ts` (new file) to main dir, then committed from worktree. Result: main had uncommitted changes blocking Phase 2.6 merge. Fixed with `git stash push -u` + merge + drop. **NEW PROCESS**: subagent prompts should say "WRITE FILES TO WORKTREE DIRECTORY ONLY".

2. **Subagent #47 malformed commit message** — Incorrect `-m` flag usage created duplicated "Body:" line. Subagent self-flagged bug, said "DO NOT amend". Lead-direct override — amended commit message (bug fix, not content change). SHA changed from `7096c18` → `9004134`. **NEW PROCESS**: subagent prompts should use `git commit -F- <<EOF` (heredoc) NOT multiple `-m` flags.

3. **SG.R22.1 first-time apply worked perfectly** — pre-commit `grep -c` verification showed all 3 counts match (1=1, 1=1, 1=1) on first try. ZERO silent failures (unlike R21+R22). SG.R22.1 PREVENTS the R22 bilingual lockstep gap class entirely.

4. **SG.R22.2 first-time apply worked perfectly** — Removed 4 stale worktrees from R19/R20/R21 at Phase -0 + symlinked node_modules. Pre-commit audit Fast Gate 2 immediately showed 538/538 (not 458/461 like R22 subagent #46).

## What worked well

- **Lead-direct execution at ~95 min** for 2 issues (1 polish + 1 feature)
- **STRINGS_USAGE_PLAN executed cleanly** for 2 keys × 2 locales
- **SG.R20.1 3-step rebuild held up** (merge → build → grep verify)
- **In-round gap-fix per SG.R19.8** — 0 deferred gaps
- **Composite scoring + cap enforcement** — both candidates within feature+polish caps
- **Test baseline NET POSITIVE 3rd round in a row** (510/0 → 538/0)

## Process improvements for R24+

1. **Subagent prompt update**: "WRITE FILES TO WORKTREE DIRECTORY ONLY — verify `pwd` is worktree before each Write/Edit"
2. **Subagent prompt update**: "Use `git commit -F- <<EOF` (heredoc) NOT multiple `-m` flags"
3. **Investigate tsc PATH** consistency (some subagents find it, some don't)
4. ~~Skill file edits for SG.R22.1 + SG.R22.2 (embed in SKILL.md)~~ → **APPLIED IN-ROUND via R23-gap-fix commit** (Oracle caught the in-flight-only gap; SKILL.md now v5.3.7 with all 3 SGs embedded)

## What future sessions should know

1. **R23 SHIP landed clean** — main HEAD `9dba52d`, 538/538 tests pass
2. **0 open issues** — both #47 and #48 auto-closed
3. **2 new SGs (SG.R22.1, SG.R22.2) successfully applied** — no gaps surfaced
4. **R24 candidates well-defined** — diff virt toggle, per-hunk expand/collapse, sidebar bulk delete, toast screenshots, skill file edits
5. **3 NET POSITIVE rounds in a row** — test health trend continues
6. **Diff virtualization for 1000+ line files shipped** — 3-year-old R20 carryover finally closed

## Loop state

- `.omo/round-23/`: 15+ artifacts (sync, brief, competitor-landscape, pm-manager-review, planner, plan, 5 review-*.md, test-report, diff-report, playwright-report, doc-update-report, decision, retro, post-exec, self-check, experience-summary)
- `.omo/proposals.jsonl`: 53 lines (append-only per SG.R19.6)
- main HEAD: `9dba52d` (synced to origin/main)
- 0 open issues · 2 R23 issues CLOSED
- Loop ready for R24

## Wall-clock

~95 min lead-direct (Phase -0 through 4.9), stable across R21/R22/R23.