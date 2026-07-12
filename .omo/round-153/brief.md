# R153 Brief — remove deprecated `legacyExecCommandCopy` fallback + simplify 4 call sites

## Scope

1. **`src/ui/app.ts:667-684`** — delete `legacyExecCommandCopy` function (18 LOC including deprecation docstring).

2. **`src/ui/app.ts:385-395`** (`copyFindingPermalinkToClipboard`):
   - Old: try { writeText; ok = true } catch { ok = legacyExecCommandCopy } else { ok = legacyExecCommandCopy }
   - New: try { writeText; ok = true } catch { ok = false } — no else branch (if `navigator.clipboard` undefined, ok stays false → error toast)

3. **`src/ui/app.ts:451-461`** (`copyFindingAsMarkdownToClipboard`):
   - Same simplification pattern as above

4. **`src/ui/app.ts:1759-1769`** (`copyBranchNameToClipboard`):
   - Same simplification pattern

5. **`src/ui/app.ts:1788-1800`** (`copyRoundNotesToClipboard`):
   - Same simplification pattern

6. **`src/ui/r139-fallback-copy.test.ts`** — DELETE (tests the removed function — no longer meaningful)

7. **`src/ui/r147-fallback-copy.test.ts`** — DELETE (T1/T2/T3 tested the removed function's try/catch behavior)

8. **`src/permalink.test.ts:T11.2d`** — upgrade from byte-equivalence to behavior-contract: assert `navigator.clipboard?.writeText` + `✓ Copied` + `setStatus` (all real behaviors); assert `legacyExecCommandCopy` does NOT exist.

9. **`src/r16-features.test.ts:T16.8d + T16.10a + T16.10b`** — upgrade from byte-equivalence to behavior-contract: assert the function uses `navigator.clipboard.writeText` directly + the helper function does NOT exist + writeText rejection sets `ok=false` (no fallback).

10. Append R152 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/ui/app.ts` — 1 function deletion + 4 call site simplifications (~30 LOC net deletion)
- `src/ui/r139-fallback-copy.test.ts` — DELETE
- `src/ui/r147-fallback-copy.test.ts` — DELETE
- `src/permalink.test.ts` — 1 test upgrade (T11.2d)
- `src/r16-features.test.ts` — 3 test upgrades (T16.8d + T16.10a + T16.10b)
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The R137→R142 byte-equivalence → behavior-contract SOP applies. R151 retro explicitly noted: "R137→R142 SOP is mature. 13 documented occurrences. Pattern: when a refactor removes an API, tests asserting that API get upgraded to behavior-contract."
- The deprecation docstring at L667-669 (4 lines) is also removed since the function is gone.

## Simplest change

Per call-site list. ~50 LOC net deletion + 2 file deletions + 1 housekeeping append.

## Risk

- **Real behavior change** for copy failures: environments without `navigator.clipboard.writeText` (very old browsers + non-secure contexts) now show an error toast instead of falling back to execCommand. The existing `if (ok)` false branch already calls `setStatus("Could not copy", true)` + `showToast(...)` — no UX regression, just more honest error reporting.
- **No server changes** — pure client-side refactor.
- **Test upgrade risk**: the upgraded tests should still cover the same behavior (each test asserts the function uses writeText + produces feedback). Behavior-contract assertions are less brittle to future refactors.
- **R103 invariant unaffected** (no i18n changes).

## Acceptance

- `bun test` full suite passes (was 1103, expect ~1098 with 2 file deletions + 5 test upgrades)
- `bun run check` PASS (lint + typecheck) — 0 new lint warnings
- Pre-commit 8/8 PASS
- `grep -nE 'legacyExecCommandCopy|execCommand\("copy"\)' src/ui/app.ts` returns 0 matches
- `ls src/ui/r139-fallback-copy.test.ts src/ui/r147-fallback-copy.test.ts` returns "No such file"

## Profile

Refactor. 1 src file modified + 2 src test files modified + 2 file deletions + 1 housekeeping append. Removes deprecated API usage + simplifies 4 call sites.