# R15 Plan — Cmd+P file jumper + Submit confirm modal + Comments audit trail (3 R12-deferred features)

## Goal
Ship 3 R12-deferred features that R13 + R14 left on the table: Cmd+P file jumper (#26, 4/5), Submit confirm modal (#27, 3.5/5), Comments audit trail (#28, 3/5). All 3 are feature profile, additive only (no schema break for #1 + #2, additive optional `audit_log?: FindingAuditRow[]` for #3), no new dep. Profile = **feature**, 20-25 min Dev timeout per v5.3.3 subagent scope sizing. Worktree `$HOME/.worktrees/team-dev-loop-round-15`, branch `team-dev-loop-round-15-cmdp-submit-audit`. **v5.3.3 lead-direct model**: lead does 16/17 phases, subagent only does Phase 2 Dev (NO merge/push/issue close).

## Acceptance Criteria

Each AC classified: `[R1]` round-1 ground truth (e2e) · `[MR]` multi-round (direct unit test on round-transition helper) · `[PS]` payload-shape / static.

| AC | Tag | Description | Evidence target |
|---|---|---|---|
| **AC1** [R1] | Cmd+P trigger | `Cmd+P` / `Ctrl+P` global keydown opens fixed-top palette modal; capture-phase `preventDefault` (mirror R13 n/p nav + R13 in-diff search pattern); focus-guard via `isTextInputFocused` | `src/ui/app.ts:494-535` (existing keydown pattern) |
| **AC2** [R1] | Cmd+P palette content | Palette input filters `getOrderedFiles()` by substring (case-insensitive); shows up to 10 results with file path + matching substring highlight | `src/ui/app.ts:2530-2553` (`getOrderedFiles` + `filterByQuery`) |
| **AC3** [R1] | Cmd+P selection | Enter / click on result → `navigateToFile(filePath)` (scroll to file + flash highlight); Escape closes; arrows navigate up/down | `flashFindingPermaHighlight` at `src/ui/app.ts:329` |
| **AC4** [R1] | Submit modal trigger | Click "Submit Review" → modal opens with finding count + "Review N findings before submitting" copy; Cancel returns null; Confirm proceeds to existing `submit()` | `src/ui/app.ts:4569-4652` (existing submit handler) |
| **AC5** [R1] | Submit modal close behaviors | Click outside modal / Escape / Cancel → returns null; submit button stays as primary CTA in modal | R13 modal pattern at `src/ui/app.ts:1586-1725` |
| **AC6** [R1] | Audit trail trigger | Edit finding comment (or severity/category) via existing R10 Edit-in-place flow → preserve prior version as new FindingAuditRow | `src/index.ts:2145-2146` (existing `manually_edited` flag) |
| **AC7** [R1] | Audit trail storage | New `audit_log?: FindingAuditRow[]` field on `Finding` type (additive optional, default `[]`); `FindingAuditRow = { before: {...}, after: {...}, at: number, by: string }` | new field on `src/index.ts:66-90` |
| **AC8** [R1] | Audit trail rendering | Conversation panel renders audit rows in comment thread (collapsible "X edits" disclosure); each row shows `at: timestamp + before/after diff` | `src/ui/app.ts:3020` (`renderConversationPanel`) + new render code |
| **AC9** [R1] | Audit trail backwards-compat | Existing `state.json` files (R14 or earlier) load with `audit_log: []` default; no migration script needed | `Finding` type widening (optional field) |
| **AC10** [R1] | Agent prompt integration | Add "Audit trail (R15)" honor directive mirroring R13's "Manually-reopened" + "Resolution-kind" patterns; agent sees prior edit history and respects user's final intent | `src/index.ts:1536-1513` (append new block) |
| **AC11** [PS] | `FindingAuditRow` type shared | Defined ONCE in `src/index.ts` next to existing `FindingResolutionKind` (NO new `src/constants.ts` per v5.3.3 + R12 patch Gap #11) | `src/index.ts:55-56` (extend type table) |
| **AC12** [PS] | All 3 features additive | Old `state.json` files (R14 or earlier) load without errors; existing 250 unit tests + 33 e2e scenarios all PASS | `Finding` type widening check |

**Multi-round AC confirmation**: All 12 are `[R1]` (round-1 ground truth) or `[PS]` (payload-shape static). No multi-round ACs need round-transition helper direct unit tests (audit trail is a single-round schema addition, not a multi-round state assertion).

## File changes (5 files)

| File | Change |
|---|---|
| `src/index.ts` | Add `FindingAuditRow` type at `:55-56`; extend `Finding` with `audit_log?: FindingAuditRow[]` at `:80-90`; add audit row creation in `editFinding` at `:2145-2146`; add agent prompt honor directive at `:1536-1513` |
| `src/ui/app.ts` | Add Cmd+P keydown listener + palette modal + file jump (AC1-3, ~50 LOC); add Submit confirm modal + pre-submit hook (AC4-5, ~30 LOC); add audit trail rendering in `renderConversationPanel` (AC8, ~50 LOC). Total ~130 LOC |
| `src/ui/review.html` | Add `.cmd-p-palette` + `.submit-confirm-modal` + `.audit-trail-row` CSS |
| `README.md` | +3 bullets in "Other shipped features" (Cmd+P, Submit confirm, Audit trail) + 1 keyboard-shortcut tip |
| `src/r15-features.test.ts` (NEW) | 12 unit tests covering AC1-AC12 |

## Implementation steps (10 steps, 1 action per step)

1. Read `.omo/round-15/plan.md` (this file) FIRST.
2. Worktree: `$HOME/.worktrees/team-dev-loop-round-15`; branch `team-dev-loop-round-15-cmdp-submit-audit`; baseline `c3a6aea`.
3. **#26 Cmd+P**: add global keydown listener at `src/ui/app.ts:494` + Cmd+P palette modal + filter result list + Enter/Escape/arrows + jump-to-file action. Reuse `flashFindingPermaHighlight` at `:329`.
4. **#27 Submit confirm**: wrap `submitButton.click` handler at `src/ui/app.ts:4652` with modal opening; if modal confirms → existing `submit()` proceeds; else null. Reuse R13 modal pattern at `:1586-1725`.
5. **#28 Audit trail (server)**: add `FindingAuditRow` type at `src/index.ts:55-56`; extend `Finding` with `audit_log?: FindingAuditRow[]` at `:80-90`; in `editFinding` handler at `:2145-2146`, push prior values to `audit_log` before applying edits.
6. **#28 Audit trail (UI)**: in `renderConversationPanel` at `src/ui/app.ts:3020`, render audit rows after each comment with collapsible disclosure showing `at: timestamp + before/after diff`. R10's `manually_edited` flag → renders "X edits" disclosure.
7. **Agent prompt**: append "Audit trail (R15)" honor directive at `src/index.ts:1536-1513` mirroring R13's "Manually-reopened" + "Resolution-kind" patterns.
8. **CSS**: add `.cmd-p-palette` + `.submit-confirm-modal` + `.audit-trail-row` styles in `src/ui/review.html`.
9. **Test**: write `src/r15-features.test.ts` with 12 unit tests (AC1-AC12 + 2 defense-in-depth).
10. **Verify**: `bun run check && bun run build && bun test` all PASS.

## Test plan (unit + e2e)

**Unit (12 new tests in `src/r15-features.test.ts`)**:

- AC1: Cmd+P keydown opens palette (test: dispatch keydown event, verify palette visible)
- AC2: Cmd+P filters files by substring (test: input "featu", verify result list filters)
- AC3: Cmd+P selection jumps to file (test: select result, verify `navigateToFile` called + flash highlight)
- AC4: Submit modal opens with finding count (test: click Submit, verify modal + count text)
- AC5: Submit modal close behaviors (test: 3 close paths — click outside / Escape / Cancel)
- AC6: Edit triggers audit row creation (test: edit finding, verify `audit_log` length +1)
- AC7: FindingAuditRow shape (test: type validation, before/after/at/by fields)
- AC8: Audit trail rendering (test: finding with audit_log, verify UI renders disclosure)
- AC9: Backwards-compat (test: load state.json WITHOUT audit_log, verify default `[]`)
- AC10: Agent prompt integration (test: agent prompt contains "Audit trail" directive + R15 reference)
- AC11: FindingAuditRow shared (test: import path, no constants.ts)
- AC12: All 3 features additive (defense-in-depth: load R14 state.json, verify all 250 existing tests + 12 new all PASS)

**E2e (0 new — UI polish candidates)**: 33 existing scenarios must pass (regression check). R15 has no new e2e (mirrors R14 plan hand-off item 8 — UI-only features). Lead verifies all 33 existing + 0 new at Phase 2.5 audit.

## Risk register (5 risks)

1. **Cmd+P palette intercepts Ctrl+F browser find** — mitigation: focus-guard via `isTextInputFocused` (mirrors R13 in-diff search SG.6 patch); palette opens only when no input/textarea focused. If user wants native browser find, press Ctrl+F twice (once closes palette, second opens native).
2. **Submit modal adds friction to power users** — mitigation: allow `Enter` (default confirm) + `Escape` (cancel) + click outside (cancel); users can confirm with single Enter press.
3. **Audit log grows unbounded over many edits** — mitigation: cap `audit_log` length at 10 most recent rows; older rows archived (not deleted, just hidden via disclosure). R+ can revisit if user reports issues.
4. **`FindingAuditRow` schema-touching might break R12+R13+R14 existing state.json files** — mitigation: type is `audit_log?: FindingAuditRow[]` (optional, default `[]`). Backwards-compat: existing `state.json` files load with `audit_log: []` (no migration script).
5. **R+ v5.3.3 mid-task check-in might cancel Dev subagent at t=20 if it's making real progress on #3 audit trail** — mitigation: lead checks `git -C $worktree log --oneline -5` at t=20; if 2+ commits present, lead only cancels if no tests passing.

## Worker hand-off checklist (12 items)

1. Read `.omo/round-15/plan.md` (this file) FIRST.
2. Worktree: `$HOME/.worktrees/team-dev-loop-round-15`; branch `team-dev-loop-round-15-cmdp-submit-audit`; baseline `c3a6aea` (R14 closure + v5.3.3 patches).
3. **#26 Cmd+P**: global keydown listener at `src/ui/app.ts:494-535` (R12 n/p pattern); palette modal HTML in `src/ui/review.html`; reuse `flashFindingPermaHighlight:329` for jump highlight. **NO merge/push/gh issue close** — those are lead's.
4. **#27 Submit confirm**: wrap `submitButton.click` at `src/ui/app.ts:4652`; modal with finding count + "Review N findings before submitting" copy; reuse R13 modal pattern at `:1586-1725`. **NO merge/push.**
5. **#28 Audit trail (server)**: `FindingAuditRow` type at `src/index.ts:55-56`; `Finding.audit_log?` at `:80-90`; `editFinding` at `:2145-2146` pushes prior values before applying.
6. **#28 Audit trail (UI)**: `renderConversationPanel` at `src/ui/app.ts:3020`; render audit rows in comment thread with collapsible "X edits" disclosure.
7. **Agent prompt**: append "Audit trail (R15)" honor directive at `src/index.ts:1536-1513` (mirror R13 pattern).
8. **CSS**: add 3 new selectors in `src/ui/review.html`.
9. **Test**: write `src/r15-features.test.ts` with 12 unit tests (AC1-AC12 + 2 defense-in-depth).
10. **Verify**: `bun run check && bun run build && bun test` all PASS (12 new + 250 existing = 262 total).
11. **Atomic commits**: 3 commits + 1 test commit + 1 docs commit. Use `close #26, close #27, close #28` syntax in commit messages. **DO NOT merge/push** — lead takes over Phase 2.6.
12. **Forbidden**: do NOT create `src/constants.ts`; do NOT claim any count without `wc -l`; do NOT touch merge/push; do NOT skip `bun run check` between commits.

## Multi-round AC confirmation

All 12 R15 ACs are `[R1]` (round-1 ground truth) or `[PS]` (payload-shape static). No multi-round ACs require direct unit tests on round-transition helpers. Audit trail is a single-round schema addition (additive optional field) — not a multi-round state assertion.
