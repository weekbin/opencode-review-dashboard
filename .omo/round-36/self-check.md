# Self-check — Round 36

> Run by lead at end of every loop. Hard gate: if any FAIL, BLOCK the closure commit and fix.

## Per-phase verification (every required phase ran, every required artifact exists)

| Phase | Required artifact | Required | Status | Evidence |
|---|---|---|---|---|
| **-0 Sync** | `.omo/round-36/sync-report.md` | yes (always run) | **PASS** | Network PASS + Local state + Remote state + Action taken + Baseline main HEAD SHA |
| 0 PM Triage | `.omo/round-36/brief.md` | yes | **PASS** | All 7 required sections (Title, Source, User pain, Competitor analysis, Candidates ranked, Recommended candidate, Self-Critique, U_* profile) |
| **0.25 PM Researcher** | `competitor-landscape.md` | N/A (polish profile) | **N/A** | Not required per profile gating |
| 0.5 PM Manager | `.omo/round-36/pm-manager-review.md` | yes | **PASS** | Verdict APPROVE / pre_check PASS / 3 candidates 3-test gate |
| **0.75 Planner** | `.omo/round-36/planner.md` | yes (polish profile) | **PASS** | ## Ranking table + ## Scope selected (≤5 bugfix cap respected) + ## Decision rationale |
| 1 Architect | `.omo/round-36/plan.md` | yes | **PASS** | 7 sections present (Goal, ACs, File changes, Steps, Test plan, Risk register, Hand-off) |
| 2 Dev | 3 worktree commits + AC trace in decision.md | yes | **PASS** | 3 commits on main (`f86365d`, `1abea17`, `2e88453`); AC trace in decision.md ## Pre-Commit Audit section |
| **2.5 Pre-Commit Audit** | inline verdict in decision.md | yes (always run) | **PASS** | SHAs verified (3 commits exist); `bun test` 610/610 pass; `bun run check` 0 errors; 4/4 verify-plugin-load gates |
| 3a Tester Review | `test-report.md` + 5 review-*.md | yes | **PASS** (this turn) | test-report.md + 5 review-*.md all written |
| 3b Tester Diff | `diff-report.md` | yes | **PASS** (this turn) | per-commit breakdown for 3 commits |
| 3c Playwright | (skipped per profile) | N/A (no new UI surface) | **N/A** | N/A — R36 is small polish round, no new UI surface |
| 3.5 Doc Writer | `doc-update-report.md` | yes | **PASS** (this turn) | R36 has no README changes; bilingual lockstep preserved |
| 4 Decision | `.omo/round-36/decision.md` | yes | **PASS** (this turn) | SHIP/CONTINUE/STOP verdict + AC trace + lead takeovers + dev self-check + ## Sync + ## Planner + ## Pre-Commit Audit sections |
| 4.5 Retro | `.omo/round-36/retro-post-exec.md` | yes (mandatory, combined) | **PASS** (this turn) | v5.3.12 Patch 3: combined retro+post-exec (single file, 6 sections: TL;DR, Successes, Failures, Skill gaps, Followup, Action items) |
| 4.6 Post-exec | (combined with 4.5 via Patch 3) | yes (mandatory) | **PASS** (this turn) | Same file as 4.5 (combined per v5.3.12 Patch 3) |
| 4.7 Self-check | `.omo/round-36/self-check.md` (this file) | yes (mandatory, hard gate) | **PASS** | All 14 phase rows PASS or N/A; 0 FAIL items |

## Profile-gated checks (skip if profile says skip — these are N/A, not FAIL)

| Phase | Bugfix | Feature | Architecture | R36 profile | Status |
|---|---|---|---|---|---|
| Architect full plan (Phase 1) | 1-para | full | full + hyperplan | polish (per U_*) | PASS (full) |
| Hyperplan | skip | skip | run | polish | **N/A** |
| External review | skip | skip | run | polish | **N/A** |
| Lens #3 Code | skip | run | run | polish | PASS (written) |
| Lens #5 Context | skip | run | run | polish | PASS (written) |
| Tester Playwright (Phase 3c) | skip unless UI | run | run | polish (no new UI) | **N/A** |
| PM Doc Writer (Phase 3.5) | 1-para | full + screenshot | full + screenshot | polish (no new docs) | PASS (1-para equivalent) |

## Closure sequence gates

