# R150 Brief — localize 2 hardcoded English strings in app.ts (closes R146 audit gap)

## Scope

1. **`src/ui/i18n.ts`** — add 2 new keys × 2 locales = 4 strings:
   - `navHint.navigate`: en="Press <kbd>n</kbd> / <kbd>p</kbd> to navigate findings" / zh-CN="按 <kbd>n</kbd> / <kbd>p</kbd> 在审查项间导航"
   - `previously.panelHint`: en="Showing prior rounds only (round {prevRound} and earlier). The current round's findings are in the Conversation tab." / zh-CN="仅显示历史轮次（第 {prevRound} 轮及更早）。当前轮的审查项在「会话」面板中。"

2. **`src/ui/app.ts:619`** — wrap nav hint with `t("navHint.navigate")` instead of hardcoded English.

3. **`src/ui/app.ts:5358`** — wrap prior rounds hint with `t("previously.panelHint", { prevRound: String(currentRound - 1) })` instead of hardcoded template literal.

4. **`src/keyboard-nav.test.ts:T12.K3b`** — upgrade byte-equivalence to behavior-contract per R137→R142 SOP.

5. **`src/previously-hint.test.ts:T7.4b + T7.4g`** — upgrade byte-equivalence to behavior-contract per R137→R142 SOP.

6. **`src/ui/r150-nav-hint-i18n.test.ts`** — 4 new contract tests.

7. Append R149 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/ui/i18n.ts` — 2 new keys
- `src/ui/app.ts` — 2 `t()` wraps
- `src/keyboard-nav.test.ts` — 1 test upgrade
- `src/previously-hint.test.ts` — 2 test upgrades
- `src/ui/r150-nav-hint-i18n.test.ts` — new test file
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- R137→R142 byte-equivalence → behavior-contract SOP applies to 3 tests.
- `t()` direct lookup is the canonical pattern (R140-R149).
- New `navHint.*` namespace; `previously.*` namespace already exists.

## Simplest change

Per call-site list. ~10 LOC net (4 strings + 2 wraps + 3 test upgrades + 1 new test file + 1 housekeeping append).

## Risk

- **No behavior change** for the common case.
- **No brittle-test upgrade beyond the 3 tests** that explicitly asserted hardcoded English.
- **R103 invariant preserved**: `en ≠ zh-CN` for both new keys.

## Acceptance

- `bun test src/ui/r150-nav-hint-i18n.test.ts` passes (4 tests)
- Full project suite stays green (was 1097, expect ~1101)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS

## Profile

Polish. ≤3 src files modified + 2 test upgrades + 1 new test + 1 housekeeping append. UI text improvement, no behavior change.