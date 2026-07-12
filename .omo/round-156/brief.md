# R156 Brief — add `src/runtime-compat.test.ts` + tighten `bun()` return type

## Scope

1. **`src/runtime-compat.ts:44-45`** — tighten `function bun(): any` to `function bun(): Bun.RuntimeNamespace | undefined` (Bun has its own types in `@types/bun`). If `@types/bun` is not available, fall back to `unknown` to force callers to narrow.

2. **`src/runtime-compat.test.ts`** (new file) — add direct test coverage for the runtime-compat module:
   - Test `fileExists(path)` for both Bun and Node paths
   - Test `readFileText(path)` for both Bun and Node paths
   - Test `IS_BUN` detection
   - Test `bun()` lazy lookup

3. **`src/state-store.test.ts`** — fix any test that breaks due to stricter typing on `bun()`.

4. Append R155 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/runtime-compat.ts` — 1 function return type change (~3 lines)
- `src/runtime-compat.test.ts` — new test file (~30 LOC)
- `src/state-store.test.ts` — fix any test that breaks (~0-5 LOC)
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- Every other module in `src/` has direct test coverage (e.g. `src/state-store.test.ts`, `src/i18n.test.ts`, etc.). `src/runtime-compat.ts` is the outlier.
- The `bun()` function's comment at L41-43 explains the pattern: "We keep the lazy reference to the Bun global so test injection can swap it without breaking the runtime-compat layer's own detection." The current return type `any` is a code smell.
- The R137→R142 byte-equivalence → behavior-contract SOP doesn't apply here (R156 is a new test file + type tightening).

## Simplest change

Per call-site list. ~30 LOC net (test file + type tightening + housekeeping append).

## Risk

- **No runtime behavior change.** Type tightening is compile-time only.
- **No production code path changes.** The `bun()` function is called the same way; the caller now gets a properly-typed return value.
- **No brittle-test upgrade** — R156 only adds a new test file.
- **No new lint warnings** — replacing `any` with a proper type is a lint improvement.

## Acceptance

- `bun test src/runtime-compat.test.ts` passes (≥4 tests)
- Full project suite stays green (was 1103, expect ~1107 with 4+ new tests)
- `bun run check` PASS (lint + typecheck — should have 0 warnings, was 0)
- Pre-commit 8/8 PASS
- `grep -nE 'function bun\(\): any' src/runtime-compat.ts` returns 0 matches
- `ls src/runtime-compat.test.ts` returns the new file

## Profile

Refactor. ≤3 files modified + 1 new test file + 1 housekeeping append. Adds direct test coverage to the last untested module + tightens a code smell.