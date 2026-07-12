# R136 Retro — localize audit-trail timestamps

## What worked

Lead-direct round across 1 src file modified (`app.ts`) + 1 new test + 1 housekeeping append. R135 retro's surfaced-risk #3 — "audit-trail `ts` line uses `new Date(row.at).toLocaleString()` — not localized" — was closed in this round with a single-line replacement. Reuses the R134 `formatRelativeTime` helper directly; zero new i18n keys, zero new strings, zero new utilities.

The whole round is a 5-LOC net change. This is what minimal polish looks like: surface a real inconsistency, replace the one call that breaks the invariant, add a regression test, ship.

Pre-commit 8/8 PASS after one test-slice widening (1500 chars wasn't enough to reach the `ts` assignment above the `audit-ts` marker; 3000 worked) and one comment-removal pass per the hook guidance (slice-mechanics comments are not algorithmically necessary). All 3 R136 contract tests red→green. Project suite 1064/1064. Per-SHIP append discipline restored: R135 entry landed in `.omo/proposals.jsonl` before this round's commit.

## What didn't

- First test slice (1500 chars before `audit-ts` marker) was too narrow. Bumped to 3000 and the test passed. Same lesson as R133/R134 — test slices need to be wide enough for source whitespace + multi-line shape.
- Hook flagged two comments I added explaining the slice mechanics. Removed them per rule #4 ("make the code itself clearer"). The test name + slice code already says what's happening.

## Carry-over list (≤3 items)

None — R136 closes the last R135 surfaced-risk. No new loop-internal flags.

## Closed in this round (loop-internal)

- R135 retro surfaced-risk #3: audit-trail timestamps not localized — **closed**. Now uses `formatRelativeTime(row.at)`.
- Per-SHIP append discipline: `.omo/proposals.jsonl` missing R135 entry — **closed**. R135 entry appended in this round.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **One-line replacements earn full rounds when they close a retro risk.** R136's 5-LOC net change still ships because it closes a documented surfaced risk. The v6 loop's value isn't just net LOC — it's risk-closure-per-round. The bookkeeping is the same regardless of size.
- **Reuse > new utilities.** R136 needed zero new code beyond the 1-line replacement. The R134 helper carried the weight. This is what compounding improvements looks like — every round stands on the previous one's shoulders.
- **Test slices need to be ~2x the source distance** between marker and target. 1500 chars missed; 3000 worked. Use 3000 as default for any "find this call above this marker" assertion.
- **Comments about test mechanics are unnecessary** unless they're protecting against a non-obvious bug. The hook is right to flag these.

## Risks Surfaced (not actioned this round)

- The lock banner still doesn't link to the round that locked the review (R132 retro original risk #1). Reconsidered in R135 retro: the locked round IS the current round, so there's no UI surface to jump to. Effectively closed as a non-issue.
- `formatRelativeTime` doesn't handle > 1 year as a calendar date. Preventive only.
- Worktree has 5 untracked PNGs from R132 visual QA + `.agents/` + `skills-lock.json`. Not blocking anything; can be a future housekeeping round.

## v6 Compliance

- Hard caps: **1 polish** (≤1) + **0 feature** + **0 bugfix** = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.

## Round Profile

- Polish: 1 (close R135 surfaced-risk)
- Total: 1
- Subagents: 0
- Time: ~10 min wall-clock.