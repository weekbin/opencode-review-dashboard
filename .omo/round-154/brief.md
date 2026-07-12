# R154 Brief — remove R153 stale deprecation comment + add regression test for 3 server-side markers

## Scope

1. **`src/ui/app.ts:663-665`** — delete the now-obsolete deprecation comment block (3 lines):
   ```
   // Deprecated: navigator.clipboard.writeText is the primary copy path; this
   // is the catch-all fallback for environments where the Clipboard API is
   // unavailable. Migrate to ClipboardItem API when browser support stabilizes.
   ```
   R153 SHIPped the legacyExecCommandCopy fallback deletion; this comment was the docstring for the now-removed function. Leaving it pollutes the source with stale information.

2. **`src/r154-server-markers-regression.test.ts`** — new regression test (5 tests) that asserts the 3 server-side i18n-coupling markers (R142-R152 retro #3, 10 rounds shelved) are preserved as part of the agent contract.

3. Append R153 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/ui/app.ts` — 3 lines of comment deletion
- `src/r154-server-markers-regression.test.ts` — new test file (5 tests)
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The 3 server-side markers are NOT orphans or unused code — they're a deliberate agent contract. R154 just adds a test to catch unintended future changes.
- The regression test reads source via `Bun.file()` and asserts regex matches. Same pattern as every R## test since R87.

## Simplest change

Per call-site list. ~3 LOC net deletion + 1 new test file (5 tests) + 1 housekeeping append.

## Risk

- **No behavior change.** Comment deletion is doc-only.
- **Regression test is non-invasive** — it just reads source and asserts the contract.
- **No test cascade** — R154 doesn't modify existing tests.
- **R103 invariant unaffected** (no i18n changes).

## Acceptance

- `bun test src/r154-server-markers-regression.test.ts` passes (5 tests)
- Full project suite stays green (was 1098, expect ~1103 with 5 new tests)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep -nE 'Deprecated: navigator.clipboard.writeText' src/ui/app.ts` returns 0 matches

## Profile

Housekeeping. 1 src file modified + 1 new test file + 1 housekeeping append. Closes R153 leftover + adds regression net for 10-round-shelved flag.