# Round 1 Brief

## Title
Pick 1 of 5 PM-proposed candidates for round 1 (no open GitHub issues, agent self-investigation triggered)

## Source
- Agent self-investigation (no open issues, issues #2 and #4 both CLOSED)
- 3 parallel audits (plugin code, UI code, tests+docs) cross-verified against actual code
- PM source: `unspecified-high` subagent, 1m33s execution

## Goal
Address one real user-facing bug or test gap in `@weekbin/opencode-review-dashboard` to make the next release safer/more reliable.

## Acceptance criteria
- Fix must be backed by concrete file:line evidence (not speculation)
- Fix must NOT require a major rewrite
- If fix touches user-facing behavior, must add a test scenario (per candidate #4 finding)
- All 7 roles (PM / PM Manager / Architect / Dev / Tester / PM Doc Writer / Decision) participate

## PM's 5 Candidates (ranked by user value, full detail in PM's session output)

| # | Title | Severity | Effort | Risk |
|---|---|---|---|---|
| 1 | Atomic `state.json` writes — review history is one power-loss away from being wiped | bug (data loss) | Short | Low |
| 2 | `--worktree` silently auto-picked around when target worktree is clean | bug (wrong review) | Trivial | Low |
| 3 | Reopen anchor only checks `start_line`, so multi-line range with partial change re-opens stale findings | bug (stale finding) | Trivial | Low |
| 4 | E2E harness has zero regression coverage for the two things both READMEs call out — range-changed banner and stale-finding reconcile | test gap | Medium | Low |
| 5 | `take-screenshots.mjs` is dead code that future contributors will try to use and hit three silent failures | ux / trap-for-contributor | Trivial-Short | Negligible |

## PM's 4 Deliberately-Excluded items (for reference, not part of round 1)
- "Drop the `endsWith` fallback in `--files`" (typo edge case only, demote)
- "Add timeout to `Bun.spawn` in `run()`" (rare trigger)
- "Browser auto-open failure → tell the user" (URL already in TUI log)
- "Constant-time token compare" (nice-to-have only)

## Per-candidate evidence (PM verified)

### Candidate #1: Atomic state.json writes
- `src/index.ts:527-530` — `saveState` writes directly with no temp+rename
- `src/index.ts:524` — corruption recovery is destructive (silently returns fresh state on parse failure)
- `src/index.ts:1820-1831` — round-NNN.json/.md exports also non-atomic

### Candidate #2: --worktree override
- `src/index.ts:1233-1243` — auto-pick checks `isWorktree(root)` not `worktree` parameter

### Candidate #3: Reopen anchor
- `src/index.ts:1703-1710` — only checks `lines[start_line - 1]`, ignores `end_line`
- Asymmetric vs `src/index.ts:308-343` (close-on-change is stricter)

### Candidate #4: E2E coverage
- `scripts/test-review-ui/scenarios.mjs:201-214` — explicit "verified manually" comment
- `scripts/test-review-ui/e2e.mjs:80-99` — 8 scenarios collapse to same assertion
- `src/index.ts:308-343` reconcile() has zero e2e coverage
- `scripts/test-review-ui/scenarios.mjs:243` — 13 scenarios defined but READMEs say 10 (3 missing from docs)

### Candidate #5: take-screenshots.mjs
- `scripts/test-review-ui/take-screenshots.mjs:1,14,19,24,34` — hardcoded Linux path
- `package.json:46-59` — puppeteer not in dependencies
- Port mismatch: 8897 in script vs 8890 in mock-server.py/README
