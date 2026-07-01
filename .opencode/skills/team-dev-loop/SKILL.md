---
name: team-dev-loop
description: "v5.3.13 cron-style dev loop — 11 phases + Phase 2.6 Lead Merge+Push (NEW v5.3.3) — 17 phases total (Phase -0 Sync / Phase 0 PM Triage / 0.25 PM Researcher / 0.5 PM Manager / 0.75 Planner / 1 Architect / 2 Dev / 2.5 Pre-Commit Audit / 2.6 Lead Merge+Push / 3a-c Tester / 3.5 Doc Writer / 4 Decision + 4.5-4.9 lead-owned). Lead-direct execution model (v5.3.3): 16 of 17 phases lead-direct, ONLY Phase 2 Dev uses subagent (for code generation). v5.3.4: zh-CN lockstep + READ ONLY ONCE + post-completion verification + user-manual README. v5.3.4+: SG.12 screenshot workflow. v5.3.5: SG.13-SG.16 (regex + immutable helpers + regex pre-validation + screenshots in Phase 2). v5.3.5+1: SG.17 append-only proposals.jsonl + SG.18 combine Triage+Researcher subagent + SG.19 single-commit bilingual docs + SG.20 Phase 3c Playwright minimum. v5.3.6: SG.R19.1-SG.R19.8 (R19 retro 8 patches). v5.3.7: SG.R20.1 + SG.R22.1 + SG.R22.2 (R20 + R22 retro 3 patches). v5.3.8: SG.R24.1 subagent worktree-per-Edit verification (R23+R24 recurring double-write prevention). v5.3.9: SG.R25.1 pre-commit SG.R22.1 verify gate (R25 retro bilingual lockstep gap-fix precedent). v5.3.10: SG.R26.1 file-existence verify gate (R21-R31 retro double-fabrication fix) + SG.R26.2 husky installation verify gate (R30 husky automation false-positive fix) + SG.R27.1 runtime load verification gate (R32 retro 4-gate: runtime compat + PluginModule shape + hook contract + path-plugin entry). v5.3.11: SG.R28.1 frontend skill invocation gate (R33 retro UI/UX 6-issue feedback). v5.3.12: R33/R34/R35 retro loop-level optimization patches (1 AC max per subagent + auto-lightweight + combined retro+post-exec + auto proposals.jsonl + 5 hard rules). v5.3.13: R36 retro follow-up patches (5 NEW: SG.R29.6 auto-lightweight validation + SG.R29.7 auto-pilot 5min default + SG.R29.8 Phase 3.5 conditional skip + SG.R29.9 backlog-empty decision + SG.R30.0 pre-commit test gate). Subagent scope: 1 AC max, ≤15min wall (v5.3.12 default — never 2+ ACs in 1 subagent). Default NO user pick (Planner autonomous); user MAY pre-pick A-E or 1-6 (R12 Gap #1). PM researcher advisories are advisory-only (R12 Gap #14: lead must verify independently). Subagent NEVER does git ops (merge/push/issue close) — lead's responsibility. Mid-task check-in every 5/10/15/20 min OR post-completion verification. ≤3 feature + ≤5 bugfix + ≤8 total + ≤1 polish per round; hard STOP on sync/audit/artifacts/husky/load failure. Triggers: 'team dev loop', 'dev loop', 'run dev loop', 'pick next issue', 'next round', 'do 1 round'."
---

# /team-dev-loop Command (v5)

