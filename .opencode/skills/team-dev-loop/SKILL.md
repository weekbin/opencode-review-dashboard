---
name: team-dev-loop
description: "7-role dev loop for THIS REPO. 7 sequential task() calls + 5 parallel review-work lenses. NO team_create. Round N pre-staged at .omo/round-N/ as tracked docs (project-level design library, NOT ephemeral audit). Triggers: 'team dev loop', 'dev loop', 'run dev loop', 'pick next issue', 'next round', 'do 1 round'."
---

# /team-dev-loop Command (v2 — 2026-06-28 redesign)

## What changed from v1

v1 (Round 1, earlier 2026-06-28) used `team_create` to spin up 7 chat sessions per round, with `team_send_message` / `team_task_list` / `team_shutdown_request` coordination. **v2 removes the entire team_* lifecycle** and runs the same 7 roles as sequential `task(category=...)` calls. The 5 review-work lenses (Goal / QA / Code / Security / Context) that ran in parallel inside v1's `tester-review` member now run via `Promise.all([5 run_in_background=true])` inside the v2 `tester-review` task.

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

// === Phase 0: PM Triage ===
const brief = await task({
  category: "unspecified-high",
  prompt: PM_TRIAGE_PROMPT,   // from references/phase-prompts.md
})
// Writes: ${roundDir}/brief.md (incl. ## Self-Critique at end — no separate quality report)

// === Phase 0.5: PM Manager gate ===
const pmMgr = await task({
  category: "unspecified-high",
  prompt: PM_MANAGER_PROMPT,
})
if (pmMgr.verdict === "REJECT" || pmMgr.verdict === "CLARIFY") {
  askUser(`PM Manager ${pmMgr.verdict}: ${pmMgr.reason}. Override or skip?`)
}
// Writes: ${roundDir}/pm-manager-review.md

// === User pick candidate (HARD GATE — no auto-proceed) ===
// Ask user to pick 1 of PM's candidates. WAIT for answer.

// === Phase 1: Architect ===
const plan = await task({
  category: "unspecified-high",
  prompt: ARCHITECT_PROMPT,  // includes the user-picked candidate
})
// Writes: ${roundDir}/plan.md (decision-complete, ACs, file structure, worker checklist)

// === Phase 2: Dev ===
const dev = await task({
  category: "unspecified-high",
  prompt: DEV_PROMPT,        // includes brief + PM Manager review + plan
})
// Internal: creates worktree per project memory 372
// Internal: implements, runs tests, writes inline self-check into dev's return value
// (Dev does NOT write a separate dev-self-check.md — AC trace is appended to decision.md in Phase 4)

// === Phase 3a: Tester Review (5 parallel lenses) ===
const review = await task({
  category: "unspecified-high",
  prompt: TESTER_REVIEW_PROMPT,  // internally fires 5 run_in_background=true
})
// Writes: ${roundDir}/review-goal.md, review-qa.md, review-code.md, review-security.md, review-context.md
// Writes: ${roundDir}/test-report.md (synthesis of 5 lenses)

// === Phase 3b: Tester Diff (uses /diff-review-dashboard on the diff) ===
const diff = await task({
  category: "unspecified-high",
  prompt: TESTER_DIFF_PROMPT,
})
// Writes: ${roundDir}/diff-report.md

// === Phase 3c: Tester Playwright (real browser walkthrough) ===
const playwright = await task({
  category: "unspecified-high",
  prompt: TESTER_PLAYWRIGHT_PROMPT,
})
// Writes: ${roundDir}/playwright-report.md

// === Phase 3.5: PM Doc Writer ===
const doc = await task({
  category: "unspecified-high",
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

| Phase | Role | Subagent type | Output file(s) |
|---|---|---|---|
| 0 | PM Triage | `unspecified-high` | `brief.md` |
| 0.5 | PM Manager (gate) | `unspecified-high` | `pm-manager-review.md` |
| — | User pick candidate | (no subagent) | (lead asks user) |
| 1 | Architect | `unspecified-high` | `plan.md` |
| 2 | Dev | `unspecified-high` | (worktree + code + tests; inline AC trace in return) |
| 3a | Tester Review (5 lens parallel) | `unspecified-high` (×5 internal) | `review-{goal,qa,code,security,context}.md` + `test-report.md` |
| 3b | Tester Diff | `unspecified-high` | `diff-report.md` |
| 3c | Tester Playwright | `unspecified-high` | `playwright-report.md` |
| 3.5 | PM Doc Writer | `unspecified-high` | `doc-update-report.md` (side effect: README + screenshots) |
| 4 | Decision | (lead writes directly) | `decision.md` |
| — | Append audit log | (lead writes directly) | `.omo/proposals.jsonl` (1 line) |

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

1. **Verify** all expected output files exist (use the table in "Per-phase execution" above)
2. **Write** `decision.md` using the template in `references/loop-decision.md` § Decision template
3. **Append** one line to `.omo/proposals.jsonl` (see § Decision log in loop-decision.md)
4. **Commit** all round-N files + any side effects (README updates, screenshots, code in worktree):
   ```bash
   git add .omo/round-${N}/ README.md README.zh-CN.md docs/screenshots/ src/ scripts/
   git commit -m "Round ${N}: <one-line summary>

   Co-Authored-By: ..."

   git push origin main   # no PR — user reviews the commit on main directly
   ```
5. **No team_delete** (v2 has no team to delete)

## File structure (tracked, NOT ephemeral)

Every round produces a directory `.omo/round-N/` with these 13 files (all tracked):

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

- **worktree**: per project memory 372, Phase 2 (Dev) MUST create worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-N` before any src/ edits
- **Push strategy**: v2 commits go directly to `main` (no PR). User reviews commits on main. If user prefers PR flow, add a flag and use `gh pr create` instead.
- **5 review lens parallelism**: works because each lens writes to its OWN file (`review-goal.md` etc), so there's no shared write contention. The synthesis `test-report.md` is written by the tester-review subagent AFTER `Promise.all([5 lenses])` resolves.
- **Memory budget**: v1 consumed ~150KB of artifacts per round. v2 keeps the same artifact budget — the saving is in orchestration overhead, not artifact volume.
- **Main context compaction risk**: if the 5 lenses collectively produce >50KB of output and lead's main context already has the brief + plan + pm-manager-review (~30KB), lead may trigger context compaction. Mitigation: tester-review synthesizes `test-report.md` (1-2KB summary) and lead reads the summary, NOT the 5 lens files. The 5 lens files are available on disk for deep dive if needed.

## Migration from v1

v1 ran Round 1 successfully (commit `708a6fc` + `9e3b734` + `fcdf498`). The Round 1 artifacts are PRESERVED in `.omo/round-1/` (tracked) for retroactive review. v2 starts at Round 2 with the new pipeline. No re-run of Round 1 is needed or wanted.

If you need to run a v1-style round (e.g. to reproduce Round 1), see git history at `git show fcdf498` for the v1 SKILL.md.
