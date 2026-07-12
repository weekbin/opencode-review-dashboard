# R141 Verify — localize `addSavedReply()` validation errors

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R141 scope files (2 src + 1 new test + 1 brittle-test fix + 6 round artifacts + proposals)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1080/1080 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R141 Contract Suite — 4/4 PASS

```
(pass) i18n.ts declares all 4 new savedReplies.error keys with en + zh-CN
(pass) savedReplies.error.softCap uses {n} placeholder for the cap number
(pass) addSavedReply returns translation keys (not hardcoded English) for all 4 errors
(pass) caller wraps result.error with t() before setStatus
```

## Side Fix — T10.1c upgraded from byte-equivalence to behavior-contract

The R140 polish round localized the parallel `data?.error ?? t(status.X)` fetch-error pattern. R141 closes the same shape's twin — the `result.error ?? t("status.templateSaveFailed")` validation-error pattern in `addSavedReply()`.

R141's swap from hardcoded English ("name is required", "body is required", "localStorage quota exceeded", "soft cap reached (...)") to translation-key strings ("savedReplies.error.*") **also broke `T10.1c` in `src/saved-replies.test.ts`** — that test asserted `expect(block![0]).toMatch(/localStorage quota exceeded/)` as a byte-equivalence check on the `addSavedReply` function body.

Applied the same marker-anchored, behavior-contract upgrade pattern R139 used for T11.2d / T16.8d / T16.10a:

```js
// before (byte-equivalence)
expect(block![0]).toMatch(/localStorage quota exceeded/);

// after (behavior-contract)
expect(block![0]).toMatch(/error: "savedReplies\.error\.nameRequired"/);
expect(block![0]).toMatch(/error: "savedReplies\.error\.bodyRequired"/);
expect(block![0]).toMatch(/error: "savedReplies\.error\.softCap"/);
expect(block![0]).toMatch(/error: "savedReplies\.error\.quotaExceeded"/);
expect(block![0]).not.toMatch(/name is required/);
expect(block![0]).not.toMatch(/body is required/);
expect(block![0]).not.toMatch(/localStorage quota exceeded/);
expect(block![0]).not.toMatch(/soft cap reached \(/);
```

The test now asserts the **contract** (function returns translation keys, not English), not the **byte composition** (string X exists inside the function block). Survives future refactors that move the validation logic.

All 15 saved-replies tests pass after the upgrade.

## Regression Sweep — All Green

- R140, R139, R138, R137, R136, R135, R134, R133, R132, R131, R130, R129, R128, R127, R126, R125, R124, R123, R122, R121, R120, R119, R118, ... R57, R44 regression tests all pass.
- **R103 i18n coverage**: PASS — `en !== zh-CN` invariant holds for all 4 new keys.
- **T10.1c behavior-contract upgrade**: PASS.
- Project suite after R141: **1080 tests pass** (was 1075 pre-R141; +4 R141 new + 1 net T10.1c consolidation).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-141/`)

## What changed

- `src/ui/i18n.ts` — 4 new keys × 2 locales = 8 strings placed next to the existing `savedReplies.empty` (L318):
  - `savedReplies.error.nameRequired`: en="Template name is required" / zh-CN="模板名称不能为空"
  - `savedReplies.error.bodyRequired`: en="Template body is required" / zh-CN="模板内容不能为空"
  - `savedReplies.error.softCap`: en="Too many templates ({n}). Delete some first." / zh-CN="模板过多（{n} 个）。请先删除一些。"
  - `savedReplies.error.quotaExceeded`: en="Browser storage quota exceeded" / zh-CN="浏览器存储空间已满"
- `src/ui/app.ts:291-L307` — `addSavedReply()` body updated to return translation-key strings instead of hardcoded English copy. Caller at L5084 wraps with `t()` to resolve per locale.
- `src/ui/r141-saved-replies-validation.test.ts` — 4 contract tests covering key wiring, `{n}` placeholder, function returning key strings, caller `t()` wrap.
- `src/saved-replies.test.ts` — T10.1c upgraded from byte-equivalence to behavior-contract (asserts the function returns 4 translation keys, not the old English strings).
- `.omo/proposals.jsonl` — appended R141 entry (per-SHIP discipline).

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R141 is text-only localization inside the existing Saved Replies dropdown — DOM shape unchanged, only English → bilingual swap on the 4 error messages.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (closes R140's adjacent validation-error polish) |
| ≤1 polish | PASS (R141 = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R141 ready to SHIP.