# R136 Verify — localize audit-trail timestamps

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R136 scope files
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1064/1064 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R136 Contract Suite — 3/3 PASS

```
(pass) app.ts renders audit-trail ts via formatRelativeTime
(pass) app.ts no longer calls new Date(row.at).toLocaleString()
(pass) audit-ts span still wraps ts via escapeHtml (future-proof)
```

## Regression Sweep — All Green

- R135 round-test suite carries forward unchanged.
- R134, R133, R132, R131, R130, R129, R128, R127, R126, R125, R124, R123, R122, R121, R120, R119, R118, ... R57, R44 regression tests all pass.
- Project suite after R136: **1064 tests pass** (was 1061 pre-R136; +3 R136 new).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-136/`)
- R103 i18n coverage: PASS

## What changed

- `src/ui/app.ts:4961` — replaced `const ts = new Date(row.at).toLocaleString();` with `const ts = formatRelativeTime(row.at);`. Reuses the R134 bilingual helper.
- `src/ui/r136-audit-trail-timestamp.test.ts` — 3 contract tests covering the swap + formatRelativeTime wiring + escapeHtml invariant preservation.
- `.omo/proposals.jsonl` — appended the missing R135 entry (per-SHIP append discipline).

## Why this matters

R135 retro flagged the inconsistency: conversation panel uses `formatRelativeTime` everywhere except the audit-trail row, which used `toLocaleString()`. After R136, every timestamp in the conversation panel (comment metadata, finding creation time, pinned badge tooltip, edited badge, audit-trail row) flows through the same bilingual relative-time helper. The audit-trail rows now show "3m ago" / "3分钟前" instead of "7/13/2026, 1:23:45 AM".

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R136 is text-only localization — DOM shape unchanged, only text content swaps between locales. No new visual surface to capture.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (R135 surfaced-risk #3 closed) |
| ≤1 polish | PASS (R136 = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R136 ready to SHIP.