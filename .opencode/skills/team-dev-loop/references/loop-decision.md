# Loop Decision Matrix (v2 — 2026-06-28 redesign)

> Reference for the lead (`sisyphus` primary chat) running the team-dev-loop v2.
> Read this BEFORE Phase 4 (Decision). Use the fail-mode table to handle subagent failures, the lead takeover protocol when subagents return empty/BLOCKED, and the decision template to write `decision.md`.

## Stop conditions

### Hard stop (exit immediately, no further rounds)
- **User signal**: chat contains "stop" / "exit" / "停" / Ctrl+C detected
- **Backlog truly empty**: no GitHub issues (open OR closed-today), no `.omo/backlog.md`, no user prompt override, agent self-investigation also empty
- **Catastrophic failure**: unhandled exception in any phase that can't be auto-recovered (e.g. disk full, network down, repo corrupted)

### Soft stop (suggest to user, do NOT auto-stop)
- **3 consecutive no-progress rounds**: same blockers recur across 3 Phase 2-3 loops within one round, OR 3 different items all returned with no code changes
- **Stagnation**: PM keeps picking same item because nothing else has higher priority
- **Quality regression**: Tester FAILs increase in frequency over last 3 rounds
- **Doc Writer FAILs recur** (suggesting features are too complex to document clearly)
- **Main context compaction triggered** (5 lens outputs pushed lead over context budget) → consider Plan B (revert to v1 team_create)

When soft stop triggers, ASK user: "I've seen no progress for 3 rounds / picked same item twice / etc. Want to continue, change direction, or stop?"

## Per-phase fail handling

| Phase | If FAIL | Action |
|---|---|---|
| **PM (Phase 0)** | Cannot pick item (backlog empty) | **Hard stop** (see above) |
| **PM Manager (Phase 0.5)** | REJECT | Ask user: "PM Manager flagged this as pseudo-requirement. Override or skip?" |
| **PM Manager (Phase 0.5)** | CLARIFY | Ask user: "PM Manager needs clarification. Provide it?" |
| **Architect (Phase 1)** | Plan too vague | Loop back to Phase 1 (Architect retries with feedback) |
| **Dev (Phase 2)** | Implementation FAIL or self-check FAIL | Loop back to Phase 2 (Dev iterates) |
| **Tester Review (Phase 3a)** | Any of 5 lenses FAIL | Loop back to Phase 2 with review report |
| **Tester Diff (Phase 3b)** | FAIL | Loop back to Phase 2 with diff report |
| **Tester Playwright (Phase 3c)** | FAIL | Loop back to Phase 2 with Playwright report (HIGHEST PRIORITY — empirical) |
| **PM Doc Writer (Phase 3.5)** | FAIL | Loop back to Phase 3.5 only (code already shipped, just docs) |
| **Decision (Phase 4)** | N/A — lead writes directly | N/A |

**Note on "loop back to Phase 2"**: v1's `tester-*` members were separate sessions. v2's `tester-*` are single-shot `task()` calls — "loop back" means the lead re-invokes Phase 2's task with feedback from the failed tester's report. Don't try to "resume" the failed tester subagent (single-shot pattern has no resume).

## Lead inline takeover protocol (DESIGN FEATURE — not rescue)

