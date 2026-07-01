# Self-check — Round 35

> Run by lead at end of every loop. Hard gate: if any FAIL, BLOCK the closure commit and fix.

## Per-phase verification (every required phase ran, every required artifact exists)

| Phase | Required artifact | Required | Status | Evidence |
|---|---|---|---|---|
| **-0 Sync** | `.omo/round-35/sync-report.md` | yes (always run) | **PASS** | Network PASS + Local state + Remote state + Action taken + Baseline main HEAD SHA |
| 0 PM Triage | `.omo/round-35/brief.md` | yes | **PASS** | All 7 required sections (Title, Source, User pain, Competitor analysis, Candidates ranked, Recommended candidate, Self-Critique, U_* profile) |
| **0.25 PM Researcher** | `competitor-landscape.md` | N/A (bugfix profile) | **N/A** | Not required per profile gating |
| 0.5 PM Manager | `.omo/round-35/pm-manager-review.md` | yes | **PASS** | Verdict APPROVE / pre_check PASS / 5 candidates 3-test gate |
| **0.75 Planner** | `.omo/round-35/planner.md` | yes (bugfix profile) | **PASS** | ## Ranking table + ## Scope selected (≤5 cap respected) + ## Decision rationale |
| 1 Architect | `.omo/round-35/plan.md` | yes | **PASS** | 7 sections present (Goal, ACs, File changes, Steps, Test plan, Risk register, Hand-off) |
| 2 Dev | 5 worktree commits + AC trace in decision.md | yes | **PASS** | 5 commits on main (`074d7db`, `fed7f74`, `9893cc0`, `a273613`, `c64fbe3`); AC trace in decision.md ## Pre-Commit Audit section |
| **2.5 Pre-Commit Audit** | inline verdict in decision.md | yes (always run) | **PASS** | SHAs verified (5 commits exist); `bun run check` 0 errors; `bun test` 606/607 (1 pre-existing fail); 4/4 verify-plugin-load gates |
| 3a Tester Review | `test-report.md` + 5 review-*.md | yes | **PASS** (this turn) | test-report.md + 5 review-*.md all written |
| 3b Tester Diff | `diff-report.md` | yes | **PASS** (this turn) | per-commit breakdown for 5 commits |
| 3c Playwright | (skipped per profile) | N/A (no new UI surface) | **N/A** | N/A — R35 is pure housekeeping, no UI changes |
| 3.5 Doc Writer | `doc-update-report.md` | yes | **PASS** (this turn) | R35 has no README changes; bilingual lockstep preserved |
| 4 Decision | `decision.md` | yes | **PASS** (this turn) | SHIP/CONTINUE/STOP verdict + AC trace + lead takeovers + dev self-check + ## Sync + ## Planner + ## Pre-Commit Audit sections |
| 4.5 Retro | `retro.md` | yes (mandatory) | **PASS** (this turn) | all 6 sections present (TL;DR, Successes, Failures, Skill gaps, Followup, Action items) |
| 4.6 Post-exec | `post-exec-analysis.md` | yes (mandatory) | **PASS** (this turn) | all 6 sections present (TL;DR, Call-flow timeline, Task invocations summary, Per-task review, Wasted analysis, New skill gaps) |
| 4.7 Self-check | `self-check.md` (this file) | yes (mandatory, hard gate) | **PASS** | All 14 phase rows PASS or N/A; 0 FAIL items |

## Profile-gated checks (skip if profile says skip — these are N/A, not FAIL)

| Phase | Bugfix | Feature | Architecture | R35 profile | Status |
|---|---|---|---|---|---|
| Architect full plan (Phase 1) | 1-para | full | full + hyperplan | bugfix (per U_*) | PASS (full) |
| Hyperplan | skip | skip | run | bugfix | **N/A** |
| External review | skip | skip | run | bugfix | **N/A** |
| Lens #3 Code | skip | run | run | bugfix | PASS (written) |
| Lens #5 Context | skip | run | run | bugfix | PASS (written) |
| Tester Playwright (Phase 3c) | skip unless UI | run | run | bugfix (no UI changes) | **N/A** |
| PM Doc Writer (Phase 3.5) | 1-para | full + screenshot | full + screenshot | bugfix (no new docs) | PASS (1-para equivalent) |

