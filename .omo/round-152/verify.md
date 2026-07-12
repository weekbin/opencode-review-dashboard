# R152 Verify — close R151 `contextHash` carry-over: upgrade R113 + R131 to behavior-contract + delete function

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R152 scope files (1 src + 2 test files + 6 round artifacts + proposals)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1103/1103 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS (0 no-unused-vars) / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R152 Contract Suite — 17/17 PASS

```
R113 #77 AC1 — close_reason union extended with content_match:
  (pass) src/index.ts close_reason type includes 'content_match' literal

R113 #77 AC2 — content-hash function computes hash from anchor context:
  (pass) src/index.ts defines fnv1a function for anchor context hashing (R152: contextHash retired)

R113 #77 AC3 — contentMatches uses fnv1a for hash comparison (R152 behavior-contract):
  (pass) src/index.ts contentMatches() body uses fnv1a() to compare anchor selected/before/after

R131 — all 12 tests pass (pathname-based handler extraction)

R152 — close R151 contextHash carry-over (regression net):
  (pass) src/index.ts no longer declares a function named contextHash
  (pass) src/index.ts contentMatches() body uses fnv1a() for content-hash comparison
```

## What R152 Closed

R151 retro carry-over: 1 `no-unused-vars` warning (`contextHash` function at `src/index.ts:434`). R151 retro explicitly noted: "Future R152+ should upgrade R113 + R131 to behavior-contract per the R137→R142 SOP, then complete the contextHash deletion."

R152:
1. Deleted `contextHash` function (5 LOC including blank line)
2. Upgraded R131 from hardcoded line-number constants (10 usages of `SUBMIT_HANDLER_START` + 4 of `RESOLVE_HANDLER_START` etc.) to pathname-based extraction (`locateHandlerBodyByPathname`)
3. Upgraded R113 AC3 from brittle 500-char window + keyword-grep to behavior-contract on `contentMatches()` function
4. Added R152 regression-net test (`src/ui/r152-context-hash-cleanup.test.ts`)

## Cross-Round Repair Notes

R152's first attempt to delete `contextHash` caused R131 regex (looking for `app.post("/submit")`) to fail because:
- src/index.ts uses Bun-style routing: `if (request.method === "POST" && pathname === '/api/review/${id}/submit')`
- Old R131 regex pattern `app\\.${method}\\(${path.source}` matched nothing

Fixed by replacing regex with direct `indexOf(pathname)` + brace-walking helper (`locateHandlerBodyByPathname`). The pathname string in the source is unique (no other occurrence of `/api/review/${id}/submit`), so `indexOf` is sufficient.

R113 AC3's original assertion (`sanitize() body contains context_hash`) was wrong — `context_hash` was never actually written by `sanitize()`. The real auto-resolve mechanism uses `contentMatches()` with `fnv1a()` for hash comparison. Fixed by asserting `contentMatches()` body contains 6 `fnv1a()` calls (3 prev + 3 next).

Stash-and-test pattern verified both R131 and R113 test files separately before staging. Each test passed with contextHash deleted. Full pre-commit 1103/1103 PASS.

## Regression Sweep — All Green

- R151, R150, R149, R148, R147, R146, R145, R144, R143, R142, R141, R140, R139, R138, R137, R136, R135, R134, R133, R132, R131, R130, R129, ... R57, R44 regression tests all pass.
- **R131**: PASS (12/12).
- **R113**: PASS (3/3).
- **R152 regression-net**: PASS (2/2).
- Project suite after R152: **1103 tests pass** (was 1101 pre-R152; +2 R152 new).
- tsc `--noEmit`: PASS
- oxlint: PASS (0 no-unused-vars warnings — `contextHash` was the last unused function)
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-152/`)

## What changed

- `src/index.ts:434-437` — deleted `contextHash` function (5 LOC)
- `src/r131-round-lock-on-approve.test.ts` — upgraded 12 tests from hardcoded line-number constants to pathname-based handler extraction
- `src/r113-content-hash.test.ts` — rewrote AC3 to assert `contentMatches()` behavior-contract (fnv1a calls) instead of brittle 500-char window + keyword-grep
- `src/ui/r152-context-hash-cleanup.test.ts` — new regression test (2 tests covering contextHash removal + fnv1a usage in contentMatches)
- `.omo/proposals.jsonl` — appended R152 entry (per-SHIP discipline)

## Visual QA Evidence

Not applicable. R152 ships zero UI changes — only test refactoring + dead-code deletion.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (closes R151 carry-over) |
| ≤1 polish | PASS (R152 = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R152 ready to SHIP.