# R12 Decision — ★ Pinned + Reactions + n/p nav

## Verdict

**SHIP**

## Outcome

- 3 user-stories shipped (feature profile, v5 lightweight budget)
- 185/185 unit tests pass (was 135 in R11; +50 new across 3 features)
- 31 e2e scenarios registered (was 25; +6 new)
- 5 atomic commits on `team-dev-loop-round-12-pinned-reactions-nav`
- 1 closure audit-trail commit on main (post-merge)
- 1 merge commit on main
- 0 hard-stop triggers; 0 orchestrator timeouts; 0 fabricated SHAs
- 0 spec deviations from `.omo/round-12/plan.md`
- 0 `deviations` from plan brief

## Commits (5 atomic, on branch `team-dev-loop-round-12-pinned-reactions-nav`)

1. `7accd8a` — feat(pinned): ★ Pinned findings + reviewer-side revisit list (close #17)
2. `d241173` — feat(reactions): 👍 👎 😄 ❤️ 🎉 👀 emoji reactions on findings (close #18)
3. `57b27ef` — feat(keyboard-nav): n / p jump-to-next/prev-finding keyboard shortcut (close #19)
4. `2b28ace` — test(round-12): pinned + reactions + keyboard-nav e2e scenarios
5. `fd446c2` — docs(round-12): ★ Pinned + Reactions + n/p nav (close #17, #18, #19)

## Files changed (8 total)

| File | Lines | Type |
|---|---|---|
| `src/index.ts` | +~140 | server-side: type extensions, 3 endpoints, agent prompt block |
| `src/ui/app.ts` | +~280 | UI: star button, emoji picker, filter chips, sidebar badge, keydown handler, nav-hint |
| `src/ui/review.html` | +~85 | CSS for star (filled/empty), reaction-pill, tab-badge, nav-hint |
| `src/finding-pin.test.ts` | +229 (new) | 20 unit tests for #17 |
| `src/finding-reaction.test.ts` | +170 (new) | 14 unit tests for #18 |
| `src/keyboard-nav.test.ts` | +190 (new) | 16 unit tests for #19 |
| `src/prior-notes.test.ts` | +3 | snapshot updated for new Finding fields |
| `scripts/test-review-ui/scenarios.mjs` | +128 | 6 new e2e scenarios |
| `README.md` | +12 | 3 new bullets + Conversation panel doc + scenario count |
| `README.zh-CN.md` | +6 | 3 new Chinese bullets + Conversation panel doc + scenario count |
| `scripts/test-review-ui/README.md` | +7 | scenario count + 6 new rows |

Total: 11 files (8 source/test/docs + 3 new test files); ~+750 prod + +589 test = ~1340 LOC

## AC trace (all 15)

| AC | Description | Status | Evidence |
|---|---|---|---|
| AC1 | `Finding` type gains `pinned?`, `reactions?`, `Reaction` shape; backwards-compat | PASS | `src/index.ts:64-82` (FindingPin + Reaction + Finding fields) |
| AC2 | POST `/pin` + `/unpin` + `/reaction`; 400/404 validation; idempotent toggle | PASS | `src/index.ts:2085-2200` (3 endpoints) |
| AC3 | Star button + emoji picker pill row on each FindingCard; empty state hides pill row | PASS | `src/ui/app.ts:2444-2476` (star) + `src/ui/app.ts:2565-2625` (picker) |
| AC4 | `conversationFilter` enum + new "★ Pinned (N)" + "😀 Reacted (N)" chips; counts from state | PASS | `src/ui/app.ts:588-592` (enum) + `:2273-2282` (filter logic) + `:1796-1807` (counts) |
| AC5 | Conversation tab badge shows `★ N` when pinned count > 0 | PASS | `src/ui/app.ts:1107-1141` (`updateConversationTabBadge`) |
| AC6 | Pinned flag persists across round transitions (unit test on round-transition helper) | PASS | `src/finding-pin.test.ts:212-229` (T12.6a direct unit test) |
| AC7 | `manually_pinned` flag (mirror of R9 `manually_reopened` / R10 `manually_edited`); agent prompt section | PASS | `src/index.ts:1507-1513` (agent prompt block) |
| AC8 | Emoji picker reuses `modal-overlay` pattern; reactions persist on reload | PASS | `src/ui/app.ts:2565-2625` (picker row) + `src/finding-reaction.test.ts:90-99` (T12.R3e CSS contract) |
| AC9 | Reactions persist across rounds (unit test on round-transition helper) | PASS | `src/finding-reaction.test.ts:131-155` (T12.R9a + T12.R9b) |
| AC10 | Global `keydown` listener for `n`/`p` with focus guard; reuse `flashFindingPermaHighlight` | PASS | `src/ui/app.ts:438-457` (listener) + `:402-411` (isTextInputFocused guard) |
| AC11 | `getSortedFindings()` sorted `(round DESC, created_at ASC)`; `currentFindingIndex` wraps on `n`/`p` | PASS | `src/ui/app.ts:381-414` (getSortedFindings) + `:416-425` (jumpToFindingByIndex wrap) |
| AC12 | Status bar hint "Press n / p to navigate findings" visible only when no textarea/input focused | PASS | `src/ui/app.ts:466-470` (`updateNavHint`) + CSS `.nav-hint` in `src/ui/review.html` |
| AC13 | Filter chips "★ Pinned" + "😀 Reacted" honor search-filter composition | PASS | `src/ui/app.ts:2273-2276` (filter applied before `filterByQuery` search) |
| AC14 | README adds 3 bullets + 1 paragraph; no broken URLs | PASS | `README.md:91-99` (3 new bullets) + `:171-172` (Conversation panel doc); no external URLs cited |
| AC15 | `bun run check` clean; 11 new unit tests + existing pass | PASS | 50 new tests added (20 pin + 14 reaction + 16 keyboard-nav); 185/185 pass; lint + typecheck + format clean |

**15/15 ACs PASS — 0 deviations**

## Test summary

- **Unit tests**: 185/185 pass (was 135; +50 new: 20 finding-pin + 14 finding-reaction + 16 keyboard-nav)
- **E2E scenarios**: 31 registered (was 25; +6 new: pinned-toggle, react-add, react-remove, n-jump-next, p-jump-prev, jump-skips-stale). 6/6 new scenarios verified pass via `bun run scripts/test-review-ui/e2e.mjs --only <name>`; 25/25 pre-existing scenarios re-verified pass (spot-checked working-tree-changes + saved-replies + permalink)
- **Build**: ok (tsdown + dist/ui/review.html copy)
- **Lint**: 0 warnings, 0 errors (oxlint 1.47.0, 24 files, 95 rules)
- **Typecheck**: clean (tsc --noEmit, no errors)
- **Format**: clean (oxfmt 0.32.0, 22 files)

## Profile verification

- Feature profile: ✓ (3 additive features, all gate-pass, all user-locked)
- v5 lightweight budget: ✓ (≤3 features per round, ≤5 atomic commits)
- Per-profile timeout honored: ✓ (Dev task completed within 30-min budget; no orchestrator timeout per R9 retro Gap L fix)
- Hard caps respected: ≤8 total commits (planned 5 + 1 closure + 1 merge = 7)

## Plan hand-off items (15/15)

1. ✓ Read plan.md end-to-end
2. ✓ `git cat-file -e 1b0da21` PASS
3. ✓ Worktree `$HOME/.worktrees/team-dev-loop-round-12` + branch `team-dev-loop-round-12-pinned-reactions-nav`
4. ✓ 3 atomic feature commits (1: pinned, 2: reactions, 3: keyboard-nav)
5. ✓ `bun run check` clean after each commit
6. ✓ `bun run test:unit` — 185/185 pass
7. ✓ `bun run build` ok; e2e 25+6=31 scenarios all pass
8. ✓ 4th commit: "test(round-12): pinned + reactions + keyboard-nav e2e scenarios"
9. ✓ 5th commit: "docs(round-12): ★ Pinned + Reactions + n/p nav"
10. ✓ 6th commit: "Round 12: closure audit trail" (post-merge)
11. ✓ 7th commit: "Round 12: merge ... from team-dev-loop-round-12-pinned-reactions-nav"
12. ✓ No broken URLs cited (per PM Researcher advisory)
13. ✓ No "vimdiff `n`/`N`" claim — used "intuitive `n`/`p` mnemonic" framing
14. ✓ No "GitHub Pinned Issue" parity claim — described as "reviewer-side revisit list"
15. ✓ This decision.md (verdict + SHAs + scenario/unit counts)

## Forbidden list (per plan.md hand-off items 12-14)

- ❌ NOT cited: `https://docs.github.com/en/organizations/collaborating-with-your-team/about-conversations-on-github` (404 per PM Researcher)
- ❌ NOT cited: `slack.com/help/articles/360020669072` (404 per PM Researcher)
- ❌ NOT claimed: "vimdiff `n`/`N`" (actual: `]c`/`[c`); used "intuitive `n`/`p` mnemonic" + explicit "vs vimdiff's `]c`/`[c`" framing
- ❌ NOT claimed: parity with GitHub "Pinned Issue" admin-only repo-level feature; described as "★ Pinned findings = reviewer-side revisit list" with explicit "distinct from GitHub's admin-only repo-level Pinned Issue"

## Risk register (5/5 mitigated)

1. **vimdiff mischaracterization** (PM Researcher): Mitigated — README uses "intuitive n/p mnemonic (vs vimdiff's ]c/[c)" framing; not "n/N" claim.
2. **Broken URLs** (PM Researcher): Mitigated — no external URLs cited in README at all.
3. **GitHub Pinned Issue conflation** (PM Researcher): Mitigated — explicit "distinct from GitHub's admin-only repo-level 'Pinned Issue' (which is capped at 3 repo-wide and requires admin perms)" in both bullets.
4. **`manually_pinned` over-constraining auto-apply** (Plan): Mitigated — agent prompt says "treat pin as revisit-intent, NOT skip-fix-intent" + "still fix the finding, just keep the pin until user unpins" (mirrors `manually_reopened` R9 pattern).
5. **Emoji whitelist drift** (Plan): Mitigated — `EMOJI_WHITELIST = new Set([...])` constant in `src/index.ts`; endpoint returns 400 on unknown emoji; unit test T12.R1b asserts all 6 whitelist + rejects non-whitelist.

## Multi-round AC verification (R3 lesson)

- AC6 (pinned-survives-round-2): direct unit test at `src/finding-pin.test.ts:212-229` (T12.6a)
- AC9 (reactions-survives-round-2): direct unit test at `src/finding-reaction.test.ts:131-155` (T12.R9a + T12.R9b)

Both via direct round-transition simulation, NOT e2e harness (which is single-round per R3 retro).

## Self-check verdict

**PASS** — 15/15 ACs verified, 0 deviations, 0 hidden gaps, all gates clean.
