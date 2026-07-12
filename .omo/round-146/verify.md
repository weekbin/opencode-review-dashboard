# R146 Verify — localize `<option value="all">` (filter-previously-by-round dropdown default)

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R146 scope files (1 src review.html + 1 src app.ts + 1 new test + 1 test upgrade + 6 round artifacts + proposals)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1092/1092 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R146 Contract Suite — 3/3 PASS

```
(pass) i18n.ts declares previously.allRounds with en + zh-CN (en ≠ zh-CN)
(pass) review.html annotates the <option value='all'> with data-i18n='previously.allRounds'
(pass) app.ts registers registerUITranslator('previously.allRounds', ...) for AC1.2 invariant
```

## Side Fix — T14.25.1 upgraded from byte-equivalence to behavior-contract

R146 added `data-i18n="previously.allRounds"` to `<option value="all">` in review.html. The existing T14.25.1 test asserted byte-equivalence on `<option\s+value="all">All rounds<\/option>`. The added `data-i18n` attr broke the assertion.

Applied the same R137→R142 SOP upgrade pattern as R145 did for T14.23.7:

```js
// before (byte-equivalence — broke when data-i18n attr was added)
expect(html).toMatch(/<option\s+value="all">All rounds<\/option>/);

// after (behavior-contract — asserts both data-i18n attr AND user-facing text)
expect(html).toMatch(
  /<option\s+value="all"[^>]*data-i18n="previously\.allRounds"[^>]*>All rounds</,
);
```

The test now asserts the contract (option is annotated with the right i18n key + the localized content) instead of byte-equivalence (exact `<option>` markup shape). Same pattern R145 applied to T14.23.7.

## Key Discovery — Existing `previously.allRounds` Key Reused

R146 audit discovered that the i18n key for "All rounds" **already exists** at `src/ui/i18n.ts:503` as `previously.allRounds` (en="All rounds" / zh-CN="所有轮次"). No new i18n key was needed. R146 is therefore:

- **0 new i18n keys added** (existing `previously.allRounds` reused)
- **1 review.html attribute addition**: L3665 `<option value="all">` → `<option value="all" data-i18n="previously.allRounds">`
- **1 `registerUITranslator()` call**: app.ts paired with the new attr (AC1.2 invariant)
- **1 test file**: src/ui/r146-review-html-i18n.test.ts (3 contract tests)
- **1 test upgrade**: T14.25.1 byte-equivalence → behavior-contract

## Regression Sweep — All Green

- R145, R144, R143, R142, R141, R140, R139, R138, R137, R136, R135, R134, R133, R132, R131, R130, R129, ... R57, R44 regression tests all pass.
- **AC1.2 registerUITranslator invariant**: PASS.
- **T14.25.1 behavior-contract upgrade**: PASS.
- Project suite after R146: **1092 tests pass** (was 1086 pre-R146; +3 R146 new + 3 test additions).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-146/`)

## What changed

- `src/ui/review.html:L3665` — `<option value="all">` → `<option value="all" data-i18n="previously.allRounds">`
- `src/ui/app.ts:L1726` — added `registerUITranslator("previously.allRounds", () => t("previously.allRounds"))` paired with the new attr (AC1.2 invariant).
- `src/draft-autosave.test.ts:T14.25.1` — upgraded from byte-equivalence to behavior-contract (asserts both data-i18n attr + user-facing text).
- `src/ui/r146-review-html-i18n.test.ts` — 3 contract tests covering i18n key wiring, attribute swap, and AC1.2 registerUITranslator registration.
- `.omo/proposals.jsonl` — appended R146 entry (per-SHIP discipline).

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R146 is text-only localization (1 string + 1 attribute). DOM shape unchanged (still renders the same `<select>` with the same `<option value="all">` element). Only the user-facing text swaps between locales via the R133 auto-discovery infrastructure.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (closes the last review.html gap from R145) |
| ≤1 polish | PASS (R146 = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R146 ready to SHIP.