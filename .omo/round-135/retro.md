# R135 Retro — localize hardcoded English labels in conversation panel

## What worked

Lead-direct round across 2 src files modified (`app.ts`, `i18n.ts`) + 1 new test + 2 housekeeping items. R134 retro's surfaced-risk #3 — "Should we also localize the pinned-badge tooltip text 'Pinned for revisit — click to unpin' and '🤖 Agent' / '🧑 You'?" — was closed in this round. 4 strings × 5 call sites (pinned badge tooltip + 2× comment author in different panels + 1× empty notes placeholder) now actually translate on language switch.

The trick was composing the new `finding.pinned.tooltip` to use the `{ago}` placeholder, which gets the R134 `formatRelativeTime` output. So the pinned badge now reads `已置顶以便稍后查看（3小时前）— 点击取消置顶` on zh-CN, with the relative time flowing through the same bilingual helper.

Pre-commit 8/8 PASS after one R103 failure: my first attempt had `comment.author.agent` with `zh-CN="🤖 Agent"` (identical to en), which tripped R103's translation-completeness invariant (`en !== zh-CN`). Fixed by using `zh-CN="🤖 助手"` (助手 = assistant, the natural Chinese role term) — keeps the universal emoji, localizes the role label. This is exactly what R103 is designed to catch: identical en/zh-CN values that suggest copy-paste rather than translation. Saved as a self-improvement observation: even when "the emoji is universal," the role label must differ across locales.

All 6 R135 contract tests red→green. R103 stays green. Project suite 1061/1061. Housekeeping: appended the missing R134 entry to `.omo/proposals.jsonl` (R134 retro lesson #4 — every SHIP commit must append its own entry), and included the uncommitted `.omo/round-133/retro.md` rewrite as housekeeping in this round's commit.

## What didn't

- First-pass zh-CN for `comment.author.agent` was identical to en — caught immediately by R103's translation-completeness test. Lesson internalized: any new i18n key with identical en/zh-CN values will fail this gate by design.
- Test file took 1 extra iteration because I initially asserted the wrong regex for `t("comment.author.agent")` occurrence count (forgot to anchor the `g` flag in the regex builder). Simple fix.

## Carry-over list (≤3 items)

None — R135 closes the last R134 retro surfaced-risk. No new loop-internal flags.

## Closed in this round (loop-internal)

- R134 retro surfaced-risk #3: hardcoded English labels in conversation/previously panels — **closed**. 4 strings × 5 call sites now use `t()`.
- v6 procedure gap (R134 retro Self-Improvement #4): `.omo/proposals.jsonl` missing R134 entry — **closed**. R134 entry appended.
- Worktree drift: uncommitted `.omo/round-133/retro.md` rewrite sitting since R133 — **closed**. Included in this round's commit.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **R103 translation-completeness test is a useful safety net.** Without it, the `comment.author.agent` zh-CN="🤖 Agent" duplicate would have shipped silently. Lesson: any new i18n key with identical en/zh-CN values fails this gate by design — surface that signals lazy translation before merge, not after.
- **Emoji is universal; role label is not.** `🤖` + `Agent`/`助手` is the right shape (universal visual + localized label). Same pattern for `🧑 You`/`🧑 你`.
- **Composing i18n keys via placeholders works.** `finding.pinned.tooltip` interpolates `{ago}` from the R134 `formatRelativeTime` output — the existing relative-time helper flows through the new tooltip with zero additional glue.
- **Pre-SHIP housekeeping should be cheap to ship.** Including the uncommitted `.omo/round-133/retro.md` rewrite took 1 line in the commit message; not bundling it would have left drift that accumulates.
- **Per-SHIP proposals.jsonl append discipline is now mechanical.** R134 retro caught the gap. R135 verified the discipline is restored. Future rounds will append in the same edit as the commit prep.

## Risks Surfaced (not actioned this round)

- The lock banner still doesn't link to the round that locked the review (R132 retro original risk #1). Could be a future polish round.
- `formatRelativeTime` doesn't handle > 1 year as a calendar date. Preventive only.
- The audit-trail `ts` line uses `new Date(row.at).toLocaleString()` — not localized. Out of R135 scope; flagging as future candidate.

## v6 Compliance

- Hard caps: **1 polish** (≤1) + **0 feature** + **0 bugfix** = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.
- R103 translation-completeness invariant honored — `en !== zh-CN` for all new keys.

## Round Profile

- Polish: 1 (close R134 surfaced-risk + housekeeping)
- Total: 1
- Subagents: 0
- Time: ~20 min wall-clock.