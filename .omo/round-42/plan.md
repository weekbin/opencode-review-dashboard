# Phase 1 Plan — Round 42

**Date**: 2026-07-01
**Lead**: sisyphus (lead-direct, 1-para plan per bugfix profile)

## Plan (1 paragraph)

R42 validates the v5.4 close-out mechanism end-to-end. Scope: (1) verify SKILL.md v5.4 patch is correctly applied (`58e316d`); (2) optionally make one tiny doc/skill update to give R42 something concrete (e.g., append a v5.4 changelog entry to a skill doc); (3) run Phase 4.5 retro-find + close-out — any loop-internal items the retro surfaces MUST be committed in current worktree (no deferral); (4) run Phase 4.6 post-exec + close-out for call-flow gaps; (5) Phase 4.7 self-check verifies `Open loop-internal at retro time` is EMPTY in both retro.md and post-exec-analysis.md (otherwise BLOCKED). No product src/ changes. No GH issues opened. No new features. R42 ships if and only if v5.4 close-out proves it works.

## Acceptance Criteria

**AC1**: SKILL.md v5.4 patch is in working tree (verified via `grep -c "v5.4" SKILL.md` ≥ 1).

**AC2**: Phase 4.5 retro.md contains a `## Open loop-internal at retro time` section. For SHIP verdict, this section MUST contain only: "None — all loop-internal items closed in this round (per v5.4 no-deferral rule)." Any other content = BLOCKED.

**AC3**: Phase 4.5 retro.md contains a `## Closed in this round (loop-internal)` section listing each loop-internal item closed + commit SHA. (If empty: "None — clean execution, no loop-internal items surfaced.")

**AC4**: Phase 4.6 post-exec-analysis.md contains the same two sections with same SHIP/BLOCKED contract.

**AC5**: Phase 4.7 self-check.md explicitly verifies AC2 and AC4 are EMPTY → PASS.

**AC6**: Phase 4 decision.md verdict is either SHIP (all ACs met) or BLOCKED (with reason citing which loop-internal item is unclosed). If BLOCKED, the loop-internal item must be closed IN THIS ROUND (per v5.4) before re-attempting SHIP.

## File changes (planned)

- `.omo/round-42/sync-report.md` (Phase -0, done)
- `.omo/round-42/brief.md` (Phase 0, done)
- `.omo/round-42/plan.md` (this file, Phase 1)
- `.omo/round-42/decision.md` (Phase 4)
- `.omo/round-42/retro.md` (Phase 4.5 — THE v5.4 test point)
- `.omo/round-42/post-exec-analysis.md` (Phase 4.6)
- `.omo/round-42/self-check.md` (Phase 4.7)
- Optional: small SKILL.md / team-dev-loop README changelog update if retro surfaces a real loop-internal gap
- `.omo/proposals.jsonl` R42 line (Phase 4.9 / append audit log)

## Risks

- **Risk 1**: v5.4 close-out doesn't actually close items. If so, decision.md = BLOCKED with reason. Then per v5.4, lead-direct fixes the gap in current worktree (e.g., amend SKILL.md) and re-attempts SHIP. This is the v5.4 mechanism being tested.
- **Risk 2**: No loop-internal items surface in retro (round was "clean"). This would mean v5.4 is over-engineered for this round, but doesn't invalidate the contract. Decision: SHIP, with note that round was clean and v5.4 had nothing to test.

## Test profile

| Phase | Status | Why |
|---|---|---|
| -0 Sync | ✓ DONE | baseline `58e316d`, clean |
| 0 PM Triage | ✓ DONE (lead-direct) | user override, backlog empty |
| 0.25 PM Researcher | SKIP | bugfix profile |
| 0.5 PM Manager | SKIP | bugfix profile |
| 0.75 Planner | SKIP | bugfix profile |
| 1 Architect | ✓ DONE (this file) | bugfix 1-para plan |
| 2 Dev | TODO (lead-direct, optional small doc update) | bugfix profile |
| 2.5 Pre-Commit Audit | TODO | inline |
| 3a Tester | TODO (lead-synthesized or skip per bugfix-light) | bugfix-lenient |
| 3b Diff | TODO | inline |
| 3c Playwright | SKIP | no UI changes |
| 3.5 Doc Writer | TODO (lead-direct, if needed) | |
| 4 Decision | TODO | |
| 4.5 Retro + Close-out | TODO (THE TEST) | mandatory |
| 4.6 Post-exec + Close-out | TODO | mandatory |
| 4.7 Self-check | TODO | mandatory |
| 4.8 Loop Summary | TODO | chat output |
| 4.9 Issue Auto-Close | TODO (N/A, no PM-Manager-opened issues) | |
| Closure commit | TODO | |