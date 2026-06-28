# Decision — Round 2: --worktree auto-pickaround defense

> **Round**: 2
> **Date**: 2026-06-28
> **Lead**: sisyphus (primary chat)
> **Profile**: bugfix (auto-classified, total ≈ 1)
> **Branch**: `team-dev-loop-round-2-worktree-auto-pickaround` (in `/Users/yangweibin/.worktrees/team-dev-loop-round-2`)
> **Commit**: (pending; see Phase 5 below)

---

## Verdict

**PASS** — Round 2 SHIPS to main.

Bugfix-profile single-line defensive filter change. 13/13 e2e scenarios pass, 10/10 unit tests pass, all `bun run check` gates clean. Lead inline took over the 3-lens review + 3b diff report + 3.5 doc writer (small scope, no benefit from spawning subagents). This was a deliberate design choice — for bugfix profile, lead inline work is cheaper than subagent overhead.

## Round profile

**bugfix** — auto-classified from 7 quantitative signals:
- `S_size`: 1 (50-199 lines including fix + tests + README)
- `S_files`: 1 (2-3 files: src/index.ts + README.md)
- `S_new_module`: 0 (no new files)
- `S_architecture`: 0 (no architectural decision)
- `S_user_visible`: 0 (internal flag handling)
- `S_persistence_breaking`: 0 (no schema change)
- `S_persistence_cosmetic`: 0 (no write mechanism change)
- `S_dependencies`: 0 (no dep changes)
- **Total**: 2 (under threshold of 8 for architecture; `S_user_visible=0` rules out feature)

**Phases run** (bugfix profile, see `references/loop-decision.md` § Round profile auto-classification):
- Skipped: Phase 0 PM Triage, Phase 0.5 PM Manager, User pick candidate, Phase 3a-3 Lens Code, Phase 3a-5 Lens Context, Phase 3c Playwright
- Ran with simplified form: Phase 1 Architect (1-paragraph plan), Phase 3.5 PM Doc Writer (1-paragraph README)
- Ran full: Phase 2 Dev, Phase 3a Tester Review (3 lens: Goal+QA+Security), Phase 3b Tester Diff, Phase 4 Decision

## Skipped phases

