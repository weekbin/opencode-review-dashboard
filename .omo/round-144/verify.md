# R144 Verify — close R143 retro #3 (source-side audit + localize uncommittedBadge.title)

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R144 scope files (1 src + 1 i18n + 1 new test + 6 round artifacts + proposals)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1082/1082 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R144 Contract Suite — 3/3 PASS

```
(pass) i18n.ts declares file.uncommitted.title with en + zh-CN (en ≠ zh-CN)
(pass) app.ts renders uncommittedBadge.title via t('file.uncommitted.title') instead of hardcoded English
(pass) the hardcoded English string is no longer present anywhere in src/ui/app.ts
```

## Source-Side Audit (R143 retro signal #3 closure)

Per the R143 retro "Risks Surfaced" suggestion:

```bash
grep -nE '\.textContent\s*=\s*"[A-Z]|\.title\s*=\s*"[A-Z]|\.placeholder\s*=\s*"[A-Z]|aria-label\s*=\s*"[A-Z]|ariaLabel\s*=\s*"[A-Z]' src/ui/*.ts
```

Returns exactly **1 real hardcoded English user-facing string** in src/ui/app.ts source code:

- **L5696**: `uncommittedBadge.title = "Working-tree only (not in diff base)";`

The other matches in the audit grep were:

- **Test files** (`r87/r88/r90/r91/r101/r57/r63/r64/r67/r70/r71/r95-*-i18n.test.ts`): these are *declarative replacement records* documenting already-localized strings (e.g., `{ old: 'removeBtn.textContent = "Remove";', key: "action.remove" }`). The actual source already uses `t()` lookups; the test file just records the migration.
- **innerHTML template literals**: All 7 occurrences already use `escapeHtml(t(...))` or `data-i18n="..."` attributes. Already localized.
- **`uncommittedBadge.textContent = "uncommitted"`** (L5695): 1-word status word, language-neutral (git terminology stays English across locales). Per the R17/R25 badge convention, not localized.

R143 retro signal #3 closed: the audit ran, found 1 real source-side hardcoded string, R144 ships the localization.

## Regression Sweep — All Green

- R143, R142, R141, R140, R139, R138, R137, R136, R135, R134, R133, R132, R131, R130, R129, R128, R127, R126, R125, R124, R123, R122, R121, R120, R119, R118, ... R57, R44 regression tests all pass.
- **R103 i18n coverage**: PASS — `en ≠ zh-CN` invariant holds.
- **T10.2b behavior-contract** (R143 SHIPped): PASS.
- Project suite after R144: **1082 tests pass** (was 1080 pre-R144; +2 net new R144 contract tests).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-144/`)

## What changed

- `src/ui/i18n.ts` — 1 new key × 2 locales = 2 strings, placed after `diff.hunk.expand`:
  - `file.uncommitted.title`: en="Working-tree only (not in diff base)" / zh-CN="仅在工作区中（不在 diff 基线中）"
- `src/ui/app.ts:5696` — `uncommittedBadge.title = "Working-tree only (not in diff base)";` → `uncommittedBadge.title = t("file.uncommitted.title");`
- `src/ui/r144-uncommitted-badge-title.test.ts` — 3 contract tests covering key wiring, call-site swap, and zero remaining hardcoded English.
- `.omo/proposals.jsonl` — appended R144 entry (per-SHIP discipline).

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R144 is text-only localization (tooltip swap). The badge renders identically; only the hover-tooltip text changes between locales. No new visual surface to capture.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (closes R143 retro "Risks Surfaced" #3) |
| ≤1 polish | PASS (R144 = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R144 ready to SHIP.