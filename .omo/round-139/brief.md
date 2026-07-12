# R139 Brief — hoist `fallbackCopy` to file scope

## Scope

1. `src/ui/app.ts` — declare one file-scope `fallbackCopy(text: string)` near the existing `COPY_FEEDBACK_MS` constant (~L698). Delete the 4 duplicate bodies in `copyFindingPermalinkToClipboard` / `copyAsMarkdown` / `copyBranchNameToClipboard` / `copyRoundNotesToClipboard`. Each deleted block is ~12 lines; net reduction ~36 LOC.
2. New test file `src/ui/r139-fallback-copy.test.ts` — direct test on the hoisted function for both happy path (execCommand returns) and catch path (DOM throws → returns false).
3. Append R138 entry to `.omo/proposals.jsonl`.

## Files involved

- `src/ui/app.ts` — 1 function added near L698 + 4 blocks deleted (L390-L403, L471-L483, L1768-L1781, L1815-L1828)
- `src/ui/r139-fallback-copy.test.ts` — new test file
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The 4 duplicates are byte-equivalent (~12 lines each, same `try { textarea } catch {}` shape).
- `r73-copied-timer-leak.test.ts` already covers the timer-leak contract for 2 of the 4 callers (preserves behavior).
- `r131-round-lock-on-approve.test.ts` uses marker-anchored slicing (`appTs.indexOf("function showPostSubmit")`) — same drift-resistant pattern.

## Simplest change

Add `function fallbackCopy(text: string): boolean {…}` near `COPY_FEEDBACK_MS`. Delete the 4 inline bodies. Each caller's existing 2-line `try/catch` flow stays unchanged (just references the hoisted function).

## Risk

- **Behavior**: must be byte-equivalent. Hoisted function literal copy of the existing body. Verified via `r73-copied-timer-leak.test.ts` (already in suite) + new direct test.
- **Scope leakage**: `fallbackCopy` references `document` (DOM global). Must not move to module scope outside DOM context. Solution: keep it as a top-level function declaration (not exported, not on a class), same DOM-access pattern as before.
- **No behavior risk:** all 4 callers already invoke exactly `fallbackCopy(text)` in their catch path; the hoisted function preserves that signature.

## Acceptance

- `bun test src/ui/r139-fallback-copy.test.ts` passes (direct DOM-mocked test of happy + catch paths)
- `bun test` full suite stays green (was 1069, expect 1070-1072 with new direct tests)
- `bun run check` PASS
- Pre-commit 8/8 PASS
- `rg -n 'const fallbackCopy' src/ui/app.ts` returns 0 matches (all duplicates deleted)
- `rg -n '^\s*(function|const)\s+fallbackCopy' src/ui/app.ts` returns 1 match (file-scope declaration)

## Profile

Housekeeping/refactor. 1 file modified + 1 new test + 1 housekeeping append. 0 features / 0 bugfixes / 0 polish. Net -36 LOC.