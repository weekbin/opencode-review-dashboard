  # Team Dev Loop

  The 8-phase development loop for **this repo** (`@weekbin/opencode-review-dashboard`).

  ## Agent architecture (CRITICAL — read first)

`team_*` tools (team_create, team_send_input, team_task_create, team_delete, etc.) are only registered to the **primary `sisyphus` agent** when `team_mode.enabled=true`. Subagents (`sisyphus-junior`, `prometheus`, etc.) do NOT get these tools.

**This means**: the dev loop MUST be driven from your primary chat session (the one with sisyphus as default agent). Subagents can only be role-specific workers AFTER the team is created.

If you are a subagent (e.g., `prometheus`) and want to drive a round, you **cannot**. Write a clear `blocker.md` and tell the user to invoke the loop from their primary chat.

## What it is

  A self-driving loop for picking the next thing to build, proposing it, gating it, designing it, building it, validating it, documenting it, and looping — without any single agent (or you) being biased toward "looks done." Each round is:

  ```
  PM (propose + self-critique)  →  PM Manager (gate on pseudo-requirements)
                                    ↓
  Architect (plan)  →  Dev (execute + inline self-check)  →  Tester (5-agent + diff-review + Playwright)
                                                                                         ↓
                                                                            PM Doc Writer (Playwright + README)
                                                                                         ↓
                                                                            Decision (continue / stop)
  ```

  ## Why 7 roles (anti-bias)

  Each phase is a SEPARATE subagent with fresh context. This prevents:

  | Risk | Mitigation |
  |---|---|
  | PM proposes a fake demand | PM self-critique + PM Manager meta-review |
  | Orchestrator hallucinates requirements | PM is spawned, not the orchestrator's own judgment |
  | Dev self-confirms "done" without matching brief | Dev does inline brief-vs-code self-check at end of Phase 2 (writes dev-self-check.md); PM Manager also guards upstream |
  | Code passes tests but UI doesn't work | Playwright tester clicks through every button — empirical |
  | Feature ships without docs | PM Doc Writer updates README with screenshot + usage after every ship |

  ## The 8 roles

  | Role | What | Implementation |
  |---|---|---|
  | **PM** | Pick next item: `gh issue list` + `.omo/backlog.md` + user prompt + agent self-investigation. Output: brief + self-critique | Spawned subagent (Phase 0) |
  | **PM Manager** | Validate PM's proposal for pseudo-requirements (DUPLICATE / SPECULATION / CONTRADICTION / INFLATED / OBSCURE) | Spawned subagent (Phase 0.5) |
  | **Architect** | Decision-complete plan | Reuses `/shared/ulw-plan` (Phase 1) |
  | **Dev** | Implement + failing-first tests + commit | Reuses `/shared/start-work` (Phase 2) |
  | ~~Verifier~~ | *(merged into Dev — Dev does inline brief-vs-code self-check)* | inline in Dev |
  | **Tester** | Code review + dogfooded diff + Playwright UI click-through | Reuses `/shared/review-work` + `/diff-review-dashboard` + Playwright MCP (Phase 3) |
  | **PM Doc Writer** | Run feature via Playwright, capture screenshots, update README with feature catalog entry | Spawned subagent (Phase 3.5) |
  | **Decision** | Loop control based on all prior outputs | Inline (Phase 4) |

  **~85% reuse** — only PM, PM Manager, PM Doc Writer are new roles (Verifier merged into Dev). Architect / Dev / Tester wrap existing skills.

  ## Backlog priority

  1. **User override** (your current chat prompt) — highest
  2. **GitHub issues** with `bug` label
  3. **GitHub issues** with `enhancement` label
  4. **`.omo/backlog.md`** (manually curated, optional)
  5. **Agent self-investigation** (only when 1-4 are empty)

  ## Loop control

  | Condition | Action |
  |---|---|
  | You say "stop" | Exit immediately |
  | Backlog empty | Exit with summary |
  | 3 consecutive no-progress rounds | Suggest stop (you decide) |
  | PM Manager REJECT / CLARIFY | Ask you before proceeding |
  | Dev self-check FAIL | Loop back to Dev (iterates) |
  | Tester FAIL (especially Playwright) | Loop back to Phase 2 (Dev fixes) |
  | Doc Writer FAIL | Loop back to Phase 3.5 only (code already shipped) |
  | All clean + backlog has more | Ask you "next round?" |

  ## Trivial mode

  For trivial work (single-file, <30 lines, no architectural decision):
  - SKIP Phase 0.5 (PM Manager)
  - (Verifier merged into Dev — no separate role to skip)
  - STILL mandatory: PM (brief), Architect (1-paragraph plan), Dev, Tester (with Playwright), PM Doc Writer

  ## Round artifacts

  Each round writes to `.omo/team/<round>/` (gitignored):

  ```
  .omo/team/round-1/
  ├── brief.md                    # PM's proposal
  ├── brief-quality-report.md     # PM's self-critique
  ├── pm-manager-review.md        # PM Manager's gate verdict
  ├── plan.md                     # Architect's plan
  ├── dev-self-check.md          # Dev's inline brief-vs-code self-verification
  ├── test-report.md              # review-work verdict
  ├── diff-report.md              # /diff-review-dashboard verdict
  ├── playwright-report.md        # Playwright UI walkthrough
  ├── doc-update-report.md        # PM Doc Writer's README update
  └── decision.md                 # Phase 4 output
  ```

  Plus a persistent audit trail:
  ```
  .omo/team/proposals.jsonl       # one JSON line per round, append-only
  ```

  ## Team mode + tmux

  ### team_* tools (preferred)

  When available (oh-my-openagent installed), use:
  - `team_spawn_agent` — spawn role subagent
  - `team_send_input` — inter-agent messaging
  - `team_wait_agent` — synchronized waiting
  - `team_close_agent` — cleanup

  Fallback to `task(...)` if team_* unreachable.

  ### tmux per round

  Each round gets a tmux session for shared visibility:

  ```bash
  # At round start
  which tmux || brew install tmux
  tmux new-session -d -s "team-dev-loop-round-N" -c <worktree>

  # Inter-agent messaging
  tmux send-keys -t "team-dev-loop-round-N:0.0" "PM done" C-m

  # At round end (optional)
  tmux kill-session -t "team-dev-loop-round-N"
  ```

  ## How to install (you only do this once)

  The skill is gitignored. To install:

  1. Create `.opencode/skills/team-dev-loop/references/`.
  2. Copy each fenced code block below into the corresponding file.
  3. Restart OpenCode.

  ## How to invoke

  In OpenCode chat:

  > "Run the team dev loop for 5 rounds."
  >
  > "Do one round of the team dev loop on issue #4."
  >
  > "Continue the dev loop for 3 more rounds."
  >
  > "Run dev loop."

  You can also let `/ulw-loop` host it for full continuation mechanics.

  ---

  ## File: SKILL.md (copy verbatim to `.opencode/skills/team-dev-loop/SKILL.md`)

  ~~~markdown
  ---
  name: team-dev-loop
  description: "Multi-role development loop for this repo. One round = PM proposes (with self-critique) → PM Manager validates (anti-pseudo-requirement gate) → Architect plans (via /shared/ulw-plan) → Dev executes (via /shared/start-work, with inline brief-vs-code self-check) → Tester validates (review-work + /diff-review-dashboard + Playwright UI) → PM Doc Writer updates README with screenshots via Playwright → Decision (continue/stop). 7-role pipeline; every role a fresh subagent (anti-bias). Persistent audit trail at .omo/team/proposals.jsonl. Reuses /shared/ulw-plan, /shared/start-work, /shared/review-work. tmux provides shared visibility. team_* preferred, task_* fallback. Triggers: 'team dev loop', 'dev loop', 'run dev loop', 'pick next issue', 'next round'."
  ---

  # team-dev-loop

  The 7-role development loop for THIS REPO (originally 8-phase; Verifier merged into Dev to respect omo's `team_mode.max_members: 8` schema limit). It exists so the dev team (you + me) can pick the next thing to work on, propose it, gate it, design it, build it, validate it, document it, and loop — without any single agent (or you) being biased toward "looks done."

  ## Why 7 roles (anti-bias)

  Each phase is a SEPARATE subagent with fresh context. This prevents:

  | Risk | Mitigation |
  |---|---|
  | PM proposes a fake demand | **PM self-critique** (`brief-quality-report.md`) + **PM Manager** meta-review (`pm-manager-review.md`) |
  | Orchestrator hallucinates requirements | PM is a spawned subagent, not the orchestrator's own judgment |
  | Dev self-confirms "done" without matching brief | **Dev does inline brief-vs-code self-check** at end of Phase 2 (writes `dev-self-check.md`); PM Manager also guards upstream |
  | Code passes tests but UI doesn't work | **Playwright** tester clicks through every button — empirical, not subjective |
  | Feature ships without docs | **PM Doc Writer** updates README with screenshot + usage after every ship |

  ## Roles

  | Role | When | Output |
  |---|---|---|
  | **PM** (Phase 0) | Start | `brief.md`, `brief-quality-report.md` |
  | **PM Manager** (Phase 0.5) | After PM | `pm-manager-review.md` (APPROVE / REJECT / CLARIFY) |
  | **Architect** (Phase 1) | After PM Manager approves | Delegates to `/shared/ulw-plan` → `plan.md` |
  | **Dev** (Phase 2) | After plan approved | Delegates to `/shared/start-work` → code commits |
  | **Tester** (Phase 3) | After Dev self-check passes | `test-report.md` + `diff-report.md` + `playwright-report.md` |
  | **PM Doc Writer** (Phase 3.5) | After Tester passes | `doc-update-report.md` + README + screenshot(s) |
  | **Decision** (Phase 4) | After Doc Writer | `decision.md` (continue / stop / loop-back) |

## Agent architecture (CRITICAL)

| Layer | Agent | Why |
|---|---|---|
| **Orchestrator (creates team)** | **`sisyphus` (primary chat)** | omo `team_mode` only registers `team_*` tools to the primary `sisyphus` agent. Subagents (`sisyphus-junior`, `prometheus`, etc.) do NOT get `team_create` / `team_send_input` / `team_task_create` tools — they only get `call_omo_agent` (explore/librarian only). So `team_create` MUST be called from the primary chat. |
| **Members (spawn per role)** | `team_spawn_agent` (preferred) or `task(category="unspecified-high", subagent_type="sisyphus-junior")` (fallback) | Once team is created, each member is a fresh sisyphus-junior subagent. Anti-bias preserved. |

### Hand-off pattern

```
Primary chat (sisyphus, has team_* tools)
  ↓ team_create({teamName: "team-dev-loop"})
  ↓ team_send_message(member="pm", prompt="<pm-triage-prompt>")
  ↓ team_task_create(subject="pm-round-1", description=...)
  ↓ team_send_message(member="pm-manager", prompt="<pm-manager-prompt>")
  ↓ ...
  ↓ team_shutdown_request(member="pm") / team_approve_shutdown
  ↓ team_shutdown_request(member="pm-manager") / team_approve_shutdown
  ↓ ...
  ↓ team_delete(teamRunId)
```

If you are a subagent (e.g., `prometheus`) and want to drive a round, you cannot. Write a clear `blocker.md` and tell the user to invoke the loop from their primary chat.

### Hard rule: orchestrator = primary chat

DO NOT attempt to run `team_create` from a subagent. It is structurally impossible. The PRIMARY chat session is the orchestrator; subagents are only the role-specific workers.

  ## Loop control

  | Condition | Action |
  |---|---|
  | User said "stop" / "exit" / Ctrl+C | Exit immediately |
  | Backlog empty + no user override + no agent suggestion | Exit with summary |
  | 3 consecutive rounds with no-progress | Suggest stop to user (do NOT auto-stop) |
  | PM Manager REJECT / CLARIFY | Ask user for confirmation before proceeding |
  | Tester FAIL | Loop back to Phase 2 (Dev fixes) with tester feedback |
  | Doc Update FAIL | Loop back to Phase 3.5 (Doc Writer retries) — code already shipped, just docs |
  | All clean + backlog has more | Ask user "next round?" — if user says continue, go to Phase 0 |

  ## Trivial mode

  For trivial work (single-file, <30 lines, no architectural decision):
  - SKIP Phase 0.5 (PM Manager)
  - STILL mandatory: PM (with brief), Architect (1-paragraph plan), Dev (with inline self-check), Tester (with Playwright), PM Doc Writer

  ## Round artifacts

  Each round writes to `.omo/team/<round>/` (gitignored):

  ```
  .omo/team/round-1/
  ├── brief.md                    # PM's proposal
  ├── brief-quality-report.md     # PM's self-critique
  ├── pm-manager-review.md        # PM Manager's gate
  ├── plan.md                     # Architect's plan (or symlink to .omo/plans/...)
  ├── dev-self-check.md          # Dev's inline brief-vs-code self-verification
  ├── test-report.md              # review-work verdict
  ├── diff-report.md              # /diff-review-dashboard verdict
  ├── playwright-report.md        # Playwright UI walkthrough verdict
  ├── doc-update-report.md        # PM Doc Writer's README update summary
  └── decision.md                 # Phase 4 output
  ```

  Plus a persistent log:
  ```
  .omo/team/proposals.jsonl       # one JSON line per round (audit trail)
  ```

  ## Phase 0: PM Triage (spawned subagent)

  Spawn PM via `team_spawn_agent` (preferred) or `task(category="unspecified-high", subagent_type="explore")` (fallback). See `references/phase-prompts.md` for the exact prompt.

  - Inputs (in priority): user override, `gh issue list`, `.omo/backlog.md`, agent self-investigation
  - Outputs: `brief.md` + `brief-quality-report.md`
  - `brief-quality-report.md` includes: clarity score (HIGH/MEDIUM/LOW), hidden ambiguities, risks, suggested clarifications

  If 4 input sources all empty → exit loop with `backlog empty, stopping`.

  ## Phase 0.5: PM Manager (spawned subagent — gate)

  Spawn PM Manager. The PM Manager is INDEPENDENT of the PM (different agent instance, fresh context). They MUST NOT share context.

  - Input: `brief.md` + `brief-quality-report.md` + git log + existing README/code
  - Verdict: APPROVE / REJECT / CLARIFY
  - Looks for PSEUDO-REQUIREMENT markers:
    - **DUPLICATE** — same feature already exists (cite file:line)
    - **SPECULATION** — based on hypothetical need without evidence
    - **CONTRADICTION** — conflicts with in-flight item or recent commit
    - **INFLATED** — scope larger than the bug/feature warrants
    - **OBSCURE** — solving for an imaginary persona when actual users differ
  - Output: `pm-manager-review.md`

  If REJECT or CLARIFY → orchestrator asks user before proceeding.

  ## Phase 1: Architect Plan (delegated)

  **Delegate to `/shared/ulw-plan`**:
  - Pass brief.md as planning input
  - Architect reviews brief-quality-report.md + pm-manager-review.md to know what PM and PM Manager flagged
  - ulw-plan produces `.omo/plans/<slug>.md` after approval
  - Symlink/copy to `.omo/team/<round>/plan.md`

  Skip if trivial — write 1-paragraph plan directly.

  ## Phase 2: Dev Execute (delegated)

  **Delegate to `/shared/start-work`**:
  - Pass plan + brief + PM Manager review (so Dev knows what was approved and what PM/PM Manager flagged)
  - start-work handles: Boulder, worktree per memory 372, sub-agent spawning per todo, Sisyphus verification, ultraqa classes, evidence ledger
  - Dev phase ends when `.omo/start-work/ledger.jsonl` shows all checkboxes done

  ## Phase 2: Dev Execute — with inline self-check (delegated, includes spec verification)

After Dev finishes coding, the Dev does an inline brief-vs-code self-check (replaces the standalone Verifier role to respect omo `max_members: 8` schema). Output `.omo/team/<round>/dev-self-check.md` with traceability matrix + deviations + hidden gaps + PASS/FAIL/PARTIAL verdict. If FAIL or PARTIAL → Dev iterates before Phase 3.

## Phase 3: Tester Validate (3 parallel validations)

  ### 3a. Code review (delegated)

  **Delegate to `/shared/review-work`**:
  - 5 parallel agents (Goal / QA / Code / Security / Context)
  - Outputs: `test-report.md`

  ### 3b. Dogfooded diff review

  - Run `/diff-review-dashboard --base=origin/main` on the worktree
  - Capture URL + state.json
  - Output: `diff-report.md`

  ### 3c. Playwright UI run (spawned subagent)

  Spawn Playwright tester. The tester ACTUALLY RUNS THE UI as a real user.

  - Setup: install plugin (if not done), start OpenCode test session
  - Test scenarios via Playwright MCP (load skill: playwright)
  - For this project specifically, ALWAYS test:
    - File tree expand/collapse
    - Line click → finding drawer opens
    - File `+` button → file-level finding drawer opens
    - Category dropdown (bug/style/perf/question/recommend)
    - Severity dropdown (high/medium/low)
    - Comment textarea captures text
    - "Add Finding" button adds to Conversation panel
    - "Submit Review" button submits and shows JSON response
    - Conversation panel: Resolve / Remove / Reopen / Jump-to-file
    - Cross-round drift: re-launch, verify previous findings carry over
    - Yellow range banner shows when diff range changes
  - Capture screenshots at each step
  - Output: `playwright-report.md` with per-scenario PASS/FAIL + screenshot paths

  **Combined verdict**: PASS only if 3a AND 3b AND 3c pass.

  If FAIL → loop back to Phase 2 with all 3 reports as feedback. Playwright FAIL is the strongest signal — fix that first.

  ## Phase 3.5: PM Doc Writer (spawned subagent — Playwright + README)

  PM wears a SECOND hat: documentation updater. Spawn PM Doc Writer with Playwright harness.

  - Inputs: brief.md, test-report.md, playwright-report.md, current README.md
  - Steps:
    1. Run the feature via Playwright MCP one more time
    2. Capture screenshots at key steps → save to `docs/screenshots/<feature-slug>.png`
    3. Update README.md:
       - Find or create a "Features" section (alphabetical or by ship date)
       - For THIS shipped feature, add a sub-section:
         - One-line description
         - `![screenshot](docs/screenshots/<feature-slug>.png)`
         - Usage example (CLI command, code snippet, or workflow)
    4. Optionally: update README.zh-CN.md (Chinese translation)
    5. Verify the README is now a complete product catalog: "what can this product do?" is fully answered
    6. Commit the README/docs changes (single atomic commit with the feature)
  - Output: `doc-update-report.md`

  If FAIL → loop back to Phase 3.5 (not Phase 2 — code is already shipped, just docs).

  ## Phase 4: Decision (loop control)

  Apply the loop control matrix above. Write `.omo/team/<round>/decision.md`.

  **Append to `.omo/team/proposals.jsonl`** (one line per round):

  ```json
  {
    "round": 1,
    "timestamp": "2026-06-28T12:00:00Z",
    "pm_source": "issue#4",
    "brief_excerpt": "first 200 chars of brief",
    "brief_quality": "HIGH",
    "pm_manager_verdict": "APPROVE",
    "dev_self_check": "PASS",
    "tester_verdict": "PASS",
    "doc_update_verdict": "PASS",
    "final_outcome": "PASS",
    "decision": "continue"
  }
  ```

  ## Team mode (preferred) + tmux

  ### team_* tools

  When available (oh-my-openagent installed), use:
  - `team_spawn_agent` — spawn role subagent with role-specific harness
  - `team_send_input` — inter-agent messaging (e.g., PM Doc Writer asks PM what to document)
  - `team_wait_agent` — synchronized waiting
  - `team_close_agent` — cleanup

  Fallback to `task(category=..., subagent_type=...)` if team_* unreachable.

  ### tmux per round

  ```bash
  # At round start
  tmux new-session -d -s "team-dev-loop-round-<N>" -c <worktree> -x 200 -y 50

  # Optional: split into panes for shared visibility
  tmux split-window -h -t "team-dev-loop-round-<N>"
  tmux split-window -v -t "team-dev-loop-round-<N>"

  # Inter-agent messaging via tmux send-keys
  tmux send-keys -t "team-dev-loop-round-<N>:0.0" "PM done, brief ready" C-m

  # At round end (optional cleanup)
  tmux kill-session -t "team-dev-loop-round-<N>"
  ```

  If tmux not installed:
  ```bash
  which tmux || brew install tmux
  ```

  ## How to invoke

  In OpenCode chat:

  > "Run the team dev loop for 5 rounds."
  > "Do one round of the team dev loop on issue #4."
  > "Continue the dev loop for 3 more rounds."
  > "Run dev loop."

  Or hosted by `/ulw-loop`.

  ## Installation

  Skill is gitignored. To install:
  1. Read `docs/team-dev-loop.md` (committed).
  2. Copy SKILL.md + references/ from the fenced code blocks.
  3. Restart OpenCode.

  ## See also

  - `/shared/ulw-plan` — Architect
  - `/shared/start-work` — Dev (Boulder, ledger, ultraqa)
  - `/shared/review-work` — Tester (5-agent parallel)
  - `/shared/hyperplan` — Adversarial sub-loop (optional)
  - `/diff-review-dashboard` — This project's own review tool (used in Phase 3b)
  - `team_*` tools — omo plugin agent lifecycle
  - `tmux` — shared visibility per round
  ~~~

  ---

  ## File: references/phase-prompts.md (copy verbatim to `.opencode/skills/team-dev-loop/references/phase-prompts.md`)

  ~~~markdown
  # Phase Sub-Prompts

  Exact prompts for each sub-agent. Copy-paste from here.

  ## PM Triage prompt (Phase 0)

  ```
  You are the PM (Product Manager) for @weekbin/opencode-review-dashboard. You are a fresh subagent — the orchestrator does NOT share context with you.

  TASK: Pick the next item to work on AND self-critique the brief.

  Inputs (read in priority order):
  1. The user's current chat prompt — if it overrides with a specific task, use it directly.
  2. `gh issue list --state open --limit 30 --json number,title,labels,createdAt`
     - Sort: bug > enhancement > others; oldest first within label.
  3. `.omo/backlog.md` (if exists)
  4. Recent git log (`git log --oneline -20`)

  Outputs:
  - `.omo/team/<round>/brief.md`:
    - ## Title
    - ## Source (issue #N / backlog / user / agent-suggested + rationale)
    - ## Goal (1-3 sentences)
    - ## Acceptance criteria (testable bullets)
  - `.omo/team/<round>/brief-quality-report.md`:
    - ## Clarity (HIGH / MEDIUM / LOW)
    - ## Hidden ambiguities (list)
    - ## Risks (list)
    - ## Suggested clarifications (list)

  If all four input sources empty → exit the loop with "backlog empty, stopping".
  ```

  ## PM Manager prompt (Phase 0.5)

  ```
  You are the PM MANAGER for @weekbin/opencode-review-dashboard. You review PM's proposals for pseudo-requirements. You are a FRESH subagent — you did NOT see PM's reasoning, you only see PM's outputs.

  TASK: Validate that PM's proposed brief is a real, worthwhile demand — NOT a pseudo-requirement.

  Inputs:
  - `.omo/team/<round>/brief.md` (PM's proposal)
  - `.omo/team/<round>/brief-quality-report.md` (PM's self-critique)
  - Recent git log (`git log --oneline -50 --all`)
  - Existing README.md
  - Existing code under `src/`

  Pseudo-requirement markers (look for AT LEAST ONE to REJECT):
  - **DUPLICATE** — same feature already exists (cite file:line)
  - **SPECULATION** — based on hypothetical need without evidence (no issue, no user request)
  - **CONTRADICTION** — conflicts with in-flight item or recent commit
  - **INFLATED** — scope larger than the bug/feature warrants
  - **OBSCURE** — solving for an imaginary persona when actual users differ

  Output `.omo/team/<round>/pm-manager-review.md`:
  - ## Verdict: APPROVE / REJECT / CLARIFY
  - ## Pseudo-requirement markers found (list with evidence: file:line, commit hash, etc.)
  - ## Suggested rewrites (if any)
  - ## Rationale (1-2 sentences)

  If REJECT or CLARIFY → orchestrator asks user before proceeding. You do NOT auto-override.
  ```

  ## Architect delegation prompt (Phase 1)

  ```
  TASK: Plan this work using the ulw-plan skill.

  BRIEF:
  <full content of .omo/team/<round>/brief.md>

  PM NOTES:
  <full content of .omo/team/<round>/brief-quality-report.md>

  PM MANAGER REVIEW:
  <full content of .omo/team/<round>/pm-manager-review.md>

  OUTPUT: .omo/plans/<slug>.md (after approval). Symlink to .omo/team/<round>/plan.md.

  You are the Architect role of the team-dev-loop. Skip if trivial (single file, <30 lines, no architectural decision) — write 1 paragraph to plan.md directly.
  ```

  ## Dev delegation prompt (Phase 2)

  ```
  TASK: Execute this plan using the start-work skill.

  PLAN: <path to .omo/plans/<slug>.md>
  ROUND: <round number>
  WORKTREE: per project memory 372 — create one if needed

  CONTEXT:
  <full content of .omo/team/<round>/brief.md>
  <full content of .omo/team/<round>/pm-manager-review.md>

  You are the Dev role. Spawn sub-agents per todo. Verify each with Sisyphus DoneClaim + AdversarialVerify. End when all checkboxes done and ledger.jsonl is complete.
  ```

  ~~~

  ---

  ## File: references/loop-decision.md (copy verbatim to `.opencode/skills/team-dev-loop/references/loop-decision.md`)

  ~~~markdown
  # Loop Decision Matrix

  Detailed heuristics for Phase 4.

  ## Stop conditions

  ### Hard stop (exit immediately)
  - User signal: chat contains "stop" / "exit" / "停" / Ctrl+C detected
  - Backlog truly empty: no GitHub issues (open OR closed-today), no `.omo/backlog.md`, no user prompt override, agent self-investigation also empty
  - Catastrophic failure: unhandled exception in any phase that can't be auto-recovered

  ### Soft stop (suggest to user, do NOT auto-stop)
  - 3 consecutive no-progress rounds: same blockers recur across 3 Phase 2-3 loops within one round, OR 3 different items all returned with no code changes
  - Stagnation: PM keeps picking same item because nothing else has higher priority
  - Quality regression: Tester FAILs increase in frequency over last 3 rounds
  - Doc Writer FAILs recur (suggesting features are too complex to document clearly)

  When soft stop triggers, ASK user: "I've seen no progress for 3 rounds / picked same item twice / etc. Want to continue, change direction, or stop?"

  ## Per-phase fail handling

  | Phase | If FAIL | Action |
  |---|---|---|
  | PM (Phase 0) | Cannot pick item (backlog empty) | Hard stop |
  | PM Manager (Phase 0.5) | REJECT | Ask user: "PM Manager flagged this as pseudo-requirement. Override or skip?" |
  | PM Manager (Phase 0.5) | CLARIFY | Ask user: "PM Manager needs clarification. Provide it?" |
  | Architect (Phase 1) | Plan too vague | Loop back to Phase 1 with feedback (Architect retries) |
  | Dev (Phase 2) | Implementation FAIL | Loop back to Phase 2 with verifier/tester feedback |
  
  
  | Tester (Phase 3) | 3a (review-work) FAIL | Loop back to Phase 2 with review report |
  | Tester (Phase 3) | 3b (diff-review-dashboard) FAIL | Loop back to Phase 2 with diff report |
  | Tester (Phase 3) | 3c (Playwright) FAIL | Loop back to Phase 2 with Playwright report (HIGHEST PRIORITY — empirical) |
  | Doc Writer (Phase 3.5) | FAIL | Loop back to Phase 3.5 only (code already shipped, just docs) |

  ## Self-judgment (agent's discretion)

  The agent MAY decide to:
  - Skip Phase 0.5 (PM Manager) for trivial work (single file, <30 lines)
  - Add `/shared/hyperplan` adversarial sub-loop if plan has architectural ambiguity
  - Spawn `explore` subagent for tech-debt investigation when backlog is empty

  The agent MUST NOT:
  - Stop the loop without user confirmation (unless hard stop)
  - Skip Phase 3c (Playwright) — always run, even for trivial changes
  - Skip Phase 3.5 (PM Doc Writer) — every shipped feature needs README entry
  - Skip worktree creation in Phase 2 (per project memory 372)
  - Modify production code outside a worktree
  - Use the same agent instance for both PM (Phase 0) and PM Manager (Phase 0.5) — must be independent

  ## Decision log (persistent audit trail)

  Append one JSON line per round to `.omo/team/proposals.jsonl`:

  ```json
  {
    "round": 1,
    "timestamp": "2026-06-28T12:00:00Z",
    "pm_source": "issue#4",
    "brief_excerpt": "first 200 chars",
    "brief_quality": "HIGH",
    "pm_manager_verdict": "APPROVE",
    "dev_self_check": "PASS",
    "tester_verdict": "PASS",
    "doc_update_verdict": "PASS",
    "final_outcome": "PASS",
    "decision": "continue"
  }
  ```

  This is the audit trail. Grep-able, queryable, persistent across rounds.
  ~~~

  ---

  ## License

  This workflow is part of the @weekbin/opencode-review-dashboard project (MIT).
