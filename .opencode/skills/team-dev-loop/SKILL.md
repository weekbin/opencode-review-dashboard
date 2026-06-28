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

// === Phase 0: PM Triage ===
const brief = await task({
  category: "unspecified-high",  // product judgment
  prompt: PM_TRIAGE_PROMPT,   // from references/phase-prompts.md
})
// Writes: ${roundDir}/brief.md (incl. ## Self-Critique at end — no separate quality report)

// === Phase 0.5: PM Manager gate ===
const pmMgr = await task({
  category: "ultrabrain",  // critical anti-pseudo-requirement reasoning
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

| Phase | Role | Subagent type | Output file(s) | Profile gating |
|---|---|---|---|---|
| 0 | PM Triage | `unspecified-high` | `brief.md` | bugfix: **skip** / feature: run / architecture: run |
| 0.5 | PM Manager (gate) | `ultrabrain` | `pm-manager-review.md` | bugfix: **skip** / feature: run / architecture: run |
| — | User pick candidate | (no subagent) | (lead asks user) | bugfix: **skip** / feature: run / architecture: run |
| 1 | Architect | `ultrabrain` | `plan.md` | bugfix: 1-para plan / feature: full plan / architecture: full plan + hyperplan |
| 2 | Dev | `deep` | (worktree + code + tests; inline AC trace in return) | always run |
| 3a | Tester Review (5 lens parallel) | `deep` (orchestrator) + 5 internal lenses | `review-{goal,qa,code,security,context}.md` + `test-report.md` | bugfix: 3 lens (Goal+QA+Security) / feature+architecture: 5 lens |
|   | 3a-1 Lens Goal | `quick` (parallel) | `review-goal.md` | always if 3a runs |
|   | 3a-2 Lens QA | `quick` (parallel) | `review-qa.md` | always if 3a runs |
|   | 3a-3 Lens Code | `ultrabrain` (parallel) | `review-code.md` | bugfix: **skip** / feature+architecture: run |
|   | 3a-4 Lens Security | `ultrabrain` (parallel) | `review-security.md` | always if 3a runs |
|   | 3a-5 Lens Context | `artistry` (parallel) | `review-context.md` | bugfix: **skip** / feature+architecture: run |
| 3b | Tester Diff | `unspecified-high` | `diff-report.md` | always run |
| 3c | Tester Playwright | `visual-engineering` | `playwright-report.md` | bugfix: **skip unless UI changed** / feature+architecture: run |
| 3.5 | PM Doc Writer | `writing` | `doc-update-report.md` (side effect: README + screenshots) | bugfix: 1-para README / feature+architecture: full README + screenshot |
| 4 | Decision | (lead writes directly) | `decision.md` | always run |
| — | Append audit log | (lead writes directly) | `.omo/proposals.jsonl` (1 line) | always run |

**Why different categories per role** (per user feedback on category-specialization): each role has a different work shape — product judgment (`unspecified-high`), critical reasoning (`ultrabrain`), autonomous end-to-end (`deep`), mechanical checks (`quick`), soft/uncoventional judgment (`artistry`), UI walkthrough (`visual-engineering`), documentation (`writing`). Picking the right sub-model per role gives better quality per token than a one-size-fits-all `unspecified-high` for everything.

## Round profile auto-classification (run before Phase 0)

Each round is auto-classified into 1 of 3 profiles based on **7 quantitative signals** — not lead judgment. The profile gates which phases run (see "Profile gating" column in the per-phase table above). The user feedback that triggered this: "如果是单纯的 bug 修复，用这个 loop 流程做就有点复杂了".

### 3 profiles

| Profile | What | Example |
|---|---|---|
| **bugfix** | Single-bug fix: 1-2 files, <50 lines, no architectural decision | Round 1: atomic state.json writes (1 new file 156 lines + 1 test file 338 lines) |
| **feature** | New user-visible feature: 3-6 files, 50-500 lines, may add new module/file | Adding "Resolved filter" button (2-3 files, ~100 lines) |
| **architecture** | Schema/state/API change, new dependency, new module boundary, >500 lines, >7 files | Refactoring state.json schema |

### 7 quantitative signals (each scored 0-3)

| Signal | Source | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| `S_size` | `lines_changed` (from `git diff --stat <base>..<branch>`) | 0-49 | 50-199 | 200-499 | 500+ |
| `S_files` | `files_changed` (count from `git diff --stat`) | 1 | 2-3 | 4-6 | 7+ |
| `S_new_module` | `new_files_count > 0` | no | — | yes | — |
| `S_architecture` | PM brief `## Architectural decisions` section (boolean) | no | — | — | yes |
| `S_user_visible` | PM brief `## User-visible changes` section (boolean) | no | — | yes | — |
| `S_persistence_breaking` | diff changes `state.json` schema / API response shape | no | — | yes | — |
| `S_persistence_cosmetic` | diff changes only write mechanism (atomicity, ordering) | no | yes | — | — |
| `S_dependencies` | diff adds/updates `package.json` deps | no | — | yes | — |

### Auto-classification rules (deterministic — first match wins)

```yaml
1. IF S_architecture==3 OR S_persistence_breaking==2 OR S_dependencies==2 OR total >= 8
   → profile = "architecture"
2. ELSE IF S_user_visible==2 AND total >= 3
   → profile = "feature"
3. ELSE
   → profile = "bugfix"
```

Lead reads these signals from PM Triage's `brief.md` `## Profile signals` section (machine-readable frontmatter) — see "PM Triage profile output" in `references/phase-prompts.md` § 1.

**Override rule**: lead MAY override auto-classification if user chat explicitly states scope (e.g. "treat as architecture review"). Document the override in `decision.md` ## Round profile section.

**Reclassification mid-round**: if work scope expands (e.g. bugfix touches persistence), lead MAY reclassify. Document in `decision.md`.

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
4. **Commit** all round-N files + any side effects (README updates, screenshots, code in worktree):
   ```bash
   git add .omo/round-${N}/ README.md README.zh-CN.md docs/screenshots/ src/ scripts/
   git commit -m "Round ${N}: <one-line summary>

   Co-Authored-By: ..."

   git push origin main   # no PR — user reviews the commit on main directly
   ```
5. **No team_delete** (v2 has no team to delete)

## Examples

### Example 1: Round 1 (bugfix profile) — atomic state.json writes

**Trigger**: User chat said "fix the data loss bug in state.json". PM Triage was skipped (bugfix profile, user chat IS the brief).

**Profile classification** (from `brief.md` `## Profile signals`):
```yaml
S_size: 500+       # 614 lines (insertion 585 + deletion 29)
S_files: 2-3       # 6 files
S_new_module: yes  # 2 new files
S_architecture: no
S_user_visible: no
S_persistence_breaking: no   # state.json SCHEMA unchanged, only WRITE mechanism
S_persistence_cosmetic: yes  # atomic write instead of direct write
S_dependencies: no
# total = 7
```

**Auto-classification**:
- Rule 1 (architecture): `S_persistence_breaking==yes`? NO. `total >= 8`? NO (7). → skip.
- Rule 2 (feature): `S_user_visible==yes`? NO. → skip.
- Rule 3 (bugfix): default → **bugfix**.

**Phases run** (under bugfix profile, see gating table): Dev, 3a (3 lens: Goal+QA+Security), 3b (Tester Diff), 3.5 (PM Doc Writer), 4 (Decision). Skipped: 0 PM Triage, 0.5 PM Manager, user pick, 1 Architect full plan (1-para), 3a-3 Code lens, 3a-5 Context lens, 3c Playwright (no UI change).

**Output**:
- 6 files committed, +585 / -29 lines
- 10/10 unit tests pass, 13/13 e2e pass
- PR #6 mergeable on first push

### Example 2: bugfix (1 file, <50 lines)

**Trigger**: User reports typo in README.

**Profile**: bugfix (total=0-1).

**Phases run**: Dev, 3a (3 lens), 3b, 3.5 (1-para README fix), 4. Total ~5 phases instead of 8.

### Example 3: architecture (schema change)

**Trigger**: User says "refactor state.json to use indexed-by-round structure".

**Profile**: architecture (`S_persistence_breaking==yes`).

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

- **worktree**: per project memory 372, Phase 2 (Dev) MUST create worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-N` before any src/ edits
- **Push strategy**: v2 commits go directly to `main` (no PR). User reviews commits on main. If user prefers PR flow, add a flag and use `gh pr create` instead.
- **5 review lens parallelism**: works because each lens writes to its OWN file (`review-goal.md` etc), so there's no shared write contention. The synthesis `test-report.md` is written by the tester-review subagent AFTER `Promise.all([5 lenses])` resolves.
- **Memory budget**: v1 consumed ~150KB of artifacts per round. v2 keeps the same artifact budget — the saving is in orchestration overhead, not artifact volume.
- **Main context compaction risk**: if the 5 lenses collectively produce >50KB of output and lead's main context already has the brief + plan + pm-manager-review (~30KB), lead may trigger context compaction. Mitigation: tester-review synthesizes `test-report.md` (1-2KB summary) and lead reads the summary, NOT the 5 lens files. The 5 lens files are available on disk for deep dive if needed.

## Migration from v1

v1 ran Round 1 successfully (commit `708a6fc` + `9e3b734` + `fcdf498`). The Round 1 artifacts are PRESERVED in `.omo/round-1/` (tracked) for retroactive review. v2 starts at Round 2 with the new pipeline. No re-run of Round 1 is needed or wanted.

If you need to run a v1-style round (e.g. to reproduce Round 1), see git history at `git show fcdf498` for the v1 SKILL.md.
