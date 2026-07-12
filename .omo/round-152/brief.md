# R152 Brief — close R151 `contextHash` carry-over: upgrade R113 + R131 + delete function

## Scope

1. **`src/index.ts:434-437`** — delete `contextHash` function (5 LOC including blank line).

2. **`src/r113-content-hash.test.ts`** — upgrade R113 AC3 from keyword-grep + windowed-slice to behavior-contract. New assertion: the submit handler / sanitize function uses `fnv1a(...)` to compute a hash and writes it as `context_hash` on each finding. The 500-char window + `window.includes("anchor") || window.includes("context")` heuristic is replaced with a precise behavior assertion.

3. **`src/r131-round-lock-on-approve.test.ts`** — upgrade SUBMIT_HANDLER_START / STATE_TYPE_DEF_START from hardcoded line-number constants to behavior-contract. These tests currently slice the source at a fixed line number and assert substring patterns in the window. After contextHash deletion (and any future source shifts), the line numbers move. New approach: grep the source for the function name + assertion target substring, then verify the assertion target appears in the function body.

4. **`src/ui/r152-context-hash-cleanup.test.ts`** — new regression test: assert `src/index.ts does NOT declare a function named `contextHash`` (catches future re-introductions).

5. Append R151 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/index.ts` — 1 function deletion (~5 LOC)
- `src/r113-content-hash.test.ts` — 1 test upgrade (AC3)
- `src/r131-round-lock-on-approve.test.ts` — multiple test upgrades (AC6 + AC2 + others using SUBMIT_HANDLER_START / STATE_TYPE_DEF_START)
- `src/ui/r152-context-hash-cleanup.test.ts` — new test file (1 test)
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The R137→R142 byte-equivalence → behavior-contract SOP applies. R151 retro explicitly mentioned this pattern.
- `bun:test` provides `describe`/`it`/`expect`. Source-level assertions via `Bun.file(src).text()`.
- The R113 + R131 keyword-grep patterns are now 10+ rounds old (R113 from 2026-05). They're brittle but proven. The upgrade removes the brittleness.

## Simplest change

Per call-site list. ~20 LOC net deletion + 1 new test.

## Risk

- **No runtime behavior change.** `contextHash` is genuinely unused — deleting it doesn't break any production code path.
- **Test upgrade risk**: the upgraded tests should still cover the same behavior. R113 AC3 still verifies that submit handler stamps `context_hash` on findings. R131 still verifies that submit returns 409 when locked.
- **No new lint warning** introduced.
- **R103 invariant unaffected** (no i18n changes).

## Acceptance

- `bun test src/r113-content-hash.test.ts` passes (3 tests)
- `bun test src/r131-round-lock-on-approve.test.ts` passes (12 tests)
- `bun run check | grep -c 'no-unused-vars'` returns 0 (was 1) — `contextHash` removed
- Full project suite stays green (was 1101)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep -nE 'function contextHash' src/index.ts` returns 0 matches

## Profile

Polish. ≤4 files modified + 1 new test + 1 housekeeping append. Closes R151 carry-over (1 of 1).