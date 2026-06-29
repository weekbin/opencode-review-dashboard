# Round 5 Plan — Architecture Profile

> **Date**: 2026-06-29
> **Architect**: Round 5 Architect (Sisyphus-Junior, fresh subagent)
> **Profile**: architecture (Rule 1: U_behavior_shift=yes)
> **Bundle**: #7 + #8 + #9 (user-picked option 3)
> **Scope-relaxation**: Layer 1 cap (300 LOC / 3 src files) RELAXED to ~400-600 LOC / 3 src files per user explicit override
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-5-bundle-3-issues` (R3 path-templating fix: `$HOME`, not absolute path)
> **Branch**: `team-dev-loop-round-5-bundle-3-issues`
> **Baseline**: main HEAD `a3f04aa` (5 skill-patch commits since R4 merge `6c87b43`)

---

## 1. Goal

Round 5 ships **one coherent UX pass** on `/diff-review-dashboard` that closes three flow-level frictions a developer hits in the "30 seconds after I edited code" window:

1. **See every file I just touched** — including never-staged untracked files — in the diff page, so a developer who creates `src/foo.ts` and opens the review UI sees it as a new file with its content (sub-candidate #7).
2. **Review + write notes + submit in 1 click** — the drawer becomes findings-only; round-level notes live in an always-visible notes surface; the header's existing `Submit Review` button is the single terminal action (sub-candidate #8).
3. **Get agent replies in my language** — the auto-apply agent's prompt gains a "Language Matching" section + a `detectLanguage()` heuristic, so a Chinese-speaking developer writes Chinese findings and gets Chinese replies (sub-candidate #9).

Together they form a single coherent UX pass: the developer edits → opens the UI → sees the new file (#7) → writes notes while reviewing (#8) → submits in one click (#8) → reads agent reply in their language (#9). None of the three sub-candidates touch each other's core code paths — #7 and #9 both edit `src/index.ts` but at non-overlapping functions (`collectWorking`/`stats`/`names` at L922-1113 vs. agent prompt at L1408-1462 vs. `FindingComment` at L21-26); #8 is UI-only in `src/ui/review.html` + `src/ui/app.ts`. The PM Triage's 3 premise corrections (see brief §Self-Critique at `.omo/round-5/brief.md:142-151`) are the source of truth — the original issue bodies (#7's "collectMerged only invokes git diff" claim, #8's "Submit Review buried in drawer" claim, #9's off line numbers) are **rejected**.

---

## 2. Acceptance Criteria

Per `.opencode/skills/team-dev-loop/references/loop-decision.md:188-196` ("Multi-round AC test-design rule"), all 3 sub-candidates carry multi-round aspects — direct unit tests on changed functions with synthetic input, NOT 2-round e2e.

### Sub-candidate #7 ACs (Untracked files appear in diff page)

The PM Triage correction at `.omo/round-5/brief.md:51-55` established that `names()` at `src/index.ts:934` already runs `git ls-files --others --exclude-standard`; the actual bug surface is at `stats()` at `:952-972` (only runs `git diff --numstat HEAD` which excludes untracked) OR a render-layer assumption that committed-file status always exists. **AC7-1 / AC7-2 are the reproduction gates** — Dev MUST verify the actual user-visible failure mode matches before applying any fix.

- **AC7-1** [unit-test, multi-round]: Given a working tree with 1 untracked file `src/__test_untracked.ts` containing `console.log("hello")\nconsole.log("world")\n` (2 lines), when `collectWorking(root, dir)` is called, then the returned array includes that file with `status: "added"` and `after` matching the file content. Test file: `src/untracked-files.test.ts` (NEW). Asserts the existing fallback at `src/index.ts:1103` (`prev ? Math.max(0, count(next) - count(prev)) : count(next)`) does the right thing for untracked (prev = `""`, so additions = `count(next)`).
- **AC7-2** [unit-test, multi-round]: Given the same untracked file, when `collectWorking()` returns the file, then `additions === 2` and `deletions === 0`. Test file: `src/untracked-files.test.ts` (NEW). Same synthetic setup as AC7-1.
- **AC7-3** [unit-test, regression]: Given a working tree with 0 untracked files (only modified tracked files), `collectWorking()` returns the same array as on main (no behavior change). Test file: `src/untracked-files.test.ts` (NEW).
- **AC7-4** [unit-test, regression]: Given an untracked file `src/dist/should-ignore.js` inside a `.gitignore`-listed directory, `collectWorking()` does NOT include it. The existing `git ls-files --others --exclude-standard` at `src/index.ts:934` already respects `.gitignore` via the `--exclude-standard` flag — AC7-4 verifies this contract is preserved (no regression to `.gitignore` semantics). Test file: `src/untracked-files.test.ts` (NEW).
- **AC7-5** [e2e, regression]: All existing 10 e2e scenarios in `scripts/test-review-ui/scenarios.mjs` continue to pass after the #7 fix. No DOM-side assumptions change for #7 — only `collectWorking()` is touched.
- **AC7-6** [unit-test, structural]: The `__test` export at `src/index.ts:2098-2102` is extended to expose `collectWorking`, `names`, and `stats` (or the equivalent set Dev identifies as the minimal export needed for #7's tests). Dev documents which helpers are added to `__test` and why.

### Sub-candidate #8 ACs (Drawer refactor: notes always-visible + header Submit)

PM Triage verified at `.omo/round-5/brief.md:69-71` that Submit Review button is already at `src/ui/review.html:1690-1697` in the header (not in the drawer). The real pain is `src/ui/review.html:1818-1819` notes textarea being hidden in the drawer. Dev MUST re-validate with a Playwright walkthrough per the brief's instruction at `.omo/round-5/brief.md:80` before designing the fix.

- **AC8-1** [unit-test, structural]: `state.notes` (declared at `src/ui/app.ts:355`) is bound to a NEW always-visible textarea element (the OLD `notesRoot = document.querySelector("#notes")` reference at `src/ui/app.ts:324` may be replaced or co-exist, but the binding source must be the new surface). Verify by inspecting `app.ts` after the refactor — the new surface has a stable `data-testid` like `notes-surface` so e2e can target it.
- **AC8-2** [e2e]: When the drawer is closed (default state on page load — drawer-toggle off, drawer is overlay hidden), the notes textarea is still visible and editable. New e2e scenario `notes-always-visible` in `scripts/test-review-ui/scenarios.mjs`: load UI, assert `#notes` (or the new selector) is in the DOM and visible; type text, assert text appears; close drawer, assert text still visible.
- **AC8-3** [e2e]: The drawer contains ONLY finding fields (category select, severity select, comment textarea, Clear + Add Finding buttons, findings list `<div id="findings">`, status `<div id="status">`) — NO notes textarea, NO Submit button. New e2e scenario `drawer-is-findings-only`: open drawer, assert no element matching `#notes` inside `#drawer`, no element matching `#submit` inside `#drawer`.
- **AC8-4** [e2e]: The header's `Submit Review` button at `src/ui/review.html:1690-1697` is the ONLY submit action; clicking it submits the round with current `state.notes`. New e2e scenario `header-submit-only`: type into the new notes surface, click `#submit`, assert the round is submitted and `state.notes` flows through `draftPayload()` at `src/ui/app.ts:2430`.
- **AC8-5** [e2e, regression]: All existing 10 e2e scenarios pass after the drawer refactor. Specifically verify (a) 3-status filter (`setConversationFilter` at `src/ui/app.ts:499-506`) still works, (b) finding-add flow (addFinding at `src/ui/app.ts:2470+`) still works, (c) `#submit` click still works (per AC8-4).
- **AC8-6** [unit-test, snapshot]: `src/ui/review.html` drawer block (originally `src/ui/review.html:1776-1827`) does NOT contain `<textarea id="notes">` or `<button id="submit">` after the refactor. Existing DOM-snapshot test pattern (mirror of `src/prior-notes.test.ts:243-249` for the "Previously discussed" tab).

