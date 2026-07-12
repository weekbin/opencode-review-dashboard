# R150 Verify — localize 2 hardcoded English strings in app.ts (closes R146 audit gap)

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R150 scope files (3 src + 2 test upgrades + 1 new test + 6 round artifacts + proposals)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1101/1101 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R150 Contract Suite — 4/4 PASS

```
(pass) i18n.ts declares navHint.navigate with en + zh-CN (en ≠ zh-CN)
(pass) i18n.ts declares previously.panelHint with en + zh-CN + {prevRound} placeholder
(pass) app.ts renders the nav hint via t('navHint.navigate') instead of hardcoded English
(pass) app.ts renders the prior rounds hint via t('previously.panelHint', { prevRound })
```

## Side Fixes — R137→R142 SOP byte-equivalence → behavior-contract upgrades

R150's i18n changes broke 3 byte-equivalence tests that asserted hardcoded English strings:

| Test | File | Old assertion | New assertion (behavior-contract) |
|---|---|---|---|
| T12.K3b | `src/keyboard-nav.test.ts:118` | `/Press\s*<kbd>n<\/kbd>\s*\/\s*<kbd>p<\/kbd>\s*to navigate findings/` | `expect(src).toContain('el.innerHTML = t("navHint.navigate")')` + negative assertion |
| T7.4b | `src/previously-hint.test.ts:53` | `/hint\.textContent\s*=\s*\`Showing prior rounds only/` | `/hint\.textContent\s*=\s*t\("previously\.panelHint"/` + `prevRound:` |
| T7.4g | `src/previously-hint.test.ts:113` | `/hint\.textContent\s*=\s*`([^`]+)`/` (extracts English template literal) | Multi-line: source via t() + i18n.ts ≤200 char assert on the English line |

Same SOP as R137→R142: when i18n refactor swaps hardcoded English for translation keys, byte-equivalence tests that hardcode the English get upgraded to behavior-contract in the same commit.

## Cross-Round Repair Notes

R150's first implementation left 3 duplicate `navHint.navigate` entries and 3 duplicate `previously.panelHint` entries in `src/ui/i18n.ts` — leftovers from the interrupted edit batches. Caught by running `grep -nE 'navHint\.navigate|previously\.panelHint' src/ui/i18n.ts` (5 occurrences total before cleanup). Cleaned via a Python script that removed duplicate blocks while preserving the first occurrence + the closing brace + trailing comma. Now exactly 1 of each key.

R150's first test file used `[^}]*` regex that doesn't span newlines. The multi-line i18n.ts entry (en on one line, zh-CN on the next) made the regex fail. Fixed by switching to line-anchored split (`src.split("\n").find(...)`).

## Regression Sweep — All Green

- R149, R148, R147, R146, R145, R144, R143, R142, R141, R140, R139, R138, R137, R136, R135, R134, R133, R132, R131, R130, R129, ... R57, R44 regression tests all pass.
- **T12.K3b behavior-contract upgrade**: PASS.
- **T7.4b behavior-contract upgrade**: PASS.
- **T7.4g behavior-contract upgrade**: PASS.
- **R150 4 contract tests**: PASS.
- Project suite after R150: **1101 tests pass** (was 1097 pre-R150; +4 R150 new).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-150/`)
- R103 i18n coverage gate: PASS (every `t("X.Y")` call has a matching key)

## What changed

- `src/ui/i18n.ts` — added 2 new keys × 2 locales = 4 strings:
  - `navHint.navigate`: en="Press <kbd>n</kbd> / <kbd>p</kbd> to navigate findings" / zh-CN="按 <kbd>n</kbd> / <kbd>p</kbd> 在审查项间导航"
  - `previously.panelHint`: en="Showing prior rounds only (round {prevRound} and earlier). The current round's findings are in the Conversation tab." / zh-CN="仅显示历史轮次（第 {prevRound} 轮及更早）。当前轮的审查项在「会话」面板中。"
- `src/ui/app.ts:619` — wrapped nav hint with `t("navHint.navigate")`
- `src/ui/app.ts:5358` — wrapped prior rounds hint with `t("previously.panelHint", { prevRound: String(currentRound - 1) })`
- `src/keyboard-nav.test.ts:T12.K3b` — upgraded byte-equivalence to behavior-contract
- `src/previously-hint.test.ts:T7.4b + T7.4g` — upgraded byte-equivalence to behavior-contract
- `src/ui/r150-nav-hint-i18n.test.ts` — 4 new contract tests covering i18n key wiring + app.ts call-site swaps
- `.omo/proposals.jsonl` — appended R150 entry (per-SHIP discipline) + retroactively appended R149 entry

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R150 is text-only localization. The nav hint and prior rounds hint render identically in shape; only the user-facing text swaps between locales.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (closes R146 audit gap: 2 app.ts strings missed by R140-R146 sweep) |
| ≤1 polish | PASS (R150 = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R150 ready to SHIP.