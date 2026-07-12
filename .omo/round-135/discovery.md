# R135 Discovery

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R134 retro carry-over**: none — all flags closed
- **proposals.jsonl last entry**: R134 (verified appended in R134 commit)
- **Worktree drift**: `M .omo/round-133/retro.md` (uncommitted rewrite from R133 finalization) — keep as housekeeping this round

## Surfaced candidates (from R134 retro + code scan)

### C1 — Localize hardcoded English labels in conversation / previously panels

**Evidence** (4 sites in `src/ui/app.ts`):

1. `app.ts:4804` — `Pinned for revisit (${formatRelativeTime(...))} — click to unpin`
2. `app.ts:4943` — Conversation panel comment author: `${"🤖 Agent" | "🧑 You"} · {relative}`
3. `app.ts:5396` — `(no notes sent this round)` empty state
4. `app.ts:5448` — Previously panel comment author: `${"🤖 Agent" | "🧑 You"} · {relative}` (same ternary)

All 4 strings stay hardcoded English on zh-CN locale. R134 retro "Risks Surfaced" flagged: "Should we also localize the pinned-badge tooltip text 'Pinned for revisit — click to unpin' and '🤖 Agent' / '🧑 You'? Out of scope for R134; flagging as future candidate." This round picks that up.

**Why**: User-visible UX gap. These labels appear in every conversation panel row + the pinned-badge tooltip. Bilingual users see English author labels and tooltips.

**Cost**: ≤2 src files modified (`app.ts`, `i18n.ts`) + 1 new test. ~25 LOC net. 4 keys × 2 locales = 8 strings.

**Profile**: polish (UI text improvement, no behavior change).

### C2 — Lock banner click-to-jump-to-locked-round (R132 retro original risk #1)

**Why not this round**: Already flagged by R132 + R134 retros. Requires new state shape (state.locked doesn't carry which round's findings to scroll to) + a click handler + new banner button. ~80-120 LOC, feature profile. Out of polish budget.

### C3 — formatRelativeTime > 1 year as calendar date

**Why not this round**: Preventive only. No current surface triggers this (active reviews are typically < 30 days old). Same as R133 retro's "data-i18n-placeholder" preventive — would fail the user-visible test.

## Selection

Pick **C1 — localize 4 hardcoded English labels**. Closes the R134 retro surfaced-risk + cleans worktree drift as housekeeping in the same round.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 1 | ≤1 | OK |
| total | 1 (+housekeeping) | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R134 entry to `.omo/proposals.jsonl` (per R134 retro lesson: every SHIP commit must append its own entry)
- Include the uncommitted `.omo/round-133/retro.md` rewrite as housekeeping (better retro writeup that's been sitting in working tree)