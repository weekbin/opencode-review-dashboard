# R157 Brief — fix 3 lint warnings (R156-surfaced housekeeping)

## Scope

1. **`src/runtime-compat.ts:228`** — remove the unnecessary `?? {}` fallback in `...process.env, ...(opts.env ?? {})` → `...process.env, ...opts.env`. The `?? {}` is a no-op because spreading `undefined` in an object literal is harmless.

2. **`src/runtime-compat.ts:283`** — same fix in the `spawnDetached` Node path.

3. **`src/ui/diff-virtualization.test.ts:139`** — replace `const self = this;` + `function matches` / `function walk` with arrow function versions that capture `this` lexically. The `walk` function takes `root` as a parameter rather than relying on a `self` closure capture.

4. Append R156 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/runtime-compat.ts` — 2 trivial edits (4 chars each: `?? {}` → ``)
- `src/ui/diff-virtualization.test.ts` — convert 2 inner functions to arrow functions, remove `const self = this;` alias
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The v6 loop's existing `Agent-memo hook` for comments — R157 makes 1 trivial comment-style change in the test (the `matches` and `walk` functions become arrow functions, which is a style change not a comment change).
- The `R137→R142` byte-equivalence → behavior-contract SOP doesn't apply here (R157 doesn't modify any existing byte-equivalence test).

## Simplest change

Per call-site list. ~10 LOC net (4 chars saved per runtime-compat edit + 6 lines changed in the test).

## Risk

- **No behavior change.** Both fixes are cosmetic.
- **No test brittleness** — the test still tests the same behavior.
- **No new lint warnings** — `bun run check` should report `0 warnings and 0 errors` after R157.

## Acceptance

- `bun run check` reports `0 warnings and 0 errors` (was 3 warnings pre-R157)
- `bun test src/ui/diff-virtualization.test.ts` passes (42/42 — was 42/42)
- Full project suite stays green (was 1116)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep -nE 'opts\.env \?\? \{\}|const self = this' src/runtime-compat.ts src/ui/diff-virtualization.test.ts` returns 0 matches

## Profile

Housekeeping. 2 files modified + 1 housekeeping append. Closes the R156-surfaced warnings.