# R140 Verify — tighten i18n fallbacks + adopt `data-i18n-title` for copyNotesBtn

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R140 scope files (2 modified src + 1 new test + 6 round artifacts + proposals)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1075/1075 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R140 Contract Suite — 4/4 PASS

```
(pass) i18n.ts declares all 4 new keys with en + zh-CN
(pass) app.ts wraps (no reason provided) with t('resolve.reason.empty')
(pass) app.ts uses t('status.pinFailed') / unpinFailed / reactionFailed for fallbacks
(pass) copyNotesBtn uses data-i18n-title attribute (not direct title= assignment)
```

## Regression Sweep — All Green

- R139, R138, R137, R136, R135, R134, R133, R132, R131, R130, R129, R128, R127, R126, R125, R124, R123, R122, R121, R120, R119, R118, ... R57, R44 regression tests all pass.
- **R103 i18n coverage**: PASS — `en !== zh-CN` invariant holds for all 4 new keys (no emoji-only role labels that would risk identical en/zh-CN, per R135 retro #1 lesson).
- Project suite after R140: **1075 tests pass** (was 1069 pre-R140; +4 R140 new + 2 R139 contract tests in earlier batch).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-140/`)

## What changed

- `src/ui/i18n.ts` — 4 new keys × 2 locales = 8 strings:
  - `resolve.reason.empty`: en="(no reason provided)" / zh-CN="（未提供原因）"
  - `status.pinFailed`: en="Failed to pin finding" / zh-CN="置顶审查项失败"
  - `status.unpinFailed`: en="Failed to unpin finding" / zh-CN="取消置顶审查项失败"
  - `status.reactionFailed`: en="Failed to toggle reaction" / zh-CN="切换表情反应失败"
- `src/ui/app.ts:5396` — `copyNotesBtn.title = t("previously.notes.copyButton")` → `copyNotesBtn.setAttribute("data-i18n-title", "previously.notes.copyButton")`. The MutationObserver from R133's `initUIDataI18nAttributes()` already translates this attribute on every language switch.
- `src/ui/app.ts:2448` — `closeWith(trimmed || "(no reason provided)")` → `closeWith(trimmed || t("resolve.reason.empty"))`.
- `src/ui/app.ts:6050` — fallback string `"Failed to pin finding"` → `t("status.pinFailed")`.
- `src/ui/app.ts:6081` — fallback string `"Failed to unpin finding"` → `t("status.unpinFailed")`.
- `src/ui/app.ts:6108` — fallback string `"Failed to toggle reaction"` → `t("status.reactionFailed")`.
- `src/ui/r140-english-fallbacks.test.ts` — 4 contract tests covering key wiring, fallback usage, attribute swap, and zero remaining hardcoded English strings.
- `.omo/proposals.jsonl` — appended the missing R139 entry.

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R140 is text-only localization + an attribute swap inside an existing button. The button label, button title, resolve reason fallback, and 3 error fallback messages all swap between locales but the DOM shape is unchanged. No new visual surface to capture.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (R137 retro stale flag #4 closed; 4 fallback strings now localized) |
| ≤1 polish | PASS (R140 = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R140 ready to SHIP.