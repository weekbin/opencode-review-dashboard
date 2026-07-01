# Round 12 Plan — ready for your review

> Phase 1 Architect output. 81 lines total (≤100 cap ✓). All hard caps met.

## Goal (verbatim from plan.md L4)

Ship 3 additive, user-locked features for `opencode-review-dashboard` (#17 ★ Pinned findings, #18 emoji reactions, #19 `n`/`p` jump-to-finding nav) closing GitHub PR review / GitLab MR / Slack reactions / Gerrit keyboard-nav gaps. Profile = **feature**, Dev timeout **30 min** (R9 retro Gap L). Worktree default `$HOME/.worktrees/team-dev-loop-round-12`.

## Acceptance Criteria (15 ACs — full list from plan.md L9-23)

Each AC classified: `[R1]` round-1 ground truth (e2e) · `[MR]` multi-round (direct unit test only) · `[PS]` payload-shape

- **AC1** [R1][PS] `Finding` type gains `pinned?`/`reactions?`/`manually_pinned?` fields; serialized to state.json
- **AC2** [R1] POST `/pin` + `/unpin` + `/reaction` endpoints (idempotent toggle, emoji whitelist, atomic save)
- **AC3** [R1] Star button + emoji pill row (👍👎😄❤️🎉👀) on FindingCard
- **AC4** [R1][PS] Extend `conversationFilter` enum with `"pinned"` + `"reacted"`; new chips
- **AC5** [R1] Conversation tab shows `Conversation (N★)` badge
- **AC6 [MR]** Pinned flag persists across rounds (stale auto-close fires) — **direct unit test** (e2e harness single-round)
- **AC7** [R1] `manually_pinned` flag (analogous to R10 `manually_edited`) + agent prompt update
- **AC8** [R1] Emoji picker reuses `modal-overlay` pattern; reactions persist on reload
- **AC9 [MR]** Reactions persist across rounds — **direct unit test**
- **AC10** [R1] Global keydown for `n`/`p` (focus-guard skip textarea/input); reuse `flashFindingPermaHighlight`
- **AC11** [R1] `getSortedFindings()` + in-memory `currentFindingIndex`; wraps on `n`/`p`
- **AC12** [R1] Status bar hint "Press n / p to navigate findings"
- **AC13** [R1] Filter chips honor R8 search-filter composition
- **AC14** [R1][PS] README adds 3 bullets + 1 paragraph; **NO broken URLs** (PM Researcher advisory)
- **AC15** [R1] `bun run check` clean; +11 unit tests; 135 existing pass → **146 total**

**Multi-round ACs (AC6, AC9)** routed to direct unit tests per R3 lesson — e2e harness is single-round so round N>1 asserts need unit tests on the round-transition helper.

## File changes (8 files)

| File | Change |
|---|---|
| `src/index.ts` | +Finding fields + 3 endpoints + agent prompt block |
| `src/ui/app.ts` | Star button + emoji picker + sidebar chips + Conversation badge + global keydown + filter logic + status bar hint |
| `src/ui/review.html` | CSS for star / emoji pill / nav-hint |
| `src/finding-pin.test.ts` (new) | 4 unit tests (pin/unpin, chip, persist reload, survives-round-2) |
| `src/finding-reaction.test.ts` (new) | 4 unit tests (add/remove/toggle/dedup, persist reload, survives-round-2) |
| `src/keyboard-nav.test.ts` (new) | 3 unit tests (n cycles, p cycles, focus-guard) |
| `scripts/test-review-ui/scenarios.mjs` | +6 e2e scenarios (pinned-toggle, react-add, react-remove, n/p jump, jump-skips-stale) |
| `README.md` | +3 bullets + 1 paragraph; avoid broken URLs |

## Risk register (5 — all from PM Researcher advisory, none feature-blocking)

1. **vimdiff `n`/`N` mischaracterized** (actual is `]c`/`[c`) — ship user-locked `n`/`p`, document "intuitive vs vim's `]c`/`[c`" in README
2. **GitHub + Slack reactions URLs 404** — README uses no external links, or `curl -I` first
3. **GitHub Pin is admin-only + repo-level (max 3)**, not per-finding — describe as "★ Pinned = reviewer-side revisit list"
4. **`manually_pinned` over-constraint risk** — agent prompt wording: "treat as revisit-intent, NOT skip-fix-intent" (mirrors R9 `manually_reopened`)
5. **Emoji whitelist drift** — `EMOJI_WHITELIST` constant + endpoint 400 + unit test asserts

## Worker hand-off (15 items)

- 3 atomic feature commits (#17 → #18 → #19, **no squash**)
- `bun run check` clean per commit
- 146 unit tests expected (135 + 11)
- 31 e2e scenarios expected (25 + 6)
- 6 commit shape total: 3 features + 1 tests + 1 docs (with screenshot) + 1 closure audit + 1 merge
- 3 **Forbidden** guards (no broken URLs in README, no vimdiff `n`/`N` claim, no GitHub Pin parity claim)

## Your decision (text reply)

- **`go`** — fire Phase 2 Dev now (30 min timeout, worktree default, 3 atomic feature commits)
- **`go + adjust`** — e.g. "go 但合成 1 commit", "go 但只跑 #17 + #18 不要 #19", "go 但用 ]c/[c 不用 n/p", "go 但 30 min 不够换 45 min"
- **`hold`** — 暂停，我还有想法没表达清

Default if you say nothing 5 min after a follow-up nudge: `go` 按 plan 启动。
