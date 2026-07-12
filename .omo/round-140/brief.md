# R140 Brief — tighten i18n fallbacks + adopt `data-i18n-title` for copyNotesBtn

## Scope

1. **`src/ui/i18n.ts`** — add 4 new keys × 2 locales = 8 strings:
   - `resolve.reason.empty`: "(no reason provided)" / "（未提供原因）"
   - `status.pinFailed`: "Failed to pin finding" / "置顶审查项失败"
   - `status.unpinFailed`: "Failed to unpin finding" / "取消置顶审查项失败"
   - `status.reactionFailed`: "Failed to toggle reaction" / "切换表情反应失败"

2. **`src/ui/app.ts:5396`** — switch `copyNotesBtn.title = t(...)` to `copyNotesBtn.setAttribute("data-i18n-title", "previously.notes.copyButton")`. R133's `initUIDataI18nAttributes()` MutationObserver handles the live translation.

3. **`src/ui/app.ts:2448, 6050, 6081, 6108`** — wrap the 4 hardcoded English fallback strings with `t(...)`.

4. New test `src/ui/r140-english-fallbacks.test.ts` — 4 contract tests covering the new i18n keys + copyNotesBtn attribute wiring + a guard that none of the original English strings remain in source.

5. Append R139 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/ui/i18n.ts` — 4 new keys (8 strings)
- `src/ui/app.ts` — 5 small updates (1 attribute swap + 4 fallback wraps)
- `src/ui/r140-english-fallbacks.test.ts` — new test file (4–5 tests)
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- `t()` direct lookup is the canonical resolve path; `data-i18n-*` attribute auto-discovery is the canonical mutate-and-translate path. R133 retro documented both. The 5 call sites split cleanly: 4 use direct (one-shot fallbacks in error paths), 1 uses attribute (live-translating button title that needs MutationObserver for re-renders).
- All 4 fallback messages are stored via `setStatus(data?.error ?? <message>)` — same call shape R136 audited for date localization.

## Simplest change

Per the call-site list above. ~12 LOC net (8 string additions + 5 wrapping changes − 1 attribute swap).

## Risk

- **No server changes**. All 4 fallback strings are fallbacks for when the server returns a non-200 with no JSON body (`.catch(() => undefined)`). Real server errors still propagate via `data.error`.
- The `data-i18n-title` swap depends on `initUIDataI18nAttributes()` being called at boot. Verified at `src/ui/app.ts:14` import + the R133 boot hook. No regression risk.
- R103 translation-completeness invariant (`en !== zh-CN`) must hold for all 4 new keys. Verified by inspection: none are pure emoji (per R135 retro lesson — `🤖 Agent`/`🤖 助手` was the right shape; identical en/zh would fail the test).

## Acceptance

- `bun test src/ui/r140-english-fallbacks.test.ts` passes (4–5 tests)
- Full suite stays green (was 1069, expect 1074 with new tests)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep '"Failed to \|"(no reason provided)"' src/ui/app.ts` returns 0 matches
- `grep 'copyNotesBtn\.title\s*=' src/ui/app.ts` returns 0 matches (replaced by setAttribute)

## Profile

Polish. ≤3 files modified + 1 new test + 1 housekeeping append. UI text improvement + consistency upgrade. ~12 LOC net.