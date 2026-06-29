---
name: team-dev-loop
description: "Use this skill for running a 7-role dev loop (PM/PM Manager/Architect/Dev/Tester/PM Doc Writer/Decision) on this repo, with 5 parallel review-work lenses, deterministic round-profile auto-classification into bugfix/feature/architecture, and a tracked .omo/round-N/ design library. Triggers: 'team dev loop', 'dev loop', 'run dev loop', 'pick next issue', 'next round', 'do 1 round'."
---

# /team-dev-loop Command (v2)

> **Last Updated**: 2026-06-28 (v2 redesign: removed team_create, added per-role category, added round profile auto-classification)
> **Status**: stable — Round 1 ran on v1 (commit `708a6fc`), Round 2+ will run on v2.

## What changed from v1

v1 (Round 1) used `team_create` to spin up 7 chat sessions per round, with `team_send_message` / `team_task_list` / `team_shutdown_request` coordination. **v2 removes the entire team_* lifecycle** and runs the same 7 roles as sequential `task(category=...)` calls. The 5 review-work lenses (Goal / QA / Code / Security / Context) that ran in parallel inside v1's `tester-review` member now run via `Promise.all([5 run_in_background=true])` inside the v2 `tester-review` task.

**Why**: v1 used 7 chat sessions + ~7 wakeups + ~12 polls + 3 lead inline takeovers (43% rescue rate) for one round. v2 eliminates all session-management overhead while keeping the 5-lens parallel value. Evidence: `.omo/round-1/` (tracked, see Section 6) + `.omo/round-2-plan.md` (this redesign's plan).

## Quick start

The full 7-role pipeline design lives in `docs/team-dev-loop.md` (tracked) and the skill body lives in this directory. Read them in this order:

1. **`docs/team-dev-loop.md`** — design + usage doc (~700 lines, tracked)
2. **`SKILL.md` (this file)** — orchestrator stub with execution pattern
3. **`references/phase-prompts.md`** — exact prompts to send each role (12 prompts total: 7 sequential + 5 parallel lenses)
4. **`references/loop-decision.md`** — fail-mode handling matrix + lead takeover protocol

## What this skill does

For each round `N`:
1. Read `.omo/round-N/brief.md` (PM's proposal with ranked candidates)
2. Run the 7 phases sequentially as `task()` calls (Phase 0 PM → Phase 0.5 PM Manager → user pick gate → Phase 1 Architect → Phase 2 Dev → Phase 3a-c Tester → Phase 3.5 PM Doc Writer → Phase 4 Decision)
3. Phase 3a (Tester Review) internally fans out 5 parallel `run_in_background=true` lenses
4. Write `.omo/round-N/decision.md` (lead writes directly, no separate task)
5. Append one line to `.omo/proposals.jsonl` (cross-round decision log)
6. `git add` + `git commit` + `git push origin main` (one commit per round, no PR — user reviews the round directly on main)

## Agent architecture

| Layer | Agent | Why |
|---|---|---|
| **Orchestrator (lead)** | **`sisyphus` (primary chat)** | Lead owns the round lifecycle, writes `decision.md`, commits. Has all tools. |
| **Per-role subagents** | `task(category="...", subagent_type="...")` for each phase | Sequential, fresh context per phase. No state across phases. |
| **5 review-work lenses** | `task(..., run_in_background=true)` ×5 inside tester-review task | Truly parallel — `Promise.all` collected in tester-review subagent. |

**Critical constraints**:
- Lead NEVER uses `team_create` / `team_send_message` / `team_shutdown_request` / `team_delete`. Use `task()`.
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

// === Phase 0: PM Triage (user-story advocate, NOT developer) ===
const brief = await task({
  category: "unspecified-high",  // product judgment
  prompt: PM_TRIAGE_PROMPT,   // from references/phase-prompts.md
})
// Writes: ${roundDir}/brief.md
//   - ## Candidates ranked (3-5 user-stories: As / I want / So that)
//   - ## User-impact profile (U_* fields: U_size, U_files, U_new_capability,
//     U_behavior_shift, U_user_visible, U_data_shape_breaking,
//     U_data_safety, U_installs_new_dep)
// PM does NOT estimate lines of code or file counts — that's lead's job.

// === Phase 0.5: PM Manager gate ===
const pmMgr = await task({
  category: "ultrabrain",  // critical anti-pseudo-requirement reasoning
  prompt: PM_MANAGER_PROMPT,
})
if (pmMgr.verdict === "REJECT" || pmMgr.verdict === "CLARIFY") {
  askUser(`PM Manager ${pmMgr.verdict}: ${pmMgr.reason}. Override or skip?`)
}
// Writes: ${roundDir}/pm-manager-review.md

// === User pick candidate (HARD GATE — auto-pick policy below) ===
// Ask user to pick 1 of PM's candidates. WAIT for answer.
//
// **R4 loop meta-review auto-pick policy** (mandatory):
// 1. Present all candidates + recommendation in one batched message.
// 2. Wait for user pick.
// 3. If user has not picked after **3 consecutive lead turns** (i.e., 3 "Continue from the previous assistant state" or similar non-response messages), lead MUST auto-pick the **highest user-value candidate that has passed PM Manager review** (typically the PM-recommended one).
// 4. Document the auto-pick explicitly in the audit trail:
//    - Add a "## Auto-pick (R4 loop meta-review policy)" section to `.omo/round-N/decision.md` explaining: how many non-response turns preceded the auto-pick, which candidate was auto-picked, why that candidate (consistency with user's prior picks + highest user value), and the user's right to override.
//    - Add a "lead_takeovers" entry to `.omo/proposals.jsonl` recording the auto-pick: `{"phase": "user-pick", "auto_picked": "#<N> <title>", "non_response_turns": <N>}`.
// 5. **DO NOT** block the loop indefinitely. The user-pick gate is to gate significant decisions, not to gate progress when the user is unavailable. The system-directive "do not stop until all tasks are done" + the user-profile's "explicit confirmation" preference are both legitimate but the latter cannot block the former indefinitely. Auto-pick resolves the conflict.
//
// **R4 evidence for this policy**: 4 user-non-response turns preceded the auto-pick. User's prior "1" picks (R3 retro + path forward) + the PM-recommended candidate (#1 "Previously discussed" panel, 5/5 user value) were used as the auto-pick rationale. After R4 shipped, the user reviewed the commit and could override by reverting the merge commit if desired.

// === Phase 1: Architect ===
const plan = await task({
  category: "ultrabrain",  // architecture decisions
  prompt: ARCHITECT_PROMPT,  // includes the user-picked candidate
})
// Writes: ${roundDir}/plan.md (decision-complete, ACs, file structure, worker checklist)

// === Phase 2: Dev ===
const dev = await task({
  category: "deep",  // autonomous end-to-end (worktree + tests + commit)
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

For each phase, read `references/phase-prompts.md` for the exact prompt body. Each prompt is copy-paste ready. Order is fixed: PM → PM Manager → user pick → Architect → Dev → Tester (3 lanes) → PM Doc Writer → Decision.

**IMPORTANT**: phases marked with `bugfix` / `feature` / `architecture` are gated by the round profile — see "Round profile auto-classification" below. Lead should NOT call `task()` for phases that the profile says to skip.

**Test environment policy (R4 loop meta-review lesson, MANDATORY)**:
- **3a Tester Playwright** and **3.5 PM Doc Writer** (when capturing screenshots) use the `review-dashboard-ui-test` skill, which drives Playwright MCP against a mock server. Both must follow the **test session lifecycle**:
  1. **Pre-test cleanup** (mandatory): kill any orphan Chrome (`pkill -9 -f "chrome.*--type=zygote"`) + kill any orphan mock-server (`pkill -9 -f "mock-server.py"`) + verify port 8890 free (`ss -ltn | grep -q :8890`) + verify Chrome count < 3.
  2. **Per-test cleanup**: between every test scenario, call `playwright_browser_close()` (idempotent). This is the #1 fix for the user-reported "Playwright tests are slow, unstable, cause CPU 100%" pattern.
  3. **Post-test cleanup** (mandatory): kill mock server PID (record on start), kill orphan Chrome, verify clean state (Chrome count = 0, port 8890 free). **NEVER end a Playwright test session without this step** — that's how the user-reported "machine freezes" happens.
- See `.opencode/skills/review-dashboard-ui-test/SKILL.md` Step 2 (pre-test), Step 4 (per-test close call), Step 5 (post-test) for the exact commands.

| Phase | Role | Subagent type | Default executor | Output file(s) | Profile gating |
|---|---|---|---|---|---|
| 0 | PM Triage | `unspecified-high` | subagent | `brief.md` | bugfix: **skip** / feature: run / architecture: run |
| 0.5 | PM Manager (gate) | `ultrabrain` | subagent | `pm-manager-review.md` | bugfix: **skip** / feature: run / architecture: run |
| — | User pick candidate | (no subagent) | lead | (lead asks user) | bugfix: **skip** / feature: run / architecture: run |
| 1 | Architect | `ultrabrain` | subagent (or lead for bugfix 1-para) | `plan.md` | bugfix: 1-para plan / feature: full plan / architecture: full plan + hyperplan |
| 2 | Dev | `deep` | subagent (or lead for trivial bugfix) | (worktree + code + tests; inline AC trace in return) | always run |
| 3a | Tester Review (5 lens parallel) | `deep` (orchestrator) + 5 internal lenses | **lead by default** (R4 retro: orchestrator subagent stalled 7+ min with 5 lens tasks idle; lead synthesizing `test-report.md` directly was faster and just as accurate) | `review-{goal,qa,code,security,context}.md` + `test-report.md` | bugfix: 3 lens (Goal+QA+Security) / feature+architecture: 5 lens |
|   | 3a-1 Lens Goal | `quick` (parallel) | subagent | `review-goal.md` | always if 3a runs |
|   | 3a-2 Lens QA | `quick` (parallel) | subagent | `review-qa.md` | always if 3a runs |
|   | 3a-3 Lens Code | `ultrabrain` (parallel) | subagent | `review-code.md` | bugfix: **skip** / feature+architecture: run |
|   | 3a-4 Lens Security | `ultrabrain` (parallel) | subagent | `review-security.md` | always if 3a runs |
|   | 3a-5 Lens Context | `artistry` (parallel) | subagent | `review-context.md` | bugfix: **skip** / feature+architecture: run |
| 3b | Tester Diff | `unspecified-high` | **lead by default** | `diff-report.md` | always run |
| 3c | Tester Playwright | `visual-engineering` | subagent for UI-heavy / lead for small UI changes | `playwright-report.md` | bugfix: **skip unless UI changed** / feature+architecture: run |
| 3.5 | PM Doc Writer | `writing` | **lead by default when work is small** (≤3 doc files, no screenshot, no Playwright MCP needed) / subagent for full README rewrite + screenshot capture | `doc-update-report.md` (side effect: README + screenshots) | bugfix: 1-para README / feature+architecture: full README + screenshot |
| 4 | Decision | (no subagent) | **lead always** | `decision.md` | always run |
| 4.5 | **Round-end retrospective** | (no subagent) | **lead always** | `.omo/round-N/retro.md` | **always run** (mandatory) |
| — | Skill-update patch (if retro surfaced skill gaps) | (no subagent) | **lead always** | `.opencode/skills/team-dev-loop/**` | **always run if retro surfaces skill gaps** |
| — | Append audit log | (no subagent) | **lead always** | `.omo/proposals.jsonl` (1 line) | always run |

**Default executor rationale (Round 3 lesson)**: R3 had 5/7 lead takeovers (71%), R1 had 3/7 (43%). The skill already framed takeovers as "DESIGN FEATURE, not rescue", but didn't say which phases are "typically lead-written" by default. The new `Default executor` column makes it transparent: **3b Tester Diff is `git diff main` + write report, no fresh subagent context needed → lead by default**. **3c Playwright is subagent for UI-heavy rounds, lead for small UI changes** (R3's 3c was a small change → lead-written). 0/0.5/1/2/3a stay as subagents because the work is non-trivial; 4/4.5/patches/audit stay as lead because they need full context. Lead can always override the default (per the existing "Lead inline takeover protocol" section).

**Backlog-freshness gate (Round 3 lesson)**: Before Phase 0 PM Triage, lead checks `.omo/proposals.jsonl` `follow_up_candidates`. If 3+ candidates are all small bugfixes (e.g. R1-3 backlog had 3 bugfixes: #3 Reopen end_line, #4 E2E coverage gap, #5 take-screenshots dead code), lead MUST instruct PM to surface **at least 1 fresh user-story via self-investigation** (read README + recent code + recent commits, NOT just re-rank the bugfix backlog). See `references/phase-prompts.md` PM Triage prompt § "Backlog freshness check" for the full check. Without this gate, PM auto-retreads stale bugfix backlog (R1-2 evidence) instead of surfacing new user value (R3 evidence: PM self-investigated and found the prior-round context gap, correctly classified as feature).

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
2. ELSE IF U_user_visible==yes AND total >= 3
   → profile = "feature"
3. ELSE
   → profile = "bugfix"
```

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

## Closure sequence (every round)

When all 7 phases terminal (each `task()` either returned or was taken over):

1. **Verify** expected output files exist: for `bugfix` profile, expect ≥ 3 of 13 files; for `feature` profile, expect ≥ 8 of 13 files; for `architecture` profile, expect all 13 files in `.omo/round-${N}/`. If any expected file is missing AND the phase that produces it was NOT marked as `skipped` in `decision.md` `## Skipped phases`, halt and write `lead-takeover-<role>.md` for the missing role.
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

## Round-end retrospective (Phase 4.5 — MANDATORY every round)

The loop is not closed until the lead writes `.omo/round-N/retro.md` AND (if the retro surfaces skill gaps) commits a skill patch. This is what makes the loop **self-improving** rather than just self-repeating.

**When**: Always, after Phase 4 Decision, BEFORE the closure commit. Skipping the retro is a soft-block — the loop cannot end on `decision = ship-to-main` without it.

**Why mandatory**:
- Without it, the same loop frictions repeat across rounds. Round 1 spent 90+ min on the Bun.write mocking problem; Round 2 had the React wrong-command-C pitfall; Round 3 had the `ctx.client.app.log` harness limitation. Each was a one-round discovery with no in-band propagation.
- The loop's purpose is to compound improvements, not just to ship features. Without retro, the skill becomes a snapshot of the Round 0 design and never improves.

**Output `.omo/round-N/retro.md` (no blank sections)**:

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
- **Proposed patch** (1-2 sentences describing the addition)

## Followup items
<0-N bullets, each is a concrete carry-over task>

## Action items for next round
<ordered list, the FIRST item MUST be any pending skill patch>
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

**Output `.omo/round-N/post-exec-analysis.md` (no blank sections)**:

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
- **Proposed patch** (1-2 sentences describing the addition)

## Followup items
<0-N bullets, each is a concrete carry-over task>

## Action items for next round
<ordered list, the FIRST item MUST be any pending skill patch from the new skill gaps section>
```

**Workflow distinction from Phase 4.5 retro**:
- Phase 4.5 retro: "did the round ship the right thing?" (content)
- Phase 4.6 post-exec: "did the round's call flow run cleanly?" (process)

Both are mandatory. Both are lead-written. Both can surface skill patches. The two-step split ensures process improvements (call-flow) don't get lost in content review (shipped-features).

**R4 evidence for this split**: R4 retro captured the "R3 audit-trail fabricated" content lesson (Gap 1 was about PM Manager's pre-check). It did NOT capture the "PM Triage should ALSO do the pre-check" call-flow lesson (the PM Triage pre-check is now Patch 1 in the R4 post-exec). The split would have caught both.

## Skill-update rule (when retro or post-exec surfaces skill gaps)

If the retro's "Skill gaps found" section is non-empty:

1. **Apply the patches first** — treat them as the highest-priority deliverable of the next round, ahead of any user-picked candidate. The patches are committed to `.opencode/skills/team-dev-loop/` (SKILL.md, references/loop-decision.md, references/phase-prompts.md, docs/team-dev-loop.md).
2. **Verify** with the skill-review audit on the skill directory — must hit 100% PASS, 0 blockers, 0 majors before the user picks the next feature candidate. Run via the slash-command .
3. **Commit and push** the skill patches separately from any product work, so the audit gate is visible in git history.
4. **Record** the skill-updates commit SHAs in the next round's `brief.md` ## Skill updates section, so the lineage is traceable in `.omo/proposals.jsonl`.

The recursive rule: **the loop improves the skill, the improved skill improves the loop**. Without this, "team-dev-loop" becomes just a static 7-role ceremony.

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

Every round produces a directory `.omo/round-N/` with these 13 files (all tracked):

```text
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
