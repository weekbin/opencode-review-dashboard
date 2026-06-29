# Plan — Round 11: Saved Replies /trigger + Per-finding permalinks

> **Date**: 2026-06-30 · **Lightweight round** (v5.2 lightweight mode first real-world validation)
> **Pre-check**: Baseline `f9ac43185187cca1140182d8b71f1edffd74ff60` verified. All 7 R10 SHAs verified (`8bc25b2 f9ac431 55737e5 c5fed23 3dfcfb4 643c5b8 4ef61de`).
> **Profile**: feature (LIGHTWEIGHT) · **GH issues**: #15 (Saved Replies /trigger) · #16 (Per-finding permalinks)
> **PM Researcher corrections applied**: #1 reframed to "typed-prefix /trigger" (GitHub has positional `Ctrl+.<number>`, not name-typed); #2 format is `#finding-<id>` element-id hash (Gerrit uses `#<linenumber>` line-number, we close a different gap).

## Goal
Ship 2 UX-velocity features: (1) Saved Replies `/trigger` typed-prefix expansion (R10 extension); (2) Per-finding permalink anchor (`#finding-<id>`) for shareable finding links. Validates v5.2 lightweight mode end-to-end.

## Round profile
- feature_count: 2 · bugfix_count: 0 · total: 2 · profile: feature (LIGHTWEIGHT) · Dev timeout: 30 min

## Acceptance Criteria

### #1 Saved Replies /trigger (R10 extension) — GH #15
- AC1.1: Typing `/<template-name>` in a comment textarea, then pressing **space** OR **tab** OR **Enter**, expands the template body in place (via existing `insertAtCursor` at `src/ui/app.ts:205`).
- AC1.2: `/trigger` only matches **exact** saved-reply names; unknown `/<name>` stays literal (no silent corruption).
- AC1.3: Expanded text is editable before submit (no lock-in). Click-to-insert dropdown (R10) still works.
- AC1.4: Trigger names are auto-slugified from template name (e.g., "Missing Err Handling" → `missing-err-handling`); no new schema field needed (backwards-compat: existing R10 saved replies use slugified `name`).
- AC1.5: Trigger fires on `/<chars>` followed by delimiter (space/tab/enter) — does **not** trigger on `/` alone, avoiding any future OpenCode slash-command conflict in the textarea.

### #2 Per-finding permalink (new) — GH #16
- AC2.1: Every finding card gets `id="finding-<finding.id>"` on render (Conversation + Previously discussed panels). Finding IDs are UUID-like, stable across rounds per `src/index.ts:319` `reconcile()`.
- AC2.2: Each finding card has a "Copy link" button that writes `window.location.origin + window.location.pathname + '#finding-' + id` to clipboard (reuse existing `navigator.clipboard.writeText` pattern at `src/ui/app.ts:1672`) + transient "✓ Copied" toast.
- AC2.3: Visiting `base-url#finding-<id>` auto-scrolls to the matching finding + adds a 1.5s flash-highlight class + expands the comment thread if collapsed. Cross-tab fallback: if the matching finding lives in the Previously discussed tab, auto-switch to that tab first.
- AC2.4: Graceful fallback when `#finding-<id>` doesn't match any current finding → toast "Finding not found — may have been resolved or URL is from a different round" + stay on default tab.
- AC2.5: Finding ID generation is stable across round transitions (verified by direct unit test on the ID-generation function with synthetic state — e2e harness cannot simulate round transitions).

## File changes

