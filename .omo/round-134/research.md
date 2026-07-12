# R134 Research — relative timestamp on persistent lock banner

## Files involved

- `src/ui/app.ts:3596-3625` — `renderStatsPane()` builds the persistent lock banner. Currently reads `state.locked.round` only.
- `src/ui/i18n.ts:74-81` — existing 2 keys: `view.stats.locked.heading`, `view.stats.locked.detail`. Adding 6 new keys in the same neighborhood.
- New file: `src/ui/relative-time.ts` — single exported function `formatRelativeTime(at: number, now?: number): string`.
- New test: `src/ui/r134-relative-time.test.ts` (matches the rNN-*.test.ts convention used since R57).

## Existing patterns to reuse

- `t(key, params)` already supports `{token}` interpolation (`src/ui/i18n.ts:fillTemplate` line ~858). Each new relative-time key gets a `{n}` placeholder for the number.
- The persistent banner code shape is already established (R132). The new field is appended to `lockCopy` after `lockDetail` — same container, same DOM API.
- Relative-time threshold ladder:
  - < 60s → "just now" / "刚刚" (special, no number)
  - 1-59min → "{n}m ago" / "{n}分钟前"
  - 1-23h → "{n}h ago" / "{n}小时前"
  - 1-29d → "{n}d ago" / "{n}天前"
  - 30+d → "{n}mo ago" / "{n}个月前"

## Simplest change

1. Create `src/ui/relative-time.ts` exporting `formatRelativeTime(at, now = Date.now())`:
   - Computes diff in ms, picks the right i18n key based on threshold
   - Returns the resolved string via `t(key, { n })` — `just now` has no placeholder
2. Add 6 new keys to `STRINGS` in `src/ui/i18n.ts`:
   - `view.stats.locked.ago.justNow`: en="just now", zh-CN="刚刚"
   - `view.stats.locked.ago.minutes`: en="{n}m ago", zh-CN="{n}分钟前"
   - `view.stats.locked.ago.hours`: en="{n}h ago", zh-CN="{n}小时前"
   - `view.stats.locked.ago.days`: en="{n}d ago", zh-CN="{n}天前"
   - `view.stats.locked.ago.months`: en="{n}mo ago", zh-CN="{n}个月前"
3. Modify `src/ui/app.ts:3620-3622` to append a `<span>` with `formatRelativeTime(locked.at)`.
4. Test: 6 unit tests on the function (boundary cases + key wiring) + 1 verification that the i18n keys exist in both locales + 1 verification that app.ts imports and calls the function.

## Risk

- Banner copy gets a small visible update; nothing else changes. Backwards compatible — old state.json files without `locked.at` would already not show the banner.
- The `month` boundary is approximate (30 days). Acceptable for "Xmo ago" since users don't need calendar precision at a glance.
- `< 0` future timestamps: clamp to "just now" so a clock-skewed lock time doesn't produce nonsense like "-3h ago".

## Out of scope

- Adding date format for > 1 year (very rare for an active review). Falls into "months" bucket with the 30-day approximation.
- Clicking the timestamp to copy or jump somewhere.
- Localizing abbreviations (`m`, `h`, `d`, `mo`) further (e.g., 12-hour vs 24-hour, CJK digit preferences). Out of v6 polish budget.