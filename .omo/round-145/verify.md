# R145 Verify — localize 8 hardcoded English strings in src/ui/review.html

## Pre-Commit

```
[1/8] git status --porcelain                ✓ R145 scope files (3 src + 2 test updates + 1 new test + 6 round artifacts + proposals)
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1086/1086 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## R145 Contract Suite — 4/4 PASS

```
(pass) i18n.ts declares all 8 new keys with en + zh-CN (en ≠ zh-CN)
(pass) review.html tags 4 sort <option>s with data-i18n keys
(pass) review.html tags pane-title + selection + hint + textarea placeholder with data-i18n attrs
(pass) the 7 hardcoded English literals no longer appear outside i18n.ts or their data-i18n attributes
```

## Side Fixes — R137/R142 SOP for behavior-contract upgrades

R145 added `data-i18n`/`data-i18n-placeholder` attributes to review.html, which exposed 2 brittle byte-equivalence tests that asserted exact byte sequences for the now-decorated HTML elements. Applied the marker-anchored, behavior-contract pattern (R137→R142 SOP):

### T14.23.7 upgrade (`src/draft-autosave.test.ts`)

Old assertions asserted byte-equivalence on the `<option>` markup (`<option value="newest">Newest first</option>`). After R145 added `data-i18n="conversation.sort.newest"`, the markup became `<option value="newest" data-i18n="conversation.sort.newest">Newest first</option>`, breaking the byte-equivalence assertions.

Upgraded to behavior-contract:

```js
// before (byte-equivalence)
expect(html).toMatch(/<option\s+value="newest">Newest first<\/option>/);

// after (behavior-contract — asserts both the data-i18n attr AND the user-facing text)
expect(html).toMatch(/<option\s+value="newest"[^>]*data-i18n="conversation\.sort\.newest"[^>]*>Newest first</);
```

The test now asserts the contract (option is annotated with the right i18n key AND the user-facing text is preserved) instead of byte-equivalence (the exact `<option ...>` element shape).

### AC1.2 registerUITranslator contract (`src/ui/i18n.test.ts`)

The R19 AC1.2 follow-up test enforces a strict invariant: **every `data-i18n="..."` attribute in review.html must have a paired `registerUITranslator("key", () => t(key))` registration in app.ts**. R145 added 7 new `data-i18n` attrs (the 8th `data-i18n-placeholder` doesn't require translator registration per the test pattern), so 7 new translator registrations were added to app.ts at L1719-L1725. The contract is now satisfied.

This is a strict invariant that has held since R19. R145 is the first polish round to add `data-i18n` attrs that needed translator registration. Future polish rounds adding `data-i18n` to review.html should plan for the translator registration as part of the same commit.

## Regression Sweep — All Green

- R144, R143, R142, R141, R140, R139, R138, R137, R136, R135, R134, R133, R132, R131, R130, R129, R128, R127, R126, R125, R124, R123, R122, R121, R120, R119, R118, ... R57, R44 regression tests all pass.
- **R103 i18n coverage**: PASS — `en ≠ zh-CN` invariant holds for all 8 new keys.
- **T14.23.7 behavior-contract upgrade**: PASS.
- **AC1.2 registerUITranslator invariant**: PASS.
- Project suite after R145: **1086 tests pass** (was 1082 pre-R145; +3 R145 new + 1 net consolidation).
- tsc `--noEmit`: PASS
- oxlint: PASS
- oxfmt --write: PASS (no anchor drift)
- R105 v6 conformance: PASS (all 6 artifacts present in `.omo/round-145/`)

## What changed

- `src/ui/i18n.ts` — 8 new keys × 2 locales = 16 strings, placed after `conversation.sort.title`:
  - `conversation.sort.newest`: en="Newest first" / zh-CN="最新优先"
  - `conversation.sort.oldest`: en="Oldest first" / zh-CN="最早优先"
  - `conversation.sort.severity`: en="Severity (high → low)" / zh-CN="严重程度（高 → 低）"
  - `conversation.sort.file`: en="File path (A–Z)" / zh-CN="文件路径 (A–Z)"
  - `previously.paneTitle`: en="Prior rounds — what you told the agent + how it replied" / zh-CN="历史轮次 — 你告诉代理的内容与代理的回复"
  - `selection.empty`: en="Select lines in the diff to start." / zh-CN="在 diff 中选择行以开始。"
  - `selection.hint`: en="Click a line number to start, click another to set range." / zh-CN="点击行号开始，再点击另一行以设置范围。"
  - `comment.placeholder`: en="What should change and why?" / zh-CN="应当修改什么？为什么？"
- `src/ui/review.html` — 8 attribute additions:
  - L3642-L3647: 4 `<option>` elements with `data-i18n` attrs (sort dropdown)
  - L3655: `<div class="pane-title">` with `data-i18n="previously.paneTitle"`
  - L3698: `<div id="selection">` with `data-i18n="selection.empty"`
  - L3700: `<div class="hint">` with `data-i18n="selection.hint"`
  - L3718-L3719: `<textarea id="comment">` with `data-i18n-placeholder="comment.placeholder"`
- `src/ui/app.ts:1719-L1725` — 7 `registerUITranslator()` calls for the new `data-i18n` keys (the `data-i18n-placeholder` doesn't need registration per the AC1.2 test pattern).
- `src/draft-autosave.test.ts:T14.23.7` — byte-equivalence → behavior-contract upgrade (asserts both `data-i18n` attr + user-facing text).
- `src/ui/r145-review-html-i18n.test.ts` — 4 contract tests covering key wiring, attribute swaps, and zero remaining hardcoded English.
- `.omo/proposals.jsonl` — appended R145 entry (per-SHIP discipline).

## Visual QA Evidence

Per the R132.1 gap rule, **no visual-QA subagents were fired**. R145 is text-only localization inside the existing review.html DOM. DOM shape unchanged (8 elements still render the same node tree; only the user-facing text changes between locales via the R133 auto-discovery infrastructure).

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (extends the i18n sweep into review.html) |
| ≤1 polish | PASS (R145 = 1 polish) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R145 ready to SHIP.