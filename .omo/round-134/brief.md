# R134 Brief — relative timestamp on persistent lock banner

## Scope

1. New file `src/ui/relative-time.ts` exporting `formatRelativeTime(at: number, now?: number): string`.
2. Six new i18n keys in `src/ui/i18n.ts` covering 5 thresholds + "just now" sentinel, both en and zh-CN locales.
3. `src/ui/app.ts:3622` appends a `<span class="stats-lock-status-ago">` to the persistent lock banner containing `formatRelativeTime(locked.at)`.
4. New test file `src/ui/r134-relative-time.test.ts` covering boundary cases + i18n key wiring + app.ts call site.
5. Append the missing `proposals.jsonl` R132 and R133 entries (v6 procedure gap surfaced during discovery).

## Why

Closes the explicit R132 retro risk-surface ("state.locked.at is currently only used for explanatory text-free routing; a future round could add a relative timestamp ('locked 3h ago')"). The `at` field has been in the state schema since R131 (src/index.ts:196) but never rendered. Polish-grade UX improvement with zero schema change.

## Risk

- Banner copy gets one extra span appended. Visually still inside the existing `stats-lock-status` container. ≤5% layout impact (already verified by similar R130 dark-mode polish work).
- New i18n keys must exist in both locales — covered by a dedicated test that asserts every new key has en + zh-CN.
- 30-day month boundary is approximate. Acceptable per R134 scope (no calendar-precision requirement).

## Acceptance

- `bun test src/ui/r134-relative-time.test.ts` passes (8+ assertions).
- `bun run check` (format + lint + typecheck) PASS.
- Full project test suite stays green (was 1049 in R133, +new file → 1049+10 = 1059 expected).
- Pre-commit 8/8 PASS.
- One Playwright DOM measurement (375 / 768 / 1280) shows the banner copy still inside the viewport with the new ago span appended inline.

## Pattern re-use

- `t(key, params)` interpolation (existing fillTemplate mechanism in i18n.ts:858)
- `data-i18n-title` auto-discovery pattern from R133 (no per-key wiring needed for the runtime translate, though we still register the keys explicitly here since they're consumed in app.ts directly via `t()`)
- R132 banner DOM construction pattern (`lockCopy.append(lockHeading, lockDetail)` → extend with `lockAgo`)

## Profile

Polish. UI text improvement, no new behavior, no schema change, ≤3 src files modified + 1 new utility + 1 new test.