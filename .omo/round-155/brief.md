# R155 Brief — close R154 partial closure: complete regression coverage for 5 server-side marker locations

## Scope

1. **Extend `src/r154-server-markers-regression.test.ts`** to cover **all 5 marker locations** in `src/index.ts` (not just 2 + 1 in the AGENT_PROMPT):
   - L1697: AGENT_PROMPT references `Manually reopened: <reason>` in manually-reopened directive
   - L1701: AGENT_PROMPT references `Edited by user` in manually-edited directive
   - L1726: AGENT_PROMPT references `Edited by user` in comments[] summary note
   - L2211-2212: reopen handler writes `Manually reopened: <reason>` or `Manually reopened` literal
   - L2450: edit handler writes `Edited by user<summary>` literal

2. **Add a one-line docstring at the AGENT_PROMPT** (`src/index.ts:1696`) explaining the "agent contract" decision: these strings are part of the agent's parse contract; localizing them would break agent scanning. The docstring cross-references the R142-R152 retro #3 conclusion.

3. **Verify no regression** in the 2 existing byte-equivalence tests (T9.1e in `reopen-stale.test.ts`, R153 stale comment test) — they should still pass since the literal-prefix format is preserved.

4. Append R154 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/r154-server-markers-regression.test.ts` — extend with 2-3 more assertions
- `src/index.ts:1696` — add a one-line docstring (just before the `1a.` directive block) explaining the agent contract
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The R154 regression test already has 5 tests (2 for the call-site format + 2 for the AGENT_PROMPT references + 1 meta-test documenting why). R155 just consolidates and completes the coverage.
- The R137→R142 byte-equivalence → behavior-contract SOP doesn't apply here (R155 doesn't modify any existing byte-equivalence test).
- The R142-R152 retro #3 decision: "These markers are agent contract — not i18n candidates." R155 formally closes the flag by completing the regression net.

## Simplest change

Per call-site list. ~15 LOC net addition (test extensions + 1 docstring + housekeeping append).

## Risk

- **No behavior change.** R155 just adds coverage and documentation, doesn't change the markers themselves.
- **No brittle-test upgrade** — R155 only extends the R154 regression test (which was already behavior-contract from R154).
- **No server-side dependency changes** — i18n.ts is not imported into src/index.ts (the AGENT_PROMPT is a single string literal in src/index.ts, not an i18n call).

## Acceptance

- `bun test src/r154-server-markers-regression.test.ts` passes (7 tests after R155)
- Full project suite stays green (was 1103, expect ~1106 with 2-3 new tests)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS

## Profile

Housekeeping. 1 test file extended + 1 one-line docstring + 1 housekeeping append. Closes R142-R152 retro #3 carry-over (10 rounds shelved).