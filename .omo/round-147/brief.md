# R147 Brief — close fallbackCopy deprecation flag: rename + docstring + migration TODO

## Scope

1. **`src/ui/app.ts:668-682`** — Rename `fallbackCopy` → `legacyExecCommandCopy`. Add docstring above explaining:
   - Why `document.execCommand("copy")` is still used (deprecated but works; primary path is `navigator.clipboard.writeText`)
   - The relationship to `navigator.clipboard.writeText` (this is the catch-all fallback)
   - Migration path reference (ClipboardItem API)

2. **`src/ui/app.ts:393, L396, L459, L462, L1767, L1770, L1799, L1802`** — Rename call sites from `fallbackCopy(` → `legacyExecCommandCopy(`.

3. **`src/permalink.test.ts:T11.2d`** — Update behavior-contract assertion from `fallbackCopy(` → `legacyExecCommandCopy(`.

4. **`src/ui/r147-fallback-copy-deprecation.test.ts`** — 3 contract tests verifying:
   - The renamed function `legacyExecCommandCopy` exists at the expected position
   - The function contains `document.execCommand("copy")`
   - All 4 callers use the renamed function (verify by greppinng app.ts for `legacyExecCommandCopy(` calls)

5. Append R146 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/ui/app.ts` — 1 function rename + 1 docstring + 8 call-site renames (4 functions × 2 branches each)
- `src/permalink.test.ts` — T11.2d assertion update (1 line)
- `src/ui/r147-fallback-copy-deprecation.test.ts` — new test file (3 contract tests)
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The R139 hoist established `fallbackCopy` as file-scope (renamed via R139 commit `db30b3d`). The hoist reduced ~48 LOC of duplicate code.
- The R137→R142 byte-equivalence → behavior-contract SOP applies: test asserts function existence + structural markers, not exact bytes.

## Simplest change

Per call-site list. ~15 LOC net (1 docstring + 1 rename + 8 call-site renames + 1 test assertion update + 1 new test file).

## Risk

- **No runtime behavior change.** Function behavior is identical post-rename.
- **All existing tests must stay green** — the renames are mechanical, no semantic change.
- **AC1.2 registerUITranslator invariant unaffected** (the change is in clipboard helper, not i18n).
- **T11.2d byte-equivalence SOP applies** — upgrade from `fallbackCopy` literal to `legacyExecCommandCopy` literal in the existing assertion.

## Acceptance

- `bun test src/ui/r147-fallback-copy-deprecation.test.ts` passes (3 tests)
- `bun test src/permalink.test.ts` passes (T11.2d still asserts the helper)
- Full project suite stays green (was 1092, expect ~1095)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep -nE 'function fallbackCopy|fallbackCopy\(' src/ui/app.ts` returns 0 matches
- `grep -nE 'legacyExecCommandCopy' src/ui/app.ts` returns ≥9 matches (1 def + 8 call sites)

## Profile

Housekeeping. ≤2 files modified + 1 new test + 1 test update + 1 housekeeping append. Pure documentation + rename — no behavior change.