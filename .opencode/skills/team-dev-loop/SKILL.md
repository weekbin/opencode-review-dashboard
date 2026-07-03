---
name: team-dev-loop
description: "v6 self-driving cron-style dev loop — 7 capabilities per round (Discovery / Research / Frame / Implement / Verify / Retro / Decide). User does NOT intervene mid-loop; loop is fully autonomous. Pre-commit hook (`.husky/pre-commit`) enforces mechanical hygiene + tests + plugin-load gate. Lead-direct 100% (subagent only Phase 4 if absolutely required). Hard caps: ≤3 feature + ≤5 bugfix + ≤8 total + ≤1 polish per round. Self-stop on sync / verify / pre-commit FAIL. Triggers: 'team dev loop', 'dev loop', 'run dev loop', 'next round', 'do 1 round'."
---

# /team-dev-loop Command (v6)

> **Goal**: Fully automated, self-driving iteration of project backlog. User is observer, not participant.
> **Output**: Single commit to main per round with concrete product/infra change + 6 artifacts.
> **Trigger**: User says "run a loop round" or any equivalent phrase.

## Core principle

The loop is a **cron-style process**, not a conversation. The lead makes all decisions autonomously. User input mid-loop is informational only — it never blocks. The only way to STOP the loop is one of the 5 hard gates below.

## Hard gates (any FAIL = STOP, no carry to next round)

1. **Pre-commit hook PASS** (`bash .husky/pre-commit` — runs hygiene + `bun run check` + `bun test` + `verify-plugin-load.mjs`)
2. **Discovery sweep** (pre-commit enforces 6 mechanical commands — absorbed from v5 SG.R44.1)
3. **0 Open-loop-internal items at retro time** — NO DEFERRAL; every loop-internal item must close in current worktree
4. **≤3 feature / ≤5 bugfix / ≤8 total / ≤1 polish per round**
5. **1 AC max per subagent** (subagent ≤15min wall, used only if absolutely required)

## 7 Capabilities (one round = one pass through these)

### Capability 1 — Backlog Discovery

**Output**: `.omo/round-N/discovery.md` (1 page)

Scan for what's next:
1. `gh issue list --label pm-manager-approved --state open` — open GH issues
2. Read `.omo/round-N-1/retro.md ## Carry-over` — carry-over list
3. Read `.omo/proposals.jsonl` last 10 lines — recent proposals

**Format**: bulleted list, each candidate = 1 line (`- #GH-N: <title> (label, age)` or `- carry: <description>`)

**Decision rule**: Pick top 1-3 candidates by user-impact. If none, output `## No backlog — DECIDE housekeeping` and pick 1-3 housekeeping items from `proposals.jsonl` filtered by `<10 LOC` and `no src/`.

> [R45 lesson] Discovery must include carry-over, not just new GH issues. R43 retro had 8 latent gaps that R44 surfaced — that's now structural.

### Capability 2 — Product Research

**Output**: `.omo/round-N/research.md` (1 page)

For each candidate from Discovery:
1. `grep -rn <keyword> src/` — find related code
2. Read 2-3 related test files
3. Note existing patterns / utilities to reuse

**Format**: one section per candidate (Files involved / Existing patterns / Simplest change / Risk — each 1 sentence).

> [R43 lesson] Research is the difference between "5 ACs shipped" and "8 latent gaps". Always read context before coding.

### Capability 3 — Frame

**Output**: `.omo/round-N/brief.md` (1 paragraph)

Pick 1 candidate from Discovery (or top-N for multi-AC rounds). Write:
- **Scope**: What changes (≤1 paragraph)
- **Why**: Which GH issue / carry-over / user feedback this addresses
- **Risk**: What might break
- **Acceptance**: How to verify (test name, manual check, screenshot)

> [R45 lesson] Brief must include "Acceptance" — without it, "done" is undefined.

### Capability 4 — Implement

**Output**: git diff (no separate artifact)

Lead-direct implementation:
- ≤5 files for bugfix profile, ≤10 for feature
- Follow existing patterns from research.md
- Commit style: `R<N>: <scope> - <what>` for fix; `R<N>: <type>(<scope>): <what>` for feat

> [R12–R36 lesson] Subagent only if absolutely required. Lead-direct is faster + better for solo lead workflow. Phase 2 Dev subagent in v5 was over-deployed.

### Capability 5 — Verify

**Output**: pre-commit gate output + `.omo/round-N/verify.md` (1 paragraph)

Run pre-commit:
```
bash .husky/pre-commit
```

If FAIL, fix and re-run. If PASS, capture exit code + key output lines to verify.md.

If UI change, take screenshot via `take-screenshots.sh` (NOT `take-screenshots.mjs` — dead code per R1 retro).

> [R44 lesson] Verification MUST capture actual stdout, not claim "PASS". Lead self-report is unreliable; the gate is mechanical.

### Capability 6 — Retro

**Output**: `.omo/round-N/retro.md` (1 page)

Five sections, each 1 paragraph:
1. **What worked** (1 paragraph)
2. **What didn't** (1 paragraph)
3. **Carry-over list** (bullets, each = 1 line; ≤3 items)
4. **Closed in this round (loop-internal)** — R5x lesson: every loop-internal item must close here, NOT "next round"
5. **Open loop-internal at retro time** — MUST BE EMPTY, otherwise Phase 7 = BLOCKED

