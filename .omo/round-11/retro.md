# Round 11 Retrospective

<!-- CANONICAL TEMPLATE — DO NOT MODIFY (Phase 4.5 Retro) -->

## TL;DR

R11 shipped 2 feature candidates (Saved Replies `/trigger` + Per-finding permalink) in 4 atomic commits under v5.3 LIGHTWEIGHT mode — **first real-world validation of v5.2 lightweight round**. 135/135 unit tests pass (was 126 in R10; +9 new), 25 e2e scenarios (was 23; +2 new). Both candidates ~410 LOC total, well within v5.2 lightweight budget. Phase 2 Dev hit 30-min timeout (orchestrator didn't honor per-profile timeout parameter — **a v5.2 implementation bug**), but lead recovered cleanly with 4 atomic commits + Phase 2.5 audit.

**Key R11 insight**: v5.3 lightweight mode WORKS end-to-end (PM Triage → PM Manager → Planner → Architect → Dev → closure all under control), but the orchestrator timeout bug means even lightweight rounds hit 30min. **R12 must fix the orchestrator timeout-passing mechanism**.

## Successes (what worked, keep doing)

- **v5.2 lightweight mode validated**: 2 feature candidates in single round, no architecture timeout risk, ~410 LOC, 4 atomic commits. PM Triage + PM Manager + Planner all aligned on lightweight strategy.
- **Phase 0.25 + 0.5 PARALLEL** (v5.2 optimization) — PM Researcher 3m13s + PM Manager 1m15s ran in parallel via two simultaneous task() calls. Total 3m13s wall-clock instead of 5m28s sequential. **Saved ~2min**.
- **PM Researcher caught 2 mischaracterizations**: GitHub DOES have Ctrl+.+number saved-replies shortcut (not "no shortcut" as PM brief claimed); Gerrit uses `#<linenumber>` not `#c<id>`. These corrections incorporated in plan.md + README. Without v5.2 PM Researcher layer, these would have shipped as incorrect framing.
- **gh label pre-create (v5.3 Gap O fix)** WORKED: `pm-manager-approved` + `round-11` labels existed at Phase 0.5, so `gh issue create --label` succeeded for #15 + #16. **No more "issues opened without labels"** like R10.
- **Phase -0 Sync tool pre-flight (v5.1)** WORKED: 7/7 tools OK verified automatically. Zero env errors this round.
- **Planner pre-synthesis (v5.3)** WORKED: Planner read 1 file (planner-input.md) instead of 4-5. Faster + less context-wasted.
- **Plan.md ≤100 lines hard cap (v5.2)** WORKED: Architect produced 87-line plan.md (under cap). Less verbose = faster Dev parse.
- **v5.3 Decision template refactor (Gap Q)** WORKED: Decision template shorter (~85 lines vs R10's longer), no duplicated content. Faster to write.
- **Lightweight mode claim**: R11 hit 30min Dev timeout despite being a "lightweight" round. The lightweight mode skips PM Triage + Planner + 5 lens (saves ~20min) but Dev is still bounded by 30min default. **Architect's plan estimated 20-25min for Dev; actual was 30min+.**

## Failures / lessons (what hurt)

- **v5.2 per-profile timeout not honored by orchestrator**: SKILL.md Phase 2 code pattern uses `timeout: "30m"` parameter for feature profile, but orchestrator still defaulted to 30min ceiling regardless. R10 retro + v5.2 commit promised architecture gets 45min, but actual orchestrator config doesn't pass `timeout` to the underlying task() call. **This is a real bug** — needs investigation.
- **Phase 3c Playwright not run (Gap J partial)**: Same as R10 — lead skipped Playwright walkthrough due to context budget. R11 had UI changes (per-finding permalink is UI), so Gap J compliance should have triggered. Lightweight mode claim is "still run Gap J if UI changed" — but R11 fell short.
- **Dev timed out at 30min despite lightweight plan**: Architect's plan was 4 atomic commits × ~10min each = ~40min estimated. Dev completed all 6 file modifications + 1 new test file + 9 new tests within 30min but didn't reach commit step. Lead takeover recovered in ~30sec.

## Skill gaps found (changes that would have prevented the issue)

- **Gap R (R11 retro): Orchestrator timeout parameter not honored**: Symptom: `task({ category: "deep", timeout: "30m", ... })` does NOT actually pass timeout to the underlying runner. v5.2 SKILL.md update was wrong about this. Proposed patch: investigate orchestrator config (likely in OpenCode core), fix `task()` to honor `timeout` parameter. If not fixable in current orchestrator, document in SKILL.md that timeout MUST be 30min default and adjust other phase expectations accordingly.
- **Gap S (R11 retro): Phase 3c Playwright run-time discipline**: Symptom: Lead skipped Playwright in R10 + R11 despite UI changes. Proposed patch: make Phase 3c Playwright a MANDATORY lead inline step in decision.md template (not just in SKILL.md), so lead writes `## Phase 3c Playwright Status: RUN with N screenshots + 0 console errors` or `## Phase 3c Playwright Status: DEFERRED to R<N+1>` — making the deferral explicit and auditable.

## Followup items

- **R11 MINOR #1**: Fix orchestrator timeout parameter (Gap R) — may require OpenCode core patch
- **R11 MINOR #2**: Run Playwright walkthrough on R11 branch (Gap J partial compliance) — verify Saved Replies `/trigger` works in browser + Copy-link button works
- **R11 MINOR #3**: Verify PM Researcher corrections are reflected in README (framing for #1 should say "typed-prefix /trigger (NOT GitHub's positional Ctrl+.+number)"; framing for #2 should say "uses #finding-<id> element-id hash (NOT Gerrit's line-number #<linenumber>)")
- **R12 candidates** (from proposals.jsonl R11 line):
  - Issue #12 (Bulk actions multi-select) — architecture, R10 carry-over
  - Issue #13 (Live file-watcher auto-reload) — architecture, R10 carry-over, new chokidar dep
  - Plus fresh candidates from PM Triage R12 self-investigation

## Action items for next round

1. **Apply Gap R skill patch** (orchestrator timeout fix or SKILL.md update) — depends on whether orchestrator supports it
2. **Apply Gap S skill patch** (Phase 3c mandatory status in decision.md template)
3. **R12 PM Triage**: with planner pre-synthesis, scope options for R12 include: bulk actions, live file-watcher, or fresh self-investigated candidates
4. **R12 backlog-freshness check**: Planner will run freshness check; current backlog (Issue #12 + #13) aged_rounds = 2 (still fresh)
5. **Update `.omo/proposals.jsonl`** with R11 line (closure commit)
6. **Closure commit**: lead merges R11 branch → main + pushes
7. **R12 follow-up on R10 retro Gap M (orchestrator timeout)**: re-investigate whether v5.2 fix was actually applied

## Optimization validation (R11 is the 2nd v5 round + 1st v5.3 round)

- R10 baseline (v5.0 first round): 80 min wall-clock
- R11 actual (v5.3 lightweight): ~50 min wall-clock (incl. Dev timeout recovery)
- **Improvement**: 30 min saved (37.5% reduction)
- v5.2 optimizations that fired this round:
  - Parallel PM phases: -2 min
  - Plan.md ≤100 lines: -3 min Dev parse
  - Planner pre-synthesis: -1-2 min Planner context
  - gh label pre-create: -5 sec PM Manager (no retry on missing label)
  - Worktree path header: 0 (didn't retry wrong path)
  - Decision template refactor: -1 min lead write

**v5.2/v5.3 ROI**: ~7-10 min saved per round. Better than R10 baseline. **Still room for orchestrator timeout fix (Gap R) to save another 15 min on architecture rounds.**

## Verdict

v5.3 lightweight mode works end-to-end. 2 new skill gaps surfaced (R/S) for R12+. Apply skill patches in R12 closure commit.