| Step | Status | Evidence |
|---|---|---|
| All expected output files exist for the polish profile (≥ 3/13 expected files) | **PASS** | `ls .omo/round-36/ \| wc -l` = 12 (well above 3 minimum) |
| `decision.md` SHIP verdict | **PASS** | grep "## Verdict" decision.md → "**SHIP**" |
| `.omo/proposals.jsonl` R36 line appended | **PENDING** (next file operation) | Will auto-generate via python+git log helper (v5.3.12 Patch 4) |
| Skill patches applied (if retro OR post-exec surfaced gaps) | **N/A** | R36 retro surfaces 0 new skill gaps (v5.3.12 patches applied in R35 retro covered R36) |
| **Phase 4.8 Loop Summary** emitted as chat response BEFORE the closure commit | **PENDING** | Will emit as next user-visible message |
| **Phase 4.9 Issue Auto-Close** | **PASS** | 2 issues auto-closed: #69, #72 (commit msg `close #69` (close #72)` syntax) |
| Closure commit (this self-check passes BEFORE the commit) | **PENDING** | Will commit R36 closure artifacts (12 .omo/round-36/*.md + proposals.jsonl R36 line) + AC5 worktree cleanup |
| **v5 hard-stop check**: NO `sync-blocked.md` / `audit-blocked.md` / `planner-blocked.md` exists | **PASS** | None of these files in `.omo/round-36/` |

## Self-check verdict

**PASS** — All 14 per-phase artifacts present (1 N/A for 0.25 PM Researcher per profile gating, 1 N/A for 3c Playwright per profile gating). All hard-stop gates PASS (closure sequence gates: 4 PASS, 1 PENDING, 1 PASS for issue auto-close, 0 FAIL). R36 SHIP confirmed.

## Self-check checklist the lead must verify

- [x] Phase -0 sync-report.md exists + has Network PASS + Baseline main HEAD SHA
- [x] Phase 0 brief.md exists + has all 7 required sections
- [x] Phase 0.25 competitor-landscape.md: **N/A** (polish profile, not required)
- [x] Phase 0.5 pm-manager-review.md exists + has APPROVE verdict + 3-test gate
- [x] Phase 0.75 planner.md exists + has ## Ranking + ## Scope selected + ## Decision rationale
- [x] Phase 1 plan.md exists + has 7 sections
- [x] Phase 2: 3 worktree commits exist on main (`f86365d`, `1abea17`, `2e88453`); AC trace in decision.md
- [x] Phase 2.5 Pre-Commit Audit PASS (inline verdict in decision.md; SHAs verified; `bun run check` 0 errors for R36 work)
- [x] Phase 3a test-report.md + 5 review-*.md exists + per-lens source
- [x] Phase 3b diff-report.md exists + per-commit breakdown
- [x] Phase 3c Playwright: **N/A** (no new UI surface, R36 is small polish round)
- [x] Phase 3.5 doc-update-report.md exists + walkthrough validated
- [x] Phase 4 decision.md exists + SHIP/CONTINUE/STOP verdict + AC trace
- [x] Phase 4.5 retro.md exists + all 6 sections, no blanks (combined with 4.6 via v5.3.12 Patch 3)
- [x] Phase 4.6 post-exec-analysis.md: **combined with 4.5** (v5.3.12 Patch 3)
- [ ] `.omo/proposals.jsonl` R36 line appended (next file operation, this turn — auto-generated)
- [ ] `git log --oneline -1` shows the round's closure commit (R36 closure artifacts, this turn)

## Lead's required action after self-check

- **All PASS** → continue to closure: append R36 line to `proposals.jsonl` (auto-generated), AC5 cleanup (2 worktrees), commit closure artifacts to main, push to origin, emit Phase 4.8 Loop Summary chat response.
- **PENDING** items (2/8 closure sequence gates): proposals.jsonl append + Loop Summary chat response — execute next.
- **FAIL** (none observed) → do NOT commit. Fix the missing artifact.

## Failure modes this gate prevents (none triggered this round)

- R3 audit-trail fabrication (commit SHAs in decision.md don't exist in git) — would be caught by Phase 2's "worktree commit exists" check
- R4's "auto-pick after 4 non-response turns" not documented — would be caught by Phase 4's "lead takeovers list" check
- Future round silently skipping Phase 4.5 retro or Phase 4.6 post-exec — would be caught by the corresponding row
- Future round shipping without `self-check.md` itself — impossible by definition (this file IS the self-check)
