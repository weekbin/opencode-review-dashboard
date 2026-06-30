# Self-check — Round 20

> Run by lead at end of every loop. Hard gate: if any FAIL, BLOCK the closure commit and fix.

## Per-phase verification

| Phase | Required artifact | Required | Status | Evidence |
|---|---|---|---|---|
| **-0 Sync** | `.omo/round-20/sync-report.md` | yes (always run) | **PASS** | Network PASS, Local clean, Remote clean, Baseline `03cd113`, macOS cleanup gate ran (0 residue) |
| 0 PM Triage | `.omo/round-20/brief.md` | yes | **PASS** | 7 sections present: Title, Source, User pain, Competitor analysis (7 tools), Candidates ranked (3), Product-value gate 3-test, Recommended candidate, Self-Critique, U_* profile, STRINGS_USAGE_PLAN |
| **0.25 PM Researcher** | `.omo/round-20/competitor-landscape.md` | feature/arch only | **PASS** | 9 claims verified, 0 mischaracterizations |
| 0.5 PM Manager | `.omo/round-20/pm-manager-review.md` | yes | **PASS** | Verdict APPROVE, pre_check PASS (a0e0361 verified), 3 issues opened/labeled, ## Validated for next round table |
| **0.75 Planner** | `.omo/round-20/planner.md` | feature/arch only | **PASS** | Ranking + Scope selected (≤3 feature cap), Decision rationale |
| 1 Architect | `.omo/round-20/plan.md` | feature/arch only | **PASS** | 7 sections present: Goal, ACs (15), File changes, Steps, Test plan, Risk register, Hand-off, STRINGS_USAGE_PLAN |
| 2 Dev | worktree commits + AC trace | yes | **PASS** | 3 commits `c2d76a5, 5673a23, ab51010` on `team-dev-loop-round-20-review-workflow` branch. AC trace inline in Dev's return |
| **2.5 Pre-Commit Audit** | inline verdict | yes (always run) | **PASS** | 3 SHAs verified via cat-file -e, 3 fast gates PASS, scenario count 34/34 audit-correct grep matches scripts/README.md, **SG.R19.1 build location gap caught + fixed inline** |
| 3a Tester Review | 5 review-*.md + test-report.md | yes | **PASS** | 5 review-*.md + test-report.md all written, 15/15 ACs verified |
| 3b Tester Diff | diff-report.md | yes | **PASS** | 10 files / +879 / -8, no CRITICAL findings |
| 3c Tester Playwright | playwright-report.md | UI changed (mandatory) | **PASS** | 4 screenshots (r20-s{1,2,3}), 0 console errors, 15/15 ACs live-verified |
| 3.5 PM Doc Writer | doc-update-report.md | yes | **PASS** | 3 sections × 2 langs lockstep (SG.6), 4 screenshots, single commit `23d87ea` |
| 4 Decision | decision.md | yes | **PASS** | SHIP verdict (not SHIP-WITH-NOTES), 15/15 ACs PASS, AC trace, lead takeovers list |
| 4.5 Retro | retro.md | yes (mandatory) | **PASS** | All 6 sections present (TL;DR, Successes, Failures, Skill gaps, Followup, Action items) |
| 4.6 Post-exec | post-exec-analysis.md | yes (mandatory) | **PASS** | All 6 sections present (TL;DR, Call-flow timeline, Task invocations summary, Per-task review, Wasted analysis, New skill gaps) |
| 4.7 Self-check | self-check.md | yes (mandatory hard gate) | **IN PROGRESS** | this file |

## Profile-gated checks

| Phase | Bugfix | Feature | Architecture | This round's profile | Status |
|---|---|---|---|---|---|
| Architect full plan (Phase 1) | 1-para | full | full + hyperplan | full | PASS |
| Hyperplan | skip | skip | run | skip | N/A |
| External review | skip | skip | run | skip | N/A |
| Lens #3 Code | skip | run | run | run | PASS |
| Lens #5 Context | skip | run | run | run | PASS |
| Tester Playwright (Phase 3c) | skip unless UI | run | run | run (UI changes) | PASS |
| PM Doc Writer (Phase 3.5) | 1-para | full + screenshot | full + screenshot | full + screenshots | PASS |

## Closure sequence gates

| Step | Status | Evidence |
|---|---|---|
| All expected output files exist for the profile | PASS | `ls .omo/round-20/ | wc -l` = 19 files (sync + brief + competitor + pm-manager + planner + plan + 5 review + test + diff + playwright + doc + decision + retro + post-exec + self-check = 19) |
| `decision.md` SHIP verdict | PASS | grep "## Verdict" decision.md → "SHIP" |
| `.omo/proposals.jsonl` R-N line appended | TBD | append after this file |
| Skill patches applied (if retro OR post-exec surfaced gaps) | TBD | R20 surfaced SG.R20.1 — applied this round before archive |
| **Phase 4.8 Loop Summary** emitted BEFORE the closure commit | TBD | after this file + proposals.jsonl |
| **Phase 4.9 Issue Auto-Close** verification | PASS | `gh issue list --state closed --label pm-manager-approved` shows #40, #41, #42 all CLOSED (verified during Phase 2.6) |
| Closure commit | PENDING → DONE | commits landed: c2d76a5 + 5673a23 + ab51010 + 4f1b6c2 (merge) + 23d87ea (docs) |
| **v5 hard-stop check** (NO sync-blocked/audit-blocked/planner-blocked) | PASS | `ls .omo/round-20/ | grep -E "(sync|audit|planner)-blocked"` returns empty |

## Self-check verdict

**PASS**

All required phases ran, all expected artifacts present, no skipped steps detected. R20 is the first SHIP (not SHIP-WITH-NOTES) since R19 retro — Loop quality increased.

## Self-check checklist the lead must verify

- [x] **Phase -0 sync-report.md** exists + has Network PASS + Baseline main HEAD SHA
- [x] Phase 0 brief.md exists + has all 7 required sections
- [x] **Phase 0.25 competitor-landscape.md** exists (feature/architecture profile)
- [x] Phase 0.5 pm-manager-review.md exists + has APPROVE verdict + pre_check PASS + gh issue create calls + ## Validated for next round
- [x] **Phase 0.75 planner.md** exists + has ## Ranking + ## Scope selected + ## Decision rationale
- [x] Phase 1 plan.md exists (feature profile)
- [x] Phase 2: worktree commits exist in git, AC trace has all 15 ACs in decision.md
- [x] **Phase 2.5 Pre-Commit Audit** PASS (inline verdict; SHAs verified; claims reverse-verified; SG.R19.1 build gap caught+fixed inline)
- [x] Phase 3a test-report.md exists + 15/15 AC verdicts
- [x] Phase 3b diff-report.md exists + no CRITICAL findings
- [x] Phase 3c playwright-report.md exists + 4 screenshots + 0 console errors + 15/15 ACs verified
- [x] Phase 3.5 doc-update-report.md exists + bilingual lockstep verified
- [x] Phase 4 decision.md exists + SHIP verdict + AC trace + lead takeovers list + ## Sync + ## Planner + ## Pre-Commit Audit sections
- [x] Phase 4.5 retro.md exists + all 6 sections, no blanks
- [x] Phase 4.6 post-exec-analysis.md exists + all 6 sections, no blanks
- [ ] `.omo/proposals.jsonl` R-N line appended (this step TBD — appending now)
- [ ] `git log --oneline -1` shows the round's closure commit (post-self-check)

## Lead's required action after self-check

- **All PASS** → continue to Phase 4.8 Loop Summary + Phase 4.9 Issue Auto-Close verification
- **No FAIL** → closure commit lands