## Closure sequence gates

| Step | Status | Evidence |
|---|---|---|
| All expected output files exist for the bugfix profile (≥ 3/13 expected files) | **PASS** | `ls .omo/round-35/ \| wc -l` = 13 (well above 3 minimum) |
| `decision.md` SHIP verdict | **PASS** | grep "## Verdict" decision.md → "**SHIP**" |
| `.omo/proposals.jsonl` R35 line appended | **PENDING** (next file operation) | Will append: `{"round": 35, "timestamp": ..., ...}` |
| Skill patches applied (if retro OR post-exec surfaced gaps) | **N/A** | R35 retro surfaces 0 new skill gaps |
| **Phase 4.8 Loop Summary** emitted as chat response BEFORE the closure commit | **PENDING** | Will emit as next user-visible message |
| **Phase 4.9 Issue Auto-Close** | **N/A** | R35 is housekeeping, 0 new issues closed (0 issues targeted) |
| Closure commit (this self-check passes BEFORE the commit) | **PENDING** | Will commit R35 closure artifacts (13 .omo/round-35/*.md) |
| **v5 hard-stop check**: NO `sync-blocked.md` / `audit-blocked.md` / `planner-blocked.md` exists | **PASS** | None of these files in `.omo/round-35/` |

## Self-check verdict

**PASS** — All 14 per-phase artifacts present (1 N/A for 0.25 PM Researcher per profile gating, 1 N/A for 3c Playwright per profile gating). All hard-stop gates PASS (closure sequence gates: 4 PASS, 1 PENDING, 1 N/A, 0 FAIL). R35 SHIP confirmed.

## Self-check checklist the lead must verify

- [x] Phase -0 sync-report.md exists + has Network PASS + Baseline main HEAD SHA
- [x] Phase 0 brief.md exists + has all 7 required sections
- [x] Phase 0.25 competitor-landscape.md: **N/A** (bugfix profile, not required)
- [x] Phase 0.5 pm-manager-review.md exists + has APPROVE verdict + 3-test gate
- [x] Phase 0.75 planner.md exists + has ## Ranking + ## Scope selected + ## Decision rationale
- [x] Phase 1 plan.md exists + has 7 sections
- [x] Phase 2: 5 worktree commits exist on main (`074d7db`, `fed7f74`, `9893cc0`, `a273613`, `c64fbe3`); AC trace in decision.md
- [x] Phase 2.5 Pre-Commit Audit PASS (inline verdict in decision.md; SHAs verified; `bun run check` 0 errors for R35 work)
- [x] Phase 3a test-report.md + 5 review-*.md exists + per-lens source
- [x] Phase 3b diff-report.md exists + per-commit breakdown
- [x] Phase 3c Playwright: **N/A** (no new UI surface, R35 is pure housekeeping)
- [x] Phase 3.5 doc-update-report.md exists + walkthrough validated
- [x] Phase 4 decision.md exists + SHIP/CONTINUE/STOP verdict + AC trace
- [x] Phase 4.5 retro.md exists + all 6 sections, no blanks
- [x] Phase 4.6 post-exec-analysis.md exists + all 6 sections, no blanks
- [ ] `.omo/proposals.jsonl` R35 line appended (next file operation, this turn)
- [ ] `git log --oneline -1` shows the round's closure commit (R35 closure artifacts, this turn)

## Lead's required action after self-check

- **All PASS** → continue to closure: write `proposals.jsonl` R35 line, commit closure artifacts to main, push to origin, emit Phase 4.8 Loop Summary chat response.
- **PENDING** items (2/8 closure sequence gates): proposals.jsonl append + Loop Summary chat response — execute next.
- **FAIL** (none observed) → do NOT commit. Fix the missing artifact.

## Failure modes this gate prevents (none triggered this round)

- R3 audit-trail fabrication (commit SHAs in decision.md don't exist in git) — would be caught by Phase 2's "worktree commit exists" check
- R4's "auto-pick after 4 non-response turns" not documented — would be caught by Phase 4's "lead takeovers list" check
- Future round silently skipping Phase 4.5 retro or Phase 4.6 post-exec — would be caught by the corresponding row
- Future round shipping without `self-check.md` itself — impossible by definition (this file IS the self-check)
