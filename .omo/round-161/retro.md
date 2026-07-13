# R161 Retro — [USER ISSUE #3] 截图修复

## What worked

User-driven bugfix round. Closed USER ISSUE #3 + R160 ship bug (3 missing R16 images).

Two distinct issues resolved in one round:

1. **R160 ship bug** (3 images missing from R160 commit `8b91031`): the 3 R16 PNGs were deleted in the R160 `git rm` step but the README still referenced them. R161 re-created all 3 at 1280×720 with proper trigger states.

2. **User feedback** (screenshots size/clarity): 5 README images had description-content mismatch:
   - `dashboard-overview.png` showed Cmd+P file jump (not diff overview)
   - `r12-conversation-with-finding.png` showed empty form (not populated card)
   - `r13-in-diff-search.png` showed Cmd+P file jump (not in-diff search)
   - `r15-s1-conversation-pinned-sort.png` had no pinned finding
   - `r15-s4-submit-confirm.png` was Chinese (README was English)
   All 5 re-captured with correct content.

Pre-commit ran clean (9/9 PASS). bun test stayed at 1119/1119 PASS. No code change, so no test impact.

## What didn't

- **R8/R13 in-diff search counter bug** discovered during R161: `findMatchesInDiff()` at `app.ts:743-747` queries `[data-line-number]` selector, but `@pierre/diffs` library emits `[data-line]` attribute. **Counter always shows 0 matches** regardless of query. This is a real bug surfaced by R161, but R161 deliberately scoped it out (the search bar UI itself is fine; the counter is the only broken thing). Will be R162+ candidate.
- **Initial mock data had wrong `reactions` format**: my first mock used `Record<emoji, users[]>` (object), but the actual schema is `Array<{emoji, users}>`. Caught by `TypeError: existingReactions is not iterable` in browser console. Fixed by using correct format.
- **Initial 2 attempts to set value via `setter.call(el, "...")` + dispatch event** didn't trigger React's onChange. **Workaround**: use `document.execCommand('insertText', false, 'text')` which dispatches proper input events.
- **Mock-server.py was modified for screenshots** (added round=1 finding payload, modified `serve_prior_notes()`). Restored to HEAD before commit.

## Carry-over list (≤3 items)

1. **R8/R13 in-diff search counter bug** — `findMatchesInDiff` uses `[data-line-number]` selector but library emits `[data-line]`. Real bug, would take 1 round to fix (selector + test).

## Closed in this round (loop-internal)

- **USER ISSUE #3**: 截图太小 / 功能看不全 — addressed via 5 image re-captures with richer content
- **R160 ship bug**: 3 missing R16 images — addressed via re-creation
- **2 README description mismatches** (r16-diff-toolbar, r13-in-diff-search) — fixed alt text

## Open loop-internal at retro time

- **R8/R13 in-diff search counter** — surfaced during R161, deferred to R162+

## Self-Improvement Observations

- **User-driven rounds produce significantly better signal than self-feedback-loop rounds.** This is the 3rd consecutive user-driven round (R159 + R160 + R161) all closing real issues. Self-feedback-loop rounds (R154-R158) were mostly internal hygiene.
- **`@pierre/diffs` selector mismatch** is a latent bug that survived R132-R160. The R8 #1 / R13 implementation used `[data-line-number]` but the library version bump likely changed the attribute name. Should add a regression test that searches in the diff and asserts counter > 0.
- **Mock-server.py is the right place for screenshot mock data**, but R161 needed the right `reactions` format (array, not object). The R12 mock-state fixture in mock-server.py uses the right format; my hand-rolled mock missed this. Should check that file first.
- **`document.execCommand('insertText', ...)` is the most reliable way to trigger React onChange from Playwright** when simple `el.value = ...` doesn't propagate.

## Risks Surfaced (not actioned this round)

- **R8/R13 in-diff search counter** (carry-over 1)

## v6 Compliance

- Hard caps: **0 features** (≤3) + **1 bugfix** (≤5) + **0 polish** (≤1) + **1 housekeeping** = **2 total** (≤8). PASS.
- 1 carry-over (R8/R13 in-diff search counter). PASS (≤3).
- Pre-commit 9/9 PASS.
- 0 subagents used (lead-direct).

## Round Profile

- Bugfix: 1 (R160 missing images + content mismatch)
- Housekeeping: 1 (image re-capture with richer data)
- Total: 2
- Subagents: 0
- Time: ~25 min wall-clock
- **Driver**: USER DIRECTIVE (ISSUE #3) + carry-over from R160 ship bug
