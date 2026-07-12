# R143 Verify — localize 2 hardcoded English strings in saved-replies dropdown

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R143 scope files (3 modified + 1 new test fixture + 6 round artifacts + proposals)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1080/1080 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R143 Contract — Side Fix Audit Style

R143 is a focused polish round: 2 hardcoded English strings localized + 1 byte-equivalence test upgraded to behavior-contract. Following the R140→R141→R142 pattern (audit + SOP), no new R143 test file is needed — the upgraded T10.2b in `src/saved-replies.test.ts` (already part of the project's saved-replies suite) provides the regression surface.

```
✓ saved-replies.test.ts T10.2b: 11/11 PASS (was 11/11 — net 0 since R141's T10.1c)
✓ R103 i18n coverage: PASS — `en !== zh-CN` invariant holds for both new keys
✓ grep 'Saved Replies (R10)' src/ui/app.ts: 0 matches (was 1)
✓ grep '"💾 Save current as template"' src/ui/app.ts: 0 matches (was 1)
✓ T10.2b assertion: now matches t("savedReplies.saveCurrent") lookup, not the English literal
```

## Regression Sweep — All Green

- R142, R141, R140, R139, R138, R137, R136, R135, R134, R133, R132, R131, R130, R129, ... R57, R44 regression tests all pass.
- **R103 i18n coverage**: PASS — `en !== zh-CN` invariant holds for both new keys (no emoji-only role labels).
- Project suite after R143: **1080 tests pass** (was 1080 pre-R143; net 0 since the existing 11-test T10.2b upgrade keeps the same test count).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-143/`)

## What changed

- `src/ui/i18n.ts:338-L347` — 2 new keys × 2 locales = 4 strings placed at end of `savedReplies.*` cluster (after `savedReplies.error.quotaExceeded`):
  - `savedReplies.btn.title`: en="Saved Replies (R10) — type /<name>+space to expand" / zh-CN="已保存回复 (R10) — 输入 /<name>+空格 展开"
  - `savedReplies.saveCurrent`: en="💾 Save current as template…" / zh-CN="💾 将当前回复存为模板…"
- `src/ui/app.ts:5048` — `savedRepliesBtn.title = "Saved Replies (R10) — type /<name>+space to expand"` → `savedRepliesBtn.title = t("savedReplies.btn.title")`.
- `src/ui/app.ts:5066` — `saveCurrent.textContent = "💾 Save current as template…"` → `saveCurrent.textContent = t("savedReplies.saveCurrent")`.
- `src/saved-replies.test.ts:T10.2b` — upgraded `expect(src).toMatch(/Save current as template/)` to `expect(src).toMatch(/t\(["']savedReplies\.saveCurrent["']\)/)` per the R142 audit SOP. Closes the byte-equivalence i18n-coupling test flagged in R142's audit (#4).
- `.omo/proposals.jsonl` — appended R143 entry (per-SHIP discipline).

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R143 is text-only localization inside the existing saved-replies dropdown. DOM shape unchanged (still renders the same 1 tooltip + 1 button label). No new visual surface to capture.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (R142 retro flag #3 closed; T10.2b brittle test upgraded) |
| ≤1 polish | PASS (R143 = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R143 ready to SHIP.