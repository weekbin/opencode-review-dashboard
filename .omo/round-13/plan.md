# R13 Plan — In-diff search + Resolve-with-reason + Mark as wontfix

## Goal
Ship 3 additive accountability + navigation features (closes Phabricator / GitLab / Jira / diff.nvim / Gerrit gaps per `brief.md ## Competitor analysis`): candidate_3_in_diff_search (#22, GH#22), candidate_1_resolve_with_reason (#20, GH#20), candidate_2_mark_as_wontfix (#21, GH#21). All 3 reuse existing R9/R11/R12 patterns (no install-new-dep, no breaking schema contract).

## Acceptance Criteria

| AC | Tag | Description | Source evidence |
|---|---|---|---|
| AC1 | R1 | Click "Resolve" on open finding opens modal w/ 4 quick-reason chips + textarea; Cancel returns null; Confirm posts `{finding_id, reason}` | `src/ui/app.ts:1120-1159` (`showReopenReasonModal`) mirror |
| AC2 | R1 | Server `/resolve` accepts optional `reason?: string` (max 200); sets `resolve_reason + manually_resolved + resolved_at`; **old `POST {finding_id}` (no reason) still works** | additive to `src/index.ts:1798-1830`; R9 reopen pattern at `src/index.ts:3277` |
| AC3 | R1 | New "Mark as wontfix" button (secondary style) renders next to "Resolve" on open findings; opens modal with 4 radio buttons (wontfix/out_of_scope/false_positive/duplicate) + optional reason | append at `src/ui/app.ts:2528-2535` |
| AC4 | R1 | Server `/resolve` accepts optional `resolution_kind?: FindingResolutionKind` + `resolution_reason?: string`; **400 on unknown enum value** (mirrors `EMOJI_WHITELIST`); finding gets `resolution_kind + resolution_reason`; `status` stays `"resolved"` | `src/index.ts:40-42` + `src/index.ts:2161-2168` pattern |
| AC5 | R1 | Conversation panel renders `<span class="badge badge-resolution-{{kind}}">` next to existing badges | append at `src/ui/app.ts:2649-2661` (`badgesRow.innerHTML`) |
| AC6 | R1 | `Cmd+F` / `Ctrl+F` / `/` global keydown opens fixed-top search overlay; capture-phase `preventDefault` (mirrors browser-native interception); overlay input filters diff lines (substring, case-insensitive) | `src/ui/app.ts:439-450` n/p nav keydown listener pattern |
| AC7 | R1 | Counter shows "N matches"; Enter/Shift+Enter/F3/Shift+F3 jumps next/prev with 1.5s flash highlight; Escape clears | reuses `flashFindingPermaHighlight` at `src/ui/app.ts:329` |
| AC8 | R1 | `/` key skipped when `<textarea>`/`<input>`/contentEditable focused (reuses `isTextInputFocused` at `src/ui/app.ts:429-437`) | R12 n/p nav focus-guard mirror |
| AC9 | R1 | Match-finding iterates `[data-line-number]` inside `.card[data-file]`; wraps match in `<mark class="diff-search-match">` | `src/ui/app.ts:3550-3563` `flashLine` selector reference |
| AC10 | R1 | sessionStorage persists last query across reloads (try/catch wrapped; NOT localStorage — diff is round-scoped) | try/catch mirrors `readStored/writeStored` at `src/ui/app.ts:133-149` |
| AC11 | PS | Shared `FindingResolutionKind` exported type defined ONCE in `src/index.ts` (next to `Finding` at `src/index.ts:50-74`); both #20 and #21 import it | no `src/constants.ts` exists — keep inline per existing `ReactionEmoji` style at `src/index.ts:34` |
| AC12 | PS | Agent prompt at `src/index.ts:1496-1511` gets TWO parallel honor-directive blocks: "Manually-resolved (R13)" + "Resolution-kind (R13)"; wording parallels existing `### Manually-reopened findings` | pattern at `src/index.ts:1496-1502` |
| AC13 | PS | All 3 features additive only — old `state.json` files (R12 or earlier) load without errors; no required new fields | `Finding` type widening check at `src/index.ts:50-74` |
| AC14 | PS | 3 e2e scenarios appended to `scripts/test-review-ui/scenarios.mjs` (`resolve-with-reason`, `mark-as-wontfix`, `in-diff-search`); follow `setupJumpSkipsStale` template at line 616 | current count = 30 (`grep -c "^  \"[a-zA-Z0-9-]\+\": { setup"`) |
| AC15 | PS | README "Other shipped features" gets 3 new bullets; mentions "resolve with reason", "mark as wontfix", "in-diff search"; `Ctrl+F` / `/` shortcut listed in usage | `README.md` "Other shipped features" block |

(15 ACs total — all R1 round-1 ground-truth (verifiable in single e2e run) or PS payload-shape/stash-on-setupInfo; **no MR multi-round ACs** since #20/#21/#22 are atomic scope additions whose state is read in same round. R12 patch Gap #7 amended applied.)

## File changes
| File | Change |
|---|---|
| `src/index.ts` | + `FindingResolutionKind` type union next to `Finding:50-74`; extend `POST /resolve` at `:1798` to accept `reason?` + `resolution_kind?` + `resolution_reason?` with 400 enum validation mirroring `:2161-2168`; append 2 agent-prompt honor directives at `:1496-1511` |
| `src/ui/app.ts` | + `showResolveReasonModal` (mirror `:1120-1159`); + `showMarkAsWontfixModal`; extend `resolveFinding:3252` signature to accept `{reason?, resolution_kind?, resolution_reason?}`; + "Mark as wontfix" button at `:2528-2535`; + resolution-kind badge append at `:2649-2661`; + `openInDiffSearch` + global keydown listener (mirror `:439-450`); + `<mark>` highlight + counter + Enter/Escape handlers; + fixed-top overlay DOM in `renderDiffPanel:3112` |
| `src/ui/review.html` | + `.diff-search-bar` + `.diff-search-match` CSS (small, ~15 LOC); optional dropdown helper markup |
| `scripts/test-review-ui/scenarios.mjs` | + 3 e2e scenarios (`resolve-with-reason`, `mark-as-wontfix`, `in-diff-search`) following `setupJumpSkipsStale:616` template |
| `README.md` | + 3 bullets in "Other shipped features"; + keyboard shortcut note in usage |

(5 files. Total est LOC: 305-470 per Planner's ## Scope selected.)

## Implementation steps
1. **Pre-flight**: `wc -l src/ui/app.ts src/index.ts src/ui/review.html scripts/test-review-ui/scenarios.mjs`; record baseline (3993/2416/2284/622 — verify against source).
2. **Constants/type extraction**: define `FindingResolutionKind = "wontfix" | "out_of_scope" | "false_positive" | "duplicate"` in `src/index.ts` (inline next to `Finding`, no new file).
3. **#20 backend**: extend `POST /resolve` at `src/index.ts:1798` — add `reason?`, `resolution_kind?`, `resolution_reason?` fields; 400 on `reason` >200 chars + unknown enum (mirror EMOJI_WHITELIST).
4. **#20 frontend**: implement `showResolveReasonModal` mirroring `showReopenReasonModal:1120-1159`; modify Resolve button at `:2528-2535` to await modal first; update `resolveFinding:3252` to forward optional reason.
5. **#21 frontend**: implement `showMarkAsWontfixModal`; add "Mark as wontfix" sibling button at `:2528-2535`; append `resolution_kind` badge to `badgesRow:2649-2661`.
6. **#22 overlay**: add fixed-top `.diff-search-bar` DOM at top of `#diffs`; CSS for active-match + `<mark>` highlight.
7. **#22 search**: implement `findMatchesInDiff(query)` iterating `[data-line-number]` inside `.card[data-file]`; substring case-insensitive; cap at 100 matches with "100+ matches, refine your query" notice.
8. **#22 keyboard**: capture-phase `keydown` listener (mirror `:439-450`) intercepting `Cmd+F`/`Ctrl+F`/`/`; reuse `isTextInputFocused:429-437` for `/` focus-guard.
9. **#22 navigation**: Enter/Shift+Enter/F3/Shift+F3 calls `flashFindingPermaHighlight` analog on `[data-line-number]`; Escape closes overlay + removes `<mark>` wrappers.
10. **#22 persistence**: sessionStorage `getItem`/`setItem` wrapped in try/catch (mirror `readStored/writeStored:133-149`); never localStorage.
11. **Agent prompt**: append 2 parallel honor directives at `src/index.ts:1496-1511` — "Manually-resolved" + "Resolution-kind", wording parallel to existing `Manually-reopened`.
12. **e2e scenarios**: append 3 entries to `scenarios.mjs` SCENARIOS map (after `jump-skips-stale:481`); each is a 1-commit setup with `expect: { kind: "working-tree" }` matching the R12 R19 template.
13. **Docs**: README "Other shipped features" gets 3 new bullets; keyboard shortcuts block mentions `Ctrl+F` / `/` for in-diff search.
14. **Verify**: `bun run check && bun run build && bun run test:unit && bun run scripts/test-review-ui/e2e.mjs`; spot-check `wc -l` post-change to log in `.omo/round-13/dev-report.md`.

## Test plan

**Unit** (`bun test src/`):
- 4 for #20: resolve with reason persists; resolve without reason (backwards-compat); quick-reason chip pre-fills; modal Cancel returns null + status unchanged.
- 4 for #21: mark-as-wontfix with kind persists; 400 on unknown enum; badge renders for each kind; state.json reload preserves kind.
- 4 for #22: substring match across multi-file; case-insensitive match; Enter next / Shift+Enter prev navigation; Escape clears `<mark>`.

**E2e** (`scripts/test-review-ui/e2e.mjs --only <name>`): 3 new scenarios, one per feature. Runtime UI verification (modal render, badge appearance, overlay open/close, match highlight) via Playwright walkthrough per `review-dashboard-ui-test` skill — same R12 R19 pattern.

## Risk register
1. **#21 additive `resolution_kind` field could trip naive parsers** — mitigation: type as `?: FindingResolutionKind`; exhaustive undefined default in any future filter chip logic.
2. **#22 capture-phase `preventDefault()` blocks users wanting native Ctrl+F** — mitigation: focus-guard (`isTextInputFocused`) lets native find fire when textarea/input focused; offer `/` as fallback shortcut.
3. **#22 sessionStorage quota / private-mode quirks** — mitigation: try/catch wrap mirroring `readStored/writeStored:133-149`; falls back to in-memory only on error.
4. **#20 agent-prompt integration misinterpretation** — mitigation: append parallel `### Manually-resolved (R13)` block mirroring exact `### Manually-reopened (R9)` wording shape at `src/index.ts:1496-1502`; no reordering of existing directives.
5. **Doc side-file drift (R12 retro Gap 3 / SG.1)** — mitigation: explicit pre-flight + post-commit `wc -l src/ui/app.ts src/index.ts src/ui/review.html` + `grep -c "^  \"[a-zA-Z0-9-]\+\": { setup" scripts/test-review-ui/scenarios.mjs` checks in hand-off; baseline numbers (3993/2416/2284/30 entries) cited in hand-off item 11.

## Worker hand-off checklist
1. Read `.omo/round-13/plan.md` (this file) FIRST.
2. Worktree: `$HOME/.worktrees/team-dev-loop-round-13`; branch: `team-dev-loop-round-13-in-diff-resolve-wontfix`; baseline `5cc6cc2`.
3. **#20**: mirror `showReopenReasonModal` at `src/ui/app.ts:1120-1159` EXACTLY — same modal-overlay + dialog markup, same Cmd+Enter-submit pattern, same 200-char reason slice at `:3277`.
4. **Shared enum**: define `FindingResolutionKind` ONCE inline in `src/index.ts` next to `Finding:50-74` (no new `src/constants.ts` file — style consistent with `ReactionEmoji:34`).
5. **#21**: 400 enum validation mirrors `EMOJI_WHITELIST` at `src/index.ts:40-42, 2161-2168` — same error-message shape with allowed-values list.
6. **#22**: reuse `isTextInputFocused:429-437` for `/` focus-guard (do NOT write a new helper).
7. **#22**: reuse `flashFindingPermaHighlight:329` scrollIntoView + 1.5s flash pattern for match jump (do NOT write a new flash helper).
8. **#22**: sessionStorage wrapped in try/catch mirroring `readStored/writeStored:133-149` (NOT localStorage).
9. **Agent prompt** at `src/index.ts:1496-1511`: append TWO parallel `### Manually-resolved (R13)` + `### Resolution-kind (R13)` blocks; do NOT reorder existing `Manually-reopened` / `Manually-edited` / `Manually-pinned`.
10. **3 e2e scenarios**: append after `jump-skips-stale:481` in `scenarios.mjs` — `resolve-with-reason`, `mark-as-wontfix`, `in-diff-search`; each 1-commit setup with `expect: { kind: "working-tree" }`.
11. **MANDATORY pre-commit verify**: `wc -l src/ui/app.ts src/index.ts src/ui/review.html scripts/test-review-ui/scenarios.mjs` (baseline 3993/2416/2284/622) + `grep -c "^  \"[a-zA-Z0-9-]\+\": { setup" scripts/test-review-ui/scenarios.mjs` (baseline 30). Log post-change counts in `.omo/round-13/dev-report.md`. (R12 retro Gap 3 / SG.1)
12. **README**: 3 new bullets in "Other shipped features"; mention `Ctrl+F` / `/` shortcut in usage block.
13. **Verify**: `bun run check && bun run build && bun run test:unit && bun run scripts/test-review-ui/e2e.mjs` all PASS before merge commit.
14. **Audit trail**: write `.omo/round-13/dev-report.md` + `.omo/round-13/test-report.md` + `.omo/round-13/post-exec-analysis.md` (mirror R12 closure pattern at `d17addb`).
15. **Commit msg**: `feat(r13): resolve-with-reason + mark-as-wontfix + in-diff-search (close #20, close #21, close #22)`.

## Multi-round AC confirmation
**0 multi-round ACs.** All 15 ACs classify as either R1 (round-1 ground truth, verifiable in single e2e run via mock-server + Playwright walkthrough) or PS (payload-shape / static). Per R12 patch Gap #7 amended, no MR-classified ACs exist because the 3 features are atomic scope additions whose persistence is verified in same round via state.json stash-on-setupInfo before cleanup. No `format()` round-transition helper exists for these features (the multi-round state-machine lives in `src/index.ts` saveState / loadState, not in a pure function unit-testable). All e2e scenarios are single-round (`{ kind: "working-tree" }`), so multi-round ACs are structurally impossible to verify e2e — and none are designed.