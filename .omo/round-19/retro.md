# R19 Retrospective

> **Round**: 19
> **Date**: 2026-06-30
> **Status**: SHIP-WITH-NOTES (13/14 ACs PASS, 1 PARTIAL)

## TL;DR

R19 shipped 3 R17-retro-deferred features (language toggle, toast, a11y) via 3 atomic commits. 13/14 ACs PASS + 1 PARTIAL (AC1.2 — language toggle label translation incomplete). Playwright walkthrough clean (0 console errors). 4 screenshots captured. Big lesson: Phase 2.5 audit process gap (build in worktree vs main) caused stale dist during Phase 3c walkthrough.

## Successes

- **Lead-direct v5.3.3 model worked end-to-end** (R1-R13 retro fixes validated). 16/17 phases lead-direct, only Phase 2 Dev used subagent. Time saved: ~25 min vs full subagent sequence (per SG.3 R14 evidence).
- **R18 macOS Chrome cleanup fix validated** — `1.6 macOS Chrome cleanup gate` in sync-spec.md ran correctly on R19's Phase -0 (0 residue, gate passed, no orphan Chrome).
- **Phase 2.5 audit caught pre-existing README drift** (33 → 34 scenarios, R17-era) — fixed in commit 4dfb08e before merge. R12 retro SG.1 drift defense worked.
- **3 GH issues auto-closed** via commit msg syntax (close #33 #37 #38). v5.3.3 SG.4 mechanism validated.
- **Dev subagent 17m wall-clock** (5-20 budget: 3 commits × ~5min + overhead). All 3 atomic commits landed on first try.
- **0 console errors** during Playwright walkthrough (R8 retro Gap K — TDZ bug pattern did NOT repeat).
- **R16 SG.14 add-only rule honored** — new helper files (i18n.ts, toast.ts, modal-a11y.ts) instead of modifying existing utilities. 1 minor test static-grep update required (R17-features.test.ts).
- **R+ v5.3.3 lead-direct Doc Writer (Phase 3.5)** committed README + zh-CN + 4 screenshots in single atomic commit per SG.19.

## Failures / lessons

### F.1 — Phase 2.5 audit built in WORKTREE not MAIN

**Symptom**: Phase 3c Playwright walkthrough found dist/ui/app.js still on Jun 25 timestamp (old build). All 3 R19 features missing from the bundle. Had to rebuild in main mid-walkthrough.

**Root cause**: Phase 2.5 audit (`bun run build` for fast gate 3) ran in worktree `/Users/yangweibin/.worktrees/team-dev-loop-round-19`. But mock-server (Phase 3c dependency) serves from MAIN worktree's `/Users/yangweibin/Projects/opencode-review-dashboard/dist`. After merge, main's dist was stale.

**Fix done now**: Rebuilt in main post-merge.

**Process patch for R20**: Phase 2.5 audit must rebuild in MAIN worktree post-merge. Add to SKILL.md `references/pre-commit-audit-spec.md`.

### F.2 — R18 cleanup pattern uses Linux-only `setsid`

**Symptom**: `nohup setsid python3 ...` failed on macOS with `setsid: No such file or directory`.

**Root cause**: R18 cleanup pattern referenced `setsid` (Linux utility) without macOS fallback.

**Fix done now**: Removed `setsid` from mock-server start command (worked on both macOS + Linux).

**Process patch for R20**: Document macOS-compatible variant of mock-server start in SKILL.md. Add to `references/environment-setup.md` § mock-server.

### F.3 — AC1.2 PARTIAL: i18n integration incomplete

**Symptom**: Language toggle infrastructure works (button visible, toggle persists, data-lang updates) but only 2 of 30+ UI strings wrapped in `t()` calls. Toolbar buttons (Unified/Split/Light/Auto/Review/Submit Review) and sidebar tabs (Files changed/Commits/Conversation) remain English regardless of toggle state.

**Root cause**: Dev subagent shipped i18n infrastructure (182 LOC, 30+ STRINGS keys defined) but only integrated it with the language toggle button itself (`toolbar.lang.toggle` + `ariaLabel`). Did NOT wrap the remaining hardcoded strings. Plan §3 said "replace 30-50 hardcoded strings with t('key') calls" — Dev shipped ~7% of that scope.

**Why unit tests passed**: Dev's 15/15 i18n.test.ts assertions test the `translate()` helper in isolation. None tested the integration end-to-end (toggle → label change). Classic R12 retro Gap #14 anti-pattern: unit-test-only verification.

**Fix deferred**: SHIP-WITH-NOTES per R5 retro pattern. R20 follow-up to complete AC1.2 integration.

**Process patch for R20**: Architect `plan.md` hand-off items should include `STRINGS_USAGE_PLAN: list of all hardcoded strings that must be wrapped in t() calls` so subagent has explicit checklist, not "30-50 strings" estimate.

### F.4 — Dev subagent committed to MAIN once, recovered

**Symptom**: Dev's initial Commit 1 was made in MAIN worktree (workdir mis-pinned) instead of the worktree. Required `git reset --hard HEAD~1` on main + redo.

**Root cause**: Bash commands ran with `workdir=/Users/yangweibin/...` (main) instead of the worktree path.

**Fix done now**: Dev recovered by switching workdir explicitly to worktree path for all subsequent commands.

**Process patch for R20**: Lead should ALWAYS `cd` to worktree path explicitly in Dev subagent prompt + verify workdir at task start. Add to `references/phase-prompts.md` Dev prompt.

## Skill gaps found

### SG.R19.1 — Phase 2.5 audit build location

- **Symptom**: F.1
- **Existing-skill-text**: `references/pre-commit-audit-spec.md` (referenced via SKILL.md) — does NOT specify build location (worktree vs main)
- **Proposed patch**: Add explicit step: "After merge, rebuild in MAIN worktree before Phase 3c Playwright walkthrough. dist/ in worktree is stale after merge."

### SG.R19.2 — macOS-compatible mock-server start

- **Symptom**: F.2
- **Existing-skill-text**: `references/phase-prompts.md` L906-916 (R18-fixed pre-test cleanup) — uses `nohup setsid python3 ...` (Linux-only)
- **Proposed patch**: Replace `nohup setsid` with `nohup ... & disown` (works on both macOS + Linux). Document in `references/environment-setup.md` § mock-server.

### SG.R19.3 — STRINGS_USAGE_PLAN in plan.md

- **Symptom**: F.3
- **Existing-skill-text**: SKILL.md § Phase 1 Architect plan template — does NOT include "list of all strings to translate" for i18n features
- **Proposed patch**: For i18n features, Architect must include explicit `STRINGS_USAGE_PLAN` section in plan.md with file:line evidence for each hardcoded string + target t() key. Dev subagent then has a checklist, not "30-50 strings" estimate.

### SG.R19.4 — Dev subagent workdir verification

- **Symptom**: F.4
- **Existing-skill-text**: `references/phase-prompts.md` Phase 2 Dev prompt — does NOT include workdir verification
- **Proposed patch**: Dev prompt should start with `cd $WORKTREE_DIR && pwd && git status --short` to verify in worktree before any commits.

## Followup items

1. **R20: AC1.2 PARTIAL completion** — wire t() calls to 28+ remaining UI strings. Add `onLanguageChange` subscribers. Add integration test. (HIGH PRIORITY)
2. **R20: Apply SG.R19.1-SG.R19.4 skill patches** — 4 retro-discovered process gaps.
3. **R20: Add per-trigger toast screenshots** — R19 toast section is text-only; R20 should add `r20-toast-{action}.png` for visual evidence (per SG.11).
4. **R21+: Close #12 + #13 as not-planned** — Both at aged_rounds=6 (R12 retro violation threshold). Either close or add to "explicitly skipped" backlog.
5. **R21+: Re-run R19 language toggle after R20 integration** — verify AC1.2 actually works (Playwright walkthrough + visual diff of toolbar before/after toggle).

## Action items for next round (ordered)

1. **[R20 BACKLOG] Complete AC1.2 language toggle integration** (highest priority — R19 partial)
2. **[R20 SKILL] Apply SG.R19.1 (build location) + SG.R19.2 (setsid) + SG.R19.3 (STRINGS_USAGE_PLAN) + SG.R19.4 (workdir verify)** to SKILL.md
3. **[R20 DOCS] Update README + zh-CN for R20 features**
4. **[R20 FOLLOWUP] Add per-trigger toast screenshots if R20 ships toast-related changes**
5. **[R21+ CLEANUP] Close stale issues #12 + #13 (aged_rounds=6)**
6. **[R21+ VERIFY] Re-run R19 language toggle walkthrough + visual diff**