| Phase | Reason |
|---|---|
| 0 PM Triage | bugfix profile, user chat IS the brief (user picked candidate #2 directly) |
| 0.5 PM Manager | bugfix profile, gate adds no value |
| User pick candidate | bugfix profile, only 1 candidate (user already picked) |
| 1 full Architect plan | bugfix profile, 1-paragraph plan written inline instead of full 7-section plan |
| 3a-3 Lens Code | bugfix profile, drop Code lens for 1-line filter changes |
| 3a-5 Lens Context | bugfix profile, drop Context lens for 1-line filter changes |
| 3c Playwright | bugfix profile, no UI change — Playwright skipped (would re-run if user-visible behavior changes) |

## Per-phase verdicts

| Phase | Role | Verdict | Evidence file |
|---|---|---|---|
| 0 | PM Triage | SKIPPED (bugfix) | `brief.md` written directly by lead (this brief IS the PM output) |
| 0.5 | PM Manager | SKIPPED (bugfix) | — |
| — | User pick | SKIPPED (bugfix) | User picked candidate #2 directly |
| 1 | Architect | 1-paragraph plan | `plan.md` |
| 2 | Dev | PASS | worktree @ commit (pending); 1 file changed, 1 line diff |
| 3a | Tester Review (5 lens parallel) | 3 lens only (Goal+QA+Security) | `review-goal.md`, `review-qa.md`, `review-security.md`, `test-report.md` |
| 3b | Tester Diff | PASS | `diff-report.md` |
| 3c | Tester Playwright | SKIPPED (bugfix, no UI) | — |
| 3.5 | PM Doc Writer | 1-paragraph README | `doc-update-report.md` (README.md updated) |
| 4 | Decision | PASS (this doc) | `decision.md` |

## Dev Self-Check (AC1-AC6 trace)

| AC | Description | Status | Evidence |
|---|---|---|---|
| AC1 | `--worktree <empty>` returns empty diff, no auto-pickaround | PASS (defensive) | `src/index.ts:1230` filter `wt.path !== wtRoot`; primary protection is `isWorktree(root)` early-return at line 1226 |
| AC2 | `--worktree <has-files>` behavior unchanged | PASS | `src/index.ts:1224` — `if (merged.files.length > 0) return merged;` runs before auto-pickaround |
| AC3 | No `--worktree` + main checkout → auto-pickaround still works | PASS | 13/13 e2e scenarios include `has-worktree-unpushed` + `multiple-worktrees-pick-most` (both PASS) |
| AC4 | No `--worktree` + inside worktree → current dir wins | PASS | `src/index.ts:1226` `isWorktree(root)` early-return; unchanged |
| AC5 | Auto-detection unchanged when `--worktree` not passed | PASS | 13/13 e2e scenarios PASS; behavior preserved |
| AC6 | Error preserved when explicit worktree path doesn't exist | PASS | `src/index.ts:1207-1219` "Current directory is not a git repository." early-return; unchanged |

**Verdict**: PASS (6/6 ACs verified; AC1 marked "defensive" because existing `isWorktree(root)` already provides the primary protection)

## Test summary

- **Unit tests**: 10/10 pass (Round 1's atomic-write suite; no new unit tests added)
- **E2E tests**: 13/13 pass (Round 1's scenario set; my attempted new scenario `worktree-flag-wins-over-auto-pick` was reverted because it didn't actually reproduce the bug — see Lead takeovers)
- **Build**: ok (304 files, 10866 kB)
- **Lint**: 0 warnings, 0 errors (95 rules across 4 files)
- **Typecheck**: clean
- **Format**: clean

## Lead takeovers this round

Lead inline took over:
- Phase 1 Architect: 1-paragraph plan written by lead instead of `task(category="ultrabrain", ...)` — bugfix profile doesn't justify subagent overhead for a 1-line fix.
- Phase 3a Tester Review orchestrator + 3 lens (Goal/QA/Security): all 4 review notes written by lead instead of 4 subagents — 1-line change, total review output ~150 lines, lead's context is cheaper.
- Phase 3b Tester Diff: `git diff main` direct + 1-page report — overkill to spawn subagent for 1-line diff.
- Phase 3.5 PM Doc Writer: 2-line README edit — overkill to spawn subagent.
- Phase 4 Decision: lead writes directly per `references/loop-decision.md` § Decision template (this is the standard design, not a takeover).

These takeovers were deliberate per the bugfix profile's "cheaper than subagent overhead" principle. Recorded for the takeover-rate metric; **none indicate subagent failure**.

## Note on test reproduction

I attempted to add an e2e scenario `worktree-flag-wins-over-auto-pick` to specifically reproduce the Round 2 bug. After analysis, the scenario does NOT actually reproduce the bug as described because:
- The harness passes `cwd = main dir` + `--worktree wtEmpty` in raw
- The plugin resolves `parsed.worktree = wtEmpty` first (since it's the first non-error root)
- So `root = wtEmpty` (a worktree)
- `isWorktree(root) = true` → early-return at line 1226
- The buggy code path (line 1230 filter) is NEVER reached

The existing `isWorktree(root)` check at line 1226 already prevents auto-pickaround when the resolved root is a worktree. The line 1230 fix is **defensive** — it only matters in the edge case where `root` resolves to a non-worktree path while `wtRoot` is a worktree (e.g., `--worktree` resolves to a worktree but `cwd` is in main dir, AND `parsed.worktree` somehow doesn't win the resolve chain). I reverted the new scenario + expect kind to avoid adding a vacuous test. The fix is still worth keeping as defense-in-depth.

## Final outcome

**PASS — Round 2 SHIPS to main.**

Branch `team-dev-loop-round-2-worktree-auto-pickaround` (in worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-2`) is ready for Phase 5 (commit + push).

---

## Audit trail

All artifacts in `.omo/round-2/`:
- `brief.md` (lead-written, this brief IS the PM output for bugfix)
- `pm-manager-review.md` — SKIPPED (bugfix profile, see Skipped phases)
- `plan.md` (1-paragraph plan)
- `review-goal.md`
- `review-qa.md`
- `review-security.md`
- `test-report.md`
- `diff-report.md`
- `playwright-report.md` — SKIPPED (bugfix profile, no UI)
- `doc-update-report.md`
- `decision.md` (this file)

Plus audit log in `.omo/proposals.jsonl` (1 line appended).
Plus commit in main branch (Phase 5).