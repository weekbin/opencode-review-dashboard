# Security Review — Round 2

## Threat model

Round 2 is a 1-line code change: `wt.path !== root` → `wt.path !== wtRoot`. The change narrows the worktree filter to exclude the explicitly-resolved worktree instead of just the current directory. Threat model review:

### Input validation
- `worktree` (the flag value) is parsed by `parse()` at `src/index.ts:256` after validating it as a string token. No new input surface — same flag, same parser.
- `wtRoot = worktree ?? root` is a simple fallback — no injection risk.

### Path traversal
- No new path construction. `wt.path !== wtRoot` compares two paths; doesn't construct new ones.
- `listWorktrees(root)` and `worktreeAheadSummary(wt.path, wt.branch)` are unchanged — no new exposure.

### Race conditions
- No new shared state. The filter change is purely local — no concurrency concerns.
- TOCTOU between filter and candidate evaluation is pre-existing, not new.

### Auth/authz
- No new endpoints, no auth changes.

### Data integrity
- No data write changes. `state.json` writes are unchanged (Round 1's atomic write fix from commit `708a6fc`).

## Findings by severity

### CRITICAL (must fix before merge)
None.

### HIGH (should fix — exploit possible with constraints)
None.

### MEDIUM (defense-in-depth)
None.

### LOW (informational)
None.

## Verdict

**PASS** — 1-line filter change has no security surface. No new findings. Round 1's atomic write + corrupt-file recovery still in effect (verified by QA lens — 7 state.json files validated as byte-valid JSON post-fix).