# R148 Brief — add `years` threshold to `formatRelativeTime` (close R142 retro #2 preventive)

## Scope

1. **`src/ui/i18n.ts`** — add 1 new key × 2 locales = 2 strings:
   - `view.stats.locked.ago.years`: en="{n}y ago" / zh-CN="{n}年前"

2. **`src/ui/app.ts:4202-4214`** — update `formatRelativeTime()` to add a 365-day (1-year) threshold:
   - Old: 4 thresholds (60s/60min/24h/30d) → fall through to "n months ago" indefinitely
   - New: 5 thresholds (60s/60min/24h/30d/365d) → fall through to "n years ago"

3. **`src/ui/r148-years-threshold.test.ts`** — new test file with 3 contract tests:
   - i18n key declared (en + zh-CN)
   - `formatRelativeTime` contains the new 31_536_000_000 (365 × 86_400_000 ms) threshold constant
   - `formatRelativeTime` calls `t("view.stats.locked.ago.years", { n: ... })`

4. **`src/ui/r134-relative-time.test.ts`** — upgrade the existing 4-threshold ladder test to 5-thresholds, including 31_536_000_000.

5. Append R147 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/ui/i18n.ts` — 1 new key (placed after `view.stats.locked.ago.months` at L89)
- `src/ui/app.ts` — 1 function body change (~5 lines added)
- `src/ui/r148-years-threshold.test.ts` — new test file (~30 LOC)
- `src/ui/r134-relative-time.test.ts` — 1 test upgrade (add 5th threshold)
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The 5-key ladder (justNow / minutes / hours / days / months) was established by R134 with consistent `{n}` placeholder.
- `formatRelativeTime` is called from 7 sites (L3636, L4816, L4849, L4858, L4955, L4973, L5470). All benefit from the new years threshold automatically.
- R134 test asserts the 5-threshold ladder structure. R148 upgrades it to 6-thresholds and asserts the new constant appears in source.
- `t()` direct lookup is the canonical pattern (R134-R146).

## Simplest change

Per call-site list. ~8 LOC net (1 i18n key + 1 ladder extension + 1 test file + 1 test upgrade).

## Risk

- **No behavior change for existing UI** — every < 365-day timestamp gets the same output as before (months branch still handles 30d-365d).
- **New behavior for ≥ 365-day timestamps** — was previously "n months ago" with n ≥ 12 (grammatically wrong, e.g. "13 months ago" for a 1-year-old entry); now "1 year ago".
- **R103 invariant preserved**: en ≠ zh-CN for the new key.
- **No brittle-test upgrade** — the existing R134 test upgrade adds the new threshold constant to the assertion list, which is consistent with the existing pattern.

## Acceptance

- `bun test src/ui/r148-years-threshold.test.ts` passes (3 tests)
- `bun test src/ui/r134-relative-time.test.ts` passes (existing tests stay green + 5-threshold test upgrade)
- Full project suite stays green (was 1095, expect ~1098)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep -nE '31_536_000_000|"view\.stats\.locked\.ago\.years"' src/ui/app.ts src/ui/i18n.ts` returns ≥2 matches

## Profile

Polish. ≤3 files modified + 1 new test + 1 test upgrade + 1 housekeeping append. UI text improvement, no behavior change for the common case.