### Sub-candidate #9 ACs (Agent language matching)

PM Triage verified at `.omo/round-5/brief.md:142-145` that the agent prompt has no language directive; line numbers in the issue are off (actual prompt at `src/index.ts:1408-1462`, `add_review_comment` at `:2043`, `FindingComment` at `:21-26`).

- **AC9-1** [unit-test]: `detectLanguage("这个 auth middleware 应该用 jwt.verify")` returns `"zh-CN"` (CJK ratio > 30% threshold).
- **AC9-2** [unit-test]: `detectLanguage("Please use jwt.verify instead of jwt.decode")` returns `"en"` (CJK ratio < 10% threshold).
- **AC9-3** [unit-test]: `detectLanguage("这个 magic number 25 should be a const")` returns `"mixed"` (CJK ratio between 10-30% threshold — document the threshold in `detectLanguage()` docstring).
- **AC9-4** [unit-test]: `detectLanguage("")` returns `"en"` (default fallback for empty/whitespace input — agent defaults to English as today).
- **AC9-5** [unit-test, structural]: The agent prompt template (`src/index.ts:1409-1462`) contains a new `### Language Matching` section (or equivalent directive heading) within the first 25 lines of the prompt body. Test reads `src/index.ts`, extracts the `template: [...]` array, joins with `\n`, asserts the joined text contains the directive. Test file: `src/language-detect.test.ts` (NEW) or extend `src/agent-prompt.test.ts` (NEW — see File Changes §3).
- **AC9-6** [unit-test]: `__test` export at `src/index.ts:2098-2102` is extended to expose `detectLanguage` for unit testing.
- **AC9-7** [manual, documented in README]: Visual verification — when a user posts 1 Chinese finding and triggers the auto-apply loop, the agent's reply (via `add_review_comment`) is in Chinese. **Out of e2e harness scope** (real OpenCode session required, mock context `$ = {}` cannot drive a real agent). README documents the manual verification step under "Auto-apply workflow" section.

### R4 audit-trail regression (carried-in invariant)

- **AC10** [unit-test, regression]: `src/prior-notes.test.ts:180-238` (R4 AC9 snapshot test — `T5.1`) still passes. **R5 must NOT add a new required field to `Finding` or `State` types** at `src/index.ts:21-79`. An OPTIONAL `lang?: string` on `FindingComment` (line 21-26) is allowed (additive) but **not required** for the bundle — Plan chooses to NOT add it (pure prompt update path, lower risk). If Dev identifies a strong need for it, surface to Lead for re-decision.

---

## 3. File changes

LOC estimates below are inclusive of test code; production LOC budget is the headline number per file. Total estimated: ~520-800 LOC across 3 production files + 2 new test files + 1 e2e scenario update + 2 README updates. Within the user's relaxed Layer 1 cap (400-600 LOC production) with ~50% margin for #8's DOM-surgery overrun.

### `src/index.ts` (sub-candidates #7 + #9)