> [v5.4 lesson] "Action items for next round" structurally encourages deferral. All loop-internal items close in current worktree.

### Capability 7 — Decide

**Output**: `.omo/round-N/decision.md` (1 line)

```
## Decision
SHIP | REVERT | CARRY

## Lightweight round (if applicable)
YES — <reason> | NO

## Doc updates (SG.R29.8 carry-over)
SKIPPED | UPDATED: <1-line summary>

## Loop summary (1 paragraph)
<what shipped, what improved, what's next>
```

Then:
- `git add -A && git commit -m "R<N>: <scope> - <summary>"` (single commit)
- `git push origin main` (auto-push)

> [R45 lesson] Single-commit-per-round, never amend on top of round work. Round scope is atomic.

## Anti-patterns (v6 ban list)

- ❌ Adding new SG.R patches — v6 is final; new rules go in v7
- ❌ 12+ artifacts per round — v6 = exactly 6
- ❌ 5-lens parallel review — solo lead doesn't need 5 perspectives
- ❌ Phase 4.5-4.9 elaborate close-out — collapsed into Capability 6 retro
- ❌ Cross-check rules — pre-commit is mechanical enforcement
- ❌ "Action items for next round" — replaced by Carry-over list (≤3 items, must close in current round)
- ❌ Asking user mid-loop — informational input only, never blocks

## File structure (per round)

```
.omo/round-N/
├── discovery.md      (1 page)
├── research.md       (1 page)
├── brief.md          (1 paragraph)
├── verify.md         (1 paragraph)
├── retro.md          (1 page)
└── decision.md       (1 line)

.omo/proposals.jsonl  (append-only, always present)
```

## Round profile auto-classification

Determine profile from brief.md:
- **bugfix**: scope = fix existing behavior, ≤5 files
- **feature**: scope = add new behavior
- **architecture**: scope = change schema/type/interface
- **polish**: scope = docs/UX/test-only, ≤2 src/ files

Default profile: bugfix (lightest).

## Lightweight round (skip capabilities)

Trigger if ALL of:
- ≤50 LOC net change
- ≤2 files in `src/`
- All changes docs/cleanup (no behavior change)

Then capabilities 2+3 compress into brief.md. Capabilities 1+5+6+7 still required.

## Self-driving model

The loop is **not user-prompted**. After a round completes, the lead enters auto-pilot mode:

1. Wait 5min for user input
2. If no input: lead-direct R+1 default (continue iterating)
3. If user input: honor it (informational, not blocking)

User input mid-round = informational only. The only way to STOP the loop is one of the 5 hard gates.

## Failure recovery

If 3+ consecutive rounds fail or have unmet hard gates:
1. STOP the loop
2. Revert last 3 commits: `git revert --no-commit HEAD~3..HEAD`
3. Read current SKILL.md (this file) — verify v6 spec is intact
4. Run pre-commit hook — verify mechanical gate works
5. Write `.omo/blocked.md` explaining what broke
6. Wait for user input (loop is BLOCKED)

> [v5 lesson] Random retry without diagnosis = waste. Read state, identify root cause, document, then resume.

## Migration from v5

| v5 (cumulative patches) | v6 (collapsed) |
|---|---|
| 12+ artifacts per round | 6 artifacts |
| 17 phases | 7 capabilities |
| 70+ SG.R patches | 0 patch numbers; inline `[R5X lesson]` callouts |
| SG.R44.1 8-command sweep | `.husky/pre-commit` (6 mechanical commands) |
| 5-lens parallel review | Capability 5 Verify (mechanical gate only) |
| Phase 4.5-4.9 close-out | Capability 6 Retro (5-section template) |
| Subagent Phase 2 Dev | Lead-direct default; subagent only if absolute |
| User picks between A-E | No user pick; lead decides |

## What runs where

| Capability | Tool | Artifact |
|---|---|---|
| 1 Discovery | `gh`, `git log`, file reads | discovery.md |
| 2 Research | `grep`, `read` | research.md |
| 3 Frame | plain text | brief.md |
| 4 Implement | `edit` / `write` | git diff |
| 5 Verify | `bash .husky/pre-commit` | verify.md |
| 6 Retro | plain text | retro.md |
| 7 Decide | `git`, plain text | decision.md + commit |

## Open considerations (NOT yet patches)

- v6 round count target: 1 round / 30min wall clock (was 1 / 45min in v5)
- pre-commit hook coverage: 6 mechanical checks — can grow to 8-10 if signal proven
- proposals.jsonl schema: append-only, human-readable

## Notes

- File: `.opencode/skills/team-dev-loop/SKILL.md`
- Pre-commit: `.husky/pre-commit` (absorbs v5 SG.R44.1 commands 1-8 minus user-facing ones)
- Backlog label: `pm-manager-approved` (created by Sync)
- Round artifacts: `.omo/round-N/` (committed, NOT ephemeral)
- proposals.jsonl: `.omo/proposals.jsonl` (committed, append-only)