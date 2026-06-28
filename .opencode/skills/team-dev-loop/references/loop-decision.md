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
| Dev (Phase 2) | Implementation FAIL or self-check FAIL | Loop back to Phase 2 (Dev iterates) |
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