- **#7 — Untracked-file stats + path (NEW)**. After reproducing the actual failure (Step 2 in §4), apply one of:
  - **Option A (preferred)**: Extend `stats()` at `src/index.ts:952-972` to also call `git ls-files --others --exclude-standard` and populate the stats map with `additions = lineCount, deletions = 0` for each untracked file. Then no change needed to `collectWorking()` — the fallback at `:1103` (`prev ? Math.max(0, count(next) - count(prev)) : count(next)`) already handles the case where `stat?.additions` is undefined. ~25 LOC.
  - **Option B (fallback if Option A breaks something)**: Leave `stats()` alone but ensure `collectWorking()` at `:1072-1113` does NOT depend on `stat?.additions` for untracked files — the existing fallback at `:1103` already handles this for `prev === ""`. Dev may need to add an explicit `additions: count(next), deletions: 0` override inside the `map(listed.files).` step for untracked-only detection. ~10-15 LOC.
  - **Decision rule for Dev**: try Option A first (smaller diff, single function); fall back to Option B if integration test reveals a downstream consumer (e.g. the UI's file-card renders) needs explicit `additions > 0` for untracked.
- **#9 — `detectLanguage()` helper + `__test` export (NEW)**. Add a new top-level helper `detectLanguage(text: string): "zh-CN" | "en" | "mixed"` near the existing `count()` at `src/index.ts:621`. Logic: count CJK characters (`text.match(/[\u4e00-\u9fff]/g)?.length ?? 0`), divide by max(text.length, 1), bucket as `> 0.3 → "zh-CN"`, `< 0.1 → "en"`, else `"mixed"`. Empty/whitespace input → `"en"` (fallback). ~20 LOC + 10 LOC for the threshold constants in a comment block.
- **#9 — Agent prompt update (MODIFY)**. Insert a new `### Language Matching` section into the `template: [...]` array at `src/index.ts:1409-1462`. Recommended insertion point: between `### Core Objective` (ends at L1415) and `### Tool Execution Rules` (starts at L1417). Section text (per `brief.md:99-104` Option B + C fallback + issue #9 body): ~10 LOC of new prompt text. Add 1 new string entry to the `template` array — no other array entries change.
- **#9 — `__test` export extension (MODIFY)**. Add `detectLanguage`, `collectWorking`, `names`, `stats` to the `__test` const at `src/index.ts:2098-2102`. ~5 LOC change (4 new entries).
- **Estimated total**: ~50-70 LOC production (within sub-budget).

### `src/ui/review.html` (sub-candidate #8)

- **#8 — Remove notes textarea from drawer (MODIFY)**. Delete the `<div>` block at `src/ui/review.html:1817-1820` containing `<label for="notes">Notes for this round</label>` + `<textarea id="notes" placeholder="Optional global notes"></textarea>`. Net: -4 LOC.
- **#8 — Add new always-visible notes surface (NEW)**. Insert a new notes section between the existing `<div id="range-banner">` at `:1724` and `<div class="layout">` at `:1726`. Structure: `<section class="notes-surface" data-testid="notes-surface">` containing a `<label for="notes">Round notes (always visible — appear in next round's "Previously discussed" panel)</label>` + `<textarea id="notes" data-testid="notes-textarea">`. Add `data-testid` attributes for stable Playwright selectors. Wrap in a `<details>` element so the section is collapsible by default (`<details open>` = visible by default). ~12 LOC added.
- **#8 — Update drawer-header title (MODIFY, optional polish)**. The drawer title at `:1779` is `<h2>Review</h2>` — change to `<h2>Add Finding</h2>` to make the drawer's single-responsibility explicit. ~1 LOC.
- **Estimated total**: ~10-15 LOC net (close to the budget).

### `src/ui/app.ts` (sub-candidate #8)

- **#8 — Re-bind `notesRoot` to new surface (MODIFY)**. The current `const notesRoot = document.querySelector("#notes") as HTMLTextAreaElement;` at `src/ui/app.ts:324` may need to change IF the notes textarea is moved out of the drawer (it will be — the same `id="notes"` is reused). Verify the new selector works (probably keeps `#notes` since the same id is reused — just moves to a different DOM location).
- **#8 — Remove notes-binding from drawer-close handler (MODIFY)**. The drawer-close handler at `:649-672` currently does NOT bind notes, so this is mostly a no-op. Verify after edit: drawer-close doesn't touch `state.notes`.
- **#8 — Update `draftPayload()` if notes selector changed (VERIFY)**. The current `draftPayload()` at `:2428-2443` reads `state.notes` (not `notesRoot.value` directly) — so the refactor is transparent to this function. NO LOC change needed unless Dev discovers an inconsistency.
- **#8 — Add `data-testid` references for new notes surface (NEW)**. If `data-testid` attributes are added in HTML, App.ts can reference them. ~0-5 LOC.
- **#8 — Add visual indicator when notes are non-empty (NEW, optional polish)**. Update the header Submit button's `title` attribute at `src/ui/review.html:1694` to reflect the new flow: `title="Submit this review round (your round notes are above)"`. ~1 LOC.
- **Estimated total**: ~5-15 LOC production (well within budget; most of #8's complexity is in HTML).

### `src/language-detect.test.ts` (NEW, sub-candidate #9)

- Unit tests for `detectLanguage()` per AC9-1 through AC9-6. Imports `__test.detectLanguage` from `./index`. ~10-15 test cases covering: empty string, whitespace-only, pure Chinese, pure English, mixed-language (3 different ratios), short snippets (< 10 chars), long paragraphs, technical code mixed with Chinese, comments with code blocks. ~80-120 LOC total.

### `src/untracked-files.test.ts` (NEW, sub-candidate #7)

- Unit tests for `collectWorking()` per AC7-1 through AC7-4 + AC7-6. Imports `__test.collectWorking` (and any needed helpers) from `./index`. Uses `fsPromises.mkdtemp` + `git init` to set up synthetic working trees (same pattern as `src/prior-notes.test.ts:88-99`). ~6-10 test cases: (1) untracked file appears with status "added", (2) untracked file's additions matches line count, (3) tracked-only modification returns no untracked files, (4) `.gitignore`-listed untracked file excluded, (5) deleted untracked file (rm'd after add — edge case), (6) binary untracked file (Bun.file detection), (7) `__test` export includes `collectWorking`. ~100-150 LOC total.

### `src/agent-prompt.test.ts` (NEW, sub-candidate #9)

- Unit test for the agent prompt structure per AC9-5. Reads `src/index.ts`, extracts the `template: [...]` array via regex, joins with `\n`, asserts the joined text contains `"### Language Matching"` (or equivalent directive heading). ~30-50 LOC. Could be folded into `src/language-detect.test.ts` as a single `describe` block; split for clarity.

### `scripts/test-review-ui/scenarios.mjs` (sub-candidate #8)

- Update the 10 existing scenarios if any rely on `#notes` being inside the drawer DOM. Per `e2e.mjs` review at `:9-80`, the existing harness mostly tests plugin-entry-point behavior (collectWorking output, diagnostics, worktree resolution) — the drawer DOM surgery may NOT break existing scenarios. **Dev to verify during Step 5 of execution**.
- Add 3 new scenarios: `notes-always-visible` (AC8-2), `drawer-is-findings-only` (AC8-3), `header-submit-only` (AC8-4). ~50-80 LOC of scenario code.
- Add 1 new scenario: `untracked-file-appears` (AC7-5) — creates an untracked file in the working tree, runs the plugin, asserts the file is in the `files` array with `status: "added"`. ~25-30 LOC.
- **Estimated total**: ~80-120 LOC of scenario code changes.

### `scripts/test-review-ui/e2e.mjs` (sub-candidate #8)

- Update scenario count in README + harness if needed. The scenario count text strings ("10 git scenarios") need updating to reflect the new total (10 + 4 = 14). ~10-20 LOC.

### `README.md` + `README.zh-CN.md` (sub-candidates #8 + #9)

- **#8 — Update "Review UI" section** in `README.md`: rewrite the "Review drawer (overlay)" bullet to say "Add Finding only — category, severity, comment, Add Finding button. Notes live in a separate always-visible section above the diff cards (collapsible). Submit is the header's Submit Review button." Add 1-line description of the new notes surface in the same section. ~10-15 LOC.
- **#8 — Update "Header actions" bullet** in `README.md`: minor rewrite to clarify the header's Submit Review is the single terminal action. ~3-5 LOC.
- **#9 — Add "Auto-apply workflow" section note** in `README.md`: add 1 paragraph explaining the language-matching directive + the CJK ratio heuristic + the empty-input fallback to English. ~10-15 LOC.
- **#9 — Add bilingual paragraph** in `README.zh-CN.md`: mirror the language-matching note in Chinese, with the directive reproduced in Chinese for clarity. ~10-15 LOC.
- **Estimated total**: ~30-50 LOC across both README files.

### TOTAL ESTIMATED

- Production code: ~65-100 LOC across 3 files (`src/index.ts` + `src/ui/review.html` + `src/ui/app.ts`)
- New test files: ~210-320 LOC across 3 files (`src/language-detect.test.ts` + `src/untracked-files.test.ts` + `src/agent-prompt.test.ts`)
- E2E harness updates: ~90-140 LOC across 2 files (`scripts/test-review-ui/scenarios.mjs` + `e2e.mjs`)
- README updates: ~30-50 LOC across 2 files
- **Grand total: ~395-610 LOC across 10 files** — within the user's relaxed Layer 1 cap (400-600 LOC) with margin. The "400-600" headline includes both production and tests.

---

## 4. Steps

Each step is one atomic action for Dev. Steps 1-3 set up the worktree + reproduce #7. Steps 4-6 are production code in priority order (lowest-risk first per R4 retro discipline). Steps 7-9 are tests. Steps 10-12 are e2e + README + commits.

1. **Pre-flight**: Verify all R4 SHAs still on main (`git cat-file -e f2790e5 e7cde56 6c87b43 a3f04aa 870a507 315169f be6b93d 13bff5e 1f31275 af2554c ad1efe7 dae05fd d0d4c2b e3e545b 961345d` — must all return 0). Create worktree at `$HOME/.worktrees/team-dev-loop-round-5-bundle-3-issues/` on branch `team-dev-loop-round-5-bundle-3-issues` from main HEAD (`a3f04aa`). Verify: `git -C $HOME/.worktrees/team-dev-loop-round-5-bundle-3-issues branch --show-current` returns `team-dev-loop-round-5-bundle-3-issues`.

2. **Reproduce #7 bug first** (NON-NEGOTIABLE per brief). Write a minimal repro script — create `src/__test_repro_untracked.ts` in the worktree with content `console.log("hello")\nconsole.log("world")\n`, then invoke `__test.collectWorking` from a one-off Bun script (using the `__test` export pattern from `src/prior-notes.test.ts:15`). Capture: (a) does the file appear in the returned array? (b) what is `status`? (c) what is `additions`? (d) what is `after`? Document the actual failure mode in a temp file `tmp/r5-repro.md` for the plan update. If reproduction matches PM Triage's hypothesis (file appears but with `additions: 0` due to `stats()` gap), proceed to Option A in §3. If the file is missing entirely, the bug is at a different layer — STOP and surface to Lead for re-decision before designing fix.

3. **Implement #9 first** (lowest risk, smallest LOC, prompt-only — ~50-70 LOC production). Add `detectLanguage()` helper at `src/index.ts:~621` (next to `count()`). Add `### Language Matching` section to the agent prompt template at `:1409-1462`. Extend `__test` export at `:2098-2102` to include `detectLanguage`. Verify: `bun run typecheck` passes.

4. **Implement #7 (after #9)**. Apply the fix from §3 (Option A or B based on Step 2 reproduction). Extend `__test` export to include `collectWorking`, `names`, `stats` per AC7-6. Verify: `bun run typecheck` passes; the repro script from Step 2 now shows `additions: 2` for the 2-line untracked file.

5. **Implement #8 last (highest risk, UI-breaking)**. Three sub-steps:
   - 5a. Edit `src/ui/review.html`: remove notes block at `:1817-1820`, insert new notes-surface section between `:1724` and `:1726`. Verify: `grep -c 'id="notes"' src/ui/review.html` returns exactly 1 (moved, not duplicated).
   - 5b. Edit `src/ui/app.ts`: verify `notesRoot` selector still works (same `#notes` id, moved location). Verify `state.notes` binding at `:355` unchanged. Update the drawer-header title at `:1779` if pursuing polish.
   - 5c. Run `bun run build` after each sub-step. Catch any tsc errors early.

6. **Verify all ACs (test pyramid)**:
   - 6a. Unit tests: `bun run test:unit` — expect 29/29 pre-existing (R1+R4) + 6+ new in `src/language-detect.test.ts` + 7+ new in `src/untracked-files.test.ts` + 1+ new in `src/agent-prompt.test.ts` = ~43+ pass.
   - 6b. E2E: `bun run test:ui` — expect existing 10 scenarios + 4 new scenarios = 14+ pass.
   - 6c. Gates: `bun run check` (format:check + lint + typecheck) — all clean.
   - 6d. Build: `bun run build` — succeeds, `dist/ui/app.js` regenerated.

7. **Commit strategy** (per R4 retro — worktree-based multi-commit, per-sub-candidate atomicity):
   - `feat(issue-9): detectLanguage helper + agent prompt language matching` — covers AC9-1 through AC9-6 (helper + prompt + `__test` export for #9).
   - `test(issue-9): language-detect.test.ts + agent-prompt.test.ts` — covers AC9-1, AC9-2, AC9-3, AC9-4, AC9-5.
   - `fix(issue-7): collectWorking includes untracked files with correct stats` — covers AC7-1 through AC7-4 + AC7-6.
   - `test(issue-7): untracked-files.test.ts` — covers AC7-1, AC7-2, AC7-3, AC7-4.
   - `refactor(issue-8): drawer = findings-only, notes surface always visible, header Submit` — covers AC8-1 through AC8-4 + AC8-6.
   - `test(issue-8): e2e scenarios for new DOM structure` — covers AC8-2, AC8-3, AC8-4 + AC8-5 regression.
   - `docs(issue-8/9): update README + README.zh-CN.md for new layout + language matching` — covers AC8-1 (README documentation) + AC9-7 (manual verification docs).

8. **Push worktree branch** to `origin/team-dev-loop-round-5-bundle-3-issues`. Verify: `git ls-remote --heads origin team-dev-loop-round-5-bundle-3-issues` returns the latest commit SHA.

9. **Verify worktree commits with `git cat-file -e`** (per R4 retro Gap 1, now automated at PM Manager but Dev should self-verify): for every commit SHA produced in Step 7, run `git cat-file -e <sha>` to confirm the commit exists. If any returns "Not a valid object name", re-commit (NOT amend — per `workflow` skill rule, never amend a failed commit).

10. **Hand off to Lead** (Phase 3a onward). Lead runs Phase 3a (Tester Review — 5 lens parallel via lead-takeover default per R4 retro Gap 3), Phase 3b (Tester Diff), Phase 3c (Tester Playwright — full walkthrough), Phase 3.5 (PM Doc Writer — lead takeover default if work is small ≤3 doc files + no screenshot, OR subagent for full screenshot capture), Phase 4 (Decision).

11. **Lead merges worktree branch → main** after all gates PASS (per R3/R4 pattern). Lead updates `.omo/proposals.jsonl` with R5 line (per `loop-decision.md:354-383` schema).

12. **Update `.omo/proposals.jsonl`** if Dev is also writing the closure line (or hand off to Lead). One JSON object per the schema: `{round: 5, timestamp: ..., pm_source: "user-picked (option 3)", brief_excerpt: ..., brief_quality: ..., pm_manager_verdict: "APPROVE", dev_self_check: ..., tester_verdict: ..., doc_update_verdict: ..., final_outcome: ..., decision: ..., chosen_candidate: ..., commits: [...], test_summary: ..., follow_up_candidates: [...]}`.

---

## 5. Test plan

Per `loop-decision.md:188-196` ("Multi-round AC test-design rule"), all 3 sub-candidates have multi-round aspects — direct unit tests on changed functions with synthetic input, NOT 2-round e2e.

### Unit tests (`bun run test:unit` — `bun test src/`)

| Test ID | AC | File | Setup | Assertion |
|---|---|---|---|---|
| T9.1 | AC9-1 | `src/language-detect.test.ts` (NEW) | `detectLanguage("这个 auth middleware 应该用 jwt.verify")` | returns `"zh-CN"` (CJK ratio > 0.3) |
| T9.2 | AC9-2 | `src/language-detect.test.ts` | `detectLanguage("Please use jwt.verify instead of jwt.decode")` | returns `"en"` (CJK ratio < 0.1) |
| T9.3 | AC9-3 | `src/language-detect.test.ts` | `detectLanguage("这个 magic number 25 should be a const")` | returns `"mixed"` (CJK ratio between 0.1 and 0.3) |
| T9.4 | AC9-4 | `src/language-detect.test.ts` | `detectLanguage("")` | returns `"en"` (empty → fallback) |
| T9.5 | AC9-4 | `src/language-detect.test.ts` | `detectLanguage("   \n\t  ")` | returns `"en"` (whitespace-only → fallback) |
| T9.6 | AC9-1 | `src/language-detect.test.ts` | `detectLanguage("中文")` (pure 2-char Chinese) | returns `"zh-CN"` |
| T9.7 | AC9-2 | `src/language-detect.test.ts` | `detectLanguage("Hello world")` (pure English) | returns `"en"` |
| T9.8 | AC9-3 | `src/language-detect.test.ts` | `detectLanguage("这个 is a test of mixed 语言")` | returns `"mixed"` |
| T9.9 | AC9-1 | `src/language-detect.test.ts` | long Chinese paragraph (500+ chars, ratio > 0.5) | returns `"zh-CN"` |
| T9.10 | AC9-2 | `src/language-detect.test.ts` | long English paragraph (500+ chars, ratio < 0.05) | returns `"en"` |
| T9.11 | AC9-5 | `src/agent-prompt.test.ts` (NEW) | Read `src/index.ts`, extract `template: [...]` array, join with `\n` | joined text contains `"### Language Matching"` directive |
| T9.12 | AC9-6 | `src/agent-prompt.test.ts` | Inspect `__test` export in `src/index.ts:2098-2102` | contains `detectLanguage` key |
| T7.1 | AC7-1 | `src/untracked-files.test.ts` (NEW) | `mkdtemp` + `git init` + `git add .` + create `src/__test_untracked.ts` with 2 lines + invoke `__test.collectWorking` | returned array includes the file with `status: "added"` and `after` matching content |
| T7.2 | AC7-2 | `src/untracked-files.test.ts` | Same setup as T7.1 | `additions === 2`, `deletions === 0` |
| T7.3 | AC7-3 | `src/untracked-files.test.ts` | `mkdtemp` + `git init` + commit `file.txt` + modify `file.txt` | returned array contains ONLY `file.txt` with `status: "modified"`, no untracked files |
| T7.4 | AC7-4 | `src/untracked-files.test.ts` | `mkdtemp` + `git init` + commit `.gitignore` containing `dist/\n` + create `src/dist/should-ignore.js` | returned array does NOT contain `should-ignore.js` |
| T7.5 | AC7-1 | `src/untracked-files.test.ts` | Same setup as T7.1 but with a 10-line untracked file | `additions === 10`, `deletions === 0` |
| T7.6 | AC7-6 | `src/untracked-files.test.ts` | Inspect `__test` export in `src/index.ts:2098-2102` | contains `collectWorking` key |
| T7.7 | AC7-1 | `src/untracked-files.test.ts` (optional) | Edge case: binary untracked file (PNG header) | returned, `additions` reasonable, no crash |

**Estimated**: ~16-19 new unit tests across 3 new test files, ~210-320 LOC.

### E2E scenarios (`bun run test:ui` — `bun run scripts/test-review-ui/e2e.mjs`)

| Test ID | AC | Scenario name | Description |
|---|---|---|---|
| E8.1 | AC8-2 | `notes-always-visible` | Load UI, type into `#notes`, assert text visible. Close drawer (click backdrop or X), assert `#notes` still visible and editable. |
| E8.2 | AC8-3 | `drawer-is-findings-only` | Open drawer, assert drawer DOM contains `category`, `severity`, `comment`, `add`, `clear`, `findings`, `status`. Assert NO `#notes` inside `#drawer`, NO `#submit` inside `#drawer`. |
| E8.3 | AC8-4 | `header-submit-only` | Type into new `#notes`, click header `#submit`, assert round submitted with notes content present in payload (via mock server's PUT /draft or POST /submit endpoint). |
| E8.4 | AC8-5 | (regression — existing 10 scenarios) | Run all 10 existing scenarios, assert all PASS. |
| E8.5 | AC8-5 | (regression — 3-status filter) | Verify `setConversationFilter` at `src/ui/app.ts:499-506` still works post-refactor. |
| E8.6 | AC8-5 | (regression — finding-add flow) | Click `#add` after typing comment, assert finding appears in `#findings` div. |
| E8.7 | AC7-5 | `untracked-file-appears` | Setup a repo with 1 committed file + 1 untracked file (e.g., `git init` + `git add file.txt` + `git commit` + `echo x > untracked.txt`), run plugin, assert both files in the returned `files` array with correct status. |
| E8.8 | AC8-6 | (DOM snapshot) | Verify `src/ui/review.html` drawer block does NOT contain `<textarea id="notes">` or `<button id="submit">`. |

**Estimated**: 4 new scenarios + 4 regression checks, ~80-120 LOC of scenario code.

### Manual verification (out of harness, documented in README)

- **M9.7 (AC9-7)**: Real OpenCode session. Post 1 Chinese finding ("这个 auth middleware 应该用 jwt.verify"), submit round, trigger auto-apply loop, verify the agent's `add_review_comment` reply is in Chinese. Capture a screenshot of the Chinese-language comment thread in the "Previously discussed" panel. Save to `docs/screenshots/language-matching.png`, reference in README. **This is the Phase 3c (Tester Playwright) verification step OR Phase 3.5 (PM Doc Writer) manual capture** — Dev does NOT run this; Lead or PM Doc Writer does, per Phase boundaries.

### Regression: R4 invariants

- `src/prior-notes.test.ts:180-238` (R4 AC9 snapshot test, T5.1) — must still pass (no `Finding` / `State` schema change).
- `src/prior-notes.test.ts:30-58` (T1.1-T1.5 multi-round parsePriorNotes tests) — must still pass.
- `src/prior-notes.test.ts:243-249` (T0.1 "Previously discussed" tab DOM count) — must still pass.
- `src/state-store.test.ts` (R1 atomic-write tests, T1-T7) — must still pass.
- All 14 pre-existing e2e scenarios — must still pass.

---

## 6. Risk register

Each risk carries file:line evidence per R4 retro Gap 1. Mitigations reference the §4 Steps.

### Risk R7-1: #7 actual root cause is at a different layer than PM Triage's hypothesis

- **Likelihood**: HIGH (PM Triage's premise correction at `.omo/round-5/brief.md:55` explicitly notes the bug is downstream of `names()`; the actual layer — `stats()` vs. `before()` vs. render path — is not verified)
- **Impact**: MEDIUM (Dev may need to redesign the fix during implementation, expanding LOC from ~50 to ~150)
- **File:line evidence**: `src/index.ts:952-972` (`stats()` only runs `git diff --numstat HEAD`, which excludes untracked); `src/index.ts:974-980` (`before()` returns `""` for untracked via `git show HEAD:<file>` — correct behavior); `src/ui/app.ts` rendering path (unverified — Dev to trace during Step 2)
- **Mitigation**: Step 2 of §4 (reproduce first) is non-negotiable. If reproduction reveals a render-layer bug (not `stats()`), STOP and surface to Lead for re-decision before designing fix. The plan commits to Option A (extend `stats()`) as preferred — if Option A doesn't fix the render path, fall back to Option B (add explicit `additions: count(next)` override in `collectWorking()`) per §3.

### Risk R7-2: #7 fix breaks `.gitignore` semantics

- **Likelihood**: LOW (the existing `git ls-files --others --exclude-standard` at `src/index.ts:934` already respects `.gitignore`; any new `git` command in the fix must use the same flag)
- **Impact**: HIGH (accidentally surfacing `.gitignore`'d files would be a security/privacy regression — `dist/`, `node_modules/`, `.env`, etc.)
- **File:line evidence**: `src/index.ts:934` (`git ls-files --others --exclude-standard`); the `--exclude-standard` flag covers `.gitignore`, `.git/info/exclude`, and `core.excludesfile`
- **Mitigation**: AC7-4 explicitly tests that `.gitignore`-listed files are excluded. Dev must NOT switch to `git status --porcelain --untracked-files=all` (per `brief.md:148` explicit warning — this command does NOT respect `.gitignore`). If the fix uses Option A from §3, use the SAME `git ls-files --others --exclude-standard` flag — no new `git` command should be introduced.

### Risk R8-1: #8 DOM surgery breaks existing 10 e2e scenarios

- **Likelihood**: MEDIUM (the drawer is a major UI surface; existing scenarios may rely on `#notes` being inside `#drawer`)
- **Impact**: HIGH (e2e failures block ship-to-main; the harness is regression-checked by Phase 3c)
- **File:line evidence**: `src/ui/review.html:1776-1827` (drawer markup with notes at `:1817-1820`); existing e2e harness at `scripts/test-review-ui/e2e.mjs:9-80` (mostly tests plugin-entry behavior, but the harness's mock-server.py may serialize drawer state)
- **Mitigation**: Step 5 of §4 (DOM surgery last) — run `bun run test:ui` after every HTML/app.ts change. Step 7 commits `#8` LAST so prior commits' e2e state is verifiable. AC8-5 explicitly captures the regression requirement. If e2e fails on the existing 10 scenarios, the fix is to update the affected scenarios in the same commit — NOT to revert the DOM surgery.

### Risk R8-2: #8 refactor introduces notes-binding regression in `draftPayload()`

- **Likelihood**: LOW (the current `draftPayload()` at `src/ui/app.ts:2428-2443` reads `state.notes` directly, not `notesRoot.value` — so the refactor is transparent to this function)
- **Impact**: HIGH (notes silently dropping from the round payload means R4's "Previously discussed" panel sees empty notes next round — user pain #8 was designed to fix)
- **File:line evidence**: `src/ui/app.ts:2428-2443` (draftPayload reads `state.notes`); `src/ui/app.ts:355` (`state.notes` declaration); `src/ui/app.ts:2651-2654` (notesRoot input event sets `state.notes`)
- **Mitigation**: AC8-4 (e2e `header-submit-only` scenario) explicitly verifies notes content flows through to the submit payload. Dev must NOT change the `state.notes` data flow — only the DOM source of the textarea. If Dev discovers the input event handler at `:2651-2654` needs to update (e.g., the selector changed), it must be updated in lockstep with the HTML change.

### Risk R8-3: AC8-6 DOM snapshot test is brittle to legitimate UI evolution

- **Likelihood**: MEDIUM (asserting "drawer does NOT contain `#notes`" is a negative assertion that future UI changes might break in expected ways)
- **Impact**: LOW (test failure forces a thought, not a ship-block — but slow drift accumulates)
- **File:line evidence**: `src/prior-notes.test.ts:243-249` (R4's T0.1 used positive assertion: "has exactly 1 Previously discussed button and 1 pane"; R5 AC8-6 uses negative assertion)
- **Mitigation**: Write AC8-6 as a POSITIVE assertion (drawer contains the expected finding fields: `category`, `severity`, `comment`, `add`, `clear`, `findings`, `status`) and a SEPARATE negative assertion for `#notes` and `#submit` ABSENCE. The positive assertion evolves naturally with the UI; the negative assertion locks the single-responsibility refactor.

### Risk R9-1: `detectLanguage()` heuristic has false positives on mixed-language text

- **Likelihood**: HIGH (any threshold-based detection has edge cases; Chinese/English bilingual comments are common in real code review)
- **Impact**: LOW (agent still replies, just in suboptimal language; the auto-apply loop continues to work)
- **File:line evidence**: Agent prompt at `src/index.ts:1409-1462` (no language directive exists today); the `detectLanguage()` helper location (NEW)
- **Mitigation**: Document the threshold (CJK ratio > 0.3 → `"zh-CN"`, < 0.1 → `"en"`, else `"mixed"`) in the helper's docstring AND in the agent prompt's "### Language Matching" section AND in the README's "Auto-apply workflow" section. AC9-3 explicitly tests mixed-language input returns `"mixed"` (not `"zh-CN"` blindly). The prompt must include a fallback rule: when language is `"mixed"`, default to English unless the user explicitly uses Chinese in 3+ comments in the round.

### Risk R9-2: Agent prompt update changes other agent behavior

- **Likelihood**: MEDIUM (adding a section to the prompt at `:1409-1462` may interact with the existing "Output Parsing & Priority Rules" at `:1421-1427`, "Workflow Execution Rules" at `:1428-1457`, or "Prohibitions" at `:1459-1461`)
- **Impact**: MEDIUM (agent behavior drift breaks the auto-apply loop's reliability)
- **File:line evidence**: `src/index.ts:1409-1462` (existing prompt structure)
- **Mitigation**: Step 3 of §4 implements #9 BEFORE #7 and #8 — smaller commit, smaller blast radius. The `### Language Matching` section is added near the TOP of the template (after "Core Objective" at `:1415`, before "Tool Execution Rules" at `:1417`) so it doesn't compete with the priority rules. The diff is documented in `src/agent-prompt.test.ts` (T9.11) so any unexpected change to the rest of the prompt surfaces in review.

### Risk R9-3: `__test` export extension leaks sensitive helpers

- **Likelihood**: LOW (exporting `collectWorking` / `names` / `stats` / `detectLanguage` is for test access only; the production bundle tree-shakes `__test` if unused)
- **Impact**: LOW (no production security implication; the `__test` const is already a documented pattern at `src/index.ts:2098-2102`)
- **File:line evidence**: `src/index.ts:2098-2102` (existing `__test` export pattern)
- **Mitigation**: Add a docstring above the `__test` export noting "extended in R5 for issue-7 untracked-file tests + issue-9 language detection tests". Future contributors see the convention. Bundle size is unaffected because `__test` is consumed only by test files.

### Risk R-ALL-1: Combined ~520-800 LOC exceeds Lead's "split if any sub-candidate blows up LOC" rule

- **Likelihood**: MEDIUM (the LOC estimate has wide range 395-610 from §3; #8's DOM surgery could push higher if Playwright walkthrough reveals more changes needed)
- **Impact**: MEDIUM (split mid-round is disruptive — Dev has to abandon the worktree, re-branch, and re-implement)
- **File:line evidence**: `loop-decision.md` v2 split-rule (R4 retro): "anything > 200 LOC pure code OR > 5 files touched → split into its own round"
- **Mitigation**: Per Step 1 of §4, if any sub-candidate's production LOC estimate grows by 50%+ during Dev (e.g., #8 grows from 30 → 45 LOC), surface to Lead for split decision BEFORE continuing. The commit strategy at Step 7 supports split-after-commit if needed — Dev can ship #9 + #7 as one round and defer #8 to R6.

### Risk R-ALL-2: 3 sub-candidates in 1 round increases review fatigue + regression risk

- **Likelihood**: MEDIUM (3 changes × per-AC evidence × 5 review lens = 50+ review artifacts to verify)
- **Impact**: MEDIUM (review fatigue → shallow PASS → regression slips through)
- **File:line evidence**: R4 retro `.omo/round-4/retro.md:17` ("5 lens parallel review tasks stalled 7+ minutes each, no output")
- **Mitigation**: Per-Step 6 of §4 (test pyramid verification). Per-sub-candidate commits at Step 7 (failures attributable). Lead-takeover defaults per R4 retro Gap 3: Phase 3a (Tester Review orchestrator → lead by default), Phase 3b (Tester Diff → lead by default), Phase 3c (Tester Playwright → full walkthrough), Phase 3.5 (PM Doc Writer → lead by default IF work is small ≤3 doc files + no screenshot needed).

### Risk R-ALL-3: Worktree path bug recurs (R3 lesson)

- **Likelihood**: LOW (the R3 fix at `loop-decision.md` path-templating note uses `$HOME` template; Step 1 of §4 explicitly uses `$HOME/.worktrees/...`)
- **Impact**: HIGH (hardcoded `/Users/yangweibin/...` path breaks portability across machines)
- **File:line evidence**: R3 retro (cited in `loop-decision.md` v2 split-rule); `.omo/round-5/brief.md` (R5 worktree path uses `$HOME/.worktrees/...`)
- **Mitigation**: Step 1 of §4 explicitly creates worktree at `$HOME/.worktrees/team-dev-loop-round-5-bundle-3-issues/`. Dev's setup script must use `$HOME` (not `/Users/...`). Verify: `echo $HOME` returns the actual home directory; `git worktree add $HOME/.worktrees/team-dev-loop-round-5-bundle-3-issues -b ...` succeeds.

---

## 7. Hand-off

### Dev receives

- This plan (`.omo/round-5/plan.md`)
- PM Triage's brief (`.omo/round-5/brief.md`, 187 lines)
- PM Manager's review (`.omo/round-5/pm-manager-review.md`, 218 lines, APPROVED)
- Worktree at `$HOME/.worktrees/team-dev-loop-round-5-bundle-3-issues/` on branch `team-dev-loop-round-5-bundle-3-issues`
- Current main HEAD: `a3f04aa` (skill patches baseline for R5)
- The PM Triage's 3 premise corrections are embedded throughout this plan (re-stated in §1 Goal, §2 ACs, §3 File changes, §4 Steps, §6 Risk register) — Dev builds from THIS plan, NOT the original issue bodies.

### Dev returns

- All ACs (AC7-1 through AC9-7 + AC10 R4-regression) with PASS evidence (file:line of test or e2e scenario):
  - AC7-1 through AC7-6: file:line of each `src/untracked-files.test.ts` test that PASSes
  - AC8-1 through AC8-6: file:line of each e2e scenario + DOM snapshot test that PASSes
  - AC9-1 through AC9-6: file:line of each `src/language-detect.test.ts` + `src/agent-prompt.test.ts` test that PASSes
  - AC9-7: README path documenting the manual verification step
  - AC10: `src/prior-notes.test.ts:236-237` (T5.1 snapshot test) PASS
- All commits on `team-dev-loop-round-5-bundle-3-issues` branch (per Step 7 commit strategy: 7 commits total — 2 for #9, 2 for #7, 2 for #8, 1 for docs)
- Branch pushed to `origin/team-dev-loop-round-5-bundle-3-issues`
- Inline self-check appended to Dev's return value (AC trace: PASS/PARTIAL/FAIL per AC, with file:line evidence for each)
- Worktree's `tmp/r5-repro.md` (from Step 2) — the actual user-visible failure mode observed during reproduction
- Reproduction script for AC7-1 (the script that creates an untracked file and calls `__test.collectWorking`) — useful for Phase 3c (Tester Playwright) and Phase 3b (Tester Diff) to verify the fix.

### Lead does after Dev

- **Pre-gate verification**: run `git cat-file -e` on every commit SHA Dev produced (per R4 retro Gap 1, now part of PM Manager's automated check but Lead should self-verify). If any SHA fails, lead rejects Dev's return with the SHA list and asks Dev to re-commit.
- **Phase 3a (Tester Review)**: lead-takeover by default per R4 retro Gap 3. Lead spawns 5 lens tasks (Goal / QA / Code / Security / Context) IN PARALLEL but with `block=false` and a 5-minute timeout per lens. If any lens stalls, lead cancels and synthesizes the lens output manually based on Dev's AC trace + lead's independent code review.
- **Phase 3b (Tester Diff)**: lead-takeover by default per R4 retro Gap 3. Lead runs `git diff main` on the worktree, writes `diff-report.md` directly (saves the subagent launch — per R4 retro, 0% retry success rate).
- **Phase 3c (Tester Playwright)**: subagent for full browser walkthrough (architecture profile per `loop-decision.md:181` — always run for feature/architecture). The walkthrough MUST verify: (a) new notes surface is visible when drawer is closed, (b) drawer contains only finding fields, (c) header Submit is the only submit action, (d) an untracked file appears in the file list with `status: "added"` and `additions > 0`. Lead write-takes-over if subagent stalls (per R4 retro Gap 3).
- **Phase 3.5 (PM Doc Writer)**: lead-takeover by default IF work is small (≤3 doc files + no screenshot needed, per R4 retro Gap 3). For R5, README + README.zh-CN.md + scripts/test-review-ui/README.md = 3 files. Lead-write likely; if Playwright screenshot of the new notes surface is needed, subagent.
- **Phase 4 (Decision)**: lead writes `.omo/round-5/decision.md` directly using the template at `loop-decision.md:272-352`. Verdict: SHIP / CONTINUE / STOP.
- **Phase 4.5/4.6/4.7**: mandatory retro + post-exec + self-check (per R4 retro skill patches `d0d4c2b` `315169f` `a3f04aa`).
- **Merge**: `git checkout main && git merge --no-ff team-dev-loop-round-5-bundle-3-issues` after all gates PASS.
- **Push**: `git push origin main`.
- **Update `.omo/proposals.jsonl`** with R5 line per the schema at `loop-decision.md:354-383`.

---

*Plan generated 2026-06-29 by Round 5 Architect (Sisyphus-Junior, fresh subagent). All 3 PM Triage premise corrections reflected in §1, §2, §3, §4, §6. Multi-round AC test paths in §2 + §5. $HOME worktree path in §4 Step 1 + §7. File:line evidence throughout §3 + §6.*