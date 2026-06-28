---
name: team-dev-loop
description: "7-role dev loop for THIS REPO. Orchestrate PM/PM Manager/Architect/Dev/Tester/PM Doc Writer/Decision phases. Round 1 pre-staged at .omo/team/round-1/ with 5 PM-surfaced candidates. omo team_mode is enabled. Triggers: 'team dev loop', 'dev loop', 'run dev loop', 'pick next issue', 'next round', 'do 1 round'."
---

# /team-dev-loop Command

## Quick start

The full 7-role pipeline design lives in `docs/team-dev-loop.md` (committed) and the
gitignored skill body lives in this directory. Read them in this order:

1. **`docs/team-dev-loop.md`** — design + usage doc (1 file, 700+ lines)
2. **`SKILL.md` (this file)** — thin orchestrator stub
3. **`references/phase-prompts.md`** — exact prompts to send each member
4. **`references/loop-decision.md`** — fail-mode handling matrix

## What this skill does

For each round:
1. Read `.omo/team/round-N/brief.md` (PM's proposal with ranked candidates)
2. Run the 7 phases: PM verify → PM Manager review → user pick → Architect plan → Dev (with inline brief-vs-code self-check) → Tester (3 lanes parallel) → PM Doc Writer → Decision
3. Append to `.omo/team/proposals.jsonl`
4. Cleanup: `team_shutdown_request` + `team_approve_shutdown` per member + `team_delete`

## Agent architecture (CRITICAL)

| Layer | Agent | Why |
|---|---|---|
| **Orchestrator (creates team)** | **`sisyphus` (primary chat)** | omo `team_mode` only registers `team_*` tools to the primary `sisyphus` agent. Subagents (`sisyphus-junior`, `prometheus`, etc.) do NOT get these tools — only `call_omo_agent` (explore/librarian only). So `team_create` MUST be called from the primary chat. |
| **Members (spawn per role)** | sisyphus-junior (auto-routed by `kind: "subagent_type"`) | Once team is created, each member is a fresh sisyphus-junior subagent. Anti-bias preserved. |

## Hand-off pattern (omo team_* tool calls)

```
team_create({teamName: "team-dev-loop"})                              // returns teamRunId
team_task_create({teamRunId, subject: "pm-round-1", description: ...})
team_send_message({teamRunId, to: "pm", body: <prompt>})              // auto-delivers
team_send_message({teamRunId, to: "pm-manager", body: <prompt>})
# ... etc
team_shutdown_request({teamRunId, memberName: "pm"})
team_approve_shutdown({teamRunId, memberName: "pm"})
# ... per member
team_delete({teamRunId})                                              // MUST run when every task terminal
```

## Round 1 entry point

- Existing brief: `.omo/team/round-1/brief.md` (5 candidates, file:line evidence)
- Existing self-critique: `.omo/team/round-1/brief-quality-report.md`
- All 4 files of the skill installed: SKILL.md, phase-prompts.md, loop-decision.md (gitignored) + docs/team-dev-loop.md (committed)
- omo team_mode doctor: PASS (team_mode: enabled, tmux: ok, base dir: ok, declared: 1)
- Tmux 3.7 installed, currently inside a tmux session (TMUX env set) — required for tmux_visualization
- Project memory 372: git worktree required before any src/ edits

## Per-phase execution (very brief — see phase-prompts.md for full prompts)

For each member below, read `references/phase-prompts.md` for the exact body, then:
```
team_task_create({teamRunId, subject: "<phase>", description: "<1-sentence task>"})
team_send_message({teamRunId, to: "<member-name>", body: <prompt from phase-prompts.md>})
# wait for member to mark task completed via team_task_update
team_task_list({teamRunId})
# when all tasks terminal: closure sequence
```

Members in order: `pm` → `pm-manager` (ask user if REJECT) → `architect` (after user pick) → `dev` (creates worktree) → `tester-review` + `tester-diff` + `tester-playwright` (parallel) → `pm-doc-writer` → closure

## Closure sequence (NON-NEGOTIABLE)

When every task is terminal (verified via `team_task_list`):

1. `team_shutdown_request({teamRunId, memberName: M})` for each active M
2. `team_approve_shutdown({teamRunId, memberName: M})` for each
3. `team_delete({teamRunId})` — only `force: true` if member stuck mid-write

Lingering teams burn session + mailbox quota every idle minute. Close in the same turn as the last terminal task.

## Notes
- worktree: per project memory 372, create git worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-N` before any src/ edits
- Do NOT push to remote, do NOT auto-merge to main — user reviews and merges
- tmux_visualization: each member gets a pane; you'll see them appear in your tmux session after team_create