When a `task()` returns one of:
- **Empty result**: e.g. tester-diff generated 0 bytes of SVG (Round 1 evidence: `diff-report.md` was 0 bytes initially)
- **BLOCKED / dead-end**: e.g. tester-doc-writer hit a tool-invocation dead-end (Round 1 evidence: `doc-update-report.md` was missing until lead wrote it directly)
- **Context exhaustion**: e.g. tester-playwright exceeded subagent context (Round 1 evidence: `playwright-report.md` was 0 lines until lead wrote it)
- **Explicit `verdict: FAIL`**: subagent returned structured failure (rare in v2 vs v1's rescue rate)

Lead takes over:

1. **Write** `.omo/round-N/lead-takeover-<role>.md` (5-10 lines):
   ```markdown
   # Lead Takeover: <role>
   - **Timestamp**: <ISO 8601>
   - **Original subagent return**: <paste first 200 chars of empty/error output>
   - **Reason for takeover**: <1-2 sentences>
   - **Deliverable**: lead will write <deliverable-file.md> directly
   ```
2. **Write the deliverable directly** (e.g. `diff-report.md`, `playwright-report.md`, `doc-update-report.md`). Do NOT retry the subagent — Round 1 evidence showed 0% retry success rate.
3. **Continue the next phase**. PM Doc Writer (Phase 3.5) does NOT wait for lead takeover — its inputs come from already-passed brief + test-report + playwright-report (or lead-takeover replacements).
4. **List takeovers** in `decision.md` end section (see Decision template below).
5. **Count takeovers** in `proposals.jsonl`: `"lead_takeovers": ["tester-diff", "tester-playwright"]`.

**Why this is a design feature, not a failure mode**: v1 had a 43% rescue rate (3 of 7 members needed lead takeover in Round 1). Reframing as a designed protocol (a) eliminates the "did we succeed or fail" ambiguity, (b) lets us track takeover rate as a metric, (c) makes the failure mode cheaper to invoke (5-10 line note vs debugging a stuck chat session).

## Per-role category (sub-model) selection

Each role's `task(category="...")` call uses a different sub-model — each sub-model is optimized for that role's work shape. The mapping (per user's 2026-06-28 feedback):

| Role | category | Why |
|---|---|---|
| PM Triage | `unspecified-high` | Product judgment + structured brief |
| PM Manager (gate) | `ultrabrain` | Critical anti-pseudo-requirement reasoning |
| Architect | `ultrabrain` | Architecture decisions, decision-complete plan |
| Dev | `deep` | Autonomous end-to-end (worktree + tests + commit) |
| Tester Review orchestrator | `deep` | Coordinate 5 lenses + synthesize `test-report.md` |
| Lens Goal | `quick` | Mechanical AC matching |
| Lens QA | `quick` | Run test commands, check gates |
| Lens Code | `ultrabrain` | Code-quality analysis, complexity judgment |
| Lens Security | `ultrabrain` | Threat modeling, security reasoning |
| Lens Context | `artistry` | Repo-fit, commit honesty (soft/non-standard judgment) |
| Tester Diff | `unspecified-high` | Tool-invocation, no closer fit |
| Tester Playwright | `visual-engineering` | Real-browser UI walkthrough |
| PM Doc Writer | `writing` | Playwright + README documentation |

**Why not all `unspecified-high`**: a 12-role loop pays a wide range of costs. Mechanical AC matching (Lens Goal) doesn't need `ultrabrain` cost. Playwright UI walkthrough is intrinsically visual-engineering's domain. Picking the right sub-model per role gets better quality per token than a one-size-fits-all.

**Self-judgment on category**: lead MAY override a category for a specific round if the work shape is different (e.g. PM Triage for a complex architecture decision could use `ultrabrain`). But this should be rare — the defaults in the table above are the result of v1 evidence + user's 2026-06-28 directive.

## Round profile auto-classification (bugfix / feature / architecture)

Each round auto-classifies into 1 of 3 profiles based on **quantitative user-impact signals**, not lead judgment. This was added 2026-06-28 in response to user feedback ("如果是单纯的 bug 修复，用这个 loop 流程做就有点复杂了，建议给每个阶段是否需要进入执行，增加判断") and refined 2026-06-28 to **user-impact framing** in response to "PM 的角色应该是提需求，而什么总是提 BUG FIX 呢？" — separating PM's user-side signals (`U_*`) from lead's scope-side signals (`S_*`).

### PM ↔ lead signal separation

**Two distinct stages**:

1. **PM Triage (Phase 0)** — emits `user_impact_profile` with `U_*` fields (user-side). PM thinks about WHO needs WHAT and WHY, not lines of code.
2. **Lead (Phase 4 prep, before any `task()` calls)** — converts PM's `U_*` to numeric `S_*` scores (0/2 per field, where yes=2, no=0). Lead applies the auto-classification rules below.

The conversion keeps PM in user-land (no code metrics) and lead in scope-land (no user story interpretation).

### 3 profiles (now reframed in user terms)

| Profile | What the user sees | Example |
|---|---|---|
| **bugfix** | User's existing behavior was wrong/unreliable; we made it correct. No new capability. | Round 1: user lost review history to a power-loss race → we made state.json atomic |
| **feature** | User gets a brand-new capability they didn't have before. | Adding a "Resolved filter" button to conversation panel |
| **architecture** | User's data shape changes (e.g., existing state.json becomes incompatible), or a structural shift with install/dep impact. | Refactoring state.json schema; adding a new dependency |

### PM-side signals (`U_*`, user-impact)

PM Triage outputs these in `brief.md` `## User-impact profile` section. Lead reads them.

| Signal | User-impact meaning | no → 0 | yes → 2 |
|---|---|---|---|
| `U_size` | User-visible scope (PM's estimate, NOT lines of code) | small (1-2 user-visible files) | yes if medium/large |
| `U_files` | User-visible surface area | narrow (1 file) | yes if wider |
| `U_new_capability` | User gets a brand-new feature? | no = existing capability only | yes |
| `U_behavior_shift` | User-visible behavior fundamentally changes? (not just "fixes wrong") | no | yes |
| `U_user_visible` | User notices the change at all (README/docs/UI)? | no (internal refactor) | yes |
| `U_data_shape_breaking` | User's existing data files become incompatible? | no | yes |
| `U_data_safety` | User's data becomes safer (atomic write, recovery, no data loss)? | no | yes |
| `U_installs_new_dep` | User's `npm install` adds new packages? | no | yes |

### Lead-side signals (`S_*`, derived from PM's `U_*`)

Lead applies a deterministic conversion: **yes → 2, no → 0** (binary scoring). Total = sum of all 8 signals (range 0-16, typical 0-8).

| `U_*` signal | `S_*` score |
|---|---|
| `U_size == "small (1-2)"` | 0 |
| `U_size == "medium (3-6)"` | 1 |
| `U_size == "large (7+)"` | 2 |
| `U_files == "narrow"` | 0 |
| `U_files == "small"` | 1 |
| `U_files == "medium"` | 2 |
| `U_files == "wide"` | 3 |
| `U_new_capability == yes` | 2 |
| `U_behavior_shift == yes` | 3 |
| `U_user_visible == yes` | 2 |
| `U_data_shape_breaking == yes` | 2 |
| `U_data_safety == yes` | 1 |
| `U_installs_new_dep == yes` | 2 |

(Note: `S_behavior_shift` has score 3 — the strongest "architecture" trigger — because a fundamental user-visible behavior change requires structural rework. `S_data_safety` has score 1 — it bumps total without forcing a specific profile.)

### Auto-classification rules (deterministic, lead applies after PM emits `U_*`)

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

**Override rule**: lead MAY override auto-classification if user chat explicitly states scope (e.g. "do this as architecture review" or "treat as trivial"). Document the override in `decision.md` ## Round profile section.

### Reclassification mid-round

If the work scope expands during the round (e.g. a bugfix touches persistence), lead MAY reclassify mid-round. Document the reclassification in `decision.md`.

### Phase gating per profile

Each profile runs a different subset of phases. **Skip a phase = lead does NOT call `task()` for it**.

| Phase | bugfix | feature | architecture |
|---|---|---|---|
| 0 PM Triage | skip (user chat IS the brief) | run | run |
| 0.5 PM Manager (gate) | skip | run | run |
| User pick candidate | skip (only 1 candidate) | run | run |
| 1 Architect | 1-paragraph plan (no full 7-section plan) | run (full plan) | run (full plan) + `/shared/hyperplan` |
| 2 Dev | run | run | run |
| 3a Tester Review (5 lens) | 3 lens (Goal + QA + Security, drop Code + Context) | 5 lens | 5 lens + external review |
| 3b Tester Diff | run | run | run |
| 3c Tester Playwright | skip (unless diff touches `src/ui/` or `docs/screenshots/`) | run | run |
| 3.5 PM Doc Writer | run (1-paragraph README add, no screenshot) | run (full README section + screenshot) | run (full README section + screenshot) |
| 4 Decision | run (lead writes directly) | run | run |

**Phase skip reason must be recorded** in `decision.md` `## Skipped phases` section (e.g. "Phase 0.5 PM Manager skipped: profile=bugfix, see loop-decision.md 'Round profile auto-classification'"). This is auditable.

### Quantitative evidence — Round 1 retroactive reclassification under v3 (user-impact framing)

Round 1 (atomic state.json writes) re-framed in user terms:

> **As a** reviewer doing long review sessions,
> **I want** my review history to survive power loss / editor crash / OOM-kill,
> **So that** I don't lose all my findings to a corrupted `state.json`.

That's the user story. Now the `U_*` signals PM would have emitted:

| PM signal | Round 1 value | Lead converts to `S_*` |
|---|---|---|
| `U_size` | "small (1-2)" | S_size = 0 |
| `U_files` | "small (2-3)" | S_files = 1 |
| `U_new_capability` | no | S_new_capability = 0 |
| `U_behavior_shift` | no | S_behavior_shift = 0 |
| `U_user_visible` | no (internal state file format) | S_user_visible = 0 |
| `U_data_shape_breaking` | no (state.json SCHEMA unchanged; only write mechanism) | S_data_shape_breaking = 0 |
| `U_data_safety` | **yes** (atomic write instead of direct write, corrupt-file recovery) | S_data_safety = 1 |
| `U_installs_new_dep` | no | S_installs_new_dep = 0 |
| **Total** | | **2** |

**Auto-classification**: rule 1? `U_behavior_shift==yes`? NO. `U_data_shape_breaking==yes`? NO. `U_installs_new_dep==yes`? NO. `total >= 8`? NO. → skip. Rule 2? `U_user_visible==yes`? NO. → skip. Rule 3 → **bugfix**.

Under v3 rules, Round 1 would have auto-classified as **bugfix** (not architecture, not feature). The `U_data_safety` signal properly captures the user value ("review history survives crashes") without forcing the profile up to architecture. The 2-point total under the threshold (≥3 for feature, ≥8 for architecture) reflects that the user doesn't see a behavior change — they just see "no more crashes."

This is the same conclusion as the previous `S_persistence_cosmetic=1, total=7` reclassification, but cleaner: PM thinks in user terms (does the user's data become safer? yes), lead translates that to a numeric score (1 point) that doesn't accidentally tip Round 1 into `feature` or `architecture`.

### Why split PM-side `U_*` from lead-side `S_*`

**The fundamental reason**: PM's job is to articulate user pain, not to estimate code metrics. When PM emits `U_user_visible: yes` they're saying "users will notice this" — that's a user-land judgment. When lead converts that to `S_user_visible: 2`, they're translating to scope-land scoring. Keeping the two stages explicit prevents PM from sliding into developer thinking (which Round 1+2 evidence shows happened — both rounds were framed as "bug fixes" because the input source was bug-shaped, not user-story-shaped).

If PM tries to estimate `lines_changed` or `files_changed`, that's a code metric and PM doesn't have ground truth. The `U_size` field deliberately uses "small/medium/large in user-visible files" — PM's honest estimate of user impact, not code churn. Lead converts to scope scoring only at Phase 4 prep time.

## Self-judgment (agent's discretion)

The agent (lead) MAY decide to:
- **Override auto-classification** if user chat explicitly states scope (e.g. "treat as architecture"). Document override in `decision.md` ## Round profile section.
- **Add `/shared/hyperplan` adversarial sub-loop** if plan has architectural ambiguity (only for `architecture` profile)
- **Spawn `explore` subagent** for tech-debt investigation when backlog is empty
- **Run extra review lens** beyond the profile default (e.g. add Context lens to a bugfix if you suspect scope creep)
- **Reclassify mid-round** if work scope expands (e.g. bugfix touches persistence — reclassify as feature/architecture). Document the reclassification in `decision.md`.

The agent MUST NOT:
- Stop the loop without user confirmation (unless hard stop)
- Skip Phase 3c (Playwright) for `feature` or `architecture` profile — always run
- Skip Phase 3.5 (PM Doc Writer) for `feature` or `architecture` profile — every shipped user-visible change needs README entry
- Skip worktree creation in Phase 2 (per project memory 372)
- Modify production code outside a worktree
- Use the same agent instance for both PM (Phase 0) and PM Manager (Phase 0.5) — must be independent
- Use `team_create` / `team_send_message` / `team_shutdown_request` — v2 only uses `task()`

**Profile gating rules** (per profile): see "Round profile auto-classification" section above for the 3 profiles, the 7 quantitative signals, the auto-classification rules, and the per-profile phase-gating table.

## `.omo/` file tracking policy (v2)

| Path | Tracked? | Why |
|---|---|---|
| `.omo/round-N/*.md` | **YES** | Project-level design library, browsable on GitHub |
| `.omo/proposals.jsonl` | **YES** | Cross-round decision log, append-only |
| `.opencode/reviews/<session>/*.json` | NO (gitignored) | Per-machine runtime state |
| `.opencode/{logs,cache,state.json,magic-context}/` | NO (gitignored) | Per-machine runtime state |
| `.opencode/skills/` | **YES** | Skill packages, project assets |
| `.playwright-mcp/` | NO (gitignored) | Playwright temp files |

**Why tracked**: v1 gitignored `.omo/` and called it "audit trail" — but PR reviewers couldn't see it, cross-machine replay was impossible, and after a few weeks the local files were lost. v2 treats `.omo/round-N/` as **canonical project documentation** that lives alongside the code.

**Round number naming**:
- Sequential: `.omo/round-1/`, `.omo/round-2/`, ... `.omo/round-N/`
- No resets — even if a round fails, its directory stays (with `decision.md` showing FAIL)
- Skip numbers only when explicitly canceled by user

## Decision template (Phase 4 — lead writes directly)

Lead writes `.omo/round-N/decision.md` using this template. Replace `<...>` placeholders.

```markdown
# Decision — Round <N>: <one-line title>

> **Round**: <N>
> **Date**: <ISO 8601>
> **Lead**: sisyphus (primary chat)
> **Branch**: <branch-name if applicable, else main>
> **Commit**: <commit-sha after push>

---

## Verdict

**PASS** | FAIL | CONTINUE | STOP

<1-2 sentence summary>

## Per-phase verdicts (1 row per phase)

| Phase | Role | Verdict | Evidence file |
|---|---|---|---|
| 0 | PM | <PASS/FAIL> | `brief.md` |
| 0.5 | PM Manager | <APPROVE/REJECT/CLARIFY> | `pm-manager-review.md` |
| 1 | Architect | <PASS/FAIL> | `plan.md` |
| 2 | Dev | <PASS/FAIL/PARTIAL> | (worktree + diff) |
| 3a | Tester Review (5 lens) | <PASS/FAIL> | `test-report.md` |
| 3b | Tester Diff | <PASS/FAIL> | `diff-report.md` |
| 3c | Tester Playwright | <PASS/FAIL> | `playwright-report.md` |
| 3.5 | PM Doc Writer | <PASS/FAIL> | `doc-update-report.md` |
| 4 | Decision | <this doc> | `decision.md` |

## Dev Self-Check (AC1-ACN trace)

<inline AC trace from Dev's return value — replaces v1's dev-self-check.md>

| AC | Description | Status | Evidence |
|---|---|---|---|
| AC1 | <text> | <PASS/FAIL> | <file:line> |
| AC2 | <text> | <PASS/FAIL> | <file:line> |
| ... | ... | ... | ... |

## Test summary

- **Unit tests**: <N>/<N> pass
- **E2E tests**: <N>/<N> pass
- **Build**: <ok/fail>
- **Lint**: <0/0 warnings/errors>
- **Typecheck**: <clean/errors>
- **Format**: <clean/errors>

## Lead takeovers this round

<list of roles lead took over, or "None">

## Final outcome

**PASS — Round <N> SHIPS to main.**

Branch `<branch-name>` @ commit `<short-sha>` is ready for user review.

User to: review the commit on main, merge when satisfied.

---

## Audit trail

All artifacts in `.omo/round-<N>/`:
- `brief.md`
- `pm-manager-review.md`
- `plan.md`
- `review-{goal,qa,code,security,context}.md`
- `test-report.md`
- `diff-report.md`
- `playwright-report.md`
- `doc-update-report.md`
- `decision.md` (this file)

Plus audit log in `.omo/proposals.jsonl`.
```

## Decision log (persistent audit trail)

Append one JSON line per round to `.omo/proposals.jsonl`. Schema:

```json
{
  "round": 1,
  "timestamp": "2026-06-28T12:00:00Z",
  "pm_source": "issue#N | backlog | user | agent-suggested",
  "brief_excerpt": "<first 200 chars of brief.md>",
  "brief_quality": "HIGH | MEDIUM-HIGH | MEDIUM | LOW",
  "pm_manager_verdict": "APPROVE | REJECT | CLARIFY",
  "dev_self_check": "PASS | FAIL | PARTIAL",
  "tester_verdict": "PASS | FAIL",
  "doc_update_verdict": "PASS | FAIL",
  "lead_takeovers": ["tester-diff", "tester-playwright"],
  "final_outcome": "PASS | FAIL | CONTINUE | STOP",
  "decision": "continue | stop | pivot",
  "chosen_candidate": "#<N> <title>",
  "commit": "<short-sha>",
  "test_summary": {
    "unit": "10/10 pass",
    "e2e": "13/13 pass",
    "build": "ok",
    "lint": "0 warnings, 0 errors",
    "typecheck": "clean",
    "format": "clean"
  },
  "follow_up_candidates": ["#<N> <title>", ...]
}
```

**Properties**:
- Append-only — never edit existing lines, only add new lines
- One JSON object per line (NDJSON / JSONL)
- All fields required EXCEPT `lead_takeovers` (omit if none) and `follow_up_candidates` (omit if backlog empty)
- Greppable: `grep '"round": 2' .omo/proposals.jsonl` finds round 2
- Queryable: `jq -s 'group_by(.final_outcome) | map({outcome: .[0].final_outcome, count: length})' .omo/proposals.jsonl` gives outcome histogram

## When to consult user

The lead should pause and ask the user (not auto-decide) when:
1. PM Manager returns REJECT (real bug vs pseudo-requirement)
2. PM Manager returns CLARIFY (genuine ambiguity)
3. User pick candidate (Phase 0.5 → Phase 1 transition)
4. Soft stop trigger fires (3 consecutive no-progress, etc.)
5. Main context compaction risk detected (>50KB of test reports)
6. Lead takeover rate >50% in a single round (means subagents are systematically failing)

## Notes

- This file is read by lead only — subagents do NOT see it (each gets its role-specific prompt from `phase-prompts.md`)
- v1 version of this file referenced `team_*` tools and omo team_mode doctor — v2 has no such dependencies
- For v1 retro-compat (re-running Round 1 with old tooling), see `git show fcdf498:references/loop-decision.md`