| File | Change | LOC est |
|---|---|---|
| `src/ui/app.ts` | /trigger parser on textarea onkeydown + Copy-link button per finding card + #finding-<id> scroll/highlight/cross-tab handler | ~180 |
| `src/ui/review.html` | Copy-link button markup + `id="finding-<id>"` attribute on finding card root + flash-highlight CSS keyframe | ~50 |
| `src/saved-replies.test.ts` | 3 new static-analysis tests for /trigger expansion (regex match, slug helper, no-trigger-on-bare-slash) | ~50 |
| `src/permalink.test.ts` (new) | 4 static-analysis tests for #finding-<id> (id attribute, clipboard payload, hash parser, cross-tab switch) | ~70 |
| `scripts/test-review-ui/scenarios.mjs` | 2 new e2e scenarios: `saved-replies-trigger` (#24) + `permalink` (#25) → 23→25 total | ~60 |
| `README.md` | Add Saved Replies /trigger + Per-finding permalinks sections (~10 lines each) + e2e count 23→25 | ~20 |
| **Total** | | **~430** |

## Implementation steps
1. Extend `src/ui/app.ts` with /trigger parser (keydown listener, exact-name match via `loadSavedReplies()`, integrate with `insertAtCursor`).
2. Add Copy-link button render path in `renderConversationPanel` + `renderPreviouslyDiscussedPanel` (both at `src/ui/app.ts:2073` / `:2528`) + `id="finding-<id>"` attribute on the card root.
3. Implement hash-scroll handler (`window.location.hash` parse → `scrollIntoView({behavior:'smooth',block:'center'})` + flash CSS class + cross-tab fallback).
4. Add flash-highlight CSS keyframe + Copy-link button styles in `src/ui/review.html`.
5. Write 3 new tests in `src/saved-replies.test.ts` (static-analysis pattern, follows existing R10 tests).
6. Write 4 new tests in `src/permalink.test.ts` (new file; same static-analysis pattern).
7. Add 2 e2e scenarios to `scripts/test-review-ui/scenarios.mjs` (saved-replies-trigger, permalink).
8. Update `README.md` with /trigger + permalink sections (frame #1 as "typed-prefix /trigger, not positional Ctrl+." per PM Researcher correction).
9. Run `bun run check && bun run test:unit && bun run scripts/test-review-ui/e2e.mjs && bun run build` — all clean.
10. Commit Phase A: `feat(saved-replies-trigger): /<name>+space/tab/enter expansion (close #15)`.
11. Commit Phase B: `feat(permalink): #finding-<id> anchor + Copy-link + scroll/highlight (close #16)`.
12. Commit Phase C: `test(round-11): /trigger + permalink e2e scenarios (24 + 25)`.
13. Commit Phase D: `docs(round-11): Saved Replies /trigger + Per-finding permalinks + e2e count 23→25`.

## Test plan
- **Unit**: 7 new tests (3 saved-replies trigger + 4 permalink) — static-analysis pattern on `src/ui/app.ts` source (R10 pattern).
- **E2E**: 2 new scenarios in `scripts/test-review-ui/scenarios.mjs` → 23→25 total.
- **Playwright walkthrough (Gap J)**: lead runs after Dev commits, verifies 0 console errors (Gap K).
- **Multi-round AC test-design (R3 lesson)**: AC2.5 (cross-round finding ID stability) = direct unit test on the ID-generation function with synthetic state, NOT e2e (harness can't simulate round transitions).

## Risk register
1. **/trigger regex collision with legitimate URL/symbol literals** — mitigation: only expand on `/<name>` where `name` is an exact saved-reply name AND followed by space/tab/enter; never on `/` alone.
2. **Clipboard API rejection on non-localhost** — mitigation: `document.execCommand('copy')` fallback for insecure contexts (already needed per brief).
3. **Finding ID stability across renders** — mitigation: `finding.id` is set at create time in `src/index.ts:319` `reconcile()` and persisted; static-analysis test AC2.5 verifies the attribute is sourced from `finding.id` (not index).
4. **E2E sweep timeout (R10 hit 120s)** — mitigation: v5.2 mock-server daemon (started once) + playwright-cli (v5.1) keep R11 fast; 2 new scenarios add ~10-20s.
5. **LIGHTWEIGHT mode budget claim (≤30 min Dev)** — mitigation: 2 atomic commits × ~15min each; both candidates are pure UI extension (no server, no schema, no agent prompt).

## Worker hand-off checklist
- [ ] Read all R11 artifacts in `.omo/round-11/` (planner-input, planner, brief, pm-manager-review, competitor-landscape, this plan).
- [ ] Verify `git rev-parse HEAD` = `f9ac43185187cca1140182d8b71f1edffd74ff60`.
- [ ] Create worktree `$HOME/.worktrees/team-dev-loop-round-11` per memory 372 (v5.3 P-fix).
- [ ] Implement Phase A: /trigger parser in `src/ui/app.ts` (textarea keydown → slug match → `insertAtCursor`).
- [ ] Implement Phase B: permalink (Copy-link button + `id="finding-<id>"` + hash-scroll + flash highlight).
- [ ] Write 3 unit tests in `src/saved-replies.test.ts` + 4 unit tests in new `src/permalink.test.ts` (static-analysis pattern).
- [ ] Add 2 e2e scenarios to `scripts/test-review-ui/scenarios.mjs` (#24 saved-replies-trigger, #25 permalink).
- [ ] Update `README.md`: Saved Replies /trigger section + Per-finding permalinks section + e2e count 23→25.
- [ ] Run `bun run check` (format:check + lint + typecheck) — 0 errors.
- [ ] Run `bun run test:unit` — all pass (existing + 7 new).
- [ ] Run `bun run scripts/test-review-ui/e2e.mjs` — all 25 pass.
- [ ] Run `bun run build` — clean dist output.
- [ ] Commit 4 atomic commits per plan (A → B → C → D).
- [ ] Push branch and report back to lead for Phase 2.5 audit + Phase 3-4.

## PM Researcher corrections incorporated
- **#1 framing**: README + plan state "typed-prefix /trigger" — NOT claim full uniqueness. GitHub has positional `Ctrl+.<number>`. Our contribution is name-typed expansion.
- **#2 format**: `#finding-<id>` element-id hash — NOT `#c<id>` (Gerrit's format is `#<linenumber>` line-number). Phabricator inline-comment permalinks remain community-knowledge-only; we use W3C-standard element-id hash.