# R145 Brief — localize 6 hardcoded English strings in `src/ui/review.html`

## Scope

1. **`src/ui/i18n.ts`** — add 7 new keys × 2 locales = 14 strings:
   - `sort.newest`: en="Newest first" / zh-CN="最新优先"
   - `sort.oldest`: en="Oldest first" / zh-CN="最早优先"
   - `sort.file`: en="File path (A–Z)" / zh-CN="文件路径 (A–Z)"
   - `pane.title.previously`: en="Prior rounds — what you told the agent + how it replied" / zh-CN="历史轮次 — 你告诉代理的内容与代理的回复"
   - `selection.empty`: en="Select lines in the diff to start." / zh-CN="在 diff 中选择行以开始。"
   - `selection.hint`: en="Click a line number to start, click another to set range." / zh-CN="点击行号开始,再点击另一行以设置范围。"
   - `comment.placeholder`: en="What should change and why?" / zh-CN="应当修改什么?为什么?"

2. **`src/ui/review.html`** — add `data-i18n` attributes to the 7 hardcoded English strings (3 `<option>` + 1 pane-title + 1 selection placeholder + 1 hint + 1 textarea placeholder).

3. **`src/ui/r145-review-html-i18n.test.ts`** — 3 contract tests covering: (a) `data-i18n` attributes present on all 7 sites, (b) i18n keys declared, (c) no hardcoded English strings remain in review.html body content.

4. Append R144 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/ui/i18n.ts` — 7 new keys (in relevant namespace: `sort.*`, `pane.*`, `selection.*`, `comment.*`)
- `src/ui/review.html` — 7 `data-i18n` attribute additions
- `src/ui/r145-review-html-i18n.test.ts` — new test file
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- The existing 11 `data-i18n="..."` attributes in review.html (e.g., L3362, L3503, L3530) all delegate to `initUIDataI18nAttributes()` MutationObserver at L998 of i18n.ts. Adding 7 more follows the same path.
- `data-i18n` (no suffix) targets `textContent` for elements like `<span>`/`<option>`/`<div>`. `data-i18n-placeholder` targets the `placeholder` attribute on `<textarea>`/`<input>`. The i18n.ts auto-discovery covers both attribute names.

## Simplest change

Per call-site list. ~12 LOC net (7 string additions + 7 `data-i18n` attribute swaps).

## Risk

- **No server changes.** All strings are pure UI text.
- **R103 invariant preserved**: no emoji-only role labels.
- **No brittle-test upgrade needed** — no existing test asserted the old English strings in review.html.
- **MutationObserver covers dynamic translation**: the existing `initUIDataI18nAttributes()` (R133 infrastructure) handles live language switches.

## Acceptance

- `bun test src/ui/r145-review-html-i18n.test.ts` passes (3 tests)
- Full project suite stays green (was 1082, expect ~1085)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep -nE 'data-i18n="(sort\.newest|sort\.oldest|sort\.file|pane\.title\.previously|selection\.empty|selection\.hint|comment\.placeholder)"' src/ui/review.html` returns 7 matches
- `grep -nE 'Newest first|Oldest first|File path \(A.{1,3}Z\)|Select lines in the diff|Click a line number' src/ui/review.html` returns 0 matches (after localization, the English text lives in i18n.ts only)

## Profile

Polish. ≤3 files modified + 1 new test + 1 housekeeping append. UI text improvement, no behavior change.