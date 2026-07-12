# R148 Verify — add years threshold to formatRelativeTime (close R142 retro #2 preventive)

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R148 scope files (2 src + 1 test upgrade + 1 new test + 6 round artifacts + proposals)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1098/1098 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R148 Contract Suite — 3/3 PASS

```
(pass) i18n.ts declares view.stats.locked.ago.years with en + zh-CN (en ≠ zh-CN)
(pass) app.ts formatRelativeTime uses the 31_536_000_000 (365d) threshold for the years branch
(pass) app.ts preserves the months branch for diffs in 30d-365d range
```

## R134 Test Upgrade — 6/6 PASS

The existing r134-relative-time.test.ts was upgraded from 4-threshold ladder to 5-threshold ladder:
- Old assertion: `expect(src).toMatch(/2_592_000_000/)` (4 thresholds)
- New assertion: `expect(src).toMatch(/31_536_000_000/)` (5 thresholds, R148 upgrade)
- Required keys list extended from 5 to 6 entries (added `view.stats.locked.ago.years`)

All 6 R134 tests still pass after the upgrade. The 5-threshold structure (60s / 60min / 24h / 30d / 365d) is now verified.

## Test Regex Fix — `[^{}]*` Trap

Initial R148 test #1 used regex `/"view\.stats\.locked\.ago\.years":\s*\{[^{}]*"zh-CN":\s*"[^"]*"\s*,?\s*\}/` — non-greedy match `[^{}]*` correctly excluded `{` and `}` characters in the value field. But the `{n}` template literal contains both `{` and `}` — `[^{}]*` couldn't traverse the `{n}y ago` value. Caught by R148 test 1 first run. Fixed by switching to line-anchored match:

```js
const line = src.split("\n").find((l) => l.includes('"view.stats.locked.ago.years"'));
```

Lesson: when i18n values contain `{n}` template-literal markers, avoid bracket-balanced regex; use line-anchored split instead. Same gotcha already hit by R144 (`uncommittedBadge.title = t("file.uncommitted.title")` regex).

## Regression Sweep — All Green

- R147, R146, R145, R144, R143, R142, R141, R140, R139, R138, R137, R136, R135, R134, R133, R132, R131, R130, R129, ... R57, R44 regression tests all pass.
- **R134 5-threshold upgrade**: PASS.
- **R148 3 contract tests**: PASS.
- Project suite after R148: **1098 tests pass** (was 1095 pre-R148; +3 R148 new).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-148/`)

## What changed

- `src/ui/i18n.ts:90` — added `"view.stats.locked.ago.years": { en: "{n}y ago", "zh-CN": "{n}年前" }` after the months entry.
- `src/ui/app.ts:4211-4213` — added the 365-day (`31_536_000_000` ms) threshold in `formatRelativeTime`. The function now has 6 thresholds: justNow / minutes / hours / days / months / years.
- `src/ui/r134-relative-time.test.ts:19, 67` — extended REQUIRED_KEYS from 5 to 6 entries + added 31_536_000_000 assertion to the threshold-list test.
- `src/ui/r148-years-threshold.test.ts` — 3 contract tests covering key wiring, threshold constant, and month/years branch preservation.
- `.omo/proposals.jsonl` — appended R148 entry (per-SHIP discipline).

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R148 is text-only — `formatRelativeTime` output changes from "13mo ago" to "1y ago" for ≥ 365-day timestamps. No new visual surface.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (closes R142 retro #2 preventive, 5 rounds shelved) |
| ≤1 polish | PASS (R148 = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R148 ready to SHIP.