> **Last Updated**: 2026-07-01 (v5.3.13 R36 retro follow-up: 5 NEW patches — SG.R29.6 auto-lightweight validation + SG.R29.7 auto-pilot 5min default + SG.R29.8 Phase 3.5 conditional skip + SG.R29.9 backlog-empty decision + SG.R30.0 pre-commit test gate. retroactively formalizing R34-R36 informal patterns + catching R36 AC1 test regression. Built on v5.3.12 R33/R34/R35 retros: 5 NEW loop-level optimization patches. Built on v5.3.11 (R33 user-feedback retro SG.R28.1 frontend skill invocation gate). v5.3.10 R32 retro: 1 NEW SG — SG.R27.1 runtime load verification gate. Built on v5.3.9 (R25 retro SG.R25.1 pre-commit SG.R22.1 verify gate). Built on v5.3.8 (R24 retro SG.R24.1 subagent worktree-per-Edit verification). Built on v5.3.7 (3 R22 retro patches). Built on v5.3.6 (8 R19 patches). Built on v5.3.5+1 (commit `74ee9a0` — R16 closure SG.17-SG.20) + v5.3.5 (`98b36b1`) + v5.3.4+ (`350efba`) + v5.3.4 (`43a44ba` + `ca01e97`) + v5.3.3 (`c3a6aea`) + v5.3.2 (`42ba5aa`) + v5.3 (`657a064`). v5.3.13 total: 66 retroactive skill patches cumulative across R12-R36 retros (61 → 62/63/64/65/66 v5.3.13 R36 retro follow-up patches).
> **Status**: R16+ will run on v5.3.4+. R13-R15 ran on v5.3 + v5.3.2 + v5.3.3. R10-R12 ran on v5. R1-R9 ran on v1-v2 (tracked in `.omo/round-{1..12}/`).
> **Migration from v2**: see `## Migration v2 → v5` section below.
> **Status**: R16+ will run on v5.3.4. R13-R15 ran on v5.3 + v5.3.2 + v5.3.3. R10-R12 ran on v5. R1-R9 ran on v1-v2 (tracked in `.omo/round-{1..12}/`).
> **Migration from v2**: see `## Migration v2 → v5` section below.

## Migration v2 → v5

**Removed in v5**:
- `User Pick` phase (PM Manager CLARIFY no longer asks user; Planner selects autonomously)
- `AskUser` calls (all replaced with Planner self-debate or hard-stop)
- `auto-pick policy` after N non-response turns (no user to be non-responsive in v5)
- `Phase 0 backlog freshness check` (moved to Planner Phase 0.75)
- `Phase 0.5 askUser on CLARIFY` (PM Manager writes inline inference; lead calls task() ONCE more as feedback loop; after 2 attempts → REJECT)

**Added in v5**:
- `Phase -0 Lead Sync` — `git fetch` + status + conflict resolution (always run)
- `Phase 0.25 PM Researcher` — `librarian` subagent, `MiniMax_web_search` + `context7_query-docs` verifies PM's competitor claims, writes `competitor-landscape.md`
- `Phase 0.75 Planner` — `deep` subagent, receives PM Manager-validated list, does backlog freshness + ranking + scope selection (hard caps: feature≤3 / bugfix≤5 / total≤8 / polish≤1) + STOP protocol + tie-breaker, writes `planner.md` with `## Decision rationale`
- `Phase 2.5 Lead Pre-Commit Audit` — lead inline `git cat-file -e` SHAs + reverse-grep PM Researcher competitor claims, HARD STOP on FAIL
- `competitor-landscape.md` artifact — PM Researcher verification matrix
- `planner.md` artifact — Planner's autonomous scope selection
- `sync-report.md` artifact — Phase -0 Sync output
- `audit-blocked.md` / `sync-blocked.md` / `planner-blocked.md` — hard-stop outputs
- PM `## Competitor analysis` + `## Product-value gate` 3-test (README 缺段 / 非开发者可见 / 竞品已有) — defensive against R6 polish rounds

**Kept from v2**:
- `team_create`-less sequential `task()` execution pattern
- Per-role category mapping (ultrabrain / deep / quick / etc.)
- Round profile auto-classification (bugfix / feature / architecture from 8 U_* signals)
- 5 parallel review-work lenses (Goal / QA / Code / Security / Context)
- Lead inline takeover protocol (R3 was 5/7 lead; v5 target: 40-50%)
- `.omo/round-N/` tracked artifact library
- `git cat-file -e` R3-fabrication defense (PM Triage + PM Manager + now Planner)

## Loop-level optimization goals (NEW v5.3.12, R33/R34/R35 retros)

The team-dev-loop's purpose is to **compound improvements per round** while **minimizing wall-clock time**. Five hard rules derived from R33/R34/R35 retros:

1. **Subagent scope = 1 AC max** (≤15min wall) — never 2+ ACs in 1 subagent (Patch 1)
2. **Auto-trigger lightweight mode** for housekeeping rounds (<10 lines net, no `src/`) (Patch 2)
3. **Auto-combine retro+post-exec** for rounds with ≤5 ACs or bugfix profile (Patch 3)
4. **Auto-generate `proposals.jsonl` R-N line** from `git log` (Patch 4)
5. **Lead-direct bias** for non-code rounds (housekeeping, docs, re-archive, plumbing)

Each rule saves 5-15min per round × 8 rounds/month = 40-120min/month saved.

**R33/R34 evidence** (subagent scope violation):
- R33: 1 subagent with 3 ACs → 30min timeout → lead-direct rescue 20min → net waste 30min
- R34: 1 subagent with 2 ACs → 30min timeout → lead-direct rescue 5min → net waste 30min
- Total: 60min wasted in 2 rounds

**R35 evidence** (5 rules applied implicitly):
- R35 housekeeping: 0 subagent dispatched → 0 timeout → 0 waste
- 5 atomic commits, 0 subagent calls, 0 wasted minutes
- R35 wall clock: ~35min vs R33/R34 ~50min each → 15min saved per round

**R36 evidence** (5 rules APPLIED for first time):
- 2 subagents × 1 AC × 15min wall (Patch 1 effective)
- 12 closure artifacts, not 13 (Patch 3 effective)
- proposals.jsonl R36 line auto-generated (Patch 4 effective)
- 0 subagent timeouts, 0 lead-direct rescue (vs R33+R34's 30min timeouts)
- Total: 30min saved per round vs R33+R34 (60min over 2 rounds + 30min in R36)

## R36 retro follow-up patches (NEW v5.3.13, R36 retro)

R36 retro surfaced 5 additional gaps not addressed by v5.3.12 patches. Five new follow-up patches:

### SG.R29.6 — Auto-lightweight validation rule (NEW v5.3.13)

**Gap**: v5.3.12 Patch 2 (auto-lightweight) was never validated in production. R36 had 300+ LOC net changes (didn't meet auto-lightweight criteria). No round since R35 has triggered it.

**Rule (mandatory, NEW v5.3.13)**: After Phase 0 (brief.md), if Patch 2's auto-lightweight criteria NOT met, lead SHOULD manually assess:
- Total round LOC <50?
- ≤2 files in `src/`?
- ≤5 minutes for Phase 2 Dev?
- All changes documentation/cleanup (not new features)?

If 3+ of 4 = YES, lead SHOULD manually trigger lightweight mode (write a one-liner in decision.md `## Lightweight round` section + skip PM Triage + Planner + 5 lens per v5.3.2 lightweight protocol).

**R36 evidence**: should have triggered manually (R36 = 5 atomic commits, 0 subagent, 0 timeouts = fits lightweight). Would have saved 5-10min of unnecessary artifact writing.

### SG.R29.7 — Auto-pilot 5min default formalization (NEW v5.3.13)

**Gap**: R34/R35/R36 Loop Summary sections include "Default if no reply 5min: lead-direct R37 housekeeping" as a soft rule. This is not formally encoded as a SG. The 5min auto-pilot was used 3 times in R34-R36 (always worked) but is informal.

**Rule (mandatory, NEW v5.3.13)**: After Loop Summary chat output, lead enters auto-pilot mode:
- Wait 5min for user reply
- If no reply in 5min: lead-direct execute the DEFAULT option in Loop Summary (usually "housekeeping round" or "polish round")
- If user replies `go` / `go+adjust` / `hold`: lead honors that reply even if past 5min
- Auto-pilot mode is TERMINATED by any user reply (any reply ends the wait, even if past 5min)

**R34-R36 evidence**: 3 rounds used auto-pilot, all 3 succeeded (R34 polish, R35 housekeeping, R36 polish). 0 user complaints about timing. Formalize as SG.

### SG.R29.8 — Phase 3.5 conditional skip (NEW v5.3.13)

**Gap**: Phase 3.5 (Doc Writer) was a no-op for ALL R33-R36 (4 consecutive rounds). 0 README changes, 0 doc updates, 0 `docs/screenshots/` updates. Yet every round writes a `doc-update-report.md` artifact (12 sections of "no change" boilerplate).

**Rule (mandatory, NEW v5.3.13)**: Phase 3.5 SKIPPED entirely if:
- `git diff main..HEAD --stat -- 'README.md' 'README.zh-CN.md' 'docs/'` shows 0 changes
- 0 new `docs/screenshots/*.png` files
- 0 new doc files in commit history

When skipped: lead writes a 1-line note in `decision.md` `## Doc updates` section ("Phase 3.5 SKIPPED per SG.R29.8: no doc changes this round") + does NOT write `doc-update-report.md`. Saves ~3-5min of boilerplate artifact writing per round.

**R33-R36 evidence**: 4 rounds × 3-5min saved = 12-20min total wasted on doc-update-report.md boilerplate.

### SG.R29.9 — Backlog-empty decision rule (NEW v5.3.13)

**Gap**: R36 ended with 0 open GH issues (all 8 user feedback issues from R1-R8 closed). R37+ has no user-facing backlog. But R35 retro's Loop Summary said "Default if no reply 5min: lead-direct R37 housekeeping" — this was implicit, not formalized.

**Rule (mandatory, NEW v5.3.13)**: When user-facing backlog is empty (0 open issues, 0 user ACs in `brief.md`):
- Lead SHOULD default to housekeeping round (husky v10 migration, stale branch refs cleanup, v5.3.12 Patch 2 validation, etc.)
- Loop Summary should EXPLICITLY state "User-facing backlog empty. Default: housekeeping round."
- If user replies with new ACs mid-round, lead pivots immediately

**R37 evidence**: after R36, 0 open GH issues. Housekeeping backlog exists (husky v10, stale branch refs, Patch 2 validation). Default should be R37 housekeeping.

### SG.R30.0 — Pre-commit test gate (NEW v5.3.13)

**Gap**: R36 AC1 fix (`skipLink` key quote) was committed to worktree, but the test that would catch the missing quote (`AC1.2 i18n data-i18n key mismatch`) only failed AFTER commit. The husky pre-commit hook should have caught it.

**R36 AC1 evidence**: AC1 fix committed to worktree, then `bun test` failed (1 fail at i18n test). The husky hook should have run `bun test` before commit and blocked the commit. Instead, commit succeeded and fix had to be done retroactively.

**Rule (mandatory, NEW v5.3.13)**: husky pre-commit hook MUST include `bun test` (not just `bun run check`). The `bun run check` only runs tsc + lint, NOT unit tests. Without `bun test` in the hook, test regressions slip through to commit.

**Current R35 husky hook**:
```bash
#!/usr/bin/env bash
# R35 AC1 + AC4: pure direct pre-commit hook (no husky shim)
set -e
cd "$(git rev-parse --show-toplevel)"
echo "🔍 R35 pre-commit: bun run check..."
bun run check || { echo "❌ bun run check failed"; exit 1; }
echo "🔍 R35 pre-commit: bun test..."
bun test || { echo "❌ bun test failed"; exit 1; }
echo "✅ R35 pre-commit: ALL PASS"
```

**Patch**: hook ALREADY includes `bun test` (line 8). R36 AC1 test fail was at WORKTREE level (before commit) — hook would have caught it IF subagent had run the hook. Subagent did not run `git commit` from worktree root, OR hook was bypassed.

**R36 evidence**: AC1 commit `f86365d` — subagent worked in `team-dev-loop-round-36-ac2` and `team-dev-loop-round-36-ac3` worktrees. AC1 was lead-direct, but lead also worked in worktree. The hook should have caught the test fail pre-commit. Either:
- Lead bypassed the hook (should not happen with `set -e`)
- Hook was misconfigured in the worktree (possible if hooks don't copy to new worktrees)

**Fix per SG.R30.0**: ensure husky pre-commit hook is correctly installed in EVERY new worktree. Use `git config core.hooksPath .husky/_` in `.git/config` of each worktree, OR install the hook to `.git/hooks/pre-commit` directly. Per v5.3.12 Patch 2 (auto-lightweight), the hook should also be lightweight-friendly (≤2 commands).

## v5.3.13 patch validation matrix (R33-R36 cumulative)

| Patch | Status | Validation |
|---|---|---|
| SG.R26.1 (file-existence gate) | ✓ APPLIED | R33-R36 all PASS |
| SG.R26.2 (husky install gate) | ✓ APPLIED | R35 wired hook (direct bypass) |
| SG.R27.1 (4-gate verify) | ✓ APPLIED | R33-R36 all PASS |
| SG.R28.1 (frontend skill) | ✓ APPLIED (substituted) | R33 retro |
| v5.3.12 Patch 1 (1 subagent = 1 AC) | ✓ VALIDATED | R36 (2 subagents, 0 timeout) |
| v5.3.12 Patch 2 (auto-lightweight) | ⚠ NEVER VALIDATED | R33-R36 all had >10 LOC + src/ changes |
| v5.3.12 Patch 3 (combined retro+post-exec) | ✓ VALIDATED | R36 (12 artifacts, not 13) |
| v5.3.12 Patch 4 (auto proposals.jsonl) | ✓ VALIDATED | R36 (R36 line auto-generated) |
| v5.3.12 Patch 5 (5 hard rules) | ✓ APPLIED | R33-R36 |
| v5.3.13 SG.R29.6 (auto-lightweight validation) | ⚠ NEW (manual trigger only) | R36 should have triggered manually |
| v5.3.13 SG.R29.7 (auto-pilot 5min default) | ⚠ NEW (informal → formal) | R34-R36 used informally |
| v5.3.13 SG.R29.8 (Phase 3.5 conditional skip) | ⚠ NEW | R33-R36 wrote boilerplate doc-update-report.md (4 rounds wasted 12-20min) |
| v5.3.13 SG.R29.9 (backlog-empty decision) | ⚠ NEW | R37+ first application |
| v5.3.13 SG.R30.0 (pre-commit test gate) | ⚠ NEW | R36 AC1 commit should have been blocked by hook |

## Expected impact (v5.3.13 patches)

- **SG.R29.6**: Saves 5-10min per housekeeping round (manual trigger)
- **SG.R29.7**: Formalizes 3 proven patterns (R34-R36), no behavior change
- **SG.R29.8**: Saves 3-5min per round × 8 rounds/month = 24-40min/month
- **SG.R29.9**: No behavior change (default = housekeeping)
- **SG.R30.0**: Prevents test regressions slipping to commit (correctness, not time)

**Total**: 32-50min/month saved + 1 correctness fix (pre-commit test gate).

## v5.3.13 SKILL.md changes (this commit)

- 5 new follow-up patches added to "Loop-level optimization goals" section
- v5.3.13 patch validation matrix added (5 v5.3.12 patches + 5 v5.3.13 patches)
- Expected impact documented (32-50min/month)
- v5.3.13 patch count: 66 cumulative retroactive skill patches (61 → 66)

**Built on v5.3.12 R33/R34/R35 retros** (5 loop-level optimization patches). **Built on v5.3.11** (R33 user-feedback retro SG.R28.1).

## v5.3.4 R+ Quick reference cheat sheet (NEW v5.3.4 — R15 retro SG.8)

**Status**: APPLIED in v5.3.4. Codifies the v5.3.3 lead-direct execution model as a 1-line-per-phase cheat sheet for future lead-direct runs.

**17 phases — 16/17 lead-direct, 1/17 subagent**:

| Phase | Who | 1-line summary |
|---|---|---|
| -0 Sync | lead (inline) | `git fetch origin` + status + ahead/behind |
| 0 PM Triage | **lead** | Read 4-5 files + write `brief.md` (5 min vs 17 min subagent) |
| 0.25 PM Researcher | **lead** | `webfetch` citations directly, cross-ref R-N-1 competitor-landscape.md |
| 0.5 PM Manager | **lead** | `gh issue create` × N + write `pm-manager-review.md` |
| 0.75 Planner | **lead** | Compute composite scores + write `planner.md` |
| 1 Architect | **lead** | Write `plan.md` (90-100 lines, hard caps met) |
| 2 Dev | **subagent** | 5-20 min budget, NO merge/push. Decompose >20 min into parallel sub-tasks |
| 2.5 Pre-Commit Audit | **lead** | 3 fast gates + scenario count drift + file count + SHAs |
| **2.6 Lead Merge + Push** | **lead** | `git merge --no-ff` + `git push origin main` + verify GH auto-close |
| 3a Tester Review | lead | 5 review-*.md + test-report.md |
| 3b Tester Diff | lead | `git diff --stat` + diff-report.md |
| 3c Playwright | lead | `playwright-cli` walkthrough (or quota-override) |
| 3.5 Doc Writer | lead | doc-update-report.md |
| 4 Decision | lead | decision.md |
| 4.5 Retro | lead | retro.md |
| 4.6 Post-exec | lead | post-exec-analysis.md |
| 4.7 Self-check | lead | self-check.md |
| 4.8 Loop Summary | lead | 5-section chat response |
| 4.9 Issue Auto-Close | lead | `gh issue list` verify-only |

**v5.3.4 mid-task check-in pattern** (R+ retro SG.7 — also see `## Mid-task check-in mechanism` section):
- t=0: fire subagent
- t=5/10/15/20: heartbeat check (commits, tests, build)
- bg completion (any time): run Phase 2.5 + 2.6 + 4.9 inline (this is the "post-completion verification" special case for bg tasks that completed within budget)

**R+ trigger phrase** (what the user types): `/team-dev-loop`, `dev loop`, `run dev loop`, `pick next issue`, `next round`, `do 1 round`, `自主决策` (autonomous), `run 2 round` (R+ specific).

**R+ guardrails** (R+ retro cumulative):
- v5.3.3: lead-directs 16/17 phases, subagent only for Phase 2 Dev
- v5.3.3: scripts/pre-commit-audit.sh (5-step pre-merge verification)
- v5.3.4: zh-CN lockstep enforcement (Phase 2 Dev parallel commit, not post-commit audit gate)
- v5.3.4: READ ONLY ONCE in lead-direct brief.md + plan.md (no re-reading R-1 retro unless needed)

## Quick start

The full v5 pipeline design lives in `docs/team-dev-loop.md` (tracked) and the skill body lives in this directory. Read them in this order:

1. **`docs/team-dev-loop.md`** — design + usage doc (~700 lines, tracked)
2. **`SKILL.md` (this file)** — orchestrator stub with execution pattern
3. **`references/sync-spec.md`** — Phase -0 Sync protocol (NEW v5)
4. **`references/v5-prompts.md`** — Phase 0 PM Triage v5 + Phase 0.25 PM Researcher + Phase 0.5 PM Manager v5 + Phase 0.75 Planner prompts (NEW v5)
5. **`references/phase-prompts.md`** — Phase 1 Architect + Phase 2 Dev + 5 lens prompts (unchanged from v2)
6. **`references/pre-commit-audit-spec.md`** — Phase 2.5 Pre-Commit Audit protocol (NEW v5)
7. **`references/loop-decision.md`** — fail-mode handling matrix + lead takeover protocol (updated v5)

## What this skill does

For each round `N` (v5 cron-style):
1. **Phase -0 Sync** (lead inline): `git fetch origin` + status + conflict resolution → `sync-report.md`. HARD STOP if sync fails.
2. Read `.omo/round-N/brief.md` (PM's proposal with ranked candidates + competitor analysis + product-value gate)
3. Run the phases as `task()` calls. **v5.2 optimization**: Phase 0.25 PM Researcher + Phase 0.5 PM Manager run **in parallel** via `Promise.all` (no data dependency; PM Manager gates on brief.md alone; Researcher verdict is advisory). Phase 0 PM Triage → **Phase 0.25 + 0.5 (parallel)** → Phase 0.75 Planner → Phase 1 Architect → Phase 2 Dev (timeout = 45min arch / 30min otherwise) → Phase 2.5 Pre-Commit Audit → Phase 3a-c Tester → Phase 3.5 PM Doc Writer → Phase 4 Decision. Saves ~3 min per round vs fully sequential.
4. Phase 3a (Tester Review) internally fans out 5 parallel `run_in_background=true` lenses
5. Write `.omo/round-N/decision.md` (lead writes directly, no separate task)
6. Append one line to `.omo/proposals.jsonl` (cross-round decision log)
7. `git add` + `git commit` + `git push origin main` (one commit per round, no PR — fully automated push)
8. **Rollback support**: lead can run `git revert <round-sha>` if invoked externally; this is documented in `references/loop-decision.md` § Rollback protocol

## User-locked scope override (NEW R12 retro Gap #1 + R12 patch)

**Scope override semantics** (v5 cron-style PLANNER auto-pick is the default, but user pre-pick is honored when explicit):

- **Default**: v5 cron-style — Planner (Phase 0.75) selects scope autonomously from PM Manager's `## Validated for next round` table per hard caps (feature ≤ 3 / bugfix ≤ 5 / total ≤ 8 / architecture ≤ 1 / polish ≤ 1). No user input.
- **Override trigger**: user explicitly says in chat "选 X" / "用 Y" / "pick from 1-6" / "选 #N" / "scope = ★1+2+3" / "pick from the candidates" / "跑 A 不跑 B" / similar decisive language.
- **Override behavior**:
  1. Lead captures the user pick verbatim into `decision.md` `## User gate` section + `proposals.jsonl` `chosen_candidate` field.
  2. Lead skips the PM Triage + Planner PROCEED-or-STOP ceremony (scope is already locked; Planner just confirms compliance with hard caps and writes `planner.md` `## Scope selected` mirroring the user pick).
  3. PM Researcher MAY verify only the user-picked subset (saves ~5 min vs full-candidate verify). Document in `competitor-landscape.md` `## Note on user-rejected items` which candidates were intentionally excluded.
  4. PM Manager auto-opens GH issues for ONLY the user-picked candidates (not all candidates from `## Candidates ranked`). Issue numbers become the scope contract for downstream phases.
  5. Architect `plan.md` MUST start with `Inherited scope: <user-pick verbatim>` so the scope is unambiguous.
- **Override end**: user can re-pick mid-round by saying "用 Y 不用 X" or "加 Z". Lead updates the captured pick + notes the change in `decision.md` `## User gate`.

**R12 evidence**: User said "3" → scope locked to ★1 Pinned + 2 Reactions + 3 Keyboard `n/p`. Lead correctly routed Phase 0.25 + 0.5 + 0.75 + 1 to consume that scope instead of cycling through all 7 candidates. ~10 min saved.

## User-gate auto-pilot (opt-in) (NEW R12 retro Gap #8 + R12 patch)

**Problem (R12 retro)**: Lead unilaterally set a "5-min default auto-pilot" rule after Plan surface to avoid indefinite wait. SKILL.md had no documented behavior. User got confused by repeated `等。` ack messages without clarity on what to reply.

**Solution**:

- **Default behavior**: Lead stays GATED. Do NOT auto-launch implementation phases (Phase 2 Dev, Phase 0.5 fire, etc.) without explicit user authorization. This is the safe default.
- **Opt-in auto-pilot** (lead proposes in plan surface or briefing): Lead MAY include a line like "Default if you say nothing N min after this nudge: `<action>` per plan" in the surface message. User implicitly consents by NOT replying within the time window.
- **Constraints**:
  - Lead MUST state the proposed default + timeout in the surface message (no silent auto-pilot).
  - Timeout defaults: 5-15 min. Lead MAY propose specific duration with reasoning.
  - System-reminder / TODO CONTINUATION prompts during the wait do NOT count as user reply. The only thing that ends the wait is explicit user input OR the timeout firing.
  - If user does reply, lead honors that reply even after auto-pilot has fired (rollback if needed, BUT avoid firing before timeout).
- **Forced opt-out**: User can say "停" / "hold" / "no auto-pilot" / "I'll respond" at any time during the wait to extend the gate indefinitely.

**R12 evidence**: I unilaterally committed to 5-min default auto-pilot in plan-surface.md. User replied "修复后继续推进 loop" (`fix` at §126) which honored the auto-pilot commitment. Future rounds should make this explicit in the surface message so the user knows the gate is time-bounded.

## User-gate decision matrix (NEW R12 retro Gap #12 + R12 patch)

**When does lead require explicit user authorization vs auto-launch** (matrix decision):

| Phase / decision | Default | Override required? | Notes |
|---|---|---|---|
| Phase 0 PM Triage → user story surface | **GATE** | YES — wait for user pick (1-6 or A-E) | R12 retro: user pre-pick essential for fresh-investigation decisions |
| Phase 1 Architect `plan.md` surface | **GATE** | YES — wait for `go` / `go+adjust` / `hold` | Architect's plan reflects scope; user wants to verify before Dev commits |
| Phase 2 Dev launch (after `plan.md` approved) | **AUTO** | NO — lead auto-fires | Once scope is user-OK'd, dev work is implementation; lead runs in `deep` subagent |
| Phase 2.5 Audit FAIL (drift caught) | **GATE** | YES — wait for explicit `fix` / `hold` | Audit correctness is user-accountable, lead auto-applied patches would be unilateral |
| Phase 2.5 Audit FAIL POST-CLOSURE (R12 case) | **GATE** | YES — write audit-blocked.md + surface to user; user OK's drift fix | Audit correctness still user-accountable, even retroactively |
| Phase 3a Tester Review | **AUTO** | NO | Lead-synthesized (R5 default + Patch H) |
| Phase 3b/3c/3.5 (Diff/Playwright/Doc) | **AUTO** | NO | Lead-only (Patch H) |
| Phase 4 Decision (SHIP/CONTINUE/STOP) | **GATE** | YES — implicit via audit trail; surface decision.md for review | User can `git revert` if unsatisfied (Rollback protocol) |
| Phase 4.9 Issue Auto-Close | **AUTO** | NO | Verified via `gh issue list --state closed` (commit msg `close #N` auto-closes) |

**R12 evidence**: Phase 1 Plan gate caught 2 minor issues (composite ranking math, hand-off item count). Phase 2 Dev auto-fired cleanly. Phase 2.5 Audit FAIL caught 1 drift (post-closure) → user OK'd fix in commit `22864bf`. The matrix above codifies which phases require user intervention vs auto-launch.

## Phase hand-off contracts (NEW R12 retro Gap #11 + R12 patch)

**Each phase's output is structured to be consumed by the NEXT phase** (no silent IMPLICIT context loss):

| From → To | Contract |
|---|---|
| Sync → PM Triage | `sync-report.md` provides baseline `1b0da21` + tool pre-flight + dirty files. PM Triage verifies sync-report.md SHA against `git cat-file -e` before claiming baseline. |
| PM Triage → PM Researcher + PM Manager | `brief.md` is canonical input. Both read it independently (no PM Triage session → subagent session pipeline). |
| PM Manager → Planner | `pm-manager-review.md ## Validated for next round` table is canonical input. Lead pre-writes `planner-input.md` consolidating this + Researcher verdict + Follow-up + Hard caps (v5.3 input pattern). |
| PM Researcher → Planner | `competitor-landscape.md` verification matrix is **advisory**. Planner does not gate on it; lead reads for Risk Register context. |
| Planner → Architect | `planner.md ## Scope selected` table is canonical input. Architect's `plan.md` MUST start with `Inherited scope from planner.md: <verbatim copy>`. |
| Architect → Dev | `plan.md` 7 sections + hard caps + multi-round AC classification is canonical. Dev MUST read it before touching code (per hand-off item 1). |
| Dev → Tester Review (Phase 3a) | Dev's `ac_trace` (15/15 PASS list with file:line evidence) is canonical. Tester Review lenses spot-check 1-2 ACs from this trace for verification depth. |
| Tester Review (Phase 3a) → Diff (Phase 3b) | `test-report.md` verdicts inform Diff's critical-findings emphasis, but Diff re-reads `git diff main..HEAD` independently. |
| Diff (Phase 3b) + Playwright (Phase 3c) + Doc (Phase 3.5) | **All run as parallel lead-synthesized Patch H deliverables**. Order doesn't matter; lead writes them in same response block. |
| Tester + Diff + Playwright + Doc → Decision (Phase 4) | `test-report.md` + `diff-report.md` + `playwright-report.md` + `doc-update-report.md` + `audit-blocked.md` are read together by lead before writing `decision.md`. |
| Decision (Phase 4) → Closures (Phase 4.5/4.6/4.7/4.8/4.9) | `decision.md` is the audit trail. Retro / Post-exec / Self-check must reference specific file:line from `decision.md`. |

**R12 evidence**: I had to inference most of these contracts mid-round. Codifying them here makes future rounds less error-prone for new leads.

## Subagent claim verification protocol (NEW R12 retro Gap #14 + R12 patch)

**Every subagent MUST have at least 1 specific claim verified by the lead before the next phase fires** (R12 evidence: PM Researcher returned REVIEW_NEEDED with 4 mischaracterized citations; PM Triage's cumulative scenario count drifted; PM Manager APPROVED before RESEARCHER's output landed).

**Per-phase verification** (lead runs inline after each subagent returns):

| Phase | Claim to verify | Verification method |
|---|---|---|
| PM Triage | "Scenario count N" (if cited) or "test file line M exists" (if cited) | `wc -l scripts/test-review-ui/scenarios.mjs` or `grep -n <file:line claim>` |
| PM Manager | "Opened N issues" | `gh issue list --label pm-manager-approved --state open --json number,title | jq '. | length'` |
| PM Researcher | "Claim X verified" (URL-VERIFIED marked claims) | `webfetch` the cited URL; confirm content matches claim |
| Planner | "Composite ranking: Pinned (9.2) > Reactions (8.6) > Keyboard (7.8)" | Lead re-computes composite math from `brief.md ## User-impact profile` U_* fields. Spot-check 1-2 candidates. |
| Architect | "AC count = 15" or "Plan ≤ 100 lines" or "Multi-round AC routed to direct unit test" | `wc -l .omo/round-N/plan.md`, `grep -c '^## '`, `grep 'AC[0-9].*MR\|multi-round' plan.md` |
| Dev | "185/185 unit tests pass" + "branch X committed" + "X+Y atoms committed" | `bun test` + `git log -1 --format=%H <branch>` + `git diff main..HEAD --shortstat` |
| Tester Review | "5/5 lens PASS" | `ls .omo/round-N/review-*.md` count + `cat .omo/round-N/test-report.md ## Verdict per lens` |
| Lead inline (Phase 2.5) | "SHA N exists" + "Claim value matches" | `git cat-file -e N` + `wc -l <source-of-truth>` |

**Hard rule**: if lead cannot verify a subagent's claim independently, lead MUST surface to user before proceeding to next phase. This is non-negotiable.

**R12 retro evidence**: I caught the Phase 2.5 Audit drift via verification (claim "31" vs actual 30). User explicitly OK'd the fix. Future rounds should make this verification systematic, not just on Audit phase.

## Phase 3c Playwright as Gap #14 verification layer for UI features (NEW R19 retro SG.R19.5 — APPLIED)

**Why** (R19 retro): Dev subagent shipped i18n infrastructure (182 LOC, 30+ STRINGS keys) for AC1.2 language toggle. Dev's 15/15 unit tests in `i18n.test.ts` all passed because they test the `translate(key, lang)` helper in isolation. **But the integration was broken** — only 2 of 30+ UI strings wrapped in `t()` calls. AC1.2 was PARTIAL until Phase 3c Playwright walkthrough caught it (toolbar labels didn't change on toggle click). Unit-test-only verification missed the integration gap.

**Hard rule** (R19 retro SG.R19.5): For UI-feature rounds (anything that changes text, role, layout, or visible DOM in `review.html` / `app.ts`), **Phase 3c Playwright walkthrough IS the Gap #14 verification layer**. Static analysis + unit tests + integration tests are insufficient. Walkthrough must:

1. **Toggle / click / interact** the feature (don't just check "page loaded")
2. **Verify DOM changed** in expected way (read state, not just check no console errors)
3. **Re-test language persistence** for i18n features (toggle, reload, verify persisted)
4. **Compare before/after screenshots** if visual change claimed

Per `R14 retro SG.5`: walkthrough can be quota-overridden only when user signals quota exhaustion explicitly + all 4 test gates pass + Dev self-check has been lead-verified. For UI features, "no console errors" is NOT sufficient to claim SHIP.

**R19 evidence**: AC1.2 caught by walking through the language toggle and observing `Unified` stayed `Unified` (not `统一`) after clicking the toggle button. Dev's unit tests passed because they only tested the helper function. Static-source checks (`grep "t(" src/`) showed only 2 hits — Phase 3c walkthrough closed the gap.

## Open considerations (R12 retro noted, NOT yet patches — v5.3+)

- **PMC Researcher's force-review mode** (R12 retro SPG.1 related): when Researcher verdict is REVIEW_NEEDED with ≥1 MISCHARACTERIZED, lead MAY escalate to user OR auto-downgrade the candidate instead of letting Planner proceed. Currently Planner proceeds with citation-level findings in risk register.

## Phase 2.5 Pre-Commit Audit placement (NEW R14 retro SG.1 — APPLIED)

**Status**: PARTIALLY APPLIED in v5.3. R12 retro Gap #13 originally deferred; R14 retro SG.1 confirms with 2 round evidence. v5.3 keeps Phase 2.5 POST-Dev (as designed) but ADDS a new lead-inline "pre-merge verification" step that effectively serves the same purpose without restructuring the phase order.

**Lead pre-merge verification** (new step added to Phase 2.5):
- Lead verifies `git diff <R11 baseline>..HEAD` worktree state BEFORE merge to main
- Lead verifies all 4 gates: `bun run check && bun run build && bun test && bun run scripts/test-review-ui/e2e.mjs`
- Lead verifies scenario count claim (R12 retro Gap 3 / SG.1 reverse-validate): `grep -c '^  "[a-zA-Z0-9-]\+": { setup' scripts/test-review-ui/scenarios.mjs` matches README claim
- If drift detected: write `audit-blocked.md` + 1-line patch + user-gate + re-verify (per `## AUDIT FAIL POST-CLOSURE workflow` in `loop-decision.md`)

**Full Phase 2.5 inversion** (deferred to v5.4+): if R15+ surfaces 1+ more drift-on-merge incidents, restructure execution pattern to `Phase 1 Architect → Phase 2.5 Pre-Commit (audit plan.md + lead sign-off) → Phase 2 Dev`. Trade-off: Dev cycle becomes longer (audit waits for completion + Dev starts fresh); benefit: zero drift-on-merge risk.

## Lead-skip-subagent threshold (NEW R14 retro SG.3 — APPLIED)

**Status**: APPLIED in v5.3. Codifies when lead can skip Phase 0/0.25/0.5/0.75/1 subagents and write directly.

**Threshold** (lead may safely skip subagents for ALL the following):

- Profile = `feature` (not `architecture` — architectural changes need subagent verification)
- Feature count ≤ 3 (matches feature ≤ 3 hard cap)
- Total est LOC ≤ 300 (matches light polish scope; exceeds 300 → fire subagents)
- All candidates are additive (no `U_data_shape_breaking`, no `U_installs_new_dep`, no `U_behavior_shift`)
- All candidates are product/user-visible (no internal refactor-only scope)
- ≥ 1 fresh candidate was previously deferred to the round (R12 brief → R13 brief, R13 brief → R14 brief — proves lead has context)
- User invoked `自主决策` or `run N round` (autonomous mode explicit)

**When threshold NOT met**: fire Phase 0/0.25/0.5/0.75/1 subagents normally per v5 default.

**R14 evidence**: 3 micro-features (Sort + Filter + Auto-save), all feature profile, all additive, total ~415 LOC including 2 NEW helper files (debatable but within threshold), autonomous mode. Lead-synthesized Phase 0/0.25/0.5/0.75/1 saved ~25 min vs full subagent sequence. No drift detected in Phase 2.5 audit.

**SG.3 risk**: skipping subagents reduces lead's external verification (R12 retro Gap #14 subagent claim verification protocol — applies only when subagents fire). Lead SHOULD still verify ≥1 specific claim inline before next phase, even if no subagent fired.

## Dev returns but merge/push incomplete recovery pattern (NEW R14 retro SG.2 — APPLIED)

**Status**: APPLIED in v5.3. Codifies the recovery workflow when Dev bg task ends with `Status: running` but all 5 atomic commits + tests + build + lint + typecheck all passed in worktree (Dev got stuck on the merge/push step).

**Detection criteria** (lead runs these inline checks):
1. Worktree `git log <R-N-1 baseline>..HEAD` shows ≥ N atomic commits (matches plan)
2. Worktree `bun run check && bun run build && bun test` all PASS
3. `git cat-file -e` all commits verifies SHA existence
4. BUT bg task status = `running` (or `pending` with `Last tool: bash`)
5. AND main worktree `git log <R-N-1 baseline>..HEAD` shows 0 commits (Dev didn't merge)

→ **STALL DETECTED**: lead cancels bg + manually completes the workflow.

**Recovery pattern** (mandatory for stalled Dev bg task):

1. `background_cancel(taskId="bg_...")` — cancel the stuck bg task
2. Verify worktree HEAD matches expected commits: `git -C "$HOME/.worktrees/team-dev-loop-round-N" log --oneline -N`
3. Switch to main worktree + run `git pull origin main` (ensure main is up to date)
4. `git merge --no-ff team-dev-loop-round-N-<slug> -m "Round N: merge ..."` (no fast-forward; preserves closure-commit pattern)
5. `git push origin main` (verify push succeeds)
6. Verify GH issue auto-close: `gh issue list --state closed --label pm-manager-approved` — all `close #N` references in commit messages should auto-close
7. Run Phase 2.5 audit inline (per existing protocol)
8. Continue with Phase 3a-c-3.5 + Phase 4 closures

**R14 evidence**: bg_2ab5b789 ran 1h 18m but completed 5 commits + tests. Lead cancelled + manually completed merge + push. Total recovery time ~2 min. Without this recovery pattern, the round would have hung indefinitely on Dev's stuck bash tool call.

## Phase 3c Playwright minimum + quota-override (NEW R14 retro SG.5 — APPLIED)

**Status**: APPLIED in v5.3. Specifies minimum Playwright walkthrough requirement + explicit quota-override exception.

**Default minimum** (when Phase 3c Playwright runs):

- Capture ≥ 1 screenshot per feature in the shipped scope
- Screenshot naming convention: `docs/screenshots/r{N}-{sN}-{scenario-name}.png`
- Walkthrough scenarios must cover: surface verification + interactive click flows + keyboard shortcuts
- Console-error check (R8 retro Gap K): `playwright-cli console error` returns 0 errors → PASS; ≥ 1 error → FAIL walkthrough + fix before claim SHIP

**Quota-override exception** (NEW, for R14+ retrospective):

- If user signals quota exhaustion mid-round (e.g., "刚刚额度干完了"), lead may skip Playwright walkthrough for the current round IF:
  - All 4 test gates pass (bun run check + build + unit + e2e)
  - Dev's self-check has been verified by lead inline (R12 retro Gap #14)
  - User's quota-override message is explicit (NOT implicit)
- Skipped walkthrough MUST be flagged in retro with a quota-override note
- Walkthrough MUST be completed in next round if feasible (R14 retro → R15 follow-up)
- R15 retro should codify this further if 2+ rounds in a row need override

**R14 evidence**: Walkthrough skipped (user quota override) → 0 screenshots added → R14 has no Playwright visual evidence. Surface verification was done via Dev's self-check + lead's reverse-verification of all 9 ACs. Documented in `retro.md ## Failures F.4` + `## Skill gaps SG.5`.

## zh-CN audit gate (NEW R14 retro SG.4 — APPLIED + v5.3.4 enforcement)

**Status**: APPLIED in v5.3.2 (audit gate) + v5.3.4 (enforcement). R15 retro surfaced that audit gate alone isn't enough — Dev updates README.md but doesn't proactively update zh-CN.

**Mandate**: When updating `README.md` (or any user-facing English doc), `README.zh-CN.md` MUST be updated in lockstep IF the project ships both languages.

**v5.3.4 enforcement** (R15 retro SG.6): Phase 2 Dev prompt should require `git add README.md README.zh-CN.md` in same docs commit. This makes zh-CN update a PARALLEL atomic action, not a separate post-commit audit gate. Pattern: `git add README.md && git add README.zh-CN.md && git commit -m "docs(rN): update both"` — or use the `git add README*.md` glob shorthand.

**Detection** (lead inline check during Phase 2.5 Audit + Phase 4.7 Self-check):

1. `git diff HEAD~N..HEAD -- README*.md` — both README.md AND README.zh-CN.md must be in the diff (or both absent if single-language project)
2. If only README.md is updated but README.zh-CN.md is not: lead MUST add a follow-up zh-CN commit before Phase 2.6 merge + push
3. Compare for equivalent content (rough text length check: |EN diff| ≈ |CN diff| within 30% tolerance)

**R14 evidence**: README.md updated with 3 R14 bullets; zh-CN NOT updated. R14 retro F.5 flagged this as a missed lockstep. v5.3.2 codifies the audit gate.

**R15 evidence**: Same drift pattern — R15 Dev updated README.md but not README.zh-CN.md. R15 retro SG.6 surfaced this. v5.3.4 enforcement (Phase 2 Dev parallel commit) is the real fix; v5.3.2 audit gate alone failed for R15.

**Single-language exception**: If project does NOT ship bilingual docs (only README.md or only README.zh-CN.md exists), this audit gate is N/A.

## README user-manual style mandate (NEW v5.3.4 — R+ retro SG.11)

**Status**: APPLIED in v5.3.4. R+ retro surfaced that the README was 299 lines of implementation jargon (atomic writes, ENOSPC, EXDEV, state.json internals, test suite references, etc.) — first-time visitors couldn't understand the product. **Mandate: README is a user manual, not an engineering doc.**

**Why this matters**:
- README is the FIRST thing potential users see on GitHub
- Implementation jargon (file paths, internal type names, test references, atomic write details, error codes) makes the product look like a hackathon project, not a polished tool
- User manual style = "what does this do for me, and how do I use it" — no `src/`, no `state.json` internals, no code references
- Plain language + "you" voice + "How to install" + "How to use" + FAQ

**Mandate** (v5.3.4 enforcement):
- README.md + README.zh-CN.md are USER MANUALS, not engineering docs
- Write for: someone who's never seen the project, doesn't know what it does, doesn't care how it's built
- DO include: what it does, who it's for, plain-language features, install steps, basic usage workflow, FAQ
- DO NOT include: file paths (`src/index.ts:60`), internal type names, test references, error codes, atomic-write details, architecture, internal state shape
- If implementation detail IS necessary, put it in a sub-section or separate doc — not in the main README

**Failure mode to avoid** (R+ retro finding): README grows technical depth as features ship. Devs add "how to" documentation for their own code, which clutters the README. SG.11 establishes the user-manual tone as the primary doc, with implementation details deferred to separate docs (e.g., `docs/team-dev-loop.md` for architecture, `docs/feature-spec.md` for individual feature specs).

**R+ retro verdict**: v5.3.4 lead-direct README rewrites should be user-manual style. R14 retro F.5 + R15 retro F.1 evidence: README had 5 old screenshots from R0/R1 era, 0 new screenshots for R12-R15 features, plus 299 lines of implementation jargon. SG.10 (visual evidence) + SG.11 (user-manual style) combined fix this.

## New feature visual evidence mandate (NEW v5.3.4 — R+ retro SG.10)

**Status**: APPLIED in v5.3.4. R+ retro surfaced: R12-R15 shipped 9 new features (Pinned / Reactions / n-p nav / Resolve-with-reason / Mark wontfix / In-diff search / Sort / Filter / Auto-save / Cmd+P / Submit confirm / Audit trail) BUT README had ZERO new screenshots. Phase 3c Playwright was skipped in R13/R14/R15 (quota-override) → product lost its story.

**Mandate** (v5.3.4 enforcement): Every new feature shipped in a round MUST have ≥ 1 screenshot in `docs/screenshots/`. Screenshot naming: `docs/screenshots/r{N}-{sN}-{feature-name}.png` where N = round number, sN = scenario number within that round's walkthrough.

**Why this matters**:
- First-time visitors browse README on GitHub — visuals are the deciding factor
- 9 new features without visual evidence = invisible product to potential users
- R0/R1-era screenshots still dominate README — but those features are old and don't represent current state

**Implementation pattern** (lead-direct, R+ v5.3.3 model):

```
# 1. After Phase 2 Dev completes, lead-direct runs Playwright walkthrough:
cd /path/to/repo
bun run build  # rebuild dist if needed
PORT=8890 nohup python3 scripts/test-review-ui/mock-server.py 8890 &
sleep 2
nohup playwright-cli open "http://127.0.0.1:8890/review/test?token=test" &
# 2. For each new feature in the round:
#    a. Navigate to UI surface
#    b. Interact (click / type / navigate)
#    c. Capture screenshot: playwright-cli screenshot --filename docs/screenshots/r{N}-s{N}-{name}.png
# 3. Stop mock-server
# 4. Update README.md + README.zh-CN.md to embed screenshots
# 5. Commit + push as `docs(rN): README screenshots for R{N} features`
```

**Failure mode to avoid**: R+ retro + SG.5 quota-override lets Phase 3c Playwright be SKIPPED. This is OK for unit-test verification but NOT OK for product storytelling. SG.10 splits the difference: walkthrough is REQUIRED for visual evidence, but lead-direct + playwright-cli makes it fast (~5-10 min per round).

**R+ retro verdict**: SG.10 codifies "screenshots are MANDATORY, not optional". v5.3.4 R+ rounds must have ≥ 1 screenshot per feature. SG.5 quota-override no longer exempts visual evidence.

## R+ screenshot capture workflow (NEW v5.3.4+ — R+ retro SG.12 operationalizes SG.10)

**Status**: APPLIED in v5.3.4+. Operationalizes SG.10 by codifying the exact commands to capture screenshots + the lockstep with README updates.

**Why operationalize**: R+ SG.10 says "every feature must have ≥ 1 screenshot". Without operational details, lead-direct has to figure out: which port, which mock-server file, how to start/stop, where to save files, how to embed into README + zh-CN. SG.12 codifies the 6-step workflow that worked for R+ retro follow-up (captures dashboard-overview.png + 5 R12-R15 feature screenshots).

**Workflow** (lead-direct, ~5-10 min per round):

```bash
# Step 1: cleanup stuck processes
pkill -9 -f "mock-server.py" 2>/dev/null || true
pkill -9 -f "playwright-cli" 2>/dev/null || true
pkill -9 -f "chrome" 2>/dev/null || true

# Step 2: build dist (rebuild if Phase 2 Dev changed code)
bun run build

# Step 3: start mock-server on unique port (8890 to avoid conflict)
# IMPORTANT: use `nohup ... & disown` for proper detachment (R18 retro SG.R19.2: setsid is Linux-only; macOS lacks it)
nohup python3 scripts/test-review-ui/mock-server.py 8890 \
  > /tmp/r{N}-mock.log 2>&1 < /dev/null & disown
sleep 3
curl -s -m 5 http://127.0.0.1:8890/health  # → "ok"

# Step 4: pre-warm playwright-cli (use 'press' not 'press_key')
playwright-cli open "http://127.0.0.1:8890/review/test?token=test"
playwright-cli snapshot  # discover DOM refs

# Step 5: walkthrough per feature
# For R12 features (Pinned, Reactions, n-p nav): add a finding first
#   by clicking a line number, then navigate to Conversation tab
# For R13 features (Resolve modal, In-diff search): trigger from within UI
# For R14 features (Sort dropdown, Filter, Auto-save): navigate + capture
# For R15 features (Cmd+P, Submit confirm, Audit trail): click + capture

playwright-cli screenshot --filename docs/screenshots/r{N}-{name}.png

# Step 6: cleanup (mock-server dies with shell — no need to pkill; bash hangs)
# Proceed to README + zh-CN updates
```

**Critical patterns**:
- Use `nohup command & disown` for background mock-server (proper detachment on macOS + Linux; R18 retro SG.R19.2: removed `setsid` which is Linux-only)
- `playwright-cli press` (not `press_key` — the latter shows help)
- For tab switching: `playwright-cli eval "() => document.querySelectorAll('[role=tab]')[N].click()"` (works when click ref hangs)
- For keyboard events: `playwright-cli press 'Control+p'` (matches Playwright keyboard syntax)
- Mock-server is dying with bash shell — no need to pkill (avoid pkill hangs)
- Avoid bash `pkill` after mock-server is running — it hangs the shell

**Failure modes to avoid**:
- **Bash hang on pkill**: `pkill -9 -f "mock-server.py"` after mock-server is running hangs the shell. Don't pkill mock-server — let it die with the shell.
- **Multiple stuck Chrome processes**: pre-warm with playwright-cli BEFORE running tests; for screenshot capture, just one page is sufficient
- **Tab click retry loop**: if click on a tab ref retries indefinitely, use JS eval `document.querySelectorAll('[role=tab]')[N].click()` instead

**Screenshot naming** (per SG.10): `docs/screenshots/r{N}-{sN}-{feature-name}.png` where N = round number, sN = scenario number. For R+ retro follow-up, naming is `r{N}-{capability-name}.png` (without sN since these are catch-up screenshots for missed rounds).

**README updates** (per SG.11 + SG.6):
- Add a "What it looks like" section near the top with 4-5 hero screenshots
- Each screenshot: alt text in plain language + 1-line caption
- BOTH README.md AND README.zh-CN.md updated (per SG.6 zh-CN lockstep enforcement)
- Commit as `docs: add R{N} feature screenshots to README + README.zh-CN` (one atomic commit covering both files + all screenshots)

**R+ retro verdict**: SG.12 codifies the operational details to capture screenshots efficiently. R+ retro SG.10 + SG.11 + SG.12 together: mandate ("screenshots required") + style ("user-manual") + operationalization ("here's exactly how to do it"). Net effect: future R+ rounds have visuals from day-1, no more 9-feature-no-screenshot backlog.

**R+ retro 6 step workflow summary** (cheat sheet):
1. Pre-cleanup: `pkill mock-server` if any (do this BEFORE starting mock-server, not after)
2. Build: `bun run build`
3. Mock-server: `nohup python3 scripts/test-review-ui/mock-server.py 8890 & disown` (R18 retro SG.R19.2: removed Linux-only `setsid`)
4. Pre-warm: `playwright-cli open http://127.0.0.1:8890/review/test?token=test`
5. Walkthrough: `playwright-cli screenshot --filename docs/screenshots/r{N}-{name}.png` per feature
6. Mock-server: leave running (dies with shell) | README + zh-CN update + commit

Total time: ~5-10 min per round for the screenshot loop. Acceptable R+ cost.

## R16 retro SG.13 — Tighten subagent regex test patterns (NEW v5.3.5)

**Status**: PROPOSED in v5.3.5. R16 Dev subagent's first test run had 9 regex failures (all regex pattern bugs, NOT impl bugs).

**Why add**: Subagent writes regex pattern assertions against source code as a defense-in-depth test pattern (R12 retro: "lock behavior with regression tests FIRST"). But subagent's first attempts had 4 common regex bugs:
1. Multiline regex using `.` instead of `[\s\S]`
2. HTML attribute matching `class="..."` when source uses `className = "..."` (JS form)
3. Ordering assumptions in non-greedy regex
4. Cross-function dependency regex (e.g., writeText followed by execCommand across function boundaries)

**Mitigation** (applied to Phase 2 Dev prompts in v5.3.5+):
- Lead-synthesize critical regex patterns in plan.md hand-off items
- Subagent translates regex patterns to vitest assertions (purely mechanical)
- Pre-R16 cycle time: +5 min lead-direct, -10 min subagent iteration
- Phase 2 Dev prompt must include: "DO NOT use `.` in regex to match across lines — use `[\s\S]` instead. When matching class names, prefer source-form `className = "..."` over HTML-form `class="..."`. Avoid ordering assumptions — use `[\s\S]*?` only when both endpoints are in the same function block."

**R16 retro verdict**: SG.13 patches the regex-test hallucination root cause. Future rounds save ~10 min subagent iteration.

## R16 retro SG.14 — Add-only policy for existing utility helpers (NEW v5.3.5)

**Status**: PROPOSED in v5.3.5. R16 Dev subagent lightly refactored `copyFindingPermalinkToClipboard`'s inner `fallbackCopy` to take a parameter. Refactor was functionally identical but represents a drift — subagent should ADD new helpers, not MODIFY existing ones.

**Why add**: R12 retro Gap #2 rule: "Add-only for existing utilities" — refactoring existing helpers during feature work creates rebase hazards + test brittleness. R16's refactor was caught by existing permalink test (T11.2d) but shouldn't have happened.

**Mitigation** (applied to Phase 2 Dev prompts in v5.3.5+):
- Lead adds to plan.md hand-off items: "DO NOT modify existing utility functions in src/ui/app.ts. If you need a similar function, write a new one with a distinct name (e.g., `copyFindingAsMarkdownToClipboard` mirrors `copyFindingPermalinkToClipboard`). Existing utility functions are immutable."
- Architect should list "immutable helpers" in plan.md as a hand-off item

**R16 retro verdict**: SG.14 patches the helper-refactor drift root cause. Future rounds keep existing tests green at zero risk.

## R16 retro SG.15 — Lead-direct pre-validation of regex test specs (NEW v5.3.5)

**Status**: PROPOSED in v5.3.5. R16 Dev subagent had 9 failing tests on first run = 30% failure rate, all due to regex pattern bugs.

**Why add**: This is subagent hallucination in test design — the patterns LOOK correct but fail on edge cases. Lead-synthesizing the regex patterns upfront reduces failure rate from 30% to ~0%.

**Mitigation** (applied to Phase 1 Architect + Phase 2 Dev prompts in v5.3.5+):
- Architect plan.md hand-off items should include "regex test patterns" as pre-validated TS code blocks (not descriptions)
- Subagent only translates pre-validated patterns to vitest assertions (purely mechanical)
- Pre-R16 cycle time: +5 min lead-direct, -10 min subagent iteration

**R16 retro verdict**: SG.15 patches the regex-test hallucination root cause via lead-direct pre-validation. Future rounds have ~0% regex failure rate.

## R16 retro SG.16 — Move screenshot capture into Phase 2 Dev (NEW v5.3.5)

**Status**: PROPOSED in v5.3.5. R16 deferred screenshots to after Phase 4 closure (lead-direct pass). Same pattern as R12-R15. ~10 min per round spent on screenshots AFTER closure.

**Why add**: R+ retro SG.10 mandates visual evidence. R+ retro SG.12 operationalizes the workflow. R16 retro finds that screenshots-after-closure is the WRONG timing — feature commits ship without visual evidence, and visual evidence arrives as a separate follow-up commit (drift-prone).

**Mitigation** (applied to Phase 2 Dev prompts in v5.3.5+):
- Phase 2 Dev prompt includes screenshot capture as part of feature validation
- Subagent captures `docs/screenshots/r{N}-{feature-name}.png` for each feature BEFORE marking the feature done
- Lead-direct verifies screenshot existence in Phase 2.5 Pre-Commit Audit
- README + zh-CN updates include screenshot embedding in Phase 2 Dev's final docs commit (per SG.6 lockstep)

**R16 retro verdict**: SG.16 patches the screenshot-timing drift root cause. Future rounds ship features WITH visual evidence (1 atomic commit per feature, not 2-commit split).

## R16 closure SG.17 — Append-only pattern for proposals.jsonl (NEW v5.3.5+1)

**Status**: PROPOSED in v5.3.5+1. R16 archive commit `fe1830c` accidentally overwrote R1-R15 history when archiving R16 entries — required recovery commit `4538fd0` to restore 16 lines.

**Why add**: proposals.jsonl is the audit trail for every round's PM Triage → Manager → Planner → Decision. Loss of history = loss of decision context for future retros. The append-only pattern prevents silent data loss.

**Mitigation** (applied to lead-direct workflow in v5.3.5+1):
- NEVER use `cat >> .omo/proposals.jsonl` (atomic overwrites the whole file if git merge produces conflicts)
- ALWAYS use `git diff .omo/proposals.jsonl` before any commit to verify delta is additive only
- Commit each round's append as a separate `chore(round-N): append PM Triage entry to proposals.jsonl` commit (1 commit per round, not bundled into R closure)
- If the file already has the new R entry on `main`, skip the archive step entirely (don't re-archive what was already committed at Phase 0)
- Lead-direct verifies proposals.jsonl size increases monotonically across rounds: `git log --oneline -- .omo/proposals.jsonl` should show N commits with N lines per round

**R16 closure verdict**: SG.17 patches the data-integrity risk. Future rounds can't accidentally lose audit trail.

### Auto-generated proposals.jsonl R-N template (NEW v5.3.12, R33/R34 retro)

**R33/R34 retro surfaced**: every round manually writes a JSON entry for `proposals.jsonl`. Manual JSON writing is error-prone (typos, missing fields, inconsistent structure).

**Rule (mandatory, NEW v5.3.12)**: lead-direct can auto-generate the R-N line from `git log` output:

```bash
# Auto-generate R-N proposals.jsonl entry (lead-direct helper)
ROUND=N
python3 <<EOF
import json, subprocess
result = subprocess.run(
    ['git', 'log', '--format=%H', f'HEAD~5..HEAD'],
    capture_output=True, text=True
)
commits = [c for c in result.stdout.strip().split('\n') if c][:5]
print(json.dumps({
    "round": $ROUND,
    "timestamp": subprocess.run(['date', '-u', '+%Y-%m-%dT%H:%MZ'], capture_output=True, text=True).stdout.strip(),
    "scope": len(commits),
    "ship_chain": commits,
    "tests_total_after": ...,
    "tests_total_before": ...,
    "wall_clock_min": ...,
    "sg_compliance": {},
    "gap_fix_applied": False,
    "fix_count": 0,
}, ensure_ascii=False))
EOF
```

**Benefits**:
- Eliminates manual JSON writing errors (typos, missing fields, inconsistent structure)
- Ensures consistent structure across rounds
- Saves 2-3min per round (manual JSON → auto-generated)
- One-liner that lead can paste into the append step

**R33/R34 retro evidence**: each round's R-N line was hand-written JSON with minor inconsistencies (e.g., R33 used `sg_compliance: {}` placeholder, R34 used `sg_compliance: { "SG.R24.1": "APPLIED-7th-consec", ... }` with real entries). Auto-generation would standardize.

## R16 closure SG.18 — Combine PM Triage + PM Researcher into single subagent (NEW v5.3.5+1)

**Status**: PROPOSED in v5.3.5+1. R16 fired 2 separate subagents (PM Triage 3m 17s + PM Researcher 2m 9s = 5m 26s total). Both read the same `.omo/round-N/` files.

**Why add**: Two subagents for verification = 2x context-loading + 2x result-parsing overhead. One subagent doing both saves ~2 min/round when verification is needed.

**Mitigation** (applied to Phase 0 PM Triage prompts in v5.3.5+1):
- Subagent prompt includes BOTH tasks:
  1. **PM Triage**: surface 6-8 fresh user-stories with file:line evidence + 3-test gate verdict
  2. **PM Researcher**: verify 5 specific claims about top-3 candidates (Pierre205 API reality, clipboard pattern reuse, FileDiff constructor pattern, 3-test gate reverse-validation)
- Single subagent, single report with `## PM Triage` and `## PM Researcher Verification` sections
- Returns to `.omo/round-N/pm-triage-and-research-report.md`

**When to use combined vs separate**:
- **Combined** (default): when scope is fresh (R16 user picked from 14 candidates), verification is needed
- **Separate subagents**: when scope is locked and only verification is needed (rare)
- **Skip both, lead-synthesize**: when scope is small (≤ 2 features) and changes are obvious (R14/R15 pattern)

**R16 closure verdict**: SG.18 saves ~2-3 min/round when verification is needed. R16 86 min → ~83 min.

## R16 closure SG.19 — Single-commit batch for bilingual docs (NEW v5.3.5+1)

**Status**: PROPOSED in v5.3.5+1. R16 had 2 docs commits (1d53bf1 for English README, 284dd21 for zh-CN follow-up). Should be 1 atomic commit per SG.6 lockstep.

**Why add**: 2-commit split for bilingual docs = inconsistent history (English-only commit appears first; zh-CN "follow-up" looks like a fixup). SG.6 mandates lockstep — but the workflow doesn't enforce it.

**Mitigation** (applied to Phase 3.5 Doc Writer + Phase 2 Dev prompts in v5.3.5+1):
- Phase 3.5 Doc Writer prompt: "ALWAYS update README.md AND README.zh-CN.md in the same `git add` + `git commit`. NEVER commit English README.md separately from README.zh-CN.md. If you forgot zh-CN, use `git commit --amend` to add it before pushing — don't create a 2nd commit."
- Phase 2 Dev prompt (SG.6 enforcement): "If implementation includes doc updates, BOTH README.md AND README.zh-CN.md must be in the same commit. Verify with `git diff --cached --stat` before committing."
- Lead-direct verifies bilingual files move together: `git diff main --stat -- README.md README.zh-CN.md` should show same commit hash for both

**R16 closure verdict**: SG.19 saves 1-2 min/round + cleaner git history. R16 had `1d53bf1` then `284dd21` (2 commits for one logical change).

## R16 closure SG.20 — Phase 3c Playwright minimum (loosen R+ retro SG.5 quota-override) (NEW v5.3.5+1)

**Status**: PROPOSED in v5.3.5+1. R+ retro SG.5 lets Phase 3c Playwright be SKIPPED. R12-R15 all skipped. R16 also skipped — only the 3 lead-direct screenshots I captured manually provide visual verification.

**Why add**: SG.5 was added to save 10-15 min/round (Playwright walkthrough + scenario execution). But it left a quality gap — no automated visual regression safety net. The lead-direct screenshots (SG.12) are good but they're snapshots, not interaction tests.

**Mitigation** (applied to Phase 3c Playwright prompt in v5.3.5+1):
- REQUIRE at least 1 Playwright scenario per round that exercises the new features
- Subagent (not lead-direct) captures during Phase 3c
- Re-allocates 5-8 min from lead-direct post-closure work (SG.12) to subagent Phase 3c work
- Net effect: same total time, but QUALITY is higher (interactive scenarios, not static snapshots)

**When to skip Playwright minimum**:
- R is a pure bugfix round (no UI changes)
- R is a SKILL.md-only patch (no app.ts changes)
- User explicitly opts out

**When to require Playwright**:
- R has UI changes (state.visibleChanges > 0)
- New button / modal / tab / sidebar element
- New keyboard shortcut
- New visual rendering path (e.g., diff layout change)

**R16 closure verdict**: SG.20 patches the visual regression safety gap. Future rounds with UI changes get automated Playwright validation, not just lead-direct snapshots.

## Cumulative R+ retro skill patches count (R12-R16 closure)

- v5 (R12 retro): 14 patches
- v5.3.2 (R14 retro): 5 patches (SG.1-SG.5)
- v5.3.3 (R+ retro): 6 patches (lead-direct model + 4 root-cause fixes)
- v5.3.4 (R15 retro): 5 patches (SG.6-SG.9 + SG.11)
- v5.3.4+ (R+ retro follow-up): 1 patch (SG.12)
- **v5.3.5 (R16 retro)**: 4 patches (SG.13-SG.16) — applied in 98b36b1
- **v5.3.5+1 (R16 closure follow-up)**: 4 NEW patches (SG.17-SG.20) — this commit
- **Total**: **39 retroactive skill patches cumulative**

## Top 5 patches by ROI (R+ retro + R16 retro combined)

| Rank | Patch | Time saved | Status |
|---|---|---|---|
| 1 | SG.16 (screenshots into Phase 2 Dev) | 10 min/round | v5.3.5 (98b36b1) |
| 2 | SG.15 (lead-direct regex pre-validation) | 10 min/round | v5.3.5 (98b36b1) |
| 3 | SG.18 (combine Triage + Researcher) | 2-3 min/round | v5.3.5+1 (this commit) |
| 4 | SG.13 (tighten subagent regex) | 1-2 min/round | v5.3.5 (98b36b1) |
| 5 | SG.19 (batch bilingual docs) | 1-2 min/round + cleaner history | v5.3.5+1 (this commit) |

**Combined: -24-27 min/round if all 5 applied.** R16's 86 min → ~60 min target.

## Cumulative R+ retro skill patches cumulative count (R12-R16)

- v5 (R12 retro): 14 patches
- v5.3.2 (R14 retro): 5 patches (SG.1-SG.5)
- v5.3.3 (R+ retro): 6 patches (lead-direct model + 4 root-cause fixes)
- v5.3.4 (R15 retro): 5 patches (SG.6-SG.9 + SG.11)
- v5.3.4+ (R+ retro follow-up): 1 patch (SG.12)
- **v5.3.5 (R16 retro proposed)**: 4 NEW patches (SG.13-SG.16)
- **Total proposed**: 35 retroactive skill patches cumulative

## Mid-task check-in mechanism (v5.3.3) + v5.3.4 post-completion verification (R+ retro SG.7)

**Status**: APPLIED in v5.3.3 + v5.3.4 clarification. R15 retro surfaced that "mid-task check-in" needs to include "post-completion verification" as a special case for bg tasks that completed within budget.

**R+ retro SG.7 clarification** (v5.3.4): "Mid-task check-in" pattern in v5.3.3 SG.3 covers:
1. **Standard case**: bg subagent running >5 min, lead does heartbeat check at t=5/10/15/20 min
2. **Post-completion verification** (NEW v5.3.4 case): bg subagent completed within budget — lead runs Phase 2.5 + 2.6 + 4.9 inline immediately, no manual check-in needed. This is the **majority case** for subagent tasks that complete in 5-20 min budget.

**Pattern** (mandatory for any `run_in_background=true` task):

```
t=0:   fire subagent (run_in_background=true)

# STANDARD CASE (bg > 5 min):
t=5:   first check-in
       - bash: `git -C $worktree log --oneline -1` (any commits?)
       - bash: `git -C $worktree status --short` (any uncommitted changes?)
       - bash: `ps aux | grep -E "<task-pattern>" | grep -v grep | wc -l` (process alive?)
t=10:  second check-in (if t=5 had no progress OR bg > 5 min)
       - bash: `bun test` (tests passing? in worktree)
t=15:  third check-in (if still no completion)
       - bash: `bun run build` (build clean?)
       - bash: `git -C $worktree log --oneline -5` (commit count)
       - if ALL of: commits > 0, tests pass, build clean, NO merge → take over
t=20:  hard cap
       - if subagent still running, `background_cancel(taskId=...)` + take over
       - lead merges + pushes + audits + continues

# POST-COMPLETION VERIFICATION (v5.3.4 NEW — bg completed within budget):
bg end (any time, system reminder):
       - lead runs Phase 2.5 audit inline:
         * `git diff <R-N-1 baseline>..<worktree-branch>` (file deltas sanity)
         * `git cat-file -e` × all new commits (R4 fabrication defense)
         * `wc -l` for scenario count claim vs actual (R12 retro Gap 3)
         * `bun run check && bun run build && bun test` (3 fast gates)
       - lead runs Phase 2.6 (NEW v5.3.3 phase): `git merge --no-ff` + `git push origin main`
       - lead runs Phase 4.9: `gh issue list --state closed` to verify auto-close

# POST-COMPLETION + SCOPE NARROW: skip e2e gate (Phase 2.5)
       - per R14 retro F.4: e2e suite takes 2-3 min due to harness startup, not a pre-merge blocker
       - Dev's Phase 2 work already verified e2e PASS
       - Phase 3c Playwright covers full walkthrough
```

**R+ retro verdict**: v5.3.4 clarification working as designed. R15 (first R+ round with v5.3.3 model) used post-completion verification pattern exclusively (bg completed at t=14, no check-in needed). Saved ~5 min vs v5.3.3 standard check-in pattern that would have run at t=5/10/15 even when bg already completed.

## Subagent scope sizing (v5.3.3) + v5.3.4 READ ONLY ONCE (R+ retro SG.9)

**Status**: APPLIED in v5.3.3 (5-20 min budget) + v5.3.4 (READ ONLY ONCE reminder). R15 retro surfaced that subagent re-reads R-1 retro / R-2 retro / etc. excessively, wasting tokens.

**R+ retro SG.9** (v5.3.4 NEW): Subagent over-reads prevention. When lead writes `brief.md` and `plan.md` directly (R+ v5.3.3 lead-direct pattern), subagent tasks receive full context inline. Subagent should NOT re-read R-1 retro / R-2 retro / R-3 retro / R-N-1 closure unless explicitly needed. Over-reading wastes tokens and slows subagent response time.

**R+ READ ONLY ONCE rule** (codified in lead-direct brief.md + plan.md templates):

1. Subagent reads `brief.md` + `plan.md` + relevant `src/` files. ONCE.
2. Subagent does NOT re-read:
   - `proposals.jsonl` (cross-round context) — already in plan.md if relevant
   - Previous R-N-1 `decision.md` (closure verdict) — already in plan.md if relevant
   - `references/v5-prompts.md` (phase prompts) — already loaded by lead before firing subagent
3. Subagent may re-read ONLY if plan.md has a specific reference like "see R-1 retro § F.1 for context" — explicit cross-reference, not implicit
4. If subagent needs additional context mid-task, it can ask the lead via the prompt's "If you need clarification, request from lead" instruction

**R+ retro verdict**: R15 Dev transcript showed multi-round re-reads (per retro F.2). v5.3.4 codifies "READ ONLY ONCE" in subagent prompts to prevent over-reading. v5.3.3's 5-20 min budget + v5.3.4's READ ONLY ONCE should keep subagent wall-clock <20 min for typical 3-feature bundles.

## zh-CN audit gate (NEW R14 retro SG.4 — APPLIED + v5.3.4 enforcement)

## Agent architecture

| Layer | Agent | Why |
|---|---|---|
| **Orchestrator (lead)** | **`sisyphus` (primary chat)** | Lead owns the round lifecycle, writes `decision.md`, commits. Has all tools. R+ retro: lead-directs Phase 0-2.5 + 2.6-4 (see `## Lead-direct execution model` below). |
| **Per-role subagents** | `task(category="...", subagent_type="...")` for each phase | Sequential, fresh context per phase. No state across phases. R+ retro: only for Phase 2 Dev (code generation). All other phases lead-direct. |
| **5 review-work lenses** | `task(..., run_in_background=true)` ×5 inside tester-review task | R+ retro: DEPRECATED — lead writes 5 review-*.md files directly (R4 retro Gap 2 + R12 patch Gap #2). Orchestrator-fanout pattern retired. |

**Critical constraints**:
- Lead NEVER uses `team_create` / `team_send_message` / `team_shutdown_request` / `team_delete`. Use `task()`.

## Lead-direct execution model (NEW v5.3.3 — R+ retro root-cause fix)

**Status**: APPLIED in v5.3.3. Replaces over-delegation pattern from v5.3.2.

**Root cause** (R14 retro + this session's user feedback):
- v5.2/v5.3 design had lead as "synthesizer of subagent output" — 14/17 phases were lead takeovers
- User feedback: "lead as transcriber has no involvement in most phases" + "subagent task too heavy, slow + unreliable"
- v5.3.2 symptom-level patches (SG.1-SG.5) didn't address the root cause: **lead defaults to over-delegation + subagent over-loads**

**v5.3.3 model** (the fix):

| Phase | Who | Why lead-direct is better |
|---|---|---|
| -0 Sync | **lead** (inline `git fetch + status`) | 1 min, instant, no subagent overhead |
| 0 PM Triage | **lead** (Read 4-5 files + write brief.md directly) | R14 evidence: 17 min subagent = 5 min lead (3-4x faster, lead has full context) |
| 0.25 PM Researcher | **lead** (`webfetch` + `minimax-token-plan_web_search` directly) | R13 evidence: 5 min subagent = 5 min lead, BUT lead can verify 1-2 claims inline (Gap #14) |
| 0.5 PM Manager | **lead** (`gh issue create` + write pm-manager-review.md) | R13 evidence: 5 min subagent = 2 min lead (commit-msg `close #N` is the auto-close mechanism, no need for subagent to call `gh issue create`) |
| 0.75 Planner | **lead** (compute composite scores + write planner.md) | R13 evidence: 2 min subagent = 2 min lead (composite formula is 1 line of math) |
| 1 Architect | **lead** (write plan.md) | R14 evidence: 5 min subagent = 5 min lead (R14 plan.md is 89 lines lead-synthesized, all hard caps met) |
| 2 Dev | **subagent** (commit + test + build ONLY) | Subagent's only required phase — multi-file code generation needs fresh context. **NO merge / NO push / NO gh issue close — those are lead's.** |
| 2.5 Pre-Commit Audit | **lead** (inline `wc -l + git cat-file -e + scenario count grep`) | 3 min, instant, no need for subagent |
| **2.6 Lead Merge + Push (NEW phase)** | **lead** (inline `git merge + git push + verify`) | R14 evidence: bg_2ab5b789 hung 18 min on final `git push` tool. Lead takes over → no hang. |
| 3a Tester Review | **lead** (5 review-*.md + test-report.md) | 8 min, all 5 lenses lead-synthesized per R12 patch Gap #2 |
| 3b Tester Diff | **lead** (`git diff --stat` + diff-report.md) | 2 min, instant |
| 3c Tester Playwright | **lead** (`playwright-cli` directly) | 5-10 min walkthrough; quota-override exception per R14 SG.5 |
| 3.5 Doc Writer | **lead** (doc-update-report.md) | 3 min, lead has direct context |
| 4 Decision | **lead** (decision.md) | Standard |
| 4.5 Retro | **lead** (retro.md) | Standard |
| 4.6 Post-exec | **lead** (post-exec-analysis.md) | Standard |
| 4.7 Self-check | **lead** (self-check.md) | Standard |
| 4.8 Loop Summary | **lead** (5-section chat) | Standard |
| 4.9 Issue Auto-Close | **lead** (verify via `gh issue list`) | R12 patch Gap #10 — verification-only |

**15 of 17 phases lead-direct** (vs 14/17 in v5.3.2 + 16/17 in R14). Only Phase 2 Dev remains subagent.

**When subagent IS used** (Phase 2 Dev scope):

- **Scope narrow**: implement N features in worktree, write N unit test files, run `bun run check` + `bun test`, commit. **NO merge / NO push / NO gh issue close / NO merge conflict resolution.**
- **Time budget**: 5-20 min per atomic task. If a feature needs >20 min, lead decomposes into multiple parallel subagent tasks.
- **Decomposition pattern** (R15+ if 3 features):
  ```
  // 3 parallel sub-tasks, each ~15 min wall
  promise1 = task(category="quick", prompt="Implement ONLY #1. Atomic commit. ~15 min.");
  promise2 = task(category="quick", prompt="Implement ONLY #2. Atomic commit. ~15 min.");
  promise3 = task(category="quick", prompt="Implement ONLY #3. Atomic commit. ~15 min.");
  // wait for all (via Promise.all with bg_output), then lead merge + push
  ```
- **Mid-task check-in** (every 5 min during bg task):
  - t=5: `git -C worktree status --short` + `git -C worktree log --oneline -1` (commit progress)
  - t=10: `bun test` (tests passing)
  - t=15: `bun run build` (build clean)
  - t=20: if no completion, **cancel bg + take over** per `## Stall detection and emergency lead takeover`

**R14 evidence** (which motivated this model):
- 78-min Dev subagent did 5 min of real work + 18 min stuck on final tool call
- Lead had no mid-task visibility into the stuck state
- After cancel, lead manually completed merge + push in 2 min (less than 1/9th of subagent's 78 min)

**R+ prediction** (if this model is applied):
- 1 subagent × 15 min wall + 2 min lead merge = 17 min total
- vs R14: 78 min actual → **4.6x faster** for same scope

## Subagent scope sizing (v5.3.3 root-cause fix)

**Status**: APPLIED in v5.3.3. Replaces ambiguous v5.3.2 SG.3 with explicit time budget.

**Root cause**: R13 Dev 78 min + R14 Dev 50 min, both with 1 subagent doing 3 features. Subagent tool framework is unreliable for >20 min tasks (hang risk). Plus subagent is opaque to lead (no mid-task visibility).

**Rule** (mandatory for all `task()` calls in this skill):

- **Single subagent task budget**: 5-20 min wall
- **If task would take >20 min**: decompose into multiple parallel subagent tasks
- **If task is hard to decompose** (e.g., atomic multi-file change): fire subagent with 20-min soft cap, lead takes over partial work after 20 min
- **Decomposition patterns**:
  - **N independent features**: `Promise.all` of N parallel `task()` calls, each 1 feature, lead synthesizes
  - **Multi-file change**: 1 subagent for implementation, 1 subagent for tests, lead for merge/push (3 phases of work)

**Examples**:

```python
# R+ PM Triage: 1 subagent 17 min → 3 parallel 5 min micro-tasks
p1 = task(category="quick", prompt="Read R-2 brief + recent commits. Output: deferred candidates list. 5 min.")
p2 = task(category="quick", prompt="Read README + recent src/ surface. Output: feature inventory. 5 min.")
p3 = task(category="quick", prompt="Web search 5+ competitors. Output: candidate user-stories. 5 min.")
# Lead synthesizes 3 outputs → brief.md (5 min)
# Total: 5 min parallel + 5 min synthesis = 10 min vs 17 min current

# R+ Dev: 1 subagent 78 min → 3 parallel 15 min tasks
p1 = task(category="quick", prompt="Implement ONLY #1 feature. 1 atomic commit. NO merge/push. 15 min budget.")
p2 = task(category="quick", prompt="Implement ONLY #2 feature. 1 atomic commit. NO merge/push. 15 min budget.")
p3 = task(category="quick", prompt="Implement ONLY #3 feature. 1 atomic commit. NO merge/push. 15 min budget.")
# Lead merge + push (2 min)
# Total: 15 min parallel + 2 min lead = 17 min vs 78 min current
```

**R+ retro policy**: If any round has subagent wall-clock > 20 min on a single task, retro flags it as a bug — lead should have decomposed earlier.

## Subagent scope default = 1 AC max, 15min hard cap (NEW v5.3.12, R33/R34 retro)

**Why add**: R33 + R34 retro both surfaced 30min subagent timeouts. Root cause: subagent scoped with 2-3 ACs each, not the 1-AC-per-subagent default. M3 model is `'unstable/experimental'` (per subagent supervisor output) so 30min wall cap is hit routinely for multi-AC tasks. R35 retro (100% lead-direct) proved 0 subagent = 0 timeout = 0 wasted minutes.

**Rule (mandatory, NEW v5.3.12)**:
- **Default**: 1 subagent = 1 AC, ≤15min wall
- **2-AC tasks**: ALWAYS decompose into 2 sub-tasks (parallel via `Promise.all` of 2 `task()` calls)
- **3+ AC tasks**: FORBIDDEN — decompose into N sub-tasks (3-AC → 3 sub-agents; 4-AC → 4 sub-agents)
- **4+ AC tasks**: PARALLEL BATCH (3-4 sub-tasks run concurrently via `Promise.all`)

**Decomposition pattern** (N independent ACs → N parallel sub-tasks):
```typescript
const promise1 = task(category="deep", prompt="Implement ONLY #1. 1 AC. ≤15min wall. NO merge/push.");
const promise2 = task(category="deep", prompt="Implement ONLY #2. 1 AC. ≤15min wall. NO merge/push.");
const promise3 = task(category="deep", prompt="Implement ONLY #3. 1 AC. ≤15min wall. NO merge/push.");
// Wait for all (Promise.all) → lead synthesizes → merge + push
```

**R33/R34 retro evidence** (1 subagent with 2-3 ACs → timeout → wasted time):
- R33: 1 subagent with 3 ACs (AC1+AC2+AC3) → 30min timeout → lead-direct rescued in 20min → net waste 30min
- R34: 1 subagent with 2 ACs (AC3+AC2) → 30min timeout → lead-direct rescued in 5min → net waste 30min
- 2 sub-agents with 1-2 ACs each would have completed in ≤15min wall (parallel) with no timeout → save 60min total

**R35 retro evidence** (0 subagent = 0 timeout):
- R35 housekeeping: 0 subagent dispatched → 0 timeout → 0 waste
- Proof: subagent is NOT needed for housekeeping / plumbing / re-archive rounds (mechanical work, lead-direct is faster + more accurate)
- **Lead-direct bias**: for non-code rounds (housekeeping, docs, re-archive, plumbing), prefer lead-direct over subagent

**Enforcement**: when retro surfaces "subagent >20min wall-clock", retro must also surface the decomposition failure (i.e., "this could have been N parallel sub-agents at 1-AC-each").

## Mid-task check-in mechanism (v5.3.3)

**Status**: APPLIED in v5.3.3. Replaces passive "wait for system reminder" with active heartbeat.

**Why** (R14 evidence): bg_2ab5b789 ran 78 min, last 18 min stuck on final `git push` tool call. Lead had no mid-task visibility — only system reminder fired AFTER Dev's bg task finally ended (stuck). If lead had checked at t=15, "5 commits done, build clean, tests pass" but no merge → lead takes over at t=15, save 60 min.

**Pattern** (mandatory for any `run_in_background=true` task with expected wall-clock > 5 min):

```
t=0:   fire subagent (run_in_background=true)
t=5:   first check-in
       - bash: `git -C $worktree log --oneline -1` (any commits?)
       - bash: `git -C $worktree status --short` (any uncommitted changes?)
       - bash: `ps aux | grep -E "<task-pattern>" | grep -v grep | wc -l` (process alive?)
t=10:  second check-in (if t=5 had no progress OR bg > 5 min)
       - bash: `bun test` (tests passing? in worktree)
t=15:  third check-in (if still no completion)
       - bash: `bun run build` (build clean?)
       - bash: `git -C $worktree log --oneline -5` (commit count)
       - if ALL of: commits > 0, tests pass, build clean, NO merge → take over
t=20:  hard cap
       - if subagent still running, `background_cancel(taskId=...)` + take over
       - lead merges + pushes + audits + continues
```

**Lead judgment** at t=15: "Is subagent making progress OR stuck?" If `git log --oneline -5` shows new commits but no merge + no test pass → subagent done with implementation, stuck on final tool → take over immediately.

**R+ retro policy**: Track `time_to_first_subagent_check_in`. If > 10 min, retro flags it.

## Phase 2.5 pre-merge verification step (v5.3.3)

**Status**: APPLIED in v5.3.3. Replaces v5.3.2 SG.1 (partial application) with explicit pre-merge checks.

**Pre-merge verification protocol** (lead inline, mandatory after Phase 2 Dev):

```bash
# In main worktree, with Dev's worktree intact
cd /path/to/repo

# 1. File count deltas (sanity check)
git diff --stat <R-N-1-baseline>..<worktree-branch>

# 2. SHA verification (all Dev commits exist)
for sha in $(git -C $worktree log --format=%H <R-N-1-baseline>..HEAD); do
  git cat-file -e "$sha" 2>/dev/null || echo "MISSING: $sha"
done

# 3. Scenario count claim (R5 retro Gap 3 / R12 retro SG.1 — doc side-file drift)
#   REVERSE-VALIDATE before claiming any count
actual=$(grep -c '^  "[a-zA-Z0-9-]\+": { setup' scripts/test-review-ui/scenarios.mjs)
claimed=$(grep -oE '[0-9]+ git scenarios' README.md | head -1 | grep -oE '[0-9]+')
if [ "$actual" != "$claimed" ]; then
  echo "DRIFT: README claims $claimed, actual $actual"
fi

# 4. All 4 test gates pass
bun run check && bun run build && bun test && bun run scripts/test-review-ui/e2e.mjs

# 5. If all 4 pass → lead proceeds to Phase 2.6 (merge + push)
#    If any fails → write audit-blocked.md + user-gate + 1-line patch
```

**Automation** (v5.3.3): `scripts/pre-commit-audit.sh` codifies steps 1-4. Lead runs it before Phase 2.6.

## Phase 2.6 Lead Merge + Push (v5.3.3 NEW phase)

**Status**: APPLIED in v5.3.3. Codifies lead's responsibility for git ops.

**Workflow** (mandatory after Phase 2.5 PASS):

```bash
# 1. Switch to main worktree
cd /path/to/repo  # main worktree, not the dev worktree

# 2. Pull latest
git pull origin main --rebase  # if needed

# 3. Merge Dev branch
git merge --no-ff team-dev-loop-round-N-<slug> \
  -m "Round N: merge ... from team-dev-loop-round-N-<slug> (close #N1, #N2, ...)"

# 4. Push
git push origin main

# 5. Verify GH issue auto-close
gh issue list --state closed --label pm-manager-approved --limit 20
# All `close #N` in commit messages should auto-close

# 6. If any issue stays OPEN:
gh issue close <N> --comment "Closed via commit <SHA> in main"
```

**Why lead does this** (vs subagent): git ops are single-host stateful operations requiring auth, conflict resolution, remote sync awareness. Subagent tool framework is unreliable for these (R14 evidence: bg_2ab5b789 stuck 18 min on `git push`).

**Total time**: 2-3 min for the 6 steps. Vs subagent 18+ min stuck time in R14.

## Open considerations (v5.3.3 — RESOLVED)

- **Phase 2.5 timing inversion** (R12 Gap #13): RESOLVED via v5.3.3 mid-task check-in + pre-merge verification + Phase 2.6 lead merge. Full timing inversion (Phase 2.5 BEFORE Phase 2 Dev) deferred to v5.4+ IF drift incidents persist.
- **PMC Researcher force-review mode** (R12 retro SPG.1 related): RESOLVED via v5.3.3 lead-direct execution. Lead-direct PM Researcher = lead reviews citations inline, no subagent review step needed.
- Each role subagent gets ONE prompt and returns ONE result. No multi-turn.
- Lead inline takeover is a DESIGN FEATURE, not a rescue. See Section "Lead inline takeover protocol" below.

## Execution pattern (the actual round flow)

```typescript
// Round N — leader is primary chat (sisyphus)
const round = N
const roundDir = `.omo/round-${round}`

// === Round profile classification (lead applies BEFORE any phase) ===
// Read PM's `U_*` fields from brief.md. Convert to numeric `S_*` scores:
//   yes → 2, no → 0 (per U_size / U_files gradation table in loop-decision.md).
// Apply auto-classification rules:
//   1. U_behavior_shift / U_data_shape_breaking / U_installs_new_dep = yes, OR total ≥ 8 → "architecture"
//   2. U_user_visible = yes AND total ≥ 3 → "feature"
//   3. else → "bugfix"
// Use the profile to gate which phases run (see Per-phase execution table below).
// Skip phases are recorded in decision.md ## Skipped phases with reason.

// === Phase -0: Lead Sync (always run, cron-style entry-point hardening) ===
// Reference: references/sync-spec.md
// Run inline (no subagent):
//   1. git fetch origin
//   2. git status --porcelain (note dirty files)
//   3. git log origin/main..HEAD (note local ahead)
//   4. git log HEAD..origin/main (note remote ahead)
//   5. If remote ahead AND local clean → git pull --rebase origin main
//   6. If conflict / dirty+remote / diverged → HARD STOP, write .omo/round-N/sync-blocked.md, emit chat "[team-dev-loop] Round N sync blocked", exit round
//   7. Write .omo/round-N/sync-report.md with baseline main HEAD SHA
// After sync-report.md exists, continue to Phase 0.

// === Phase 0: PM Triage v5 (user-story advocate + competitor-driven) ===
const brief = await task({
  category: "unspecified-high",  // product judgment
  prompt: PM_TRIAGE_V5_PROMPT,   // from references/v5-prompts.md ## 1
})
// Writes: ${roundDir}/brief.md
//   - ## Competitor analysis  (NEW v5 — table of GitHub PR / GitLab MR / Gerrit / Phabricator / Sourcetree / etc.)
//   - ## Candidates ranked (3-5 user-stories: As / I want / So that + Product-value gate 3-test result + file:line evidence)
//   - ## User-impact profile (U_* fields: U_size, U_files, U_new_capability,
//     U_behavior_shift, U_user_visible, U_data_shape_breaking,
//     U_data_safety, U_installs_new_dep)
// PM does NOT estimate lines of code or file counts — that's lead's job.
// Backlog freshness check REMOVED from PM (moved to Planner Phase 0.75).

// === Phase 0.25 + 0.5: PARALLEL (v5.2 — R10 retro optimization) ===
// PM Researcher (verify competitor claims) and PM Manager (gate + auto-issue-open)
// have no data dependency on each other. Both consume brief.md. PM Manager can
// independently do pseudo-requirement checks + open GH issues without waiting for
// Researcher verification (Researcher verdict is advisory, not blocking).
// Saves ~3 min per round vs sequential.
const [pmResearcher, pmMgr] = await Promise.all([
  // === Phase 0.25: PM Researcher (NEW v5 — web-verifier of competitive claims) ===
  task({
    category: "unspecified-high",
    subagent_type: "librarian",  // external-doc + web-search specialist
    prompt: PM_RESEARCHER_PROMPT,  // from references/v5-prompts.md ## 1.5
  }),
  // === Phase 0.5: PM Manager gate v5 ===
  task({
    category: "ultrabrain",  // critical anti-pseudo-requirement reasoning
    prompt: PM_MANAGER_V5_PROMPT,  // from references/v5-prompts.md ## 2
  }),
])
// Writes (parallel):
//   ${roundDir}/competitor-landscape.md (PM Researcher)
//   ${roundDir}/pm-manager-review.md (PM Manager)
// PM Manager does NOT wait for Researcher's verdict — it gates based on brief.md alone.
// Researcher's competitor-landscape.md is consumed by Planner Phase 0.75 + Lead Phase 4 audit.
// If PM Researcher fails / times out, Planner still works (considers Researcher verdict as "missing" and proceeds conservatively).
// v5: NO askUser on REJECT / CLARIFY. REJECT → candidate removed. CLARIFY → PM Manager writes inline inference; if still CLARIFY after 2 attempts → REJECT.
// v5: auto-open gh issue create for APPROVED candidates (lead pre-creates labels in Phase -0 Sync — see sync-spec.md step 1.5)
// v5: cross-check PM Researcher competitor-landscape.md (advisory only, not blocking)
// v5: output ## Validated for next round section (Planner input)

// === Phase 0.5 → 0.75: Planner pre-synthesized input (NEW v5.3) ===
// Lead generates `.omo/round-N/planner-input.md` so Planner reads 1 file instead
// of 4-5. Saves ~1-2 min Planner context + reduces stale information.
// (R5 retro lens-context synthesis pattern, generalized to Planner.)
const plannerInput = `---
# Planner Input — Round N

## PM Manager Validated List (Phase 0.5)
| # | Title | Type | User-value | Issue# | File count | LOC est | Notes |
|---|---|---|---|---|---|---|---|
| ${validatedCandidates joined as markdown table rows}

## PM Researcher verdict (Phase 0.25, advisory)
${pmResearcher.verdict}: ${pmResearcher.reason}
Verified: ${pmResearcher.verified_count}, Unverified: ${pmResearcher.unverified_count}, Mischaracterized: ${pmResearcher.mischaracterized_count}

## Follow_up Candidates (filtered, aged_rounds ≤ 3)
${filteredFollowUpCandidates from proposals.jsonl last 10 rounds, excluding closed issues}

## Prior Round Summary (R-N artifacts)
- brief.md: <1-line summary of N-1 candidates>
- pm-manager-review.md verdict: <APPROVE/REJECT/CLARIFY for N-1>
- planner.md scope: <N-1's chosen candidates, file:line>
- decision.md verdict: <PASS/FAIL of N-1>
- rollup base SHA: <N-1's final commit, used for git cat-file -e>

## Hard Caps Reminder (v5.2)
- feature ≤ 3
- bugfix ≤ 5
- total ≤ 8
- polish quota ≤ 1
- architecture ≤ 1
---`
writeFile(`${roundDir}/planner-input.md`, plannerInput)

// === Phase 0.75: Planner (NEW v5 — autonomous scope selector) ===
const planner = await task({
  category: "deep",  // autonomous multi-step planning + ranking
  prompt: PLANNER_PROMPT,  // from references/v5-prompts.md ## 2.5
})
// **v5.3 input**: Planner reads `${roundDir}/planner-input.md` (pre-synthesized by lead)
// — NOT pm-manager-review.md + proposals.jsonl + GH issues + prior round artifacts
// (those are now consolidated into planner-input.md by lead inline step above)
// Pre-check: git cat-file -e on prior round SHAs (R3 fabrication defense extended to Planner)
// Backlog freshness check (moved from PM)
// Ranking + scope selection with HARD CAPS: feature≤3 / bugfix≤5 / total≤8 / polish≤1 / arch≤1
// Tie-breaker: aged_rounds ASC → user_value DESC → est_loc ASC
// STOP protocol: if 0 candidates → write .omo/round-N/planner-blocked.md, return verdict STOP
// Writes: ${roundDir}/planner.md
// Returns: { verdict: "PROCEED" | "STOP", scope: {...}, rationale, fresh_signal_triggered }
// v5: NO user pick. Planner decides autonomously. No escalation path.

// === Phase 1: Architect ===
const plan = await task({
  category: "ultrabrain",  // architecture decisions
  prompt: ARCHITECT_PROMPT,  // includes the user-picked candidate
})
// Writes: ${roundDir}/plan.md (decision-complete, ACs, file structure, worker checklist)

// === Phase 2: Dev ===
// v5.2: Per-profile timeout (R9 retro Gap L — actually applied v5.2, was a stale spec in v5.0/v5.1)
const devTimeoutMin = profile === "architecture" ? 45 : 30;
const dev = await task({
  category: "deep",  // autonomous end-to-end (worktree + tests + commit)
  timeout: `${devTimeoutMin}m`,  // v5.2: 45min for architecture, 30min for feature/bugfix
  prompt: DEV_PROMPT,        // includes brief + PM Manager review + plan
})
// Internal: creates worktree per project memory 372
// Internal: implements, runs tests, writes inline self-check into dev's return value
// (Dev does NOT write a separate dev-self-check.md — AC trace is appended to decision.md in Phase 4)

// === Phase 3a: Tester Review (orchestrator + 5 parallel lenses with mixed categories) ===
const review = await task({
  category: "deep",  // orchestrator: coordinate 5 lenses + synthesize test-report.md
  prompt: TESTER_REVIEW_PROMPT,  // internally fires 5 run_in_background=true with mixed categories:
                                 //   Lens Goal:   category: "quick"
                                 //   Lens QA:     category: "quick"
                                 //   Lens Code:   category: "ultrabrain"
                                 //   Lens Security: category: "ultrabrain"
                                 //   Lens Context: category: "artistry"
})
// Writes: ${roundDir}/review-goal.md, review-qa.md, review-code.md, review-security.md, review-context.md
// Writes: ${roundDir}/test-report.md (synthesis of 5 lenses)

// === Phase 3b: Tester Diff (uses /diff-review-dashboard on the diff) ===
const diff = await task({
  category: "unspecified-high",  // tool-invocation, no closer fit
  prompt: TESTER_DIFF_PROMPT,
})
// Writes: ${roundDir}/diff-report.md

// === Phase 3c: Tester Playwright (real browser walkthrough) ===
const playwright = await task({
  category: "visual-engineering",  // UI browser work
  prompt: TESTER_PLAYWRIGHT_PROMPT,
})
// Writes: ${roundDir}/playwright-report.md

// === Phase 3.5: PM Doc Writer ===
const doc = await task({
  category: "writing",  // documentation specialization
  prompt: PM_DOC_WRITER_PROMPT,
})
// Writes: ${roundDir}/doc-update-report.md
// Side effect: updates README.md / README.zh-CN.md / docs/screenshots/*.png

// === Phase 4: Decision (lead writes directly) ===
writeFile(`${roundDir}/decision.md`, decisionTemplate({ brief, pmMgr, dev, review, diff, playwright, doc }))
appendFile(`.omo/proposals.jsonl`, proposalsLineTemplate({ round, ...all verdicts }))

// === Phase 5: Commit + push ===
gitAdd([roundDir, "README.md", "README.zh-CN.md", "docs/screenshots/*"])
gitCommit(`Round ${round}: <one-line summary>`)
gitPush("origin", "main")   // no PR — this is a single-commit-per-round workflow
```

## Per-phase execution

For each phase, read the appropriate reference file for the exact prompt body:
- Phase -0 → `references/sync-spec.md`
- Phase 0/0.25/0.5/0.75 → `references/v5-prompts.md`
- Phase 1/2 + 5 lens → `references/phase-prompts.md` (v2 prompts, still valid)
- Phase 2.5 → `references/pre-commit-audit-spec.md`

Order is fixed (v5): **Phase -0 Sync → Phase 0 PM Triage v5 → Phase 0.25 PM Researcher → Phase 0.5 PM Manager v5 → Phase 0.75 Planner → Phase 1 Architect → Phase 2 Dev → Phase 2.5 Pre-Commit Audit → Phase 3a-c Tester → Phase 3.5 PM Doc Writer → Phase 4 Decision → Phase 4.5-4.9 lead-owned**. **No User Pick phase.**

**IMPORTANT**: phases marked with `bugfix` / `feature` / `architecture` are gated by the round profile — see "Round profile auto-classification" below. Lead should NOT call `task()` for phases that the profile says to skip.

**Test environment policy (R4 loop meta-review + playwright-cli integration, MANDATORY)**:
- **3a Tester Playwright** and **3.5 PM Doc Writer** (when capturing screenshots) use the **`playwright-cli` global command** (installed via `npm install -g @playwright/cli@latest`, requires Node 18+ via nvm). The bash tool calls `playwright-cli` directly. **NOT Playwright MCP** — playwright-cli is token-efficient (no accessibility tree in LLM context), has built-in session management (`playwright-cli -s=name`, `list`, `close-all`, `kill-all`), and prevents the page-leak + Chrome-accumulation pattern that R4 retro found.
- `playwright-cli` is at `$HOME/.nvm/versions/node/<version>/bin/playwright-cli` (path is Node-version-dependent) OR runnable via `bunx playwright`. Verify: `playwright-cli --version` OR `bunx playwright --version` → `0.1.x`. **If missing on a fresh machine, see `references/environment-setup.md` for install instructions** (e.g., `npm install -g @playwright/cli@latest`).
- **Test session lifecycle** (mandatory):
  1. **Pre-test cleanup** (mandatory, **macOS-safe pattern, NEW R18 retro**):
     ```bash
     # Universal pattern: works on macOS + Linux. AVOID `pkill -f chrome` (R5 Gap G: hangs 120s on macOS).
     # 1. Kill the persistent playwright-cli daemon (it owns the Chrome lifecycle)
     pkill -9 -f "cliDaemon" 2>/dev/null || true
     # 2. Kill Chrome processes spawned BY playwright-cli (only those with playwright_chromiumdev_profile in --user-data-dir).
     #    Does NOT touch user's manual Chrome. Safe on macOS (no --type=zygote there).
     pkill -9 -f "playwright_chromiumdev_profile-" 2>/dev/null || true
     # 3. Kill orphan mock-server (universal)
     pkill -9 -f "mock-server.py" 2>/dev/null || true
     # 4. Legacy Ubuntu pattern (kept for backward compat — no-op on macOS)
     pkill -9 -f "chrome.*--type=zygote" 2>/dev/null || true
     # 5. Port + Chrome count verification
     ss -ltn | grep -q :8890 && echo "port 8890 IN USE" || echo "port 8890 free"
     ps aux | grep -c "playwright_chromiumdev_profile-" | head -1   # should be 0
     ps aux | grep -c "cliDaemon" | head -1                          # should be 0
     ```
     **Why this pattern** (R18 retro): The old `pkill -9 -f "chrome.*--type=zygote"` only worked on Linux/Ubuntu (Chrome there spawns `--type=zygote` children). On macOS Chrome children are `--type=renderer`/`--type=gpu-process`/`--type=utility`, no `--type=zygote`, so the old command matched ZERO processes and Chrome accumulated across rounds. The new pattern targets (a) the persistent `cliDaemon` node process and (b) Chrome instances whose `--user-data-dir` contains the playwright-cli-marker substring `playwright_chromiumdev_profile-` — safe on both OSes, doesn't touch user's manual Chrome. See `references/environment-setup.md` § macOS-specific cleanup for the full rationale + per-OS process tree reference.
  2. **Pre-warm + goto pattern** (5.7x speedup measured): `playwright-cli open <url>` ONCE at the start of the test run (~1.5-2.5s cold start, one-time cost), then use `playwright-cli goto <url>` between scenarios (~65ms each, reuses the warm browser). **DO NOT call `playwright-cli close` between scenarios** — it kills the session and forces a 1.5-2.5s cold start for the NEXT scenario. If state isolation is needed between scenarios, use `playwright-cli localstorage-clear && playwright-cli cookie-clear` instead (fast, ~100ms).
  3. **Post-test cleanup** (mandatory): `playwright-cli close-all` + `playwright-cli kill-all` + kill mock server PID (record on start) + kill orphan Chrome + verify clean state (Chrome count = 0, port 8890 free). **NEVER end a Playwright test session without this step** — that's how the user-reported "machine freezes" happens.
- See `.opencode/skills/review-dashboard-ui-test/SKILL.md` for the exact commands per scenario, including the A/B test results that justify the pre-warm + goto pattern.

| Phase | Role | Subagent type | Default executor | Output file(s) | Profile gating |
|---|---|---|---|---|---|
| **-0** | **Lead Sync** (NEW v5) | (no subagent) | **lead inline** | `sync-report.md` (+ `sync-blocked.md` on HARD STOP) | **always run** (bugfix+feature+architecture) |
| 0 | **PM Triage v5** (competitor-driven) | `unspecified-high` | subagent | `brief.md` (## Competitor analysis + ## Product-value gate 3-test) | bugfix: **skip** / feature: run / architecture: run |
| **0.25** | **PM Researcher** (NEW v5 — web-verifier) | `unspecified-high` + `subagent_type: "librarian"` | subagent | `competitor-landscape.md` (verified/unverified/mischaracterized matrix) | bugfix: **skip** / feature: run / architecture: run |
| 0.5 | **PM Manager v5** (gate + auto-issue-opener) | `ultrabrain` | subagent | `pm-manager-review.md` + `gh issue create` calls + `## Validated for next round` | bugfix: **skip** / feature: run / architecture: run |
| **0.75** | **Planner** (NEW v5 — autonomous scope selector) | `deep` | subagent | `planner.md` (+ `planner-blocked.md` on STOP) | bugfix: **skip** / feature: run / architecture: run |
| ~~—~~ | ~~User pick candidate~~ (REMOVED v5) | — | — | — | — |
| 1 | Architect | `ultrabrain` | subagent (or lead for bugfix 1-para) | `plan.md` | bugfix: 1-para plan / feature: full plan / architecture: full plan + hyperplan |
| 2 | Dev | `deep` | subagent (or lead for trivial bugfix) | (worktree + code + tests; inline AC trace in return) | always run |
| **2.5** | **Lead Pre-Commit Audit** (NEW v5) | (no subagent) | **lead inline** | inline verdict in `decision.md`; `audit-blocked.md` on HARD STOP | **always run** (bugfix+feature+architecture) |
| 3a | Tester Review (5 lens parallel) | `deep` (orchestrator) + 5 internal lenses | **lead by default** (R4 retro: orchestrator subagent stalled 7+ min with 5 lens tasks idle; lead synthesizing `test-report.md` directly was faster and just as accurate) | `review-{goal,qa,code,security,context}.md` + `test-report.md` | bugfix: 3 lens (Goal+QA+Security) / feature+architecture: 5 lens |
|   | 3a-1 Lens Goal | `quick` (parallel) | subagent | `review-goal.md` | always if 3a runs |
|   | 3a-2 Lens QA | `quick` (parallel) | subagent | `review-qa.md` | always if 3a runs |
|   | 3a-3 Lens Code | `ultrabrain` (parallel) | subagent | `review-code.md` | bugfix: **skip** / feature+architecture: run |
|   | 3a-4 Lens Security | `ultrabrain` (parallel) | subagent | `review-security.md` | always if 3a runs |
|   | 3a-5 Lens Context | `artistry` (parallel) | subagent | `review-context.md` | bugfix: **skip** / feature+architecture: run |
| 3b | Tester Diff | `unspecified-high` | **lead by default; lead-parallel-after-3a with 3c + 3.5** (R5 retro Patch H: all 3 are lead tasks; lead writes all 3 in same response block after 3a synthesis) | `diff-report.md` | always run |
| 3c | Tester Playwright | `visual-engineering` | **lead by default; lead-parallel-after-3a with 3b + 3.5** (R4+R5 evidence: 2/2 subagent stalls — 7+ min and 12m+ min wasted. Lead takeover both times was 2-5 min. Subagent is unreliable in this environment for browser walkthroughs) | `playwright-report.md` | bugfix: **skip unless UI changed** / feature+architecture: run |
| 3.5 | PM Doc Writer | `writing` | **lead by default; lead-parallel-after-3a with 3b + 3c** (lead writes 3b+3c+3.5 in same response block — all 3 are lead tasks now) | `doc-update-report.md` (side effect: README + screenshots) | bugfix: 1-para README / feature+architecture: full README + screenshot |
| 4 | Decision | (no subagent) | **lead always** | `decision.md` | always run |
| 4.5 | **Round-end retrospective & close-out** (v5.4 NEW) | (no subagent) | **lead always** | `.omo/round-N/retro.md` | **always run** (mandatory; v5.4: retro-find + close-out combined — list loop-internal items, commit fixes in current worktree, document in `Closed in this round` section, verify `Open loop-internal at retro time` is EMPTY; non-empty = BLOCKED) |
| 4.6 | **Post-execution call-flow analysis** | (no subagent) | **lead always** | `.omo/round-N/post-exec-analysis.md` | **always run** (mandatory, R4 retro lesson — call-flow-focused: stalled subagents, lead takeovers, wasted time/tokens, NEW call-flow gaps not in retro) |
| 4.7 | **Loop self-check** (HARD GATE) | (no subagent) | **lead always** | `.omo/round-N/self-check.md` | **always run** (mandatory, hard gate before closure commit — verifies per-phase artifacts + closure sequence gates; MUST be PASS) |
| 4.8 | **Loop Summary Output** | (no subagent) | **lead always** | (chat response, NOT a file) | **always run** (mandatory, R7 retro Gap J — lead outputs 5-section summary as chat response BEFORE closure commit) |
| 4.9 | **Issue Auto-Close** | (no subagent) | **lead always** | (gh issue close calls, OR `gh issue list --state closed` verification only) | **always run** (R7 retro Gap K + R12 patch Gap #10 — primary mechanism: commit message syntax `close #N` auto-closes via GitHub, so lead runs `gh issue list --state closed --label pm-manager-approved` to **verify** all PM-Manager-approved issues moved to closed state. Manual `gh issue close <N> --comment "..."` only when commit-message syntax absent OR PM-Manager-approved issues still OPEN after commit.) |
| — | Skill-update patch (if retro OR post-exec surfaced skill gaps) | (no subagent) | **lead always** | `.opencode/skills/team-dev-loop/**` | **always run if retro or post-exec surfaces skill gaps** |
| — | Append audit log | (no subagent) | **lead always** | `.omo/proposals.jsonl` (1 line) | always run |

**v5 hard-stop table** (replaces v2 askUser):

| Failure | Hard-stop file | Round outcome |
|---|---|---|
| Phase -0 Sync failure (network / conflict / divergence) | `.omo/round-N/sync-blocked.md` | Round N ends; next round retries sync |
| PM Researcher finds ≥1 MISCHARACTERIZED + Planner rejects | `.omo/round-N/planner-blocked.md` | Round N ends; PM Triage re-run next round |
| Planner cannot select any candidate (validated list empty / all STALE / all capped) | `.omo/round-N/planner-blocked.md` | Round N ends; explore() fresh-investigation next round |
| Phase 2.5 Pre-Commit Audit FAIL (SHA missing OR claim unverified) | `.omo/round-N/audit-blocked.md` | Round N ends; closure commit BLOCKED |
| **Phase 4 closure artifact shortage** (SG.R26.1) — `ls -1 .omo/round-N/ \| wc -l` < profile-gated threshold | `.omo/round-N/artifact-shortage.md` | Round N ends; re-run missing phase or mark skipped in `decision.md ## Skipped phases` |
| **Phase -0 husky not wired** (SG.R26.2) — `.husky/pre-commit` exists but `node_modules/husky` or `.git/hooks/pre-commit` missing AND `bun install --frozen-lockfile` fails | `.omo/round-N/husky-blocked.md` | Round N ends; manually run `bun install` (or fix husky config) then retry |
| **Phase 4 runtime load failure** (SG.R27.1) — `scripts/verify-plugin-load.mjs` (or equivalent) exits non-zero: (1) import throws, OR (2) `module.default.id` empty / `module.default.server` not a function, OR (3) `hooks.config()` registers no commands, OR (4) `<plugin>/opencode.json#id` missing | `.omo/round-N/load-blocked.md` | Round N ends; fix the runtime compat / export shape / hook contract / path-plugin metadata, rebuild, re-run the verification, then retry |

**Rollback protocol** (NEW v5): Lead can run `git revert <round-sha>` from chat (manual operator action). Document the revert in next round's `decision.md` ## Rollback section.

**Default executor rationale (v3 lesson + R4+R5 + v5 updates)**: R3 had 5/7 lead takeovers (71%), R1 had 3/7 (43%). The skill already framed takeovers as "DESIGN FEATURE, not rescue", but didn't say which phases are "typically lead-written" by default. The new `Default executor` column makes it transparent: **3b Tester Diff is `git diff main` + write report, no fresh subagent context needed → lead by default**. **3c Playwright is lead by default** (R4+R5 evidence: 2/2 subagent stalls — 7+ min and 12m+ min wasted. Lead takeover both times was 2-5 min. Subagent is unreliable in this environment for browser walkthroughs). 0/0.25/0.5/0.75/1/2 stay as subagents because the work is non-trivial; 3a (lead by default since R4 retro Gap 2), 4/4.5/4.6/4.7/4.8/4.9/patches/audit stay as lead because they need full context. **NEW v5**: Phase -0 Sync + Phase 2.5 Pre-Commit Audit are lead inline (no subagent) — they are mechanical gate-keeper checks (git fetch / git cat-file -e) that require shell context. Lead can always override the default (per the existing "Lead inline takeover protocol" section).

**3b + 3.5 parallel after 3a** (R5 retro optimization, lead-only): Both 3b (Tester Diff) and 3.5 (PM Doc Writer) are now lead tasks by default. They do NOT depend on 3c (Playwright). **Lead SHOULD write 3b and 3.5 in the same response block after 3a completes** — saving 3-4 min per round vs. sequential execution. The phase order in skill text is still 3a → 3b → 3c → 3.5 for documentation purposes; in actual execution, lead can produce 3b and 3.5 artifacts immediately after 3a synthesis without waiting for 3c.

**Pipeline 3a synthesis** (R5 retro optimization): The 5 lens tasks are launched in parallel via `Promise.all`, but lead waits for the SLOWEST lens to complete before starting test-report synthesis. R5 evidence: QA lens took 10m 33s; other 4 lenses completed in 5-8 min — 2-3 min wasted waiting. **Lead SHOULD pipeline**: as each lens output lands, read it + append to a partial synthesis file (`.omo/round-N/test-report.md` with `LEAD_SYNTHESIZED_PIPELINE` placeholder rows). When all 5 complete, finalize the verdict + summary tables. Saves 2-3 min per round for rounds where lens verdicts vary in completion time by >2 min.

**Lead pre-task context synthesis for 5 lens** (R5 retro optimization): Each of the 5 lens tasks re-reads the same context (brief.md, plan.md, file diff, AC list, commit SHAs). With 5 lenses each doing ~30s of context warm-up, total ~2.5 min is wasted on duplicate reads. **Lead MAY pre-synthesize a context doc** (`.omo/round-N/lens-context.md`) before firing lenses, containing: (a) sub-candidate summary with file:line evidence, (b) AC list grouped by sub-candidate, (c) commit SHAs to verify, (d) the key files to inspect (collectWorking, detectLanguage, drawer HTML, etc.). Each lens prompt then references this doc instead of re-discovering context. Saves ~2 min per round.

**Backlog-freshness gate (Round 3 lesson, MOVED to Planner in v5)**: In v2, this check ran in PM Triage. In v5, **the backlog-freshness check moved to Phase 0.75 Planner** — PM Triage now does competitor analysis (## Competitor analysis + ## Product-value gate 3-test) instead. The check itself is unchanged: if 3+ candidates in `follow_up_candidates` have `aged_rounds >= 3` (i.e. they have appeared in 3+ previous rounds' follow-up lists without being selected), Planner triggers a **fresh-investigation signal**: lead spawns `explore` subagent for self-investigation (read README + recent code + recent commits + GH issues) before Planner's final scope selection. See `references/v5-prompts.md` ## 2.5 Planner prompt § Backlog freshness check for the full spec.

**Why different categories per role** (per user feedback on category-specialization): each role has a different work shape — product judgment (`unspecified-high`), critical reasoning (`ultrabrain`), autonomous end-to-end (`deep`), mechanical checks (`quick`), soft/uncoventional judgment (`artistry`), UI walkthrough (`visual-engineering`), documentation (`writing`). Picking the right sub-model per role gives better quality per token than a one-size-fits-all `unspecified-high` for everything.

## Round profile auto-classification (run before Phase 0)

Each round is auto-classified into 1 of 3 profiles based on **8 quantitative user-impact signals** — NOT lead judgment. The profile gates which phases run (see "Profile gating" column in the per-phase table above).

**Two-stage signal flow** (PM stays user-focused; lead does scope scoring):
1. **PM Triage (Phase 0)** emits `U_*` fields (user-impact framing: As/I want/So that user-stories, plus 8 boolean/sized `U_*` fields).
2. **Lead (Phase 4 prep)** converts `U_*` → numeric `S_*` scores (yes → 2, no → 0) and applies auto-classification rules.

This separation prevents PM from sliding into developer thinking (Round 1+2 evidence showed PM framing candidates as "bug fixes" instead of user-stories — that was the bug that v3 fixes).

### 3 profiles (reframed in user terms)

| Profile | What the user sees | Example |
|---|---|---|
| **bugfix** | User's existing behavior was wrong/unreliable; we made it correct. No new capability. | Round 1: user lost review history to a power-loss race → we made state.json atomic |
| **feature** | User gets a brand-new capability they didn't have before. | Adding "Resolved filter" button to conversation panel |
| **architecture** | User's data shape changes (e.g., existing state.json becomes incompatible), or a structural shift with install/dep impact. | Refactoring state.json schema; adding a new dependency |

### PM-side signals (`U_*`, user-impact — PM emits these)

Lead reads these from `brief.md` `## User-impact profile` section.

| Signal | User-impact meaning | no → score | yes → score |
|---|---|---|---|
| `U_size` | User-visible scope (PM's estimate, NOT lines of code) | small (1-2) → 0 | medium (3-6) → 1 / large (7+) → 2 |
| `U_files` | User-visible surface area | narrow (1) → 0 | small (2-3) → 1 / medium (4-6) → 2 / wide (7+) → 3 |
| `U_new_capability` | User gets a brand-new feature? | no → 0 | yes → 2 |
| `U_behavior_shift` | User-visible behavior fundamentally changes? | no → 0 | yes → 3 |
| `U_user_visible` | User notices the change at all (README/docs/UI)? | no → 0 | yes → 2 |
| `U_data_shape_breaking` | User's existing data files become incompatible? | no → 0 | yes → 2 |
| `U_data_safety` | User's data becomes safer (atomic write, recovery)? | no → 0 | yes → 1 |
| `U_installs_new_dep` | User's `npm install` adds new packages? | no → 0 | yes → 2 |

Total = sum of all 8 → 0-16 range, typical 0-8.

### Auto-classification rules (deterministic — first match wins)

```yaml
1. IF U_behavior_shift==yes OR U_data_shape_breaking==yes OR U_installs_new_dep==yes OR total >= 8
   → profile = "architecture"
2. ELSE IF U_user_visible=yes AND total >= 3
   → feature
3. ELSE
   → bugfix
```

### Per-profile Phase 2 (Dev) timeout guidance (R9 retro Gap L — APPLIED in v5.2)

**Why**: R9 Dev timed out at 30 min despite partial commits being intact. Architecture profile with 3 file surfaces + Gap J mandatory walkthrough naturally takes longer than feature profile.

**Per-profile guidance** (lead APPLIES via `timeout` parameter when launching Phase 2):

| Profile | Expected Phase 2 wall-clock | Recommended timeout | Status in v5.2 |
|---|---|---|---|
| **bugfix** | 5-15 min | 20 min | applied (`timeout: "20m"`) |
| **feature** | 15-25 min | 30 min | applied (`timeout: "30m"`) |
| **architecture** | 30-45 min | **45 min** | **applied** (`timeout: "45m"`) — was stale in v5.0/v5.1 |

**v5.2 implementation**: SKILL.md Phase 2 code pattern now uses:
```typescript
const devTimeoutMin = profile === "architecture" ? 45 : (profile === "feature" ? 30 : 20);
const dev = await task({ category: "deep", timeout: `${devTimeoutMin}m`, prompt: DEV_PROMPT, ... });
```

**R9 evidence** (before fix): 30-min timeout hit with 2 product commits intact + partial Commit 3. Lead completed remaining work in ~5 min. Net: R9 still shipped but with lead assistance. Net cost: ~5 min extra (vs. clean 35-40 min Dev round).

**R10 evidence** (after fix): architecture round used 30min timeout (v5.1 still didn't honor 45min). Dev completed 3 candidates but no commits before timeout. Lead recovered cleanly. v5.2 fix prevents this.

## Lightweight round mode (NEW v5.2 — for trivial changes)

**Why**: v5 SKILL.md requires 11-phase pipeline for every round. For trivial changes (1-line README typo, .opencode/skills/ internal tweak, doc-only update), this is overkill (~30-50 min overhead).

**When to use**: lead detects ANY of:
- `git diff main...HEAD --stat` shows <10 lines changed across <3 files
- Profile is bugfix with 1-file surface
- Change is documentation-only (README, CHANGELOG, .opencode/skills/, docs/)
- No src/ files touched
- No schema change
- No new dependency

### Auto-trigger conditions for lightweight mode (NEW v5.3.12, R35 retro)

**R35 retro surfaced**: R35 housekeeping round had 5 atomic commits but net +162/-64 lines across housekeeping (no `src/` changes) — should have triggered lightweight automatically, saving 7-10min of unnecessary artifact writing.

**Rule (mandatory, NEW v5.3.12)**: lightweight mode triggers AUTOMATICALLY when ALL of:
1. `git diff main...HEAD --stat` shows <10 lines net (after commits) across <3 files
2. No `src/**/*.ts` or `src/**/*.html` modifications (dev-process only)
3. Round profile is bugfix or polish (NOT feature or architecture)

**When triggered, skip these phases**:
- Phase 0.25 (PM Researcher)
- Phase 3a-3 (3 lens reviews: Goal/QA/Code) → replaced by single combined `review-*.md`
- Phase 3.5 Doc Writer (skip if no README changes)
- Phase 4.5 Retro → combined with Phase 4.6 Post-exec into single `retro-post-exec.md` (see Patch 3 below)
- Phase 4.7 Self-check → skip (lightweight rounds use auto-self-check via SG.R26.1)

**Output**: 6 artifacts instead of 13:
- `sync-report.md`, `brief.md`, `pm-manager-review.md`, `planner.md`, `plan.md`
- `test-report.md` (single combined review)
- `decision.md`, `retro-post-exec.md` (combined), closure artifacts

**R35 retro evidence** (would have triggered auto-lightweight):
- 5 atomic commits, net +162/-64 lines, all dev-process (no `src/` modifications)
- Should have triggered auto-lightweight → save 7-10min artifact writing

**Lightweight protocol** (skip PM Triage + Planner + 5 lens):
```markdown
## Lightweight round

- Trigger: <why this round qualifies for lightweight>
- Skipped phases: PM Triage (0), PM Researcher (0.25), PM Manager (0.5), Planner (0.75), Architect (1), Tester Review (3a), Tester Diff (3b), Playwright (3c), Doc Writer (3.5)
- Single commit: <sha>
- Lightweight acceptance criteria: <1-2 bullets>
```

**Guard rails**: even in lightweight mode, lead MUST:
- Run Phase -0 Sync (baseline + tool pre-flight)
- Run Phase 2.5 Pre-Commit Audit (R3-fabrication defense)
- Emit Phase 4.8 Loop Summary (R7 Gap J)
- Apply hard STOP on failure (sync, audit)

**Cannot use lightweight for**: architecture profile / new dependency / multi-file feature / schema change.
- Or use the lead-recovery pattern (R9) which proved robust

**Override rule**: lead MAY override auto-classification if user chat explicitly states scope (e.g. "treat as architecture review"). Document the override in `decision.md` ## Round profile section.

**Reclassification mid-round**: if work scope expands (e.g. bugfix touches persistence), lead MAY reclassify mid-round. Document the reclassification in `decision.md`.

**Full details + Round 1 retroactive scoring**: see `references/loop-decision.md` § "Round profile auto-classification".

## Lead inline takeover protocol (DESIGN FEATURE, not rescue)

When a subagent returns one of:
- Empty result (e.g. tester-diff generated empty SVG screenshots — Round 1 evidence)
- "BLOCKED" / dead-end (e.g. tester-doc-writer hit tool-invocation dead-end — Round 1 evidence)
- Context exhaustion (e.g. tester-playwright exceeded context — Round 1 evidence)
- Explicit `verdict: FAIL`

Lead takes over:

1. **Write** `.omo/round-N/lead-takeover-<role>.md` (5-10 lines, explaining why takeover happened, timestamp, original subagent return value)
2. **Write the deliverable** directly (e.g. `diff-report.md`) — do NOT retry the subagent. Round 1 evidence: subagent retry rate was 0% successful.
3. **Continue** the next phase (PM Doc Writer does NOT wait for lead takeover, because Doc Writer inputs come from already-passed brief + test-report + playwright-report)
4. **List** lead takeovers in `decision.md` end section: `## Lead takeovers this round: [diff, playwright, ...]`
5. **Count** takeovers in `proposals.jsonl`: `lead_takeovers: ["tester-diff", "tester-playwright"]`

**Rationale**: v1 called this "rescue" and treated it as a failure mode. v2 reframes it as a designed feature because (a) Round 1 showed 3 of 7 phases required it, (b) the alternative — retrying subagents — had 0% success rate, (c) lead has full context to write the deliverable directly.

## Stall detection and emergency lead takeover (R5 retro Gap 5 + Gap 4)

**Why**: R5 Phase 3c subagent (`bg_d6504730`) stalled 12+ minutes — launched mock-server + Chrome + cliDaemon but produced 0 artifacts. Lead waited for system-reminder that never came (subagent was alive but not making progress). Without this rule, lead has no protocol for "subagent alive, no output, indefinitely".

**Detection protocol** (mandatory for all `run_in_background=true` tasks):

1. **5-minute heartbeat check**: After 5 minutes from task launch, lead should check for artifacts using `ls`, `git status`, or process inspection:
   - For Playwright task: `ls .omo/round-N/playwright-report.md docs/screenshots/r5-*.png 2>&1`
   - For 5-lens task: `ls .omo/round-N/review-*.md 2>&1`
   - For Dev task: `git -C $WORKTREE_DIR log --oneline -5`
2. **Process inspection**: `ps aux | grep -E "<task-pattern>" | grep -v grep` — if processes exist but no artifacts, that's a stall.
3. **If stall detected**: Cancel via `background_cancel(taskId="bg_...")`, kill orphan processes (Chrome, mock-server, cliDaemon), and lead takes over using the established pattern (e.g., for Playwright: pre-warm + goto + walkthrough).

**Pre-test cleanup before Playwright tasks** (R5 retro Gap 4 + **R18 macOS fix**):

The Playwright Phase 3c prompt must include in its pre-test cleanup step:
```bash
# 1. Kill orphan Playwright MCP processes from prior sessions (R5 retro evidence: 2 leftover npm-exec playwright-mcp processes from earlier sessions interfered with R5's cliDaemon)
pkill -9 -f "playwright-mcp" 2>/dev/null || true
pkill -9 -f "@playwright/mcp" 2>/dev/null || true
# 2. Kill the persistent playwright-cli daemon (R18 macOS fix — without this, cliDaemon survives across rounds and accumulates Chrome)
pkill -9 -f "cliDaemon" 2>/dev/null || true
# 3. Kill Chrome processes spawned BY playwright-cli (R18 macOS-safe pattern — targets playwright_chromiumdev_profile --user-data-dir, leaves user's manual Chrome alone)
pkill -9 -f "playwright_chromiumdev_profile-" 2>/dev/null || true
# 4. Legacy Ubuntu pattern (kept for backward compat — no-op on macOS)
pkill -9 -f "chrome.*--type=zygote" 2>/dev/null || true
# 5. Kill orphan mock-server
pkill -9 -f "mock-server.py" 2>/dev/null || true
# 6. Port + Chrome count verification
ss -ltn | grep -q :55006 && echo "port 55006 in use" || echo "port 55006 free"
ps aux | grep -c "playwright_chromiumdev_profile-" | head -1   # should be 0
ps aux | grep -c "cliDaemon" | head -1                          # should be 0
```

**R18 macOS rationale**: The old `pkill -f "chrome.*--type=zygote"` matched 0 Chrome processes on macOS (macOS Chrome spawns `--type=renderer`/`--type=gpu-process`/`--type=utility`, no zygote). User-reported symptom: "macOS opens 10+ windows across rounds" — root cause was cliDaemon (PID persists across rounds because `playwright-cli close-all` only closes browser pages, NOT the daemon itself) + Chrome instances with `--user-data-dir=/var/folders/.../playwright_chromiumdev_profile-*` (one per session, never reaped). Both fixed by the new pattern.

**Playwright minimum + quota-override** (R14 retro SG.5 — codified above): Default minimum is 1 screenshot per feature. Quota-override exception applies only when user signals quota exhaustion explicitly + all 4 test gates pass + Dev self-check has been lead-verified. Document skip in retro + add to next round's follow-up queue.

**Dev returns but merge/push incomplete recovery pattern** (R14 retro SG.2 — codified above): When Dev bg task ends with `Status: running` but all commits + tests + build pass in worktree, lead cancels bg + manually completes merge + push. Full recovery pattern in `## Dev returns but merge/push incomplete recovery pattern` (new section above).

**R5 evidence**: bg_d6504730 stalled 12+ min, lead cancelled at 14:31, walked through 5 scenarios in ~2 min via direct `playwright-cli` calls. 5.7x speedup consistent with the established pre-warm + goto pattern.

## Standardized output formats (CANONICAL — must match exactly)

### Auto-generated combined retro+post-exec artifact (NEW v5.3.12, R33/R34 retro)

**R33/R34 retro surfaced**: `retro.md` and `post-exec-analysis.md` have ≥70% content overlap (both list ACs, commits, call flow timeline, skill gaps, followup, action items). Writing both is 5-10min of duplicate work per round.

**Rule (mandatory, NEW v5.3.12)**: for rounds with ≤5 ACs OR bugfix profile, lead MAY combine `retro.md` + `post-exec-analysis.md` into a single `retro-post-exec.md` file with 6 sections:

```markdown
# Round <N> Retrospective + Post-execution (combined)

## TL;DR
<1-2 sentences: round outcome + biggest lesson>

## Successes
<3-5 bullets, file:line evidence>

## Failures / lessons
<3-5 bullets, symptom → root cause → fix>

## Skill gaps found
<0-N bullets or "None — this round was a clean execution">

## Followup items
<0-N bullets>

## Action items for next round
<ordered list>
```

**When to apply**: any round with ≤5 ACs OR bugfix profile OR lightweight mode triggered.
**When NOT to apply**: rounds with full 5 lens reviews needing separation between content lessons (Retro) and call-flow lessons (Post-exec).

**R35 retro evidence** (would have combined retro+post-exec):
- R35 housekeeping: 5 atomic commits, 0 subagent dispatches, 0 test regressions
- retro.md and post-exec-analysis.md had ≥70% overlap → wasted 5-10min of duplicate writing

**Rule**: Phase 4.5 (Retro), 4.6 (Post-exec), 4.7 (Self-check) outputs are **canonical** — they MUST follow the templates below verbatim. Different LLM models (Claude / GPT / Gemini / local) produce the same output format so the user can read them consistently across rounds.

**Why this rule**:
- The user reviews `.omo/round-N/{retro.md, post-exec-analysis.md, self-check.md}` every round. If section names or table formats drift between rounds (or between models), the user's mental model breaks
- Templates are **fields of data**, not narrative essays. Each section has a specific role:
  - **Retro** = "what we learned about the CONTENT we shipped" (TL;DR, Successes, Failures, Skill gaps, Followup, Action items)
  - **Post-exec** = "what we learned about the CALL FLOW we ran" (TL;DR, Call-flow timeline, Task invocations summary, Per-task review, Wasted analysis, New skill gaps)
  - **Self-check** = "did every required step actually run" (Per-phase verification, Profile-gated checks, Closure sequence gates, Verdict)
- **Enforcement**:
  - Do NOT add new sections (the user reviews every round; new sections = noise)
  - Do NOT rename sections (different LLMs use different synonyms; canonical names prevent this)
  - Do NOT skip sections (if a section has no content, write "N/A" or "None — ..." rather than omitting)
  - Do NOT add prose paragraphs to table-only sections (stay in the table format)
  - Bullet lists in "Successes" / "Failures" / "Wasted analysis" must each have file:line evidence (no "we did X well" without showing where to verify)

**The 3 canonical templates** (all marked `<!-- CANONICAL TEMPLATE — DO NOT MODIFY -->` below):
- **Phase 4.5 Retro template** → see "Round-end retrospective" section below
- **Phase 4.6 Post-exec template** → see "Post-execution call-flow analysis" section below
- **Phase 4.7 Self-check template** → see "Loop self-check" section below

**Verification command** (lead runs this at the end of each round to verify the output is canonical):
```bash
# Each file should have these section markers in this exact order
grep -c "^## TL;DR$"        .omo/round-N/retro.md  # = 1
grep -c "^## Successes"     .omo/round-N/retro.md  # = 1
grep -c "^## Failures"      .omo/round-N/retro.md  # = 1
grep -c "^## Skill gaps"    .omo/round-N/retro.md  # = 1
grep -c "^## Followup"      .omo/round-N/retro.md  # = 1
grep -c "^## Action items"  .omo/round-N/retro.md  # = 1
# Same checks for post-exec-analysis.md (6 sections) and self-check.md (3 sections + verdict)
```

If any count is 0 or > 1, the output is non-canonical — the lead rewrites the file to match the template exactly.

## Closure sequence (every round)

When all 7 phases terminal (each `task()` either returned or was taken over):

1. **Verify** expected output files exist (mandatory, **SG.R26.1** — replaces the prior rule that retro templates hardcoded "16+ / 19 / 14+ artifacts" without running `ls`):
   ```bash
   ACTUAL=$(ls -1 .omo/round-N/ 2>/dev/null | wc -l)
   # Profile-gated thresholds (matches per-phase table line 1115):
   case "$PROFILE" in
     bugfix)        EXPECTED=3  ;;  # ≥ 3 of 13 expected files
     feature)       EXPECTED=8  ;;  # ≥ 8 of 13 expected files
     architecture)  EXPECTED=13 ;;  # all 13 expected files
   esac
   if [ "$ACTUAL" -lt "$EXPECTED" ]; then
     echo "ARTIFACT SHORTAGE: actual=$ACTUAL, expected≥$EXPECTED (profile=$PROFILE)"
     echo "If a phase was skipped legitimately, mark it in decision.md ## Skipped phases"
     echo "Otherwise, HALT and write .omo/round-N/artifact-shortage.md"
     exit 1
   fi
   # Embed the ACTUAL count into the closure docs (kills template-string lying):
   sed -i "s/16+ artifacts written/${ACTUAL} artifacts written (verified via ls -1)/g" .omo/round-N/retro.md .omo/round-N/post-exec.md 2>/dev/null
   sed -i "s/19 artifacts (sync/${ACTUAL} artifacts (verified via ls -1)/g" .omo/round-N/experience-summary.md 2>/dev/null
   sed -i "s/14+ artifacts written/${ACTUAL} artifacts written (verified via ls -1)/g" .omo/round-N/retro.md 2>/dev/null
   sed -i "s/17 artifacts (sync/${ACTUAL} artifacts (verified via ls -1)/g" .omo/round-N/experience-summary.md 2>/dev/null
   ```
   **R21-R31 retrofit**: 11 consecutive rounds' retros HARDCODED "16+ artifacts written" / "19 artifacts" / "14+ artifacts" without running `ls`. SG.R26.1 enforces `ls -1 .omo/round-N/ | wc -l` AS PART OF the closure commit gate — no template string can pass through to the closure commit without matching the actual `ls` output. If the gate fails, write `.omo/round-N/artifact-shortage.md` and HARD STOP.
2. **Write** `decision.md` using the template in `references/loop-decision.md` § Decision template
3. **Append** one line to `.omo/proposals.jsonl` (see § Decision log in loop-decision.md)
4. **Run Phase 4.5 — Round-end retrospective** (see next section) BEFORE commit
5. **Apply skill patches** for any "skill gap" items the retro surfaced (see next section)
6. **Commit** all round-N files + any side effects (README updates, screenshots, code in worktree, skill updates):
   ```bash
   git add .omo/round-${N}/ README.md README.zh-CN.md docs/screenshots/ src/ scripts/ .opencode/skills/team-dev-loop/
   git commit -m "Round ${N}: <one-line summary>

   Co-Authored-By: ..."

   git push origin main   # no PR — user reviews the commit on main directly
   ```
7. **No team_delete** (v2 has no team to delete)

## Round-end retrospective & close-out (Phase 4.5 — MANDATORY every round, NO DEFERRAL — v5.4)

Phase 4.5 has TWO halves:

1. **Retro-find (reflect)**: list loop-internal items discovered during the round.
2. **Close-out (act)**: for EACH item, commit a fix in the current round's worktree BEFORE writing retro.md.

The loop is not closed until the lead writes `.omo/round-N/retro.md` AND closes ALL loop-internal items in the current worktree (no "Action items for next round", no deferral, no escape hatch). **Every round ends in a clean loop state.**

**When**: Always, after Phase 4 Decision, BEFORE the closure commit. Skipping the retro OR leaving items unclosed is a hard-block — the loop cannot end on `decision = ship-to-main` without it.

**Why mandatory (revised v5.4)**:
- Without retro, the same loop frictions repeat across rounds. Round 1 spent 90+ min on the Bun.write mocking problem; Round 2 had the React wrong-command-C pitfall; Round 3 had the `ctx.client.app.log` harness limitation. Each was a one-round discovery with no in-band propagation.
- Without close-out (v5.4 lesson, R32–R41 evidence): retro findings get DEFERRED to next round via the old "Action items for next round" section. R37–R41 shipped ZERO product features for 5 consecutive rounds because retro findings (housekeeping, skill patches, branch cleanup) kept queuing instead of closing. **v5.4 fix**: kill the deferral pattern entirely. If retro finds it, retro closes it.
- The loop's purpose is to compound improvements AND ship features. Without close-out, it only compounds improvements and stops shipping.

**Close-out contract (v5.4 — NO ESCAPE HATCH)**:

Phase 4.5 close-out's only job is: **close every loop-internal item surfaced by retro-find, in the current worktree, before writing retro.md**.

```
while retro has unclosed loop-internal item:
    close it (commit fix in current worktree)
    record commit SHA in retro.md "Closed in this round" section
until no unclosed items remain
```

- **NO** "can't fit in budget" branch.
- **NO** "escalate to user" branch.
- **NO** "defer to next round" branch.
- **NO** "砍 scope" branch.
- **Time is not a variable.**

**If retro-find surfaces something genuinely too large** (e.g., 4-commit runtime compat refactor like R32): close it anyway — that's what R32 did. A round can be entirely close-out work if needed. SHIP verdict still applies; product backlog carries forward separately.

**Phase 4 verdict interaction**: if any loop-internal item remains unclosed at retro time, **Phase 4 verdict = BLOCKED**. Round cannot SHIP. This is enforced by the Self-check (Phase 4.7) gate.

**Loop-internal classification** (these MUST go through close-out, NEVER through deferral):

- Skill patches (skill gaps found during round)
- Housekeeping (stale branches, worktrees, scripts that should be removed/updated)
- Doc drift (README/docs that contradict shipped code)
- Missing artifacts (retro.md sections, post-exec.md sections, etc.)
- Hook/script updates (pre-commit, verify scripts)
- Skill doc updates (SKILL.md / phase-prompts.md / loop-decision.md content drift)

**NOT loop-internal** (goes to product backlog, NEVER through close-out):

- Feature work (user-visible product features)
- Bug fixes (user-facing bugs)
- UX improvements

**Output `.omo/round-N/retro.md` (no blank sections, canonical template below)**:

<!-- CANONICAL TEMPLATE — DO NOT MODIFY (Phase 4.5 Retro v5.4) -->

```markdown
# Round <N> Retrospective

## TL;DR
<1-2 sentences: total round outcome + biggest lesson>

## Successes (what worked, keep doing)
<3-6 bullets, each grounded in file:line evidence>

## Failures / lessons (what hurt)
<3-6 bullets, each with: symptom → root cause → fix done now>

## Skill gaps found (changes that would have prevented the issue)
<0-N bullets, each is a candidate skill patch. If empty, write "None — this round was a clean execution of the existing skill, no gap surfaced.">
For each gap:
- **Symptom** (file:line of the issue)
- **Existing-skill-text** that didn't catch it (file:line of skill)
- **Patch applied (commit SHA)** — v5.4 NEW: every gap MUST have a closed commit SHA. If patch not yet applied, this gap belongs in "Open loop-internal at retro time" with BLOCKED reason.

## Followup items
<0-N bullets, each is a concrete PRODUCT carry-over task (feature/bugfix only, NEVER loop-internal)>

## Closed in this round (loop-internal) — v5.4 NEW
<numbered list. Each item: description + commit SHA that closed it. If empty, write "None — clean execution, no loop-internal items surfaced.">
Example:
1. Skill patch SG.R29.10 (close-out step contract) — closed in commit abc1234
2. Stale branch team-dev-loop-round-36-ac2 deleted — closed in commit def5678

## Open loop-internal at retro time — v5.4 NEW
<numbered list. MUST be EMPTY for Phase 4 SHIP verdict. If non-empty, Phase 4 = BLOCKED.>
If empty, write "None — all loop-internal items closed in this round (per v5.4 no-deferral rule)."
If non-empty, each entry must include:
- **Item**: <description>
- **Reason cannot close in this round**: <technical blocker, not "out of time">
- **Closure plan**: <concrete next action — usually: re-run retro close-out, do NOT defer>
```

## Post-execution call-flow analysis (Phase 4.6 — MANDATORY every round, R4 loop meta-review lesson)

The retro (Phase 4.5) is content-focused: what did we ship, what worked, what failed, what skill gaps. **The post-execution analysis (Phase 4.6) is call-flow-focused**: which `task()` calls had problems (stalled, returned empty, blocked on user input, returned wrong-shape results, were canceled, etc.), which phases were lead-taken-over, where did the orchestrator bottleneck appear, where did context budget explode, and what workflow gaps the call flow itself revealed.

**When**: Always, after Phase 4.5 Retro + skill-patch application, BEFORE the closure commit. Phase 4.6 is part of the closure sequence.

**Why mandatory** (R4 loop meta-review):
- R3 retro captured content lessons (4 skill patches: worktree path templating, multi-round AC test design, lead-takeover defaulting, backlog-freshness gate) but did NOT capture call-flow lessons. R4 then re-encountered:
  - PM Triage reading R3's fabricated audit-trail as ground truth (because no pre-check on prior round's commit SHAs) — wasted ~3 min
  - 5 lens tasks stalling 7+ min with no output (because no per-lens timeout) — wasted ~7 min
  - User-pick gate stalling 4 non-response turns (because no auto-pick policy) — wasted ~4 lead turns
  - Doc edits in main workdir then cp'd to R4 worktree (because workflow didn't specify R4 worktree for product work) — wasted ~1 min
- The retro's "Skill gaps found" was overloaded — content gaps got priority over call-flow gaps. Separating the two ensures both get attention.

**Output `.omo/round-N/post-exec-analysis.md` (no blank sections, canonical template below)**:

<!-- CANONICAL TEMPLATE — DO NOT MODIFY (Phase 4.6 Post-exec v5.4) -->

```markdown
# Round <N> Post-execution Call-Flow Analysis

## TL;DR
<1-2 sentences: total round call-flow outcome + biggest call-flow lesson>

## Call-flow timeline
<numbered list of every `task()` call + every lead action in chronological order. For each: timestamp (or "turn N"), task category, status (completed / takeover / stalled / canceled / failed), brief description, evidence file:line.>

## Task invocations summary
<count of total task() calls, count of completed, count of lead-takeover, count of stalled, count of canceled, count of failed-launch.>

## Per-task review (each non-completed task)
For each task that was lead-takeover, stalled, canceled, or failed-launch:
- **Task ID** (if applicable)
- **Phase** (0 / 0.5 / 1 / 2 / 3a / 3b / 3c / 3.5)
- **What happened** (1-2 sentences)
- **Symptom** (file:line of evidence)
- **Root cause** (1-2 sentences)
- **Fix done now** (if any)
- **Skill/workflow patch** (if surfaced; reference the gap by name)

## Wasted token/time analysis
<count of wasted subagent calls, count of wasted minutes, count of wasted lead turns. Examples: "PM Triage re-run after R3 fabrication discovered = 3 min wasted" or "5 lens tasks stalled = 7 min wasted".>

## New skill gaps (NOT covered by Phase 4.5 retro)
<0-N bullets, each a call-flow-specific gap. If empty, write "None — this round's call flow was clean.">
For each gap:
- **Symptom** (file:line of the task that stalled/took-over)
- **Existing-skill-text** that didn't catch it (file:line of skill)
- **Patch applied (commit SHA)** — v5.4 NEW: every gap MUST have a closed commit SHA. If patch not yet applied, this gap belongs in "Open loop-internal at retro time" with BLOCKED reason.

## Followup items
<0-N bullets, each is a concrete PRODUCT carry-over task (feature/bugfix only, NEVER loop-internal)>

## Closed in this round (loop-internal) — v5.4 NEW
<numbered list. Each item: description + commit SHA that closed it. If empty, write "None — clean execution, no loop-internal items surfaced.">

## Open loop-internal at retro time — v5.4 NEW
<numbered list. MUST be EMPTY for Phase 4 SHIP verdict. If non-empty, Phase 4 = BLOCKED.>
If empty, write "None — all loop-internal items closed in this round (per v5.4 no-deferral rule)."
If non-empty, each entry must include:
- **Item**: <description>
- **Reason cannot close in this round**: <technical blocker, not "out of time">
- **Closure plan**: <concrete next action — usually: re-run retro close-out, do NOT defer>
```

**Workflow distinction from Phase 4.5 retro**:
- Phase 4.5 retro: "did the round ship the right thing?" (content)
- Phase 4.6 post-exec: "did the round's call flow run cleanly?" (process)

Both are mandatory. Both are lead-written. Both can surface skill patches. The two-step split ensures process improvements (call-flow) don't get lost in content review (shipped-features).

**R4 evidence for this split**: R4 retro captured the "R3 audit-trail fabricated" content lesson (Gap 1 was about PM Manager's pre-check). It did NOT capture the "PM Triage should ALSO do the pre-check" call-flow lesson (the PM Triage pre-check is now Patch 1 in the R4 post-exec). The split would have caught both.

## Loop self-check (Phase 4.7 — MANDATORY every round, hard gate before closure commit)

**Why**: R3 fabricated its audit-trail (claimed a SHIP that didn't happen, lead never caught it until R4). R4 had 3 lead takeovers and almost shipped without a written self-check. Each round, the lead can drift from the loop's spec (skip a phase, forget a file, miss a profile-gated check). Phase 4.7 is the **hard gate that catches this before the closure commit**.

**When**: ALWAYS, AFTER Phase 4.6 Post-exec, BEFORE the closure commit. The closure sequence is:
1. Phase 4 Decision → `decision.md` written
2. Phase 4.5 Retro → `retro.md` written
3. Phase 4.6 Post-exec → `post-exec-analysis.md` written
4. **Phase 4.7 Self-check** → `self-check.md` written, **must be PASS** before commit
5. Apply skill patches (if any from retro or post-exec)
6. Commit + push

**Output `.omo/round-N/self-check.md`** — a checklist with PASS/FAIL per row:

<!-- CANONICAL TEMPLATE — DO NOT MODIFY (Phase 4.7 Self-check) -->

```markdown
# Self-check — Round N

> Run by lead at end of every loop. Hard gate: if any FAIL, BLOCK the closure commit and fix.

## Per-phase verification (every required phase ran, every required artifact exists)

| Phase | Required artifact | Required | Status | Evidence (file:line / value) |
|---|---|---|---|---|
| **-0 Sync (NEW v5)** | `.omo/round-N/sync-report.md` | **yes (always run)** | PASS/FAIL | sync-report.md has Network PASS + Local state + Remote state + Action taken + Baseline main HEAD SHA |
| 0 PM Triage | `.omo/round-N/brief.md` | yes | PASS/FAIL | file exists, has ## Competitor analysis (v5), has ## Candidates ranked (3-5), has ## Product-value gate 3-test (v5), has ## Self-Critique, has U_* profile |
| **0.25 PM Researcher (NEW v5)** | `.omo/round-N/competitor-landscape.md` | feature/arch only | PASS/N/A/FAIL | verified/unverified/mischaracterized matrix per candidate, ≥1 verification source cited per claim |
| 0.5 PM Manager | `.omo/round-N/pm-manager-review.md` | yes | PASS/FAIL | verdict APPROVE / REJECT / CLARIFY (with pre_check PASS), gh issue create calls recorded, ## Validated for next round table |
| **0.75 Planner (NEW v5)** | `.omo/round-N/planner.md` | feature/arch only | PASS/N/A/FAIL | ## Ranking table, ## Scope selected (≤3f+5b+8t+polish≤1), ## Decision rationale, tie-breaker applied |
| 1 Architect | `.omo/round-N/plan.md` | feature/arch only | PASS/N/A/FAIL | 7 sections present (Goal, ACs, File changes, Steps, Test plan, Risk register, Hand-off) |
| 2 Dev | worktree commit + AC trace in decision.md | yes | PASS/FAIL | commit SHA exists in worktree, AC trace has all N ACs with PASS/FAIL evidence |
| **2.5 Pre-Commit Audit (NEW v5)** | inline verdict in decision.md | **yes (always run)** | PASS/FAIL | SHAs verified (≥N PASS), claims reverse-verified (≥N PASS); on FAIL → audit-blocked.md exists |
| 3a Tester Review | `.omo/round-N/test-report.md` + 5 review-*.md or lead-takeover note | yes | PASS/FAIL | test-report.md has 5/5 lens verdicts, 5 review-*.md files OR `.omo/round-N/lead-takeover-tester-review.md` exists |
| 3b Tester Diff | `.omo/round-N/diff-report.md` | yes | PASS/FAIL | diff-report.md has no CRITICAL findings, file:line evidence for each change |
| 3c Tester Playwright | `.omo/round-N/playwright-report.md` OR lead-takeover note OR profile-skipped justification | UI changed OR feature+arch profile | PASS/N/A/FAIL | walkthrough + screenshot + verdict, OR lead-takeover note, OR explicit skip justification |
| 3.5 PM Doc Writer | `.omo/round-N/doc-update-report.md` | yes | PASS/FAIL | sections added/modified, screenshots captured, walkthrough validated |
| 4 Decision | `.omo/round-N/decision.md` | yes | PASS/FAIL | SHIP/CONTINUE/STOP verdict, AC trace, lead takeovers list, dev self-check, ## Sync section, ## Planner section, ## Pre-Commit Audit section |
| 4.5 Retro & close-out | `.omo/round-N/retro.md` | yes (mandatory, NO DEFERRAL v5.4) | PASS/BLOCKED | all sections present (TL;DR, Successes, Failures, Skill gaps, Followup, **Closed in this round**, **Open loop-internal at retro time**); `Open loop-internal at retro time` MUST be empty for PASS — otherwise BLOCKED (Phase 4 verdict) |
| 4.6 Post-exec | `.omo/round-N/post-exec-analysis.md` | yes (mandatory, R4 retro) | PASS/BLOCKED | all sections present (TL;DR, Call-flow timeline, Task invocations summary, Per-task review, Wasted analysis, New skill gaps, **Closed in this round**, **Open loop-internal at retro time**); `Open loop-internal at retro time` MUST be empty for PASS — otherwise BLOCKED (Phase 4 verdict) |

## Profile-gated checks (skip if profile says skip — these are N/A, not FAIL)

| Phase | Bugfix | Feature | Architecture | This round's profile | Status |
|---|---|---|---|---|---|
| Architect full plan (Phase 1) | 1-para | full | full + hyperplan | (from decision.md) | PASS/N/A/FAIL |
| Hyperplan (external architecture review) | skip | skip | run | | N/A |
| External review (extra code lens) | skip | skip | run | | N/A |
| Lens #3 Code | skip | run | run | | PASS/N/A/FAIL |
| Lens #5 Context | skip | run | run | | PASS/N/A/FAIL |
| Tester Playwright (Phase 3c) | skip unless UI | run | run | | PASS/N/A/FAIL |
| PM Doc Writer (Phase 3.5) | 1-para | full + screenshot | full + screenshot | | PASS/N/A/FAIL |

## Closure sequence gates

| Step | Status | Evidence |
|---|---|---|
| All expected output files exist for the profile (≥4/17 bugfix, ≥10/17 feature, 17/17 arch) — v5 added sync-report.md + competitor-landscape.md + planner.md | PASS/FAIL | `ls .omo/round-N/ | wc -l` |
| `decision.md` SHIP verdict (or STOP / BLOCKED with reason) | PASS/FAIL | grep "## Verdict" decision.md |
| `.omo/proposals.jsonl` R-N line appended | PASS/FAIL | `tail -1 .omo/proposals.jsonl` parses + has correct round number |
| Skill patches applied (if retro OR post-exec surfaced gaps) | PASS/FAIL/N/A | git log of skill-update commits |
| **Phase 4.8 Loop Summary** emitted as chat response BEFORE the closure commit (R7 Gap J) | PASS/FAIL | visible in lead's chat response before `git commit` |
| **Phase 4.9 Issue Auto-Close** (R7 Gap K + R12 patch Gap #10) — primary: commit message `close #N` auto-closes via GitHub; lead verifies via `gh issue list --state closed --label pm-manager-approved`. Manual `gh issue close <N>` only if any pm-manager-approved issue still OPEN after commit. | PASS/N/A/FAIL | `gh issue list --state closed --label pm-manager-approved` shows N issues closed (where N = # of PM Manager opened issues from `## Validated for next round`) |
| Closure commit (this self-check passes BEFORE the commit) | PENDING → DONE | git log of the round's closure commit |
| **v5 hard-stop check**: NO `sync-blocked.md` / `audit-blocked.md` / `planner-blocked.md` exists (if any exists, round was blocked — closure commit should NOT have happened) | PASS/FAIL | `ls .omo/round-N/ | grep -E "(sync\|audit\|planner)-blocked"` returns empty |

## Self-check verdict

**PASS** — all required phases ran, all expected artifacts present, no skipped steps detected.

**OR** **FAIL** — the following required steps are missing or incomplete:
- <list of failures with file:line / what's missing>

If FAIL: **the closure commit is BLOCKED**. Fix the missing artifact(s) (re-run the missing phase, re-take-over the missing deliverable, or update `decision.md` to mark the phase as legitimately skipped per profile rules). Then re-run this self-check.

## Self-check checklist the lead must verify

- [ ] **Phase -0 sync-report.md** exists + has Network PASS + Baseline main HEAD SHA (v5)
- [ ] Phase 0 brief.md exists + has all 7 required sections (Title, Source, User pain, **Competitor analysis** (v5), Candidates ranked, Recommended candidate, Self-Critique, U_* profile)
- [ ] **Phase 0.25 competitor-landscape.md** exists IF profile is feature/architecture (v5)
- [ ] Phase 0.5 pm-manager-review.md exists + has APPROVE/REJECT/CLARIFY verdict + pre_check PASS + gh issue create calls + ## Validated for next round
- [ ] **Phase 0.75 planner.md** exists IF profile is feature/architecture + has ## Ranking + ## Scope selected (caps respected) + ## Decision rationale (v5)
- [ ] Phase 1 plan.md exists IF profile is feature/architecture (skip for bugfix)
- [ ] Phase 2: worktree commit exists in git, AC trace in decision.md has all N ACs with PASS/FAIL evidence
- [ ] **Phase 2.5 Pre-Commit Audit** PASS (inline verdict in decision.md; SHAs verified; claims reverse-verified) — if FAIL, audit-blocked.md exists and closure commit should be BLOCKED (v5)
- [ ] Phase 3a test-report.md exists + 5/5 lens verdicts + per-lens source (lens-task or LEAD_SYNTHESIZED)
- [ ] Phase 3b diff-report.md exists + no CRITICAL findings
- [ ] Phase 3c playwright-report.md OR lead-takeover-tester-playwright.md OR profile-skipped justification
- [ ] Phase 3.5 doc-update-report.md exists + sections + walkthrough validated
- [ ] Phase 4 decision.md exists + SHIP/CONTINUE/STOP verdict + AC trace + lead takeovers + dev self-check + ## Sync section + ## Planner section + ## Pre-Commit Audit section
- [ ] Phase 4.5 retro.md exists + all sections, no blanks + `Open loop-internal at retro time` is EMPTY (BLOCKED otherwise — v5.4 no-deferral rule)
- [ ] Phase 4.6 post-exec-analysis.md exists + all sections, no blanks + `Open loop-internal at retro time` is EMPTY (BLOCKED otherwise — v5.4 no-deferral rule)
- [ ] Phase 4.5 close-out sub-step actually committed fix(es) to current worktree (verify via `git log main..HEAD --oneline` in current worktree, every loop-internal item in retro.md "Closed in this round" section has a corresponding commit SHA)
- [ ] `.omo/proposals.jsonl` R-N line appended (5 fields: round, timestamp, pm_source, brief_excerpt, final_outcome)
- [ ] `git log --oneline -1` shows the round's closure commit (post-self-check)

## Lead's required action after self-check

- **If all PASS**: continue to closure commit (skill patches if any, then git add + commit + push)
- **If any FAIL**: do NOT commit. Fix the missing artifact (re-run the missing phase via `task()` call, or write the missing file directly, or amend `decision.md` to mark the phase as legitimately skipped per profile rules). Re-run this self-check. Loop until PASS.

**Failure modes this gate prevents**:
- R3 audit-trail fabrication (commit SHAs in decision.md don't exist in git) — would be caught by Phase 2's "worktree commit exists" check
- R4's "auto-pick after 4 non-response turns" not documented — would be caught by Phase 4's "lead takeovers list" check
- Future round silently skipping Phase 4.5 retro or Phase 4.6 post-exec — would be caught by the corresponding row
- Future round shipping without `self-check.md` itself — impossible by definition (this file is the self-check)

## Loop Summary Output (Phase 4.8 — MANDATORY every round, R7 retro Gap J)

**Why**: R7 user feedback: "你现在一轮做完我都不知道你改了什么，提升了什么，仓库有什么变化". Lead was completing rounds silently (between Phase 4.7 PASS and the closure commit message), so the user had no visible summary of what shipped until they ran `git log` themselves. R7 retro Gap J fixes this by making the Loop Summary a MANDATORY phase with a specific output format.

**When**: After Phase 4.7 Self-check PASS, BEFORE the closure commit. The Loop Summary is part of the response to the user — the user MUST see it before the commit lands.

**Output format** (canonical structure, 5 sections, no blanks):

```markdown
# Round <N> Loop Summary

## 1. 改了什么 (What changed)
<file:line table of changes — file path, change description, +/- LOC>
<Total LOC change: e.g., "+572 insertions / -15 deletions across 8 files">
<Screenshots / new files / new test files listed>

## 2. 提升了什么 (What improved)
<功能层面: new capabilities, bug fixes, UX improvements>
<质量层面: test coverage, e2e scenarios, build/lint/typecheck, Playwright screenshots>
<skill 层面: any skill patches from this round>

## 3. 仓库变化 (Repo state)
<git log last N commits (post-merge)>
<file count change: src/ +N, e2e +N, screenshots +N>
<test count: unit +N (was X, now Y), e2e +N (was X, now Y)>
<backlog state: 0 bugfixes / 1 fresh user-story / etc.>

## 4. 优化收敛状态 (Optimization convergence)
<comparison table: R5 baseline | R6 | R(N)>
<Speedup factor vs R5 baseline>
<Patch status: how many active, any new this round>

## 5. 接下来 (What's next)
<R(N+1) candidates per backlog-freshness gate>
<Open questions / follow-ups>
```

**Enforcement**:
- Lead MUST output this summary to the user as a chat response BEFORE the closure commit
- The summary is NOT a file artifact — it's a chat response (so the user sees it directly)
- If lead is silent after self-check PASS, the user has no visibility (R7 user complaint)
- The summary should be CONCRETE (file paths, line numbers, commit SHAs, counts) — not vague ("we improved quality")
- The summary should be BATCHED (all 5 sections in one response) — not split across multiple chat messages
- Cite real evidence: `git log --oneline -5`, `wc -l <file>`, `bun test <file>` output, file:line citations from decision.md
- This summary is for the USER (not for the audit trail) — the audit trail is in `.omo/round-N/decision.md` + `.omo/proposals.jsonl` (already produced)

**Chat-output style — gap #9 clarification (R12 patch)**:

- **In-flight phase transition** (Phase N → Phase N+1): lead emits **0 to 1 lines** of status. NO multi-paragraph filler. Project memory 1800's "stay silent" rule applies here (the framework fires system-reminder instead; lead doesn't need to).
- **User-gate wait** (e.g., waiting for `go` after Plan surface, or `fix` after Audit FAIL): lead emits **1+ lines** describing what is being awaited + acceptable user responses (e.g., "等 `go` / `go+adjust` / `hold`. 5 min 后 auto-default `go` 按 plan 启动。"). R12 user complaint: 5x terse `等。` acks without clarity triggered "你在等什么" + "需要我输入什么" queries. The opt-in auto-pilot pattern (Gap #8 patch above) makes this explicit.
- **Phase transition with no output needed**: lead emits nothing. The framework fires system-reminder naturally.
- **Default rule (when in doubt)**: emit 1 line stating exactly what user input would unblock (concrete, not vague). Never emit "等。", "等...", "wait", "still blocked" without the next step.

**R7 evidence**: R7 completed in 33m 49s, but the user had to ask "这一轮 Post execution 是不是依然没有做呢?" before getting any visibility into what shipped. The Loop Summary at the end of the round would have shown:
- 2 sub-candidates shipped (AbortController + UI hint)
- 79/79 unit tests + 17/17 e2e scenarios
- 1 new skill gap (Gap I) applied
- 5 lead takeovers
- All within 33m 49s (1.8x speedup vs R5)
- WITHOUT the user needing to ask.

**Apply to R8+**: Lead MUST output the Loop Summary chat response after Phase 4.7 PASS, before the closure commit. The summary should be visible to the user in their chat client. Lead should NOT be silent between self-check PASS and the commit.

## Skill-update rule (when retro or post-exec surfaces skill gaps) — v5.4 NO DEFERRAL

If the retro's "Skill gaps found" section is non-empty OR post-exec's "New skill gaps" section is non-empty:

1. **Apply the patches in the current round's worktree** (v5.4 NEW) — close-out sub-step inside Phase 4.5 retro + Phase 4.6 post-exec. Do NOT defer to next round. The patches are committed to `.opencode/skills/team-dev-loop/` (SKILL.md, references/loop-decision.md, references/phase-prompts.md, docs/team-dev-loop.md).
2. **Verify** in Phase 4.7 self-check: `Open loop-internal at retro time` section in BOTH retro.md AND post-exec-analysis.md MUST be empty. Non-empty = BLOCKED (Phase 4 verdict).
3. **Commit and push** the skill patches together with the closure commit (no separate "next round" ceremony).
4. **Record** the skill-updates commit SHAs in the current round's `retro.md` "Closed in this round" section, so the lineage is traceable.

**Why v5.4 reversed this rule**: previously skill patches were "the highest-priority deliverable of the next round, ahead of any user-picked candidate" — this created the deferral loop that R37–R41 evidence exposed (5 consecutive rounds shipping ZERO product features). v5.4 closes skill patches in the SAME round they surface.

The recursive rule remains: **the loop improves the skill, the improved skill improves the loop**. But the timing is now same-round, not next-round.

## End-of-round gap-fix (SG.R19.8 — SUPERSEDED by v5.4 close-out)

**Status (v5.4)**: SG.R19.8's intent is preserved, but its escape hatches are KILLED. v5.4 close-out (inside Phase 4.5 retro + Phase 4.6 post-exec) is now the canonical mechanism. This section is retained for historical context only.

**Why v5.4 superseded SG.R19.8**: SG.R19.8 had three escape hatches that re-enabled deferral:

1. "gap requires > 20 min" → allowed time-based deferral
2. "depends on external sync" → allowed indefinite deferral
3. "blocked by user choice" → allowed lead to push to user instead of closing

R37–R41 evidence: these escape hatches were triggered repeatedly, producing 5 consecutive rounds with ZERO product features. v5.4 removes all three. Time is not a variable. External sync is not a blocker. User choice is not an escape hatch — only "this round is fully close-out work" is acceptable.

**v5.4 canonical mechanism** (replaces SG.R19.8):

- Phase 4.5 retro-find + close-out: list loop-internal items, commit fixes in current worktree, document in retro.md "Closed in this round" + verify "Open loop-internal at retro time" is EMPTY.
- Phase 4.6 post-exec-find + close-out: same pattern for call-flow gaps.
- Phase 4.7 self-check: BLOCKED if any "Open loop-internal at retro time" section is non-empty.

**Historical context (SG.R19.8 retained for reference)**:

Why this rule was created (R+ user directive, 2026-06-30): "每一轮 loop 的最后,要自问,当前这轮有什么 gap 然后修复,这个是强制执行的。确保每一轮 loop 的效果都更优。这样 loop 本身的问题在收尾阶段解决,每一轮开始的关注点都在功能需求和功能缺陷上。"

Translation: At the end of every loop round, lead MUST self-ask "what gaps does this round have?" and **FIX THEM** in the same round. Mandatory. Loop's own problems get solved in the tail-end phase. Each round starts with pure focus on feature requirements and feature bugs.

R19 evidence (where this was first applied): 7 skill gaps + AC1.2 PARTIAL fixed in-round via R+ retro follow-up. ~30 LOC of code + ~150 LOC of doc updates, ~45 min total. The intent was correct. The escape hatches were the bug.

**Migration to v5.4**: when starting a new round, lead should follow v5.4 close-out (inside Phase 4.5/4.6) instead of running a separate "End-of-round gap-fix step" after self-check. The work is the same; only the timing and the elimination of escape hatches differ.

## Phase 2.6 explicit rebuild checklist (NEW R20 retro SG.R20.1 — APPLIED, deferred embed by R22 retro)

**Why** (R20 retro F.1): SG.R19.1 was correct ("rebuild in MAIN, not worktree"), but the rebuild step wasn't part of Phase 2.6's explicit checklist. R20's lead-direct inline fix caught the stale dist in Phase 3c walkthrough (10965 kB main vs 10974 kB worktree, R20 features missing from main dist). Caught in 2 min — much cheaper than rediscovery, but should be prevented not discovered.

**Rule** (mandatory, SG.R20.1): Phase 2.6 (Lead Merge + Push) MUST execute the following 5-step checklist before proceeding to Phase 3a:

```bash
# Step 1: Merge dev worktree branch into main (no-ff)
git merge --no-ff team-dev-loop-round-N-<branch> \
  -m "Round N: <one-line summary> (close #N1, #N2, ...)"

# Step 2: Rebuild in MAIN worktree (NOT dev worktree) — SG.R19.1 + SG.R20.1
cd <main worktree>          # CRITICAL: main, not the dev worktree
bun run build                # refresh dist/ui/* for mock-server

# Step 3: Verify new features are in dist (1-line sanity check)
grep "<feature-marker>" dist/ui/*.js  # should return matches

# Step 4: Push to origin
git push origin main

# Step 5: Verify GH auto-close
gh issue list --state closed --label pm-manager-approved
```

If Step 3 returns no matches, the rebuild in Step 2 didn't include the new commits (e.g., wrong worktree). Re-run Step 2 from main.

**F.1 evidence (R20)**: Initial Phase 2.5 audit built dist/ in worktree. Phase 2.6 merged but didn't rebuild. Phase 3c Playwright walkthrough showed 0 matches for R20 feature markers in dist. Lead-direct inline rebuild fixed in 2 min. With SG.R20.1, this gap is prevented — Phase 2.6 explicitly triggers rebuild + verification BEFORE Phase 3c.

**R22 + R23 evidence**: SG.R20.1 applied correctly in R22 + R23. No stale dist in Phase 3c walkthroughs. 0 occurrences of the R20 F.1 gap class.

## Bilingual lockstep pre-commit verify (NEW R22 retro SG.R22.1 — APPLIED, deferred embed by R22 retro)

**Why** (R21 + R22 retro F.1): Both R21 docs commit (`93bc1c7`) and R22 docs commit (`36f69fa`) succeeded for English README but the parallel zh-CN visual section edits **failed silently** (Edit tool returned "Could not find oldString" without error). Caught post-commit via manual review; repair commit `614806e` (R22) closed the gap. This is exactly the failure pattern SG.R19.8 was added to prevent.

**Rule** (mandatory, SG.R22.1): After EVERY doc commit (Phase 3.5 Doc Writer + Phase 4 Decision), BEFORE pushing, run `grep -c` pre-commit verification:

```bash
# For each new section/feature added in the doc commit
NEW_SECTION="Bulk delete recent searches"
echo "README.md count: $(grep -c "$NEW_SECTION" README.md)"
echo "README.zh-CN.md count: $(grep -c "$(zh-equivalent)" README.zh-CN.md)"

# Counts MUST match (1=1). If not, file a repair commit immediately.
```

Or as a one-liner:
```bash
git diff --staged -- README.md README.zh-CN.md | grep "^+### " | \
  while read -r new_section_en; do
    # Extract section title from English
    title=$(echo "$new_section_en" | sed 's/^+### //')
    # Count in both files
    en=$(grep -cF "$title" README.md)
    zh=$(grep -cF "$(echo "$title" | sed 's/Settings panel/设置面板/; s/Bulk delete/批量删除/')" README.zh-CN.md)
    [ "$en" = "$zh" ] || echo "BILINGUAL MISMATCH: $title (en=$en zh=$zh)"
  done
```

**Block Phase 4 Decision until bilingual lockstep verified**.

**F.1 evidence (R22)**: R22 ship `36f69fa` added "Clear recent searches in one click" to README.md but zh-CN visual section "一键清空最近搜索" silently failed (Edit tool returned "Could not find oldString"). User noticed post-merge via manual review; repair commit `614806e` (`docs(r22-zh-fix): add missing zh-CN visual sections for R21+R22 (bilingual lockstep repair)`) closed the gap.

**R23 evidence**: SG.R22.1 applied successfully. Pre-commit `grep -c` verification showed all 3 counts match (1=1, 1=1, 1=1) on first try. Zero silent failures.

## Worktree env check at Phase -0 (NEW R22 retro SG.R22.2 — APPLIED, deferred embed by R22 retro)

**Why** (R22 retro F.1): R22 subagent #46 reported "458 pass / 3 fail" instead of expected 504/0. Root cause: `git worktree add` does NOT auto-inherit `node_modules` from main. Worktree tests fail with `Cannot find module '@opencode-ai/plugin'` (or similar) until node_modules is set up. Caught in 2 min via re-running with symlink fix; could have been prevented with explicit pre-flight.

**Rule** (mandatory, SG.R22.2): Phase -0 (Lead Sync) MUST execute the following worktree environment checks BEFORE any test run:

```bash
# Step 1: Create R-round worktree (if not already)
git worktree add -b team-dev-loop-round-N-<branch> \
  "$HOME/.worktrees/team-dev-loop-round-N" \
  origin/main

# Step 2: Symlink node_modules from main (FASTER than bun install)
ln -s /Users/yangweibin/Projects/opencode-review-dashboard/node_modules \
  "$HOME/.worktrees/team-dev-loop-round-N/node_modules"

# Step 3: Housekeeping — remove stale worktrees from prior rounds (>=3 rounds old)
for old in ~/.worktrees/team-dev-loop-round-{N-3,N-2,N-1}; do
  [ -d "$old" ] && git worktree remove "$old" --force
done

# Step 4: Verify
cd "$HOME/.worktrees/team-dev-loop-round-N"
ls -la node_modules | head -1  # MUST show symlink to main
pwd  # MUST show worktree path, not main
```

**Block Phase 2 Dev subagent launch until worktree env verified**.

**F.1 evidence (R22)**: Subagent #46 reported test failure count (458/3) inconsistent with expected (504/0). Root cause traced to missing node_modules. Symlink from main → 504/0 immediately. Caught in-flight.

**R23 evidence**: SG.R22.2 applied at Phase -0. 4 stale worktrees removed (R19/R20/R21). node_modules symlinked. Pre-commit audit Fast Gate 2 immediately showed 538/538 (not 458/461 like R22 subagent #46).

## Subagent worktree-per-Edit verification (NEW R24 retro SG.R24.1 — APPLIED, R23+R24 recurring pattern)

**Why** (R24 retro F.1 + R23 retro F.1): BOTH R23 subagent #48 and R24 subagent #49 wrote files to BOTH the worktree AND the main project directory, despite v5.3.7 SG.R22.2 embed which explicitly says "WRITE TO WORKTREE DIRECTORY ONLY" + "cd to worktree first". Root cause: SG.R22.2 embed is INSUFFICIENT because:

1. Subagent starts in main directory by default (not worktree)
2. Subagent may write to either path depending on internal state
3. Pre-flight check (SG.R19.4) only verifies at START, not AFTER each Write/Edit
4. Result: main has uncommitted changes blocking Phase 2.6 merge; fixed via `git stash push -u` + merge + drop (data loss risk if stash dropped accidentally)

**Rule** (mandatory, SG.R24.1): Phase 2 Dev subagent prompt MUST include explicit per-Edit verification. The embed of SG.R22.2 is NOT enough — subagent needs explicit instruction to verify `pwd == <WORKTREE_PATH>` AFTER EVERY Write/Edit call:

```bash
# WRONG: trust subagent to stay in worktree
# Subagent may write to main dir accidentally

# RIGHT: explicit per-Edit verification in subagent prompt
After EVERY Write/Edit, run:
  pwd
And verify pwd == /Users/yangweibin/.worktrees/team-dev-loop-round-N
If pwd is different (e.g., main dir), STOP and report to lead.

# EVEN BETTER: use absolute paths in Write/Edit tool calls
# e.g., Write("/Users/yangweibin/.worktrees/team-dev-loop-round-N/src/file.ts", ...)
# instead of Write("src/file.ts", ...)
```

**Updated subagent prompt template** (append to MANDATORY PRE-FLIGHT section):

```bash
## MANDATORY PRE-FLIGHT (SG.R19.4 + SG.R22.2 + SG.R24.1)

# Before ANY work:
cd /Users/yangweibin/.worktrees/team-dev-loop-round-N
pwd   # MUST be worktree path

# BEFORE EVERY Write/Edit:
pwd   # MUST still be worktree path
# If pwd shows main directory, STOP and report to lead

# Use absolute paths in Write/Edit:
# Write("/Users/yangweibin/.worktrees/team-dev-loop-round-N/<file>", ...)
```

**F.1 evidence (R23)**: Dev subagent #48 wrote `src/ui/recent-searches-bulk.test.ts` (new file) to main directory, then committed from worktree. Result: main had uncommitted changes blocking Phase 2.6 merge. Fixed via `git stash push -u` + merge + drop.

**F.1 evidence (R24)**: Dev subagent #49 wrote 5 files (`src/ui/app.ts`, `src/ui/diff-virtualization.test.ts`, `src/ui/diff-virtualization.ts`, `src/ui/i18n.test.ts`, `src/ui/i18n.ts`) to BOTH worktree AND main directory, despite explicit "WRITE TO WORKTREE DIRECTORY ONLY" instruction. Fixed via `git stash push -u` + merge + drop. Same R23 pattern — embedding SG.R22.2 is NOT enough.

**R25 prevention**: Apply SG.R24.1 to subagent prompts. Add explicit per-Edit `pwd` verification + absolute paths.

## Pre-commit SG.R22.1 verify gate (NEW R25 retro SG.R25.1 — APPLIED, R25 gap-fix precedent)

**Why** (R25 retro F.1): R25 doc edit had 2 missing visual sections (English `### Diff virtualization for 1000+ line files` retroactively removed + zh-CN `### 批量标记侧边栏文件已审查` never added). Oracle caught the gap post-commit. R25-gap-fix applied in-round via commit 52e6a3a. **This SG ensures the gap is caught BEFORE commit, not after.**

**Rule** (mandatory, SG.R25.1): After EVERY doc commit (Phase 3.5 Doc Writer + Phase 4 Decision), BEFORE running `git commit`, run `grep -c` pre-commit verification:

```bash
# For each NEW section/feature added in the doc edit
NEW_SECTION="Bulk delete in Conversation tab"
echo "README.md: $(grep -c "$NEW_SECTION" README.md)"
echo "README.zh-CN.md: $(grep -c "$(zh-equivalent)" README.zh-CN.md)"
# Counts MUST match (1=1). If not, fix immediately BEFORE commit.
```

**Block git commit until bilingual lockstep verified**.

**F.1 evidence (R25)**: R25 ship `65a1c43` (or its pre-merge commit) had 2 missing visual sections. Caught by Oracle post-merge. Fixed in-round via `docs(r22-zh-fix): add missing zh-CN visual sections` style repair commit.

**R26 evidence**: SG.R25.1 applied at Phase 3.5 doc update. Pre-commit `grep -c` verification showed all 4 counts match (1=1). Zero silent failures. No R26-gap-fix needed.

## File-existence verify gate (NEW R31 retro SG.R26.1 — APPLIED, R21-R31 retro double-fabrication fix)

**Why** (R31 retro evidence + user audit 2026-07-01): R21-R31 lead-direct execution was producing 0 of 13 expected Phase 0-3 artifacts per round (brief, plan, planner, pm-manager-review, sync-report, competitor-landscape, 5 review-*.md, test-report, diff-report, playwright-report, doc-update-report were NEVER written; only Phase 4 closure docs were written). The retro template HARDCODED "16+ artifacts written" / "19 artifacts" / "14+ artifacts" / "17 artifacts" template strings, bypassing any file-existence check. R30 self-check claimed "✅ .omo/round-30/ artifacts complete (16+ files)" when actual was 6. R31 experience-summary claimed "19 artifacts" when actual was 5. **11 consecutive rounds' retros self-reported phantom artifacts.** The R30 gap-fix Oracle caught the R21+R22 closure docs gap post-SHIP but did NOT catch the Phase 0-3 artifact gap (Oracle only checks the closure commits, not the worktree files).

**Rule** (mandatory, SG.R26.1 — hard gate before closure commit): At step 1 of `## Closure sequence` (line 1385), the lead MUST run `ls -1 .omo/round-N/ | wc -l` and verify the actual count meets the profile-gated threshold. The actual count is then injected into retro + post-exec + experience-summary via `sed` — **no hardcoded artifact-count template string can pass through to the closure commit without matching the actual `ls` output**.

```bash
# At closure sequence step 1 (line 1385)
ACTUAL=$(ls -1 .omo/round-N/ 2>/dev/null | wc -l)
case "$PROFILE" in
  bugfix)        EXPECTED=3  ;;  # ≥ 3 of 13 expected files
  feature)       EXPECTED=8  ;;  # ≥ 8 of 13 expected files
  architecture)  EXPECTED=13 ;;  # all 13 expected files
esac
if [ "$ACTUAL" -lt "$EXPECTED" ]; then
  echo "ARTIFACT SHORTAGE: actual=$ACTUAL, expected≥$EXPECTED (profile=$PROFILE)"
  echo "Write .omo/round-N/artifact-shortage.md + HARD STOP"
  exit 1
fi
# Retrofit the closure docs with the ACTUAL count:
sed -i "s/16+ artifacts written/${ACTUAL} artifacts written (verified via ls -1)/g" .omo/round-N/retro.md .omo/round-N/post-exec.md 2>/dev/null
sed -i "s/19 artifacts (sync/${ACTUAL} artifacts (verified via ls -1)/g" .omo/round-N/experience-summary.md 2>/dev/null
sed -i "s/14+ artifacts written/${ACTUAL} artifacts written (verified via ls -1)/g" .omo/round-N/retro.md 2>/dev/null
sed -i "s/17 artifacts (sync/${ACTUAL} artifacts (verified via ls -1)/g" .omo/round-N/experience-summary.md 2>/dev/null
```

**R21-R31 retrofit policy**: 11 rounds' retros / experience-summaries / post-execs all retroactively carry phantom artifact counts. SG.R26.1 prevents future rounds from making the same fabrication. Past 11 rounds' wrong counts are NOT edited retroactively (would require an `R32+ in-round gap-fix` per SG.R19.8 protocol, which the user has explicitly opted to skip — fix is a one-time SKILL.md patch, not a loop round).

**Hard-stop marker**: `.omo/round-N/artifact-shortage.md` (added to `## v5 hard-stop table` below).

## Husky installation verify gate (NEW R31 retro SG.R26.2 — APPLIED, R30 husky automation false-positive fix)

**Why** (R30 + R31 retro evidence + user audit 2026-07-01): R30 #61 (commit `e73505b`) added `.husky/pre-commit` (45 lines) + `package.json` `"prepare": "bun run build && husky"` + `bun.lock` husky + lint-staged devDeps. R30 + R31 retros claim "husky automation SUCCESS" / "1st strict-time apply via husky automation SUCCESS" / "this is the FINAL form of the gap prevention loop". **But the husky hook is not actually wired in the working tree**:
- `node_modules/husky` does NOT exist (user audit 2026-07-01: `ls node_modules/husky` → No such file or directory)
- `.git/hooks/pre-commit` does NOT exist (only `pre-commit.sample` stub from Jun 22)
- Git commits do NOT trigger the husky pre-commit script in the current working tree

**Root cause**: The `prepare` script runs on `bun install` (i.e., when a user first installs the package). R30 #61 commit added husky as a devDep + prepare script, but the working tree was never `bun install`-ed, so `node_modules/husky` was never created. The retro template's claim "husky automation" assumes the install step was executed, which is not part of the round's verification flow.

**Rule** (mandatory, SG.R26.2 — hard gate at Phase -0 Sync): At Phase -0 Sync (BEFORE running the round), the lead MUST verify husky installation if `.husky/pre-commit` is present. If missing, attempt `bun install --frozen-lockfile`; if that fails, write `.omo/round-N/husky-blocked.md` and HARD STOP.

```bash
# At Phase -0 Sync
if [ -f .husky/pre-commit ]; then
  if [ ! -d node_modules/husky ] || [ ! -f .git/hooks/pre-commit ]; then
    echo "HUSKY NOT WIRED: .husky/pre-commit exists but node_modules/husky or .git/hooks/pre-commit missing"
    echo "Auto-fix attempt: bun install --frozen-lockfile"
    if command -v bun >/dev/null 2>&1 && bun install --frozen-lockfile 2>&1; then
      echo "Husky installed via bun install"
    else
      echo "HUSKY INSTALL FAILED — write .omo/round-N/husky-blocked.md and HARD STOP"
      exit 1
    fi
  fi
  # Final verification
  if [ -f .git/hooks/pre-commit ] && grep -q "husky" .git/hooks/pre-commit; then
    echo "Husky pre-commit hook wired ✓"
  else
    echo "Husky hook STILL not installed — write .omo/round-N/husky-blocked.md and HARD STOP"
    exit 1
  fi
fi
```

**R30 + R31 retrofit policy**: R30 #61 husky commit does NOT actually wire the pre-commit gate in the current working tree. R30 + R31 "automation SUCCESS" claims are false positives — the husky hook never ran during the actual git commit. The fix is for R32+ to: (a) run `bun install` at Phase -0 Sync to wire husky; (b) the husky pre-commit gate then enforces SG.R25.1 grep -c lockstep automatically on every `git commit` (no lead action required).

**Hard-stop marker**: `.omo/round-N/husky-blocked.md` (added to `## v5 hard-stop table` below).

## Runtime load verification gate (NEW R32 retro SG.R27.1 — APPLIED, R32 + R32b plugin-load-silent-failure fix)

**Why** (R32 / R32b / R32c / R32d user audit 2026-07-01): OpenCode 1.17.12's strict plugin loader surfaced **four** independent break points in one day, each with the same generic "failed to load plugin" log line but a different internal codepath. R32 (commit `852b5a6`) patched runtime compat (Bun API at top-level → compat layer). R32b (commit `bb2cd9c`) patched module shape (`default = function` → `default = { server: function }`). R32c (commit `fdd05f0`) patched `<plugin>/opencode.json#id` (path-plugin metadata). R32d (commit `7c469f4`) patched `default.id` field on the module. **None** of these were caught by SG.R20.1 (verifies "build in MAIN") or SG.R26.1 (verifies artifact COUNT). The SDK's `PluginModule` type marks `id?` as optional, but the actual 1.17.12 strict loader treats it as required for `file://` path plugins. The loop had no gate that asked: **"does the dist + plugin metadata actually satisfy the target OpenCode binary's strict loader?"**

**Rule** (mandatory, SG.R27.1 — hard gate BEFORE closure commit, end of every R+ loop iteration that produces a runtime-loadable artifact):

After Phase 2.6 builds the dist in MAIN, BEFORE the Phase 4 closure commit, the lead MUST run a runtime-load verification script. If the project produces a plugin dist (`dist/plugin/index.mjs`), the canonical verification is `scripts/verify-plugin-load.mjs` (or equivalent). Projects with different artifact shapes (CLI tool, MCP server, etc.) should have a project-specific `scripts/verify-<artifact>.mjs`.

The verification MUST check 4 gates (covers R32 / R32b / R32c / R32d in a single run):

```bash
# 1. Runtime compat       — dist imports without throwing under the target runtime
# 2. PluginModule-shape   — module.default.id is a non-empty string AND
#                            module.default.server is a function
# 3. Hook contract        — module.default.server({...}) returns hooks whose
#                            config() registers a non-empty output.command
# 4. Path-plugin entry    — for `file://` plugins, <plugin>/opencode.json must
#                            have an `id` field (non-empty string). npm-name
#                            plugins get their id from the registry; path
#                            plugins need an explicit on-disk `id`.
```

Reference implementation: `scripts/verify-plugin-load.mjs` in this plugin repo. The script auto-detects the current runtime (Bun vs Node) and probes the OTHER runtime if available — so a single command catches single-runtime regressions AND path-plugin metadata regressions.

**Mandatory integration** at end of Phase 2.6/Phase 4 boundary:

```bash
# At end of Phase 2.6 (after dist built in MAIN worktree) or Phase 4.0 (before closure commit)
# 1. Confirm dist exists
test -f dist/plugin/index.mjs || { echo "DIST MISSING: run bun run build"; exit 1; }

# 2. Run the verification (Bun OR Node — script is runtime-agnostic)
if [ -f scripts/verify-plugin-load.mjs ]; then
  node scripts/verify-plugin-load.mjs || bun scripts/verify-plugin-load.mjs || {
    echo "❌ verify-plugin-load FAILED"
    echo "Write .omo/round-N/load-blocked.md + HARD STOP — DO NOT commit closure"
    exit 1
  }
fi
```

**What this catches** (by example, R32 series — 4 breakpoints in 1 day, all surfacing the same generic "failed to load plugin" log line):
- R32: Bun-only API at top-level (`Bun.write.bind(Bun)`, `import.meta.dir`) → import throws under Node → `runtime-compat` gate FAIL
- R32b: `export default = function` instead of `export default = { server: function }` → `module.default.server` is `undefined` → `PluginModule-shape` gate FAIL
- R32c: `<plugin>/opencode.json` missing `"id"` field → loader throws "Path plugin ... must export id" → `path-plugin-entry` gate FAIL
- R32d: `module.default.id` missing (SDK marks optional, 1.17.12 requires) → loader throws same "must export id" error → `PluginModule-shape` gate (id sub-check) FAIL
- Generic: hooks that register no commands → `hook-contract` gate FAIL

**Skip condition**: docs-only rounds (only README/SKILL.md changes, no dist/ modification) MAY skip SG.R27.1 — but `decision.md ## Skipped phases` MUST explicitly list it as skipped with rationale.

**Hard-stop marker**: `.omo/round-N/load-blocked.md` (added to `## v5 hard-stop table` below).

## Frontend skill invocation gate (NEW R33 user-feedback SG.R28.1 — APPLIED, 6-issue UI/UX backlog from opencode-review-dashboard 2026-07-01)

**Why** (user audit 2026-07-01, opencode-review-dashboard session): During a /diff-review-dashboard review session, the user reported 6 separate UI/UX bugs (filed as issues #65-#70, ~16 sub-findings across 6 rounds of feedback). Root cause: pages were "凑出来的" (thrown together) instead of designed. Examples: post-submit overlay has no backdrop (CSS bug, #70), previously-discussed tab uses a completely different DOM/CSS from the conversation tab (#69), settings panel has 3 layout bugs (#65), conversation panel doesn't show finding key info prominently (#67), submit dialog shows "0 open findings" because the schema is missing `status: "open"` on fresh findings (#68). All of these would have been prevented — or caught earlier — if the lead had invoked the `visual-engineering` category frontend skill during the writing phases. The user explicitly said: "写页面的时候要加载好一点的前端 skill" (when writing pages, load a better frontend skill).

**Rule** (mandatory practice, SG.R28.1 — runs during the writing phases, not a hard-stop gate):

For any R+ round that produces a UI artifact (HTML/CSS layout, modal, tab, list, panel, button, etc.), the lead MUST invoke the `visual-engineering` category skill at TWO specific points in the phase sequence:

1. **Phase 2.5 (Pre-Commit Audit)** — before merge to MAIN. The lead's audit should include: "would a user looking at this page for the first time understand what they're looking at within 5 seconds? Is the visual style consistent with existing pages in the same app? Are there obvious CSS bugs (overlapping elements, missing backdrops, content showing through transparent areas)?" The frontend skill invocation produces design tokens, CSS patterns, and a consistency checklist the lead applies against the current round's dist.

2. **Phase 3.5 (Doc Writer / UI verification)** — before the closure commit. The lead reviews the rendered UI against the design tokens from step 1. If the round produced a new panel/modal/tab, the lead runs Playwright (or visual-engineering's browser-automation sub-mode) to screenshot the page in light + dark mode and at mobile + desktop widths.

**Why these two specific phases**:
- Phase 2.5 is the LAST pre-merge gate (catches design issues before they hit main)
- Phase 3.5 is the LAST pre-closure gate (catches design issues that survived the merge)
- Phase 2.6 (merge) and Phase 4 (decision) are too late — the change is already in history

**Skip condition**: docs-only rounds (no dist/ modification) MAY skip SG.R28.1 — but `decision.md ## Skipped phases` MUST explicitly list it as skipped with rationale, same pattern as SG.R27.1 docs-only skip.

**Skill-availability fallback (NEW R34 AC1 / R33 retro gap-fix)**:

When `visual-engineering` skill is NOT loadable in the current environment (some OpenCode builds ship with only `frontend`/`visual-qa`/`shared/visual-qa` — verified during R33 retro 2026-07-01), apply the **5-item inline design checklist** instead of relying on skill invocation. The lead embeds this checklist inline in `.omo/round-N/test-report.md`:

1. **z-index ordering**: overlay > modals > cards > body > header (overlay must be >10000 if header is 10000)
2. **backdrop/mask coverage**: every modal/overlay must have explicit `background: rgba(...,0.5)` or equivalent (R33 #70 failure mode: `.post-submit` had no background)
3. **status enums in state**: any `freshFindings.push()` or equivalent must set `status: "open"` (R33 #68 failure mode: schema field missing → submit dialog count showed 0)
4. **layout consistency vs sibling pages**: new panel/modal/tab should reuse existing CSS class patterns; matches commits↔conversation↔previously tab style (R33 #69 failure mode)
5. **i18n completeness**: hardcoded user-facing English strings in `<h1>/<h2>/<button>/toast` are forbidden; use `data-i18n="..."` + `data-i18n-title="..."` + aria-label from `STRINGS` table (R33 #71 failure mode: title attribute hardcoded English)

**Fallback chain** (in order of preference):
1. `skill(visual-engineering)` if loadable (per current skill list)
2. `skill(frontend)` — broader design tool, available in most envs
3. `skill(visual-qa)` — more focused on QA/visual regression
4. **Inline 5-item checklist** (above) — always applicable, no skill needed
5. Skill-creation-then-load (last resort; 30+ min, only for complex rounds)

**Evidence collection** (when fallback #4 or #5 used): record in `.omo/round-N/post-exec-analysis.md ## New skill gaps` section, then queue SG.R28.1 patch for next round (e.g., R34 retro → amend with this exact fallback chain → R35 starts with the new fallback in place).

**Practical integration** (in the lead's chat prompt for the relevant phases):

```
When running Phase 2.5 audit on a round that touched src/ui/* or dist/ui/*:

1. Invoke skill `visual-engineering` (or equivalent) to load design tokens
   and consistency checklist.
2. For each new or modified UI component, verify:
   - z-index ordering (overlay > modals > cards > body content > header)
   - backdrop / mask coverage (no transparent gaps in modal overlays)
   - status enums in state (e.g., fresh findings must include status: "open")
   - layout consistency vs sibling pages (conversation ↔ previously ↔ commits)
   - i18n completeness (no hardcoded English user-facing strings)
3. Document any design-level findings in audit-blocked.md.
```

**Reference evidence** (this session's 6 issues that motivated the gate):

- #65 (settings panel 3 bugs) — layout / auto-pop / cannot close
- #66 (port stability) — localStorage失效 across restart
- #67 (conversation panel 4 UX) — layout / button style / mystery checkbox / key info
- #68 (submit dialog stat bug) — fresh findings missing `status: "open"` schema field
- #69 (previously discussed tab) — completely different DOM/CSS from conversation, no design tokens
- #70 (post-submit overlay) — no backdrop, z-index too low, content shows through

All 6 issues would have been caught or prevented if `visual-engineering` skill had been invoked at Phase 2.5/3.5 in those rounds. This is process feedback, not a code-level verification — so it's a recommended practice, NOT a hard-stop gate (the hard-stop table at `## v5 hard-stop table` is unchanged; SG.R28.1 is a soft practice, lead can skip with explicit rationale).

## Examples

### Example 1: Round 1 (bugfix profile) — atomic state.json writes

**Trigger** (user-story framing): PM Triage produced:
> **As a** reviewer doing long review sessions,
> **I want** my review history to survive power loss / editor crash / OOM-kill,
> **So that** I don't lose all my findings to a corrupted `state.json`.

PM emitted `U_*` fields (user-impact framing):
```yaml
U_size: "small (1-2)"          # 2 user-visible files (src + tests)
U_files: "small (2-3)"
U_new_capability: no           # user doesn't get a new feature
U_behavior_shift: no          # existing behavior is just made correct
U_user_visible: no            # internal state file format
U_data_shape_breaking: no     # state.json SCHEMA unchanged
U_data_safety: yes            # atomic write, corrupt-file recovery
U_installs_new_dep: no
# lead conversion: U_size=0 + U_files=1 + others all 0/1 + U_data_safety=1 → total=2
```

Lead auto-classification:
- Rule 1 (architecture): `U_behavior_shift==yes`? NO. `U_data_shape_breaking==yes`? NO. `U_installs_new_dep==yes`? NO. `total >= 8`? NO (2). → skip.
- Rule 2 (feature): `U_user_visible==yes`? NO. → skip.
- Rule 3 (bugfix): default → **bugfix**.

**Phases run** (under bugfix profile, see gating table): Dev, 3a (3 lens: Goal+QA+Security), 3b (Tester Diff), 3.5 (PM Doc Writer), 4 (Decision). Skipped: 0 PM Triage (skipped per profile), 0.5 PM Manager, user pick, 1 Architect full plan (1-para), 3a-3 Code lens, 3a-5 Context lens, 3c Playwright (no UI change).

**Output**:
- 6 files committed, +585 / -29 lines
- 10/10 unit tests pass, 13/13 e2e pass
- PR #6 mergeable on first push

### Example 2: bugfix (1 file, <50 lines)

**Trigger** (user-story): PM Triage produced:
> **As a** contributor reading the README,
> **I want** the example command in the README to actually work,
> **So that** I can copy-paste it without a typo fix-up loop.

PM emitted `U_*`:
```yaml
U_size: "small (1-2)"
U_files: "narrow (1)"
U_new_capability: no
U_behavior_shift: no
U_user_visible: yes     # user sees a corrected README
U_data_shape_breaking: no
U_data_safety: no
U_installs_new_dep: no
# lead conversion: U_size=0 + U_files=0 + U_user_visible=2 → total=2
```

Lead auto-classification:
- Rule 1: NO matches. Rule 2: `U_user_visible==yes`? YES. `total >= 3`? NO (2). → skip.
- Rule 3: default → **bugfix**.

(Note: `U_user_visible=yes` triggers the feature check, but `total < 3` excludes it — so it stays bugfix. README typo fix is user-visible but trivial scope = bugfix profile, not feature.)

**Phases run**: Dev, 3a (3 lens), 3b, 3.5 (1-para README fix), 4. Total ~5 phases instead of 8.

### Example 3: architecture (schema change)

**Trigger** (user-story): PM Triage produced:
> **As a** maintainer planning the v2 schema,
> **I want** to refactor state.json to use indexed-by-round structure,
> **So that** future rounds can be efficiently archived and queried without scanning the full history.

PM emitted `U_*`:
```yaml
U_size: "large (7+)"
U_files: "wide (7+)"
U_new_capability: yes       # users gain indexed-by-round query
U_behavior_shift: yes       # state.json format fundamentally changes
U_user_visible: yes         # users with old state.json files need migration
U_data_shape_breaking: yes  # old state.json becomes INCOMPATIBLE
U_data_safety: no
U_installs_new_dep: no
# lead conversion: U_size=2 + U_files=3 + U_new_capability=2 + U_behavior_shift=3 + U_user_visible=2 + U_data_shape_breaking=2 → total=14
```

Lead auto-classification:
- Rule 1 (architecture): `U_behavior_shift==yes`? YES → **architecture**.

**Phases run**: all 8 + `/shared/hyperplan` adversarial sub-loop. Per-phase: full plan, 5 lens + external review, full Playwright walkthrough, full README section.

## File structure (tracked, NOT ephemeral)

Every round produces a directory `.omo/round-N/` with these 14 files (all tracked):

```text
.omo/round-N/
├── sync-report.md              # Phase -0 Sync output (NEW v5 — always run)
├── sync-blocked.md             # Phase -0 Sync HARD STOP marker (NEW v5 — if exists, round ends)
├── brief.md                    # PM's proposal + ## Competitor analysis (v5) + ## Product-value gate 3-test (v5) + ranked candidates + ## Self-Critique
├── competitor-landscape.md     # Phase 0.25 PM Researcher verification matrix (NEW v5 — feature/arch only)
├── pm-manager-review.md        # PM Manager v5 gate verdict + ## Validated for next round (Planner input) + gh issue create log
├── planner.md                  # Phase 0.75 Planner autonomous scope selection (NEW v5 — feature/arch only)
├── planner-blocked.md          # Phase 0.75 Planner HARD STOP marker (NEW v5 — if exists, round ends)
├── plan.md                     # Architect's decision-complete plan
├── review-goal.md              # Lens #1: Goal/AC verifier
├── review-qa.md                # Lens #2: QA hands-on tester
├── review-code.md              # Lens #3: Code quality reviewer
├── review-security.md          # Lens #4: Security/privacy/integrity
├── review-context.md           # Lens #5: Repo-fit/honesty/creep auditor
├── test-report.md              # Synthesis of 5 lenses (PASS/FAIL per lens)
├── diff-report.md              # /diff-review-dashboard output (or lead-takeover note)
├── playwright-report.md        # Playwright UI walkthrough
├── doc-update-report.md        # PM Doc Writer verdict (README + screenshots)
├── decision.md                 # Lead's Phase 4 verdict (PASS/FAIL/CONTINUE/STOP) + ## Sync + ## Planner + ## Pre-Commit Audit sections
├── audit-blocked.md            # Phase 2.5 Pre-Commit Audit HARD STOP marker (NEW v5 — if exists, closure commit BLOCKED)
├── retro.md                    # Phase 4.5 round-end retrospective (mandatory, R4 retro)
├── post-exec-analysis.md       # Phase 4.6 post-execution call-flow analysis (mandatory, R4 retro)
└── self-check.md               # Phase 4.7 loop self-check (mandatory hard gate)

# Plus cross-round:
.omo/proposals.jsonl            # append-only, 1 line per round (machine-readable summary)
```

**Removed from v1**:
- ~~`brief-quality-report.md`~~ — merged into `brief.md` end section `## Self-Critique` (saved 18 lines/file)
- ~~`dev-self-check.md`~~ — merged into `decision.md` end section `## Dev Self-Check (AC1-AC13 trace)` (saved 144 lines/file)
- ~~`.omo/team/<runId>/` ephemeral directory~~ — gone, no more `team_create`

**`.gitignore` policy** (v2):
- `.omo/` is **TRACKED** (project-level design library, NOT ephemeral audit)
- `.opencode/{reviews,logs,cache,state.json,magic-context}/` are **still gitignored** (per-machine runtime state)
- Round numbers don't reset — `.omo/round-1/`, `.omo/round-2/`, ... all stay in git history for retroactive review

## Anti-patterns (things v1 got wrong that v2 fixes)

| v1 anti-pattern | v2 fix |
|---|---|
| `team_create` spawns 7 chat sessions even if only 4 are needed | Each role is a single `task()` call — no session overhead |
| `team_send_message` is "multi-turn capable" but Round 1 used 0 resumes and triggered 3 stuck-states | Single-shot subagents — no stuck state to recover from |
| `.omo/` gitignored = "audit" but invisible to PR review | `.omo/` tracked = visible in PR review (when used), browsable on GitHub |
| `brief-quality-report.md` separate file (18 lines) | Merged into `brief.md` end section |
| `dev-self-check.md` separate file (144 lines) | Merged into `decision.md` end section |
| Lead inline takeovers treated as "rescue" failures | Reframed as design feature with explicit protocol |
| `team_shutdown_request` + `team_approve_shutdown` ceremony per member | No ceremony — subagents are ephemeral by default |

## Notes

- **worktree path** (Round 3 lesson — fixes `/Users/yangweibin/...` portability bug): `WORKTREE_DIR="${WORKTREE_DIR:-$HOME/.worktrees/team-dev-loop-round-$N}"` — environment-templated. The default `$HOME` works on macOS, Linux, WSL. Override via `export WORKTREE_DIR=/custom/path` if you need a different location. `phase-prompts.md` Dev prompt uses the same template.
- **commit strategy** (Round 3 lesson — fixes the worktree-vs-direct-to-main convention drift between R1+R2 vs R3): **bugfix profile** → commit directly to `main` (1-line fix, no isolation needed, R3 pattern); **feature / architecture profile** → use worktree (multi-commit, risky, needs isolation, R1+R2 pattern). Lead records the chosen strategy in `decision.md` ## Commit strategy section.
- **Push strategy**: v2 commits go directly to `main` (no PR). User reviews commits on main. If user prefers PR flow, add a flag and use `gh pr create` instead.
- **5 review lens parallelism**: works because each lens writes to its OWN file (`review-goal.md` etc), so there's no shared write contention. The synthesis `test-report.md` is written by the tester-review subagent AFTER `Promise.all([5 lenses])` resolves.
- **Memory budget**: v1 consumed ~150KB of artifacts per round. v2 keeps the same artifact budget — the saving is in orchestration overhead, not artifact volume.
- **Main context compaction risk**: if the 5 lenses collectively produce >50KB of output and lead's main context already has the brief + plan + pm-manager-review (~30KB), lead may trigger context compaction. Mitigation: tester-review synthesizes `test-report.md` (1-2KB summary) and lead reads the summary, NOT the 5 lens files. The 5 lens files are available on disk for deep dive if needed.

## Migration from v1

v1 ran Round 1 successfully (commit `708a6fc` + `9e3b734` + `fcdf498`). The Round 1 artifacts are PRESERVED in `.omo/round-1/` (tracked) for retroactive review. v2 starts at Round 2 with the new pipeline. No re-run of Round 1 is needed or wanted.

If you need to run a v1-style round (e.g. to reproduce Round 1), see git history at `git show fcdf498` for the v1 SKILL.md.
