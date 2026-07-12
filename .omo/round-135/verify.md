# R135 Verify — localize hardcoded English labels in conversation panel

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R135 scope files (4 modified + 1 new test + 2 housekeeping)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1061/1061 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R135 Contract Suite — 6/6 PASS

```
(pass) i18n.ts declares all 4 new keys with en + zh-CN
(pass) finding.pinned.tooltip uses {ago} placeholder for relative time
(pass) comment.author.user zh-CN value is 🧑 你 (not 🧑 You)
(pass) app.ts renders the pinned-badge tooltip via t('finding.pinned.tooltip')
(pass) app.ts uses t('comment.author.agent') and t('comment.author.user') in both panels
(pass) app.ts renders the empty-notes placeholder via t('previously.notes.empty')
```

## Regression Sweep — All Green

- R134 round-test suite carries forward unchanged (1055 baseline).
- R133, R132, R131, R130, R129, R128, R127, R126, R125, R124, R123, R122, R121, R120, R119, R118, ... R57, R44 regression tests all pass.
- R103 i18n coverage: **PASS** (including translation completeness — `comment.author.agent` uses `en="🤖 Agent"` + `zh-CN="🤖 助手"` to satisfy the `en !== zh-CN` invariant while keeping the emoji universal).
- Project suite after R135: **1061 tests pass** (was 1055 pre-R135; +6 R135 new).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-135/`)

## What changed

- `src/ui/i18n.ts` — 4 new keys × 2 locales = 8 new strings:
  - `finding.pinned.tooltip` (with `{ago}` placeholder for the R134 relative-time format)
  - `comment.author.agent` (en="🤖 Agent" / zh-CN="🤖 助手")
  - `comment.author.user` (en="🧑 You" / zh-CN="🧑 你")
  - `previously.notes.empty` (en="(no notes sent this round)" / zh-CN="（本轮未发送笔记）")
- `src/ui/app.ts` — 4 call sites updated to use `t()`:
  - L4804: pinned-badge tooltip now uses `t("finding.pinned.tooltip", { ago: formatRelativeTime(...) })`
  - L4943: conversation panel comment author (agent/user)
  - L5396: previously-discussed panel empty notes placeholder
  - L5448: previously-discussed panel comment author (agent/user)
- `src/ui/r135-conversation-labels.test.ts` — 6 contract tests covering i18n key wiring, `{ago}` placeholder, zh-CN="🧑 你" (not "🧑 You"), call-site wiring in both panels (with ≥2 occurrences each), and no remaining hardcoded English literals.
- `.omo/proposals.jsonl` — appended the missing R134 entry (closes the per-SHIP append discipline per R134 retro lesson).
- `.omo/round-133/retro.md` — included the uncommitted rewrite (better retro writeup that has been sitting in working tree since R133).

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R135 is text-only localization — DOM shape is unchanged at all 4 call sites, only text content swaps between locales. The text changes are bounded by the existing CSS widths set by R132/R130 polish work, so no new visual surface to capture.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (R134 surfaced risks closed; proposals.jsonl append discipline restored) |
| ≤1 polish | PASS (R135 = 1 polish + housekeeping) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R135 ready to SHIP.