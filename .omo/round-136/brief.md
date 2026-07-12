# R136 Brief — localize audit-trail timestamps

## Scope

1. `src/ui/app.ts:4961` — replace `const ts = new Date(row.at).toLocaleString();` with `const ts = formatRelativeTime(row.at);`. Reuses the R134 bilingual helper. `escapeHtml(ts)` in L4998 stays as-is (formatRelativeTime output contains no HTML special chars; escapeHtml is a no-op but stays future-proof).
2. New test file `src/ui/r136-audit-trail-timestamp.test.ts` covering the swap + formatRelativeTime wiring + escapeHtml invariant.
3. Append R135 entry to `.omo/proposals.jsonl` (per-SHIP append discipline).

## Files involved

- `src/ui/app.ts:4961` — `toLocaleString()` swap target
- `src/ui/app.ts:4998` — `escapeHtml(ts)` wrap stays unchanged (output safe)
- `src/ui/app.ts:4191` — `formatRelativeTime(ts)` already exists (R134)
- No new i18n keys needed

## Existing patterns

- `formatRelativeTime(ts)` is the canonical relative-time helper (R134 ships 5-threshold ladder with bilingual output)
- Used in 6+ other call sites: pinned-badge tooltip (R135), comment author meta (R135), finding creation time, etc.

## Simplest change

5 LOC net across 1 src file + 1 test file. No new keys, no schema change, no behavior change.

## Risk

- None. `formatRelativeTime` returns ASCII / CJK strings without HTML special chars; `escapeHtml` is a safe no-op.
- For audit-trail rows > 30 days old (rare): output becomes "Xmo ago" / "X个月前" instead of "7/13/2025". Acceptable per the R134 design (months bucket at 30-day approximation).

## Acceptance

- `bun test src/ui/r136-audit-trail-timestamp.test.ts` passes
- `bun test` full suite stays green (was 1061, expect 1067 with 6 R136 new)
- `bun run check` PASS
- Pre-commit 8/8 PASS

## Profile

Polish. ≤1 src file modified + 1 new test + 1 housekeeping append. UI text improvement, no behavior change.