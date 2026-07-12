# R149 Verify — delete 16 orphan i18n keys + add orphan-detection regression test

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R149 scope files (1 i18n.ts + 1 test update + 1 new test + 6 round artifacts + proposals)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1097/1097 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R149 Contract Suite — 2/2 PASS

```
(pass) every i18n.ts key is referenced from production OR tests (with whitelist for test-only guards)
(pass) i18n.ts key count is consistent (R149 deleted 16, sidebar.allFiles kept as guarded)
```

## What R149 Closed

Audit found **17 true orphan keys** (declared in i18n.ts but never called from production source). R149 deletes 16 of them. The 17th (`sidebar.allFiles`) is intentionally kept because the r112 test guards it as documentation of a planned-but-unshipped feature (out of R149 scope).

The R149 audit pattern uses 4 reference patterns (more comprehensive than R103's single-pattern scan):
1. `t("...")` direct lookup (R103's pattern)
2. `data-i18n="..."` / `data-i18n-title="..."` / `data-i18n-placeholder="..."` / `data-i18n-aria-label="..."` HTML attribute
3. `i18nKey: "..."` property assignment (e.g., `view.stats.firstPass.bucket.*` at app.ts:3752-3755)
4. `return { ok: false, error: "..." }` raw string return (e.g., `savedReplies.error.*` at app.ts:293-301)

Without pattern 4, the orphan audit would false-positive on `savedReplies.error.*` keys. Without pattern 2, it would false-positive on `toolbar.copyBranch.title` / `saveIndicator.title` / etc. Without pattern 3, it would false-positive on `view.stats.firstPass.bucket.*` keys.

## Cross-Round Repair Notes

R149's first implementation removed a larger block (the entire `submit.footprint.*` namespace) which inadvertently deleted `submit.footprint.files` and `submit.footprint.categories` — both have production callers at app.ts:6727/6729/6802/6804. Caught by R103 coverage gate. Fixed by restoring the 2 keys.

Lesson: block-level deletions in i18n.ts can hide individual-key callers. Always run the full pre-commit + R103 + R149 audit before staging.

## Regression Sweep — All Green

- R148, R147, R146, R145, R144, R143, R142, R141, R140, R139, R138, R137, R136, R135, R134, R133, R132, R131, R130, R129, ... R57, R44 regression tests all pass.
- **R103 i18n coverage gate**: PASS (every `t("X.Y")` call has a matching key).
- **R149 orphan audit (new regression net)**: PASS.
- **R112 test still passes** (sidebar.allFiles test guard unchanged).
- **i18n.test.ts test 91-95** updated from `status.copiedPermalink` (deleted) to `view.stats.locked.ago.minutes` (existing key with `{n}` placeholder).
- Project suite after R149: **1097 tests pass** (was 1095 pre-R149; +2 R149 new - some R148 net tests adjusted due to deletions).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-149/`)

## What changed

- `src/ui/i18n.ts` — deleted 16 orphan keys + restored 2 inadvertently-deleted keys (`submit.footprint.files`, `submit.footprint.categories`). Net change: ~30 LOC removal.
- `src/ui/i18n.test.ts:L91-95` — `{token} placeholder` test updated from `status.copiedPermalink` (deleted) to `view.stats.locked.ago.minutes` (existing key with `{n}` placeholder).
- `src/ui/r149-i18n-orphan-audit.test.ts` — 2 contract tests covering orphan detection (production OR tests) + key count consistency.
- `.omo/proposals.jsonl` — appended R149 entry (per-SHIP discipline).

## Visual QA Evidence

Not applicable. R149 ships zero UI changes (only i18n.ts deletions + test additions).

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (R149 closes implicit i18n.ts hygiene flag) |
| ≤1 polish / ≤3 feature / ≤5 bugfix | PASS (R149 = 1 housekeeping, no polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R149 ready to SHIP.