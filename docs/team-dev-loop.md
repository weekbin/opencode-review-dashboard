# Team Dev Loop (v2 — 2026-06-28 redesign)

The 8-phase development loop for **this repo** (`@weekbin/opencode-review-dashboard`).

This is the **v2** design. v1 (earlier 2026-06-28) used `team_create` + `team_send_message` to orchestrate 7 chat sessions per round. **v2 eliminates the team_* lifecycle** and runs the same 7 roles as sequential `task()` calls, with the 5 review-work lenses running in parallel via `Promise.all([5 run_in_background=true])`. See `.omo/round-2-plan.md` for the full redesign rationale and `.omo/round-1/` for v1 evidence (Round 1 ran successfully with v1).

## Table of contents

1. [What it is](#what-it-is)
2. [Why 7 roles (anti-bias)](#why-7-roles-anti-bias)
3. [v1 vs v2 — what changed](#v1-vs-v2--what-changed)
4. [The 8 phases (flow diagram)](#the-8-phases-flow-diagram)
5. [The 7 roles (detailed)](#the-7-roles-detailed)
6. [Backlog priority](#backlog-priority)
7. [Loop control](#loop-control)
8. [Lead inline takeover protocol](#lead-inline-takeover-protocol)
9. [Trivial mode](#trivial-mode)
10. [Round artifacts (file structure)](#round-artifacts-file-structure)
11. [Per-phase details](#per-phase-details)
12. [Cost analysis: v1 vs v2](#cost-analysis-v1-vs-v2)
13. [Anti-patterns (things v1 got wrong)](#anti-patterns-things-v1-got-wrong)
14. [Migration from v1](#migration-from-v1)
15. [How to install](#how-to-install)
16. [How to invoke](#how-to-invoke)
17. [See also](#see-also)
18. [License](#license)

## What it is

A self-driving loop for picking the next thing to build, proposing it, gating it, designing it, building it, validating it, documenting it, and looping — without any single agent (or you) being biased toward "looks done."

```
PM (propose + self-critique in same file)
    ↓
PM Manager (gate on pseudo-requirements)
    ↓
USER PICK CANDIDATE (hard gate — lead asks)
    ↓
Architect (plan, via ulw-plan)
    ↓
Dev (execute + inline AC trace, returns to lead)
    ↓
Tester Review (5 parallel lenses in 1 subagent)
    ├─ Lens #1 Goal
    ├─ Lens #2 QA
    ├─ Lens #3 Code
    ├─ Lens #4 Security
    └─ Lens #5 Context
    ↓
Tester Diff (uses /diff-review-dashboard)
    ↓
Tester Playwright (real browser walkthrough)
    ↓
PM Doc Writer (Playwright + README update)
    ↓
Decision (lead writes directly)
    ↓
git add + commit + push origin main
```

**Key v2 change**: Only the Tester Review phase has internal parallelism (5 lenses via `run_in_background=true`). All other phases are sequential `task()` calls. No `team_create`, no chat session lifecycle, no shutdown ceremony.

## Why 7 roles (anti-bias)

Each phase is a SEPARATE subagent with fresh context. This prevents:

| Risk | Mitigation |
|---|---|
| PM proposes a fake demand | PM ## Self-Critique section in brief.md + PM Manager meta-review (gate) |
| Orchestrator hallucinates requirements | PM is a spawned subagent, not the orchestrator's own judgment |
| Dev self-confirms "done" without matching brief | Dev returns inline AC trace (ac_trace array in return value) which lead copies into decision.md; PM Manager also guards upstream |
| Code passes tests but UI doesn't work | 5 review-work lenses (incl. Playwright hands-on) catch what unit tests miss |
| Feature ships without docs | PM Doc Writer updates README with screenshot + usage after every ship |
| One round's tests don't generalize to next round's risk | Tester Context lens (Lens #5) explicitly maps changes against follow-up candidates |

**v2 reinforces anti-bias** by removing the team_* message-passing layer that v1 had — each role is now a single-shot `task()` with no chance for cross-contamination of context.

## v1 vs v2 — what changed

| Aspect | v1 (Round 1) | v2 (Round 2+) |
|---|---|---|
| **Orchestration** | `team_create` (teamRunId) + `team_send_message` × 7 | Sequential `task(category=<role-specific>, prompt=...)` × 7-8 (6 different categories per role — see "Per-role category" below) |
| **Member lifecycle** | 7 chat sessions opened/closed per round | No sessions — subagents are ephemeral |
| **Communication** | `team_send_message` (wakeup message to member) | Direct return value from `task()` |
| **Completion detection** | `team_task_list` polling (~12 polls per round) | Implicit — `task()` is synchronous, returns = done |
| **Multi-turn resumability** | Available (v1 used 0 times) | Not available (single-shot) |
| **5 review-work lens parallelism** | Inside `tester-review` member | Inside `tester-review` task — `Promise.all([5 run_in_background=true])` |
| **Lead inline takeover rate (Round 1 evidence)** | 43% (3 of 7 members) | Expected similar — refactored as design feature with explicit protocol |
| **`.omo/` storage** | `.omo/team/<runId>/` (gitignored, ephemeral) + `.omo/team/round-1/` | `.omo/round-N/` (tracked, project-level design library) |
| **`brief-quality-report.md`** | Separate file (18 lines) | Merged into `brief.md` `## Self-Critique` section |
| **`dev-self-check.md`** | Separate file (144 lines) | Merged into `decision.md` `## Dev Self-Check (AC1-ACN trace)` section |
| **Meta-artifacts (`proposals.jsonl`)** | `.omo/team/proposals.jsonl` (gitignored) | `.omo/proposals.jsonl` (tracked) |
| **Push strategy** | PR workflow | Direct commit to main (user reviews commits on main) |
| **Round number naming** | `.omo/team/round-1/` (with `team/` parent dir) | `.omo/round-1/` (no parent dir) |
| **Skill package status** | Partially gitignored | Fully tracked (`.opencode/skills/team-dev-loop/`) |

**Cost savings (estimated from Round 1 telemetry)**:

| Metric | v1 | v2 | Saving |
|---|---|---|---|
| `team_send_message` calls | ~7 | 0 | -7 wakeups |
| `team_task_list` polls | ~12 | 0 | -12 polling turns |
| `team_shutdown_request`/`team_approve_shutdown` | ~14 | 0 | -14 ceremony turns |
| `team_delete` | 1 | 0 | -1 cleanup turn |
| Meta-artifact writes (file -> read-back) | 2 files × 2 round-trips | 0 files | -4 file ops |
| Lead chat-turns spent on plumbing | ~34 | ~7 (the actual `task()` calls) | **-27 turns (~80%)** |

**Cost preserved (same in v2)**:
- Per-role subagent context overhead (~5-15k tokens per subagent prompt + response)
- Artifact disk footprint (~150KB per round)
- Main context consumption (lead reads all 5 review-*.md + test-report.md + diff-report.md + playwright-report.md)

## The 8 phases (flow diagram)

```
PHASE 0: PM TRIAGE ──────────→ .omo/round-N/brief.md
                                  │
PHASE 0.5: PM MANAGER (gate) ──→ .omo/round-N/pm-manager-review.md
                                  │
   ┌─ if REJECT: ask user ──────┤
   └─ if APPROVE: continue ─────┤
                                  │
USER PICK CANDIDATE (hard gate)  │
                                  │
PHASE 1: ARCHITECT ─────────────→ .omo/round-N/plan.md
                                  │
PHASE 2: DEV (creates worktree) → (worktree + commits + return value)
                                  │
PHASE 3a: TESTER REVIEW ────────→ .omo/round-N/review-{goal,qa,code,security,context}.md
   (5 parallel lenses)               + .omo/round-N/test-report.md
                                  │
PHASE 3b: TESTER DIFF ─────────→ .omo/round-N/diff-report.md
                                  │
PHASE 3c: TESTER PLAYWRIGHT ───→ .omo/round-N/playwright-report.md
                                  │
PHASE 3.5: PM DOC WRITER ───────→ .omo/round-N/doc-update-report.md
                                  │   (side effects: README + screenshots)
PHASE 4: DECISION (lead) ──────→ .omo/round-N/decision.md
                                  │
APPEND: AUDIT LOG (lead) ───────→ .omo/proposals.jsonl (1 line appended)
                                  │
GIT: add + commit + push ───────→ origin/main (no PR)
```

**Total: 8 distinct phases, 5 internal parallel lenses, 1 commit per round.**

## The 7 roles (detailed)

| # | Role | When | Output | Implementation |
|---|---|---|---|---|
| 1 | **PM** | Phase 0 (start) | `brief.md` (incl. `## Self-Critique`) | Spawned `task()` subagent |
| 2 | **PM Manager** | Phase 0.5 (after PM) | `pm-manager-review.md` (APPROVE/REJECT/CLARIFY) | Spawned `task()` subagent (independent of PM) |
| 3 | **Architect** | Phase 1 (after user pick) | `plan.md` (decision-complete plan) | Spawned `task()` subagent (wraps `/shared/ulw-plan`) |
| 4 | **Dev** | Phase 2 (after plan approved) | (worktree + commits + AC trace in return value) | Spawned `task()` subagent (wraps `/shared/start-work`) |
| 5 | **Tester** | Phase 3a/3b/3c (3 lanes) | `test-report.md` + `diff-report.md` + `playwright-report.md` (5 lenses inside 3a) | 3 spawned `task()` subagents (3a orchestrates 5 internal lenses) |
| 6 | **PM Doc Writer** | Phase 3.5 (after Tester) | `doc-update-report.md` + README + screenshots | Spawned `task()` subagent |
| 7 | **Decision** | Phase 4 (after Doc Writer) | `decision.md` + `proposals.jsonl` append | Lead writes directly (no subagent) |

**7 roles, 8 phases** (Phase 4 + the audit log append are written by lead, so they're not separate "roles"). **5 internal parallel lenses** (inside Phase 3a Tester Review).

## PM role: user-story advocate (not developer)

**Critical**: PM is the **user's representative** in the loop, NOT a developer who happens to ask "what's broken." The PM's job is to articulate **what the user needs** and **why it matters to them** — never to estimate code metrics.

### What PM thinks about

- **WHO** needs the change (specific user persona, not "user")
- **WHAT** capability relieves their pain (concrete, observable)
- **WHY** it matters to them (user value, not code benefit)
- **HOW BIG** the user-visible impact is (small/medium/large in user-visible files)

### What PM does NOT think about

- Lines of code to change (PM doesn't have ground truth — lead verifies via `git diff`)
- File counts to modify (same — lead verifies)
- Whether the change is a "bug" or a "feature" (that's a Dev-side frame)
- Architectural impact (that's lead's job after PM emits user-impact signals)

### Output: User-story format (mandatory)

Each candidate in `brief.md` MUST use this format:

> **As a** [specific user persona, NOT "user"]
> **I want** [concrete capability — what they do / what they see]
> **So that** [user pain relieved, value created — NOT a code benefit]

### Why this matters (anti-pattern evidence)

Round 1 and Round 2 of this loop ran with PM Triage prompt that had `Sort: bug > enhancement > others` and asked for candidates "each with severity/effort/risk." Both rounds produced bugfix outputs — not because the work was always bug-shaped, but because PM was framed as a developer triaging issues, not as a user advocate.

When PM emits user-stories instead, candidates are framed in user terms:

- ❌ Dev frame: "Fix the auto-pickaround bug in --worktree"
- ✅ User frame: "As a developer switching between worktrees, I want my explicit --worktree flag to always win, so I don't silently review the wrong branch"
- ✅ User frame: "As a reviewer doing long sessions across crashes, I want my review history to survive power loss, so I don't lose findings to a corrupted state.json"
- ✅ User frame: "As a reviewer iterating across rounds, I want stale findings to close when their anchor changes, so the conversation panel reflects current code"

Same work, but the second framing tells the developer **WHY** the user needs it — not just **WHAT** is broken.

### PM ↔ lead signal separation (v3)

PM emits `U_*` fields (user-impact). Lead converts to numeric `S_*` scores and applies auto-classification rules. This keeps PM in user-land and lead in scope-land — no scope creep between roles. See "Round profile auto-classification" below for the full conversion table.

## Per-role category (sub-model) selection

Each role's `task(category="...")` call uses a different sub-model. Each sub-model is optimized for that role's work shape — picking the right one per role gives better quality per token than a one-size-fits-all `unspecified-high`. This was added 2026-06-28 in response to user feedback ("建议按照子模型分类特色选用不同的").

| Role | category | Why this category |
|---|---|---|
| PM Triage | `unspecified-high` | Product judgment + structured brief writing, no closer fit |
| PM Manager (gate) | `ultrabrain` | Critical anti-pseudo-requirement reasoning, hard logic |
| Architect | `ultrabrain` | Architecture decisions, decision-complete plan |
| Dev | `deep` | Autonomous end-to-end (worktree + tests + commit) |
| Tester Review orchestrator | `deep` | Coordinate 5 lenses + synthesize `test-report.md` |
| Lens #1 Goal | `quick` | Mechanical AC matching, no judgment |
| Lens #2 QA | `quick` | Run test commands, check gates |
| Lens #3 Code | `ultrabrain` | Code-quality analysis, complexity judgment |
| Lens #4 Security | `ultrabrain` | Threat modeling, security reasoning |
| Lens #5 Context | `artistry` | Repo-fit, commit honesty, soft/non-standard judgment |
| Tester Diff | `unspecified-high` | Invokes `/diff-review-dashboard` tool, no closer fit |
| Tester Playwright | `visual-engineering` | Real-browser UI walkthrough, must be visual-engineering |
| PM Doc Writer | `writing` | Playwright + README documentation, writing-specialized |

**Why not all `unspecified-high`**: v2-v1 (the "team_create" era) used `unspecified-high` for every role. That's wasteful when the work shape is well-defined — `quick` for mechanical checks, `visual-engineering` for UI, `writing` for docs. v2 picks the right sub-model per role.

**Cost implication**: 6 different categories (was 1 in v1) — each task routes to its optimal sub-model. Total cost ≈ same as before (we always paid the sub-model that category picks), but quality per role should be higher. Specifically:
- Lens Goal/QA no longer pay `ultrabrain` cost (saves ~3-5× tokens on 2 of 5 lenses)
- PM Manager + Architect get `ultrabrain` (was `unspecified-high` — gains quality on the 2 hardest judgment tasks)
- Playwright + Doc Writer get the sub-models optimized for their domain (better output for same cost)

**Override rule**: lead MAY override a category for a specific round if the work shape is genuinely different (e.g. PM Triage for a complex architecture decision could use `ultrabrain`). But this should be rare — the defaults in the table are the result of v1 evidence + user directive.

## Backlog priority

1. **User override** (your current chat prompt) — highest
2. **GitHub issues** with `bug` label (oldest first)
3. **GitHub issues** with `enhancement` label (oldest first)
4. **`.omo/backlog.md`** (manually curated, optional)
5. **Previous round's `follow_up_candidates`** in `.omo/proposals.jsonl` (Round 2+)
6. **Agent self-investigation** (only when 1-5 are empty)

## Loop control

| Condition | Action |
|---|---|
| User says "stop" / "exit" / Ctrl+C | **Hard stop** — exit immediately |
| Backlog empty + no user override + no agent suggestion | **Hard stop** — exit with summary |
| PM Manager REJECT | Ask user: "PM Manager flagged this as pseudo-requirement. Override or skip?" |
| PM Manager CLARIFY | Ask user: "PM Manager needs clarification. Provide it?" |
| User pick candidate | Ask user (HARD GATE — never auto-pick) |
| Dev returns FAIL or PARTIAL verdict | Loop back to Phase 2 (Dev iterates) |
| Tester (any of 3a/3b/3c) FAIL | Loop back to Phase 2 (Dev fixes) with tester report as feedback |
| PM Doc Writer FAIL | Loop back to Phase 3.5 only (code is shipped, just docs) |
| All clean + backlog has more | Ask user "next round?" — if continue, go to Phase 0 |
| 3 consecutive no-progress rounds | **Soft stop** — suggest stop to user (do NOT auto-stop) |
| Quality regression: Tester FAILs increase over last 3 rounds | **Soft stop** — ask user |
| Main context compaction triggered (>50KB test outputs) | **Soft stop** — consider Plan B (revert to v1) |

**See `references/loop-decision.md` for the full stop-condition matrix.**

## Lead inline takeover protocol

**This is a DESIGN FEATURE in v2, not a rescue.** Round 1 evidence: 3 of 7 members (43%) needed lead takeover. v1 called this "rescue" and treated it as a failure mode. v2 reframes it.

**When lead takes over** (any of these triggers):
- Subagent returns empty result (e.g. tester-diff generated 0 bytes of SVG)
- Subagent returns "BLOCKED" / dead-end (e.g. tool-invocation failure)
- Subagent exceeds context budget
- Subagent returns explicit `verdict: FAIL`

**Lead's 5-step protocol**:
1. Write `.omo/round-N/lead-takeover-<role>.md` (5-10 lines: timestamp, original subagent return value, reason)
2. Write the deliverable directly (e.g. `diff-report.md`) — do NOT retry the subagent (Round 1: 0% retry success)
3. Continue the next phase (Doc Writer does NOT wait for lead takeover)
4. List lead takeovers in `decision.md` end section
5. Count lead takeovers in `proposals.jsonl` `lead_takeovers` field

**Lead takeover rate is a tracked metric**. If it exceeds 50% in a single round, lead should pause and ask user — this signals systematic subagent failure (consider Plan B: revert to v1 team_create with more chat sessions).

## Round profile auto-classification (run before Phase 0)

Each round is **auto-classified** into 1 of 3 profiles based on **8 quantitative user-impact signals** — NOT lead judgment. The profile gates which phases run, so a single bug fix doesn't pay the cost of an architecture-review pipeline. This was added 2026-06-28 in response to user feedback ("如果是单纯的 bug 修复，用这个 loop 流程做就有点复杂了，建议给每个阶段是否需要进入执行，增加判断") and refined to **user-impact framing** 2026-06-28 in response to "PM 的角色应该是提需求，而什么总是提 BUG FIX 呢？" — separating PM's user-side signals (`U_*`) from lead's scope-side signals (`S_*`).

### The 3 profiles (reframed in user terms)

| Profile | What the user sees | Example |
|---|---|---|
| **bugfix** | User's existing behavior was wrong/unreliable; we made it correct. No new capability. | Round 1: user lost review history to a power-loss race → we made state.json atomic |
| **feature** | User gets a brand-new capability they didn't have before. | Adding a "Resolved filter" button to conversation panel |
| **architecture** | User's data shape changes (e.g., existing state.json becomes incompatible), or a structural shift with install/dep impact. | Refactoring state.json schema; adding a new dependency |

### PM ↔ lead signal separation (v3)

**Two distinct stages**, with the user/developer split made explicit:

1. **PM Triage (Phase 0)** — emits `user_impact_profile` with `U_*` fields. PM thinks about WHO needs WHAT and WHY, not lines of code.
2. **Lead (Phase 4 prep, before any `task()` calls)** — converts PM's `U_*` to numeric `S_*` scores (yes → 2, no → 0). Lead applies the auto-classification rules.

This keeps PM in user-land (no code metrics) and lead in scope-land (no user-story interpretation). PM doesn't estimate lines of code; lead verifies via `git diff`.

### PM-side signals (`U_*`, user-impact)

PM Triage outputs these in `brief.md` `## User-impact profile` section. Lead reads them.

| Signal | User-impact meaning | no → score | yes → score |
|---|---|---|---|
| `U_size` | User-visible scope (PM's estimate, NOT lines of code) | small (1-2) → 0 | medium (3-6) → 1 / large (7+) → 2 |
| `U_files` | User-visible surface area | narrow (1) → 0 | small (2-3) → 1 / medium (4-6) → 2 / wide (7+) → 3 |
| `U_new_capability` | User gets a brand-new feature? | no → 0 | yes → 2 |
| `U_behavior_shift` | User-visible behavior fundamentally changes? (not just "fixes wrong") | no → 0 | yes → 3 |
| `U_user_visible` | User notices the change at all (README/docs/UI)? | no → 0 | yes → 2 |
| `U_data_shape_breaking` | User's existing data files become incompatible? | no → 0 | yes → 2 |
| `U_data_safety` | User's data becomes safer (atomic write, recovery, no data loss)? | no → 0 | yes → 1 |
| `U_installs_new_dep` | User's `npm install` adds new packages? | no → 0 | yes → 2 |

### Lead-side signals (`S_*`, derived from PM's `U_*`)

Lead applies the conversion above. Total = sum of all 8 signals (range 0-16, typical 0-8).

### Auto-classification rules (deterministic — first match wins)

```
1. IF U_behavior_shift==yes OR U_data_shape_breaking==yes OR U_installs_new_dep==yes OR total >= 8
   → profile = "architecture"
   (Rationale: fundamental behavior change OR data-shape break OR new dep OR high total = structural work)

2. ELSE IF U_user_visible==yes AND total >= 3
   → profile = "feature"
   (Rationale: user-visible change + non-trivial scope = new feature work)

3. ELSE
   → profile = "bugfix"
   (Rationale: existing behavior corrected, no architectural signals, no new capability = bugfix)
```

**Override rule**: lead MAY override auto-classification if user chat explicitly states scope (e.g. "treat as architecture review"). Document the override in `decision.md` ## Round profile section.

**Reclassification mid-round**: if work scope expands (e.g. a bugfix touches persistence), lead MAY reclassify mid-round. Document the reclassification in `decision.md`.

### Phase gating per profile

**Skip a phase = lead does NOT call `task()` for it.** All skipped phases must be recorded in `decision.md` `## Skipped phases` section with reason.

| Phase | bugfix | feature | architecture |
|---|---|---|---|
| 0 PM Triage | **skip** (user chat IS the brief) | run | run |
| 0.5 PM Manager (gate) | **skip** | run | run |
| User pick candidate | **skip** (only 1 candidate) | run | run |
| 1 Architect | 1-paragraph plan (no full 7-section plan) | run (full plan) | run (full plan) + `/shared/hyperplan` |
| 2 Dev | run | run | run |
| 3a Tester Review (5 lens) | **3 lens** (Goal + QA + Security, drop Code + Context) | 5 lens | 5 lens + external review |
| 3b Tester Diff | run | run | run |
| 3c Tester Playwright | **skip unless UI changed** (diff touches `src/ui/` or `docs/screenshots/`) | run | run |
| 3.5 PM Doc Writer | run (1-para README add, no new screenshot) | run (full README section + screenshot) | run (full README section + screenshot) |
| 4 Decision | run (lead writes directly) | run | run |

**Phase 2, 3b, 3.5, 4, audit log are ALWAYS run** — these are the spine of the loop (worktree + empirical diff + documentation + decision + audit). Profile only skips optional lenses (Phase 3a) and gates pre-work (PM / PM Manager / user pick / full Architect plan).

### Round 1 retroactive scoring (validates v3 user-impact framing)

Round 1 (atomic state.json writes) re-framed as a user-story:

> **As a** reviewer doing long review sessions,
> **I want** my review history to survive power loss / editor crash / OOM-kill,
> **So that** I don't lose all my findings to a corrupted `state.json`.

| PM signal | Round 1 value | Lead → `S_*` |
|---|---|---|
| `U_size` | "small (1-2)" | 0 |
| `U_files` | "small (2-3)" | 1 |
| `U_new_capability` | no | 0 |
| `U_behavior_shift` | no | 0 |
| `U_user_visible` | no (internal state file format) | 0 |
| `U_data_shape_breaking` | no (state.json SCHEMA unchanged; only write mechanism) | 0 |
| `U_data_safety` | **yes** (atomic write instead of direct write, corrupt-file recovery) | 1 |
| `U_installs_new_dep` | no | 0 |
| **Total** | | **2** |

**Rule 1** (architecture): `U_behavior_shift==yes`? NO. `U_data_shape_breaking==yes`? NO. `U_installs_new_dep==yes`? NO. `total >= 8`? NO. → skip.
**Rule 2** (feature): `U_user_visible==yes`? NO. → skip.
**Rule 3** (bugfix): default → **`bugfix`**.

Under v3 rules, Round 1 would auto-classify as **bugfix**. The `U_data_safety` signal properly captures the user value ("review history survives crashes") without forcing the profile up. Same conclusion as v2 (after splitting persistence into breaking vs cosmetic) but cleaner: PM thinks in user terms, lead translates to numeric score, no ambiguity about whether atomicity is "cosmetic" or "breaking" — it's a user-facing safety improvement, full stop.

### Why this works

- **Deterministic**: same PM `U_*` inputs always produce the same lead `S_*` outputs → same profile.
- **Auditable**: PM's user-stories + `U_*` signals are visible in `brief.md` for retroactive verification. Lead's `S_*` conversion + total + rule applied are recorded in `decision.md`.
- **PM stays user-focused**: PM is **explicitly** not asked to estimate code metrics. The `U_*` field labels all reference user impact (user-visible scope, user-visible behavior, user-noticeable change, etc.).
- **Self-correcting**: the reclassification rule handles cases where the work scope expands mid-round (e.g. discovered it needs to touch persistence).
- **Bounded**: profile can only SKIP phases, never ADD phases. Architecture profile is the max-iteration ceiling.

See `references/loop-decision.md` § "Round profile auto-classification" for the full PM↔lead signal conversion table + Round 1 retroactive scoring rationale.

## Round artifacts (file structure)

Every round produces a directory `.omo/round-N/` with these 13 files (all **tracked** in v2):

```
.omo/round-N/
├── brief.md                    # PM's proposal + ranked candidates + ## Self-Critique
├── pm-manager-review.md        # PM Manager gate verdict (APPROVE / REJECT / CLARIFY)
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
└── decision.md                 # Lead's Phase 4 verdict (PASS/FAIL/CONTINUE/STOP)

# Plus cross-round (top-level .omo/):
.omo/proposals.jsonl            # append-only, 1 line per round (machine-readable summary)
```

**Removed from v1** (saved ~162 lines/file):
- ~~`brief-quality-report.md`~~ — merged into `brief.md` end section
- ~~`dev-self-check.md`~~ — merged into `decision.md` end section

**v1 preserved for retro reference**: `.omo/round-1/` (13 files, all Round 1 artifacts) is tracked for post-hoc review.

**`.gitignore` policy** (v2):
- `.omo/round-N/*.md` → **TRACKED** (project-level design library, browsable on GitHub)
- `.omo/proposals.jsonl` → **TRACKED** (cross-round decision log)
- `.opencode/{reviews,logs,cache,state.json,magic-context}/` → **gitignored** (per-machine runtime state)
- `.opencode/skills/team-dev-loop/` → **TRACKED** (skill package, project asset)
- `.playwright-mcp/` → **gitignored** (Playwright temp)

**Why tracked**: v1 gitignored `.omo/` and called it "audit trail" — but PR reviewers couldn't see it, cross-machine replay was impossible, after a few weeks the local files were lost. v2 treats `.omo/round-N/` as **canonical project documentation** that lives alongside the code.

## Per-phase details

### Phase 0: PM Triage

Spawned subagent. **Output**: `brief.md` (incl. ## Self-Critique).

- Inputs (priority order): user override, `gh issue list`, `.omo/backlog.md`, previous rounds' follow-up candidates, agent self-investigation
- Brief sections: ## Title, ## Source, ## Goal, ## Acceptance criteria (testable, max 7), ## Candidates ranked (3-5 candidates), ## Self-Critique (clarity + hidden ambiguities + risks)
- See `references/phase-prompts.md` § 1 for exact prompt

### Phase 0.5: PM Manager (gate)

Spawned subagent (independent of PM — fresh context). **Output**: `pm-manager-review.md`.

- Looks for pseudo-requirement markers: DUPLICATE, SPECULATION, CONTRADICTION, INFLATED, OBSCURE
- Returns `{ verdict: "APPROVE" | "REJECT" | "CLARIFY", reason, suggested_rewrite? }`
- If REJECT or CLARIFY → lead asks user before proceeding. Subagent does NOT auto-override.
- See `references/phase-prompts.md` § 2 for exact prompt

### Phase 1: Architect Plan

Spawned subagent (wraps `/shared/ulw-plan`). **Output**: `plan.md` (decision-complete plan).

- Plan sections: ## Goal, ## Acceptance Criteria (AC1-ACn), ## File changes, ## Implementation steps, ## Test plan, ## Risk register, ## Worker hand-off checklist
- Skip if trivial (single file, <30 lines, no architectural decision) — write 1-paragraph plan directly
- See `references/phase-prompts.md` § 3 for exact prompt

### Phase 2: Dev Execute

Spawned subagent (wraps `/shared/start-work`). **Output**: (worktree + commits + return value).

- MUST create worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-<N>` before any src/ edits (per project memory 372)
- Branch: `team-dev-loop-round-<N>-<short-slug>`
- Runs `bun run check` (format + lint + typecheck) + `bun run build` + unit tests + e2e tests
- Returns inline AC trace in return value (replaces v1's dev-self-check.md):
  ```typescript
  {
    brief_match_percent: 85,
    ac_trace: [
      { ac: "AC1", description: "...", status: "PASS", evidence: "src/state-store.ts:42" },
      ...
    ],
    deviations: [...],
    hidden_gaps: [...],
    test_summary: { unit: "10/10 pass", e2e: "13/13 pass", ... },
    verdict: "PASS | FAIL | PARTIAL",
    branch: "...",
    commit_sha: "..."
  }
  ```
- Lead copies `ac_trace` into `decision.md` ## Dev Self-Check section
- See `references/phase-prompts.md` § 4 for exact prompt

### Phase 3a: Tester Review (5 parallel lenses)

Spawned subagent that internally fires 5 parallel `run_in_background=true` lens subagents. **Outputs**: `review-{goal,qa,code,security,context}.md` + `test-report.md`.

| Lens | Output | Focus |
|---|---|---|
| #1 Goal | `review-goal.md` | Verifies each AC1-ACn is implemented (file:line evidence) |
| #2 QA | `review-qa.md` | Runs gates (`bun run check`, build, unit, e2e) + ad-hoc smoke test |
| #3 Code | `review-code.md` | Static review: style, complexity, error handling, naming, test quality, plan-design fidelity |
| #4 Security | `review-security.md` | Threat model: input validation, path traversal, command injection, secrets, race conditions |
| #5 Context | `review-context.md` | Repo-fit: scope creep, commit honesty, README alignment, future-round impact |

After 5 lenses complete, orchestrator subagent synthesizes `test-report.md` with PASS/FAIL per lens + combined verdict.

See `references/phase-prompts.md` § 5 + § 5a-5e for exact prompts.

### Phase 3b: Tester Diff

Spawned subagent. **Output**: `diff-report.md`.

- Uses the project's own `/diff-review-dashboard` tool against the branch
- Captures findings + URL + JSON response
- See `references/phase-prompts.md` § 6 for exact prompt

### Phase 3c: Tester Playwright

Spawned subagent. **Output**: `playwright-report.md`.

- Loads `/shared/playwright` skill
- Runs the plugin's UI in a real browser
- For this project specifically, ALWAYS tests: file tree, line click, file `+`, category/severity dropdowns, comment textarea, Add Finding, Submit Review, Conversation panel actions, cross-round drift, yellow range banner
- Captures screenshot at each step
- See `references/phase-prompts.md` § 7 for exact prompt

### Phase 3.5: PM Doc Writer

Spawned subagent. **Output**: `doc-update-report.md` (+ side effects: README + screenshots).

- Runs feature via Playwright one more time
- Captures screenshots at key steps → `docs/screenshots/<feature-slug>-<N>.png`
- Updates README.md (and optionally README.zh-CN.md) with new feature entry
- Commits the docs changes in worktree
- See `references/phase-prompts.md` § 8 for exact prompt

### Phase 4: Decision (lead writes directly)

No subagent — lead writes `decision.md` directly using the template in `references/loop-decision.md` § Decision template.

**Decision template fields**:
- ## Verdict (PASS / FAIL / CONTINUE / STOP)
- ## Per-phase verdicts (table)
- ## Dev Self-Check (AC1-ACN trace — copied from Dev's return value)
- ## Test summary (unit/e2e/build/lint/typecheck/format)
- ## Lead takeovers this round (or "None")
- ## Final outcome
- ## Audit trail (links to all .omo/round-N/*.md files)

Lead also appends one line to `.omo/proposals.jsonl` (schema in `references/loop-decision.md` § Decision log).

### Phase 5: Commit + push

Lead does:
```bash
git add .omo/round-N/ README.md README.zh-CN.md docs/screenshots/ src/ scripts/
git commit -m "Round <N>: <one-line summary>

Co-Authored-By: ..."
git push origin main   # no PR — user reviews commits on main directly
```

## Cost analysis: v1 vs v2

### Round 1 actuals (v1)

| Metric | Value |
|---|---|
| Team members created | 7 |
| Chat sessions opened | 7 |
| `team_send_message` calls | ~7 |
| `team_task_list` polls | ~12 |
| `team_shutdown_request`/`team_approve_shutdown` | ~14 |
| `team_delete` | 1 |
| Lead inline takeovers | 3 (tester-diff, tester-playwright, tester-doc-writer — 43% rescue rate) |
| Per-role subagent context | ~5-15k tokens |
| Round artifacts (disk) | 156,665 bytes across 15 files |
| Meta-artifacts (brief-quality, pm-manager-review, dev-self-check, decision, proposals.jsonl) | 23,188 bytes (15% of total) |
| Code change (lines) | 585 insertions / 29 deletions across 6 files |
| Artifacts : code ratio | ~268× |

### Round 2 expected (v2)

| Metric | Expected value |
|---|---|
| Team members created | 0 (no team_create) |
| Chat sessions opened | 0 |
| `task()` calls | 7-8 (one per phase) |
| `run_in_background=true` (inside Phase 3a) | 5 (parallel lenses) |
| Lead inline takeovers | ~3 (similar rate, refactored as design feature) |
| Per-role subagent context | ~5-15k tokens (same as v1) |
| Round artifacts (disk) | ~133,000 bytes across 13 files (saved 2 meta-artifacts) |
| Meta-artifacts | ~5,000 bytes (3.7% — only pm-manager-review + decision's AC trace section) |
| Artifacts : code ratio | similar (depends on round scope) |

**Net cost saving (v2 vs v1)**: ~80% reduction in orchestration plumbing turns, ~15% reduction in artifact disk, **0% reduction in actual subagent work** (that's intentional — same 7 roles).

## Anti-patterns (things v1 got wrong)

| v1 anti-pattern | v2 fix | Cost of v1 anti-pattern |
|---|---|---|
| `team_create` spawns 7 chat sessions even if only 4 are needed | Each role is a single `task()` call — no session overhead | ~7 chat session opens/closes + ~150kB runtime state |
| `team_send_message` is "multi-turn capable" but Round 1 used 0 resumes and triggered 3 stuck-states | Single-shot subagents — no stuck state to recover from | 3 lead inline takeovers in Round 1 |
| `.omo/team/<runId>/` ephemeral + gitignored | `.omo/round-N/` tracked + browsable on GitHub | Invisible to PR review, lost across machines |
| `brief-quality-report.md` separate file (18 lines) | Merged into `brief.md` end section | Extra file I/O + read-back |
| `dev-self-check.md` separate file (144 lines) | Merged into `decision.md` end section | Extra file I/O + read-back + duplication risk |
| Lead inline takeovers treated as "rescue" failures | Reframed as design feature with explicit protocol | Ambiguous "did we succeed or fail" boundary |
| `team_shutdown_request` + `team_approve_shutdown` ceremony per member | No ceremony — subagents are ephemeral by default | ~14 ceremony turns per round |
| Lead asks "what does team_task_list say?" 12 times per round | Lead reads return value of `task()` directly | ~12 polling turns of lead context |

## Migration from v1

v1 ran Round 1 successfully. **No re-run of Round 1 needed or wanted** — the artifacts are preserved in `.omo/round-1/` for retroactive review.

To migrate future rounds:
1. Use `task(category=<role-specific>, prompt=<one of 12 prompts in phase-prompts.md>)` instead of `team_send_message`. Per-role category is documented in `references/phase-prompts.md` "Per-role category mapping" table.
2. Use `Promise.all([5 run_in_background=true])` inside Phase 3a subagent for parallel lenses
3. Write outputs to `.omo/round-N/*.md` (NOT `.omo/team/<runId>/*.md`)
4. Lead writes `decision.md` and appends to `.omo/proposals.jsonl` directly (no subagent for these)
5. `git push origin main` (no PR)

If you need to reproduce v1 (e.g., to verify v2 equivalence on a known round), see `git show fcdf498` for the v1 SKILL.md / phase-prompts.md / loop-decision.md / docs/team-dev-loop.md.

## How to install

The skill is **tracked** (no install needed for project contributors — just `git pull`).

For external use (copying to another repo):
1. Copy `.opencode/skills/team-dev-loop/SKILL.md` + `references/` to your target repo
2. Copy `docs/team-dev-loop.md` to your target repo
3. Update `.omo/` paths in the skill to match your project
4. Restart OpenCode

## How to invoke

In OpenCode chat (primary sisyphus session):

> "Run the team dev loop for 5 rounds."
>
> "Do one round of the team dev loop on issue #4."
>
> "Continue the dev loop for 3 more rounds."
>
> "Run dev loop."
>
> "Pick next issue."

Or hosted by `/shared/ulw-loop` for full continuation mechanics.

**Important**: The dev loop MUST be driven from your primary chat session (the one with `sisyphus` as default agent). If you are a subagent and want to drive a round, you cannot — write a clear blocker and tell the user to invoke from primary chat. (Unlike v1, v2 doesn't have a `team_*` exception — the rule is the same: primary chat only.)

## See also

- `.opencode/skills/team-dev-loop/SKILL.md` — thin orchestrator stub with execution pattern (241 lines)
- `.opencode/skills/team-dev-loop/references/phase-prompts.md` — 12 exact prompts (7 sequential + 5 parallel lens) (716 lines)
- `.opencode/skills/team-dev-loop/references/loop-decision.md` — fail-mode matrix + decision template + proposals.jsonl schema (237 lines)
- `.omo/round-2-plan.md` — this redesign's plan (372 lines, tracked)
- `.omo/round-1/` — Round 1 artifacts (13 files, tracked, retroactive reference for v1)
- `/shared/ulw-plan` — Architect (Phase 1)
- `/shared/start-work` — Dev (Phase 2)
- `/shared/review-work` — Tester 5 lens (Phase 3a)
- `/shared/hyperplan` — Adversarial sub-loop (optional, for plan ambiguity)
- `/shared/playwright` — Tester Playwright (Phase 3c)
- `/diff-review-dashboard` — This project's own review tool (Phase 3b)

## License

This workflow is part of the @weekbin/opencode-review-dashboard project (MIT).
