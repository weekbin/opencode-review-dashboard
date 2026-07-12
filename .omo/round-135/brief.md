# R135 Brief — localize hardcoded English labels in conversation panel

## Scope

1. Add 4 new i18n keys × 2 locales = 8 strings in `src/ui/i18n.ts`:
   - `finding.pinned.tooltip`: "Pinned for revisit ({ago}) — click to unpin" / "置顶以便稍后查看（{ago}）— 点击取消置顶"
   - `comment.author.agent`: "🤖 Agent" / "🤖 Agent" (kept same — emoji is universal)
   - `comment.author.user`: "🧑 You" / "🧑 你"
   - `previously.notes.empty`: "(no notes sent this round)" / "（本轮未发送笔记）"
2. Update 4 call sites in `src/ui/app.ts`:
   - L4804: pinned badge tooltip
   - L4943: conversation panel comment author
   - L5396: previously-discussed panel empty notes
   - L5448: previously-discussed panel comment author
3. New test file `src/ui/r135-conversation-labels.test.ts` covering all 4 keys + call-site wiring
4. Housekeeping: append R134 entry to `.omo/proposals.jsonl` (closes the v6 procedure gap surfaced by R134 retro)
5. Housekeeping: include the uncommitted `.omo/round-133/retro.md` rewrite in this round's commit (better retro writeup that has been sitting in working tree)

## Why

R134 retro "Risks Surfaced" explicitly flagged: "Should we also localize the pinned-badge tooltip text 'Pinned for revisit — click to unpin' and '🤖 Agent' / '🧑 You'? Out of scope for R134; flagging as future candidate." This round picks that up. 4 strings × 5 call sites in the conversation/previously panels (pinned badge + 2× comment author + 1× empty notes). Bilingual users see English labels and tooltips on every conversation row.

## Risk

- The `comment.author.agent` EN string stays "🤖 Agent" (the emoji is universal); only `comment.author.user` changes from "🧑 You" to "🧑 你". This is intentional — the agent label is already language-neutral.
- The `finding.pinned.tooltip` already uses `formatRelativeTime` interpolation, so the `ago` placeholder receives the same localized string as R134 introduced.
- The `previously.notes.empty` is wrapped in parentheses to match the existing visual treatment.

## Acceptance

- `bun test src/ui/r135-conversation-labels.test.ts` passes
- `bun test` full suite stays green (was 1055, expect 1063 with 8 R135 new)
- `bun run check` PASS
- Pre-commit 8/8 PASS
- No new visual surface — DOM shape unchanged, only text content localized

## Profile

Polish. UI text improvement, no behavior change, ≤2 src files modified + 1 new test + 1 housekeeping append.