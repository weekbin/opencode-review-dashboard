# R144 Brief — localize `uncommittedBadge.title`

## Scope

1. **`src/ui/i18n.ts`** — add 1 new key × 2 locales = 2 strings:
   - `file.uncommitted.title`: en="Working-tree only (not in diff base)" / zh-CN="仅在工作树中（不在 diff 基线中）"
2. **`src/ui/app.ts:5696`** — `uncommittedBadge.title = "Working-tree only (not in diff base)";` → `uncommittedBadge.title = t("file.uncommitted.title");`
3. New test file `src/ui/r144-uncommitted-badge-title.test.ts` — 2 contract tests covering the i18n key + the call-site swap.
4. Append R143 entry to `.omo/proposals.jsonl`.

## Files involved

- `src/ui/app.ts:5696` — 1 line change
- `src/ui/i18n.ts` — 1 new key (placed near the file/diff namespace)
- `src/ui/r144-uncommitted-badge-title.test.ts` — new test file
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- `t()` direct lookup is the canonical pattern (R134/R135/R136/R137/R140/R141/R143).
- The adjacent `uncommittedBadge.textContent = "uncommitted"` stays English (status-badge word; English-rendering precedent set by R17/R25).
- No test brittleness to upgrade — this round's source change is purely additive (no existing test asserted the old title string).

## Simplest change

Per call-site list. ~5 LOC net (2 strings + 1 wrapping + 4 expect assertions).

## Risk

- **No server changes.** Pure UI tooltip.
- **R103 invariant preserved**: en ≠ zh-CN (no emoji-only role label).
- **Tiny visual surface** — the user only sees this tooltip on hover of the uncommitted file badge, which appears on uncommitted files only. Acceptable to ship without explicit visual QA per the R132.1 visual-QA gap rule.
- **No brittle-test upgrade** needed — no existing test asserts the old English string in app.ts body. Per the R142 SOP audit, this round is clean.

## Acceptance

- `bun test src/ui/r144-uncommitted-badge-title.test.ts` passes (2 tests)
- Full project suite stays green (was 1080, expect 1082)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS
- `grep '"Working-tree only (not in diff base)"' src/ui/app.ts` returns 0 matches

## Profile

Polish. ≤2 files modified + 1 new test + 1 housekeeping append. UI text improvement, no behavior change.