# R143 Brief — localize 2 hardcoded English strings in saved-replies dropdown

## Scope

1. **`src/ui/i18n.ts`** — add 2 new keys × 2 locales = 4 strings, placed next to existing `savedReplies.*` cluster (after `savedReplies.empty` and the 4 `savedReplies.error.*` keys):

   - `savedReplies.btn.title`: en="Saved Replies (R10) — type /<name>+space to expand" / zh-CN="已保存回复 (R10) — 输入 /<name>+空格 展开"
   - `savedReplies.saveCurrent`: en="💾 Save current as template…" / zh-CN="💾 将当前回复存为模板…"

2. **`src/ui/app.ts:5048`** — `savedRepliesBtn.title = "Saved Replies (R10) — type /<name>+space to expand";` → `savedRepliesBtn.title = t("savedReplies.btn.title");`

3. **`src/ui/app.ts:5066`** — `saveCurrent.textContent = "💾 Save current as template…";` → `saveCurrent.textContent = t("savedReplies.saveCurrent");`

4. **`src/saved-replies.test.ts:T10.2b`** — upgrade `expect(src).toMatch(/Save current as template/);` to behavior-contract `expect(src).toMatch(/t\("savedReplies\.saveCurrent"\)/);` (same marker-anchored upgrade pattern as R140/R141).

5. Append R142 entry to `.omo/proposals.jsonl` (per-SHIP discipline).

## Files involved

- `src/ui/i18n.ts` — 2 new keys
- `src/ui/app.ts:5048, L5066` — 2 `t()` wrappings
- `src/saved-replies.test.ts` — 1 byte-equivalence assertion upgrade
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- `t()` direct lookup is the canonical pattern for one-shot rendered strings (R134/R135/R136/R137/R140/R141).
- T10.2b in `src/saved-replies.test.ts` already had its sibling assertion (`savedReplies.empty`) localized in R141's neighborhood; this round closes the 2 remaining hardcoded English strings in the same dropdown block.

## Simplest change

Per call-site list above. ~10 LOC net.

## Risk

- **No server changes.** All strings are pure UI labels.
- **R103 invariant preserved**: no emoji-only role labels (the saved-replies.btn.title includes `(R10)` as part of the description; the zh-CN translation paraphrases to the same meaning).
- **T10.2b behavior-contract upgrade** mirrors the R141 T10.1c upgrade (function/element returns translation key, not hardcoded English).

## Acceptance

- `bun test src/saved-replies.test.ts` passes (15 tests, including the upgraded T10.2b)
- Full suite stays green (was 1080, expect 1080 unchanged since R143 ships same test count via upgrade)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep -E '"Saved Replies \(R10\)|"💾 Save current as template' src/ui/app.ts` returns 0 matches

## Profile

Polish. ≤3 files modified + 1 housekeeping append. UI text improvement, no behavior change.