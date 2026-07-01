# R12 Plan — ★ Pinned + Reactions + Keyboard nav (3 features)

## Goal
Ship 3 additive, user-locked features for `opencode-review-dashboard` (#17 ★ Pinned findings, #18 emoji reactions, #19 `n`/`p` jump-to-finding nav) closing GitHub PR review / GitLab MR / Slack reactions / Gerrit keyboard-nav gaps. Profile = **feature**, Dev timeout **30 min** (R9 retro Gap L). Worktree default `$HOME/.worktrees/team-dev-loop-round-12`.

## Acceptance Criteria
Each AC classified: `[R1]` round-1 ground truth (e2e), `[MR]` multi-round (direct unit test only — e2e harness is single-round), `[PS]` payload-shape (e2e + state.json stash).

- **AC1** [R1][PS] `Finding` type gains `pinned?: { by: "user"; at: number }`, `reactions?: Reaction[]`, `Reaction = { emoji: "👍"|"👎"|"😄"|"❤️"|"🎉"|"👀"; author: "user"; created_at: number }`; serialized to `state.json`. Backwards-compat: missing fields = unpinned / no reactions.
- **AC2** [R1] POST `/api/review/${id}/pin` + `/unpin` + `/reaction` (PUT-style: `{ emoji }`, idempotent toggle). Each validates finding exists (404), emoji whitelist (400), then atomically saves via existing `saveState` (`src/state-store.ts`).
- **AC3** [R1] Star button on each `renderConversationPanel` card toggles pin; pill row of 6 emoji buttons (👍 👎 😄 ❤️ 🎉 👀) adds/toggles reactions; empty state hides pill row.
- **AC4** [R1][PS] Extend `conversationFilter` enum (`src/ui/app.ts:588`) to include `"pinned"` + `"reacted"`. New chips "★ Pinned (N)" / "😀 Reacted (N)" in `#conversation-filter`; counts computed from `state.existing + state.fresh`.
- **AC5** [R1] Sidebar Conversation tab label shows `Conversation (N★)` badge when pinned count > 0.
- **AC6** [MR] Pinned flag persists across round transitions: pin finding in round N, advance to round N+1 (stale auto-close fires), finding's `pinned` field remains intact. Unit test exercises the round-transition helper directly (no e2e harness for round 2).
- **AC7** [R1] Add `manually_pinned` flag (analogous to `manually_edited` R10, `manually_reopened` R9) so agent honors pin intent in auto-apply loop; agent prompt section updated.
- **AC8** [R1] Emoji picker reuses `modal-overlay` pattern (`src/ui/app.ts:988-1029`); reactions persist on page reload (verified via state.json reload).
- **AC9** [MR] Reactions persist across rounds: add 👍 to finding in round N, advance to round N+1, reaction still present. Unit test on the round-transition helper.
- **AC10** [R1] Global `keydown` listener for `n`/`p` (focus guard: skip when `document.activeElement` is `<textarea>`/`<input>`); reuse `flashFindingPermaHighlight` (`src/ui/app.ts:319`) for scroll-into-view + 1.5s flash.
- **AC11** [R1] `getSortedFindings()` returns findings filtered by `state.conversationFilter`, sorted `(round DESC, created_at ASC)`; `currentFindingIndex: number` (in-memory, NOT persisted) wraps on `n`/`p`.
- **AC12** [R1] Status bar hint "Press n / p to navigate findings" visible only when no textarea/input focused.
- **AC13** [R1] Filter chips "★ Pinned" + "😀 Reacted" honor search-filter composition (R8): typing in search filters the already-pinned/reacted subset.
- **AC14** [R1][PS] README adds bullet under "Other shipped features" for each of the 3 features + 1 sentence in Conversation panel docs. NO broken URLs (PM Researcher advisory: GitHub docs URLs in brief are 404 — write the README without external links or use `docs.github.com` paths verified by dev).
- **AC15** [R1] `bun run check` clean (format:check + lint + typecheck). Unit tests: +11 new (4 pinned, 4 reactions, 3 keyboard-nav) + existing pass.

## File changes

| File | Change |
|---|---|
| `src/index.ts` | Add `pinned?:`, `reactions?:`, `manually_pinned?:`, `Reaction` type; +3 endpoints (`/pin`, `/unpin`, `/reaction`); +1 agent prompt block honoring `manually_pinned` |
| `src/ui/app.ts` | Star button + emoji picker on FindingCard; sidebar chips; Conversation tab badge; `getSortedFindings()` + `currentFindingIndex` + global keydown; filter logic extension; status bar hint |
| `src/ui/review.html` | CSS for star (filled/empty hover), emoji pill row, status bar hint |
| `src/finding-pin.test.ts` (new) | 4 unit tests: pin/unpin toggle, pinned filter chip, persist reload, pin-survives-round-2 |
| `src/finding-reaction.test.ts` (new) | 4 unit tests: add/remove/toggle/dedup; persist reload; reactions-survives-round-2 |
| `src/keyboard-nav.test.ts` (new) | 3 unit tests: n cycles, p cycles, focus-guard skip when textarea focused |
| `scripts/test-review-ui/scenarios.mjs` | +6 scenarios: `pinned-toggle`, `react-add`, `react-remove`, `n-jump-next`, `p-jump-prev`, `jump-skips-stale` |
| `README.md` | +3 bullets under "Other shipped features" + 1 paragraph in Conversation panel docs |

## Implementation steps
1. `src/index.ts:28` — extend `Finding` type with `pinned?:`, `reactions?:`, `manually_pinned?:`; add `Reaction` type at `:21`.
2. `src/index.ts` after `:1961` (POST `/comment`) — add `/pin`, `/unpin`, `/reaction` handlers; reuse `saveState` atomic-write path; emoji whitelist validation; idempotent toggle logic.
3. `src/index.ts` near `:1479` — extend agent prompt with "If `manually_pinned: true`, do not auto-close pinned findings; treat pin as user intent to revisit."
4. `src/ui/app.ts:588` — extend `conversationFilter` enum to `["open", "resolved", "all", "pinned", "reacted"]`; update `setConversationFilter` + filter logic at `:2241-2246`.
5. `src/ui/app.ts:2207` `renderConversationPanel` — add star button next to action row; add emoji pill row beneath comment thread.
6. `src/ui/app.ts:759-768` — extend filter chips to include "★ Pinned (N)" + "😀 Reacted (N)".
7. `src/ui/app.ts:3544` — add `manually_pinned` to submit payload to agent (parallel to `manually_edited`).
8. `src/ui/app.ts` after `:3544` — add `getSortedFindings()`, `state.currentFindingIndex` (in-memory), global `keydown` listener with `document.activeElement` focus guard (skip textarea/input); reuse `flashFindingPermaHighlight`.
9. `src/ui/review.html` — add CSS `.finding-star` (filled/empty hover), `.reaction-pill`, `.nav-hint`; status bar hint element.
10. New unit test files: `finding-pin.test.ts`, `finding-reaction.test.ts`, `keyboard-nav.test.ts`.
11. `scripts/test-review-ui/scenarios.mjs:389` — add 6 e2e scenarios (table above).
12. `README.md` — add 3 bullets + Conversation panel paragraph; avoid broken external URLs.

## Test plan
**Unit (11 new + existing)**: per AC2 endpoint validation (pin/unpin toggle, reaction toggle, emoji whitelist 400, missing finding 404); AC4 filter chip logic (filter pinned-only, filter reacted-only, compose with search); AC6/AC9 round-transition helpers (pin survives round 2 stale auto-close, reaction survives round 2); AC10/AC11 keyboard nav (n cycles, p cycles, wrap-around, focus-guard).

**E2E (6 new scenarios)**: pinned-toggle (star click → POST → re-render), react-add (emoji click → pill renders), react-remove (same emoji click → pill gone), n-jump-next (4 findings → press n 3× → index 3 active), p-jump-prev (wrap-around), jump-skips-stale (n skips `closed_auto` findings when `conversationFilter === "open"`).

**Multi-round ACs (AC6, AC9) → direct unit tests** on the round-transition helper that applies stale auto-close + reads `state.findings[]`; e2e harness is single-round so cannot exercise round N>1.

## Risk register
1. **vimdiff `n`/`N` mischaracterization** (PM Researcher): brief claims vimdiff uses `n`/`N` — actual is `]c`/`[c`. **Mitigation**: ship user-locked `n`/`p` (intuitive mnemonic), DOCUMENT deviation in README "Keyboard shortcuts" section: "We chose `n`/`p` for intuitive next/prev (vs vim's `]c`/`[c`) to match Slack/email navigation muscle memory."
2. **GitHub reactions docs URL 404 + Slack URL 404** (PM Researcher): brief cites broken URLs. **Mitigation**: README describes feature with NO external URL; link only to `docs.github.com` paths the dev verifies via `curl -I` before commit.
3. **GitHub "Pinned Issue" is admin-only + repo-level (max 3)**, NOT per-finding/per-user. **Mitigation**: don't claim parity; describe as "★ Pinned findings = reviewer-side revisit list" with explicit "distinct from GitHub's admin-only repo-level pin."
4. **`manually_pinned` agent-prompt surface** could over-constrain auto-apply loop (pinned findings skipped from fix even when code already fixed). **Mitigation**: agent prompt says "treat pin as revisit-intent, NOT skip-fix-intent" — still fix the finding, just keep the pin until user unpins. Mirrors `manually_reopened` (R9) pattern.
5. **Emoji whitelist drift** (future contributors add emojis). **Mitigation**: constant `EMOJI_WHITELIST = new Set([...])` in `src/index.ts`; endpoint returns 400 on unknown emoji; unit test asserts all 6 whitelist + rejects 2 sample non-whitelist emojis.

## Worker hand-off checklist
1. Read `.omo/round-12/plan.md` end-to-end before touching code.
2. Verify `git cat-file -e 1b0da21` (R11 baseline) before branching.
3. Worktree: `WORKTREE_DIR="$HOME/.worktrees/team-dev-loop-round-12"`; branch `team-dev-loop-round-12-pinned-reactions-nav`.
4. Atomic commits per feature: 1st commit #17 Pinned (incl. type + endpoints + UI + tests + README), 2nd commit #18 Reactions, 3rd commit #19 Keyboard nav — DO NOT squash.
5. After each commit: `bun run check` (format:check + lint + typecheck) MUST be clean.
6. After all 3 commits: `bun run test:unit` — 11 new tests + existing 135 must pass (146 total).
7. After all 3 commits: `bun run build` then `bun run scripts/test-review-ui/e2e.mjs` — all 25+6=31 scenarios must pass.
8. E2E scenario commit: separate 4th commit "test(round-12): pinned + reactions + keyboard-nav e2e scenarios".
9. README commit: 5th commit "docs(round-12): ★ Pinned + Reactions + n/p nav" with screenshot evidence (Playwright `page.screenshot()` of star + emoji picker + n-key flash).
10. Closure audit-trail commit: 6th commit "Round 12: closure audit trail" referencing `.omo/round-12/decision.md`.
11. Round-12 merge commit: 7th commit "Round 12: merge ... from team-dev-loop-round-12-pinned-reactions-nav".
12. **Forbidden**: do NOT cite `https://docs.github.com/en/organizations/collaborating-with-your-team/about-conversations-on-github` (404) or `slack.com/help/articles/360020669072` (404) in README — per PM Researcher advisory.
13. **Forbidden**: do NOT claim "vimdiff `n`/`N`" — actual is `]c`/`[c`. Use "intuitive `n`/`p` mnemonic" framing.
14. **Forbidden**: do NOT claim parity with GitHub "Pin issue" — describe as reviewer-side revisit list.
15. Final: write `.omo/round-12/decision.md` with verdict (PASS/FAIL) + SHAs + scenario count 25→31 + unit count 135→146.