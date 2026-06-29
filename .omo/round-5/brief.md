# Round 5 Brief — bundled #7 + #8 + #9 (architecture profile)

> **Date**: 2026-06-29
> **Author**: Round 5 PM Triage (Sisyphus-Junior, fresh subagent)
> **Status**: PM brief, awaiting PM Manager review
> **User directive**: Option 3 from lead pre-scoping (R5 = all 3 issues bundled). Layer 1 scope cap (300 LOC / 3 src files) RELAXED to ~400-600 LOC / 3 src files for this round.
> **Predecessor**: R4 (`f2790e5` Previously discussed panel) merged 2026-06-29. R4 retro followup items in `.omo/round-4/retro.md` are listed in `Source` below; none are folded into this bundle as primary candidates, per the user-picked option 3.

## Title

Ship a single coherent UX pass on `/diff-review-dashboard` that (a) shows the developer every file they just created or edited — including never-staged untracked files — in the diff page, (b) refactors the review drawer so notes are first-class visible and the only submit action lives in the page header, and (c) teaches the auto-apply agent to reply in the same language as the user finding comments.

## Source

- **Issue #7** (bug): <https://github.com/weekbin/opencode-review-dashboard/issues/7> — "Untracked files don't appear in /diff-review-dashboard's diff page until `git add .`". Verified body via `gh issue view 7 --json body,title,labels` 2026-06-29. Label: `bug`.
- **Issue #8** (enhancement): <https://github.com/weekbin/opencode-review-dashboard/issues/8> — "UX: Move 'Submit Review' + 'note for this round' out of drawer into a dedicated header Review button (single responsibility)". Verified body via `gh issue view 8 --json body,title,labels`. Label: `enhancement`.
- **Issue #9** (enhancement): <https://github.com/weekbin/opencode-review-dashboard/issues/9> — "Agent auto-replies to user findings should match the user's comment language (use Chinese when user writes in Chinese)". Verified body via `gh issue view 9 --json body,title,labels`. Label: `enhancement`.
- `.omo/round-4/retro.md` ## Followup items (opportunistic add-ons — NOT in scope of this brief per user-picked option 3; surfaced in `Self-Critique`):
  - R4 MINOR #1: AbortController for `loadPriorNotes`
  - R4 MINOR #2: UI hint about "current round in Conversation"
  - R4 MINOR #3: capture Playwright screenshot of the 4-tab UI
  - R1+2+3+4 carried-over: Reopen anchor `end_line` reset
- `.omo/round-4/brief.md` (264 lines, HIGH quality) — format reference for this brief's structure.
- **R4 audit-trail code-commit verification**: ALL 5 R4 SHAs verified OK via `git cat-file -e` — `f2790e5` ✓ `e7cde56` ✓ `6c87b43` ✓ `a3f04aa` ✓ `870a507` ✓. R4 audit-trail is grounded.
- `git log --oneline -20` (R4 merge `6c87b43`, last product commit before skill patches; 5 skill-patch commits since R4: `a3f04aa` `be6b93d` `315169f` `13bff5e` `1f31275` `af2554c` `ad1efe7` `dae05fd` `d0d4c2b` — none touch product code paths cited below).

## User pain (3 connected pains, framed as user terms — NOT bug terms)

A developer running `/diff-review-dashboard` today hits **three flow-level friction points** that all happen in the same 30-second window of "I just wrote some code, let me review it":

1. **"Where did my new file go?"** — When a developer creates `src/foo.ts` (or any file not yet `git add`'d) and opens the review UI, the file is sometimes missing from the file list, or shows up with the wrong status / zero diff. The mental model is "I edited a file, I expect to review it" — and the plugin breaks that promise in a way the developer has to debug.

2. **"Where do I submit? Where are my notes?"** — The drawer (the side overlay) currently holds finding fields, the round-level notes textarea, and — per the issue — the submit button. Submit is the most important action and is hidden behind an extra click + the drawer's modal state. Notes (which feed into the R4 "Previously discussed" panel for the *next* round) are easy to forget because they sit in a hidden field. (See `Self-Critique` for the actual current-state verification — the issue's framing is partially incorrect, see below.)

3. **"Why is the agent replying in English when I wrote in Chinese?"** — A Chinese-speaking developer posts 3 findings in Chinese, the auto-apply agent responds in English, and the developer has to mentally translate 3 replies to verify the fix. R4's "Previously discussed" panel surfaces the comment thread in the UI; if the user writes Chinese and the agent replies English, the panel becomes a bilingual mess.

All 3 pains share the dashboard's review workflow surface — none are deep-engine, all are "30-second-after-the-edit" friction. Bundling them produces one coherent UX pass.

## Candidates ranked (3 sub-candidates, bundled per user-picked option 3)

### Sub-candidate #7 — Untracked files appear in diff page

> **As a** developer who just created a new file (`src/foo.ts`) in their working tree,
> **I want** to see that file in the `/diff-review-dashboard` review UI immediately,
> **So that** I can review it as part of the round without manually running `git add .` first.

- **User value**: 4/5 (high; affects every "create new file + review" round; aligns with #4 — "Uncommitted files shown in gray" already exists for `git diff --name-only HEAD` path but the untracked-staging behavior is the gap)
- **File:line evidence (verified 2026-06-29 against main)**: 
  - `src/index.ts:1221-1293` — `collectMerged` orchestrator
  - `src/index.ts:1072-1113` — `collectWorking` calls `names()` then `stats()` then `before()`/`after()` per file
  - `src/index.ts:922-950` — `names()` already invokes `git ls-files --others --exclude-standard` at **line 934** ✓ (so untracked files ARE listed in the working-set)
  - `src/index.ts:952-972` — `stats()` only runs `git diff --numstat --no-renames HEAD -- <area>`, which **does not include untracked files** (untracked have no HEAD entry → no numstat row)
  - `src/index.ts:974-989` — `before()` runs `git show HEAD:<file>` (returns "" for untracked) and `after()` reads file directly (line 982-988)
  - `src/index.ts:1097` — status calc: `!prev && next ? "added" : "modified"` → untracked SHOULD classify as "added"
  - **To verify in Dev phase**: does the untracked file actually render correctly in the UI? Possible bug surface: (a) stats missing → renders with empty additions/deletions, (b) status "added" renders with header rows that depend on git diff, (c) frontend rendering path assumes committed-file status. Issue #7's premise that "untracked files don't appear at all" is **partially incorrect** (names() does include them); the bug is likely a render/status/stats mismatch — Dev must reproduce and confirm the actual user-visible failure mode.
- **What's missing for the user**: confirmed reproducible flow where a developer creates a new file, opens the dashboard, and either (a) doesn't see the file at all, or (b) sees it with broken status / empty stats / no rendered diff. The expected behavior is "shows up as a new file with its content as additions."
- **LOC**: ~100-150 (depends on whether the fix is purely `stats()` enrichment vs a full new render path; **Dev to size in plan**)
- **Files**: 1 (`src/index.ts`) + 1 new test file (multi-round AC rule from `.opencode/skills/team-dev-loop/references/loop-decision.md` "Multi-round AC test-design rule" — synthetic untracked-file input to a unit test on `collectWorking` / `collectMerged`, NOT a 2-round e2e which would be structurally impossible)
- **Test pattern reference**: `src/prior-notes.test.ts` (250 lines, R4) — same synthetic-state + direct unit invocation shape

### Sub-candidate #8 — Drawer refactor: notes surface + submit-in-header

> **As a** developer using the review UI,
> **I want** the drawer to be findings-only, my round notes to be in an always-visible spot, and the only submit action to be the header's "Submit Review" button,
> **So that** I can submit the round in 1 click without opening the drawer, and my round notes are visible while I review (so the next round's "Previously discussed" panel has good context).

- **User value**: 3/5 (medium-high; UX polish + discoverability; pairs naturally with R4's "Previously discussed" panel by making notes a first-class citizen)
- **File:line evidence (verified 2026-06-29 against main)**:
  - `src/ui/review.html:1776-1827` — drawer markup (`<aside class="drawer" id="drawer">` opens at 1777, closes at 1827). Contains: finding fields (1793-1813), `<div class="separator">` (1815), **notes textarea at 1818-1819** (`<label for="notes">Notes for this round</label>` + `<textarea id="notes">`), separator (1822), findings list `<div id="findings">` (1824). **The drawer does NOT contain a Submit button** (verified — Submit is in the header, see next bullet). **The issue's framing ("Submit Review button is buried inside the drawer") is INCORRECT against current main.**
  - `src/ui/review.html:1690-1697` — **Submit Review button in the page header** (`<button class="btn btn-primary" id="submit" type="button" title="Submit this review round (notes can be added in the drawer)">`). This is already "always visible in the page header" per README "Header actions" section.
  - `src/ui/review.html:1687-1689` — the "Review" toggle button (`<button class="drawer-toggle" id="drawer-toggle" type="button">Review <span class="count" id="finding-count">0</span></button>`). This opens the drawer.
  - `src/ui/app.ts:478-490` — `setActiveTab` (verified ✓)
  - `src/ui/app.ts:499-506` — `setConversationFilter` (verified ✓; pattern reference for any new toggle state)
  - `src/ui/app.ts:1609+` — `renderConversationPanel` (issue cites 1603-1712; actual start is 1609, body extends past 1719) — Conversation panel rendering
  - `src/ui/app.ts:2430` — `state.notes` binding inside `draftPayload()` (issue cites 2215; actual is 2430)
  - `src/ui/app.ts:2651-2652` — `notesRoot` input event listener sets `state.notes = notesRoot.value`
  - `src/ui/app.ts:330` + `:2536` + `:2619` — `submitButton` element ref + `submit()` function + click listener
  - `src/ui/app.ts:649-672` — `openDrawer` / `closeDrawer` / drawer-toggle click handler
- **What's missing for the user**: the drawer's notes textarea (HTML 1818-1819) is hidden by default (drawer closed when not adding a finding) → developers forget to write notes → next round's "Previously discussed" panel is empty for that round. The single-responsibility fix: move notes out of the drawer into an always-visible area (e.g., collapsible section above diff cards, or inline above the Conversation tab), keep the drawer findings-only.
- **Note on issue premise correction**: the Submit Review button is **already in the header** (not buried in the drawer). The "discoverability" pain the issue describes is partly already solved. The remaining real pain is **notes being hidden in the drawer**, which is what this sub-candidate should fix. The Dev phase should re-confirm this with a Playwright walkthrough before designing the fix surface — the brief instructs Dev to surface notes as always-visible and keep the header Submit button as the single submit entry point, NOT to "move Submit out of the drawer" (it's not there).
- **LOC**: ~200-300 (DOM surgery on drawer HTML + app.ts state refactor + new notes surface; depends on where the notes section lives — collapsible in header vs in main column)
- **Files**: 2 (`src/ui/review.html`, `src/ui/app.ts`) + possibly 1 new CSS file if the notes surface needs new styling (likely inline in review.html)
- **E2E scenario updates**: existing 10 git scenarios in `scripts/test-review-ui/scenarios.mjs` need to verify the new notes-while-closed flow + the header-Submit-only flow.

### Sub-candidate #9 — Agent language matching

> **As a** Chinese-speaking developer running `/diff-review-dashboard`,
> **I want** the agent's auto-reply comments (via `add_review_comment`) to match the language I wrote my findings in (Chinese when I write Chinese, English when I write English),
> **So that** I can scan the auto-apply loop 3-5x faster, and the R4 "Previously discussed" panel shows a coherent language stream.

- **User value**: 4/5 (high for non-English users; the plugin is bilingual — `README.md` + `README.zh-CN.md` both maintained — but the agent defaults to English; this is a table-stakes localization gap)
- **File:line evidence (verified 2026-06-29 against main)**:
  - `src/index.ts:1408-1462` — **the agent prompt template** (a `template: [...]` array joined with `"\n"` inside the `[command]: {...}` block in the `config:` callback). Issue cites 1320-1366; actual is 1408-1462. Verified via `grep -n "diff_review_dashboard\|template: \[" src/index.ts` → first match at line 1409, `template: [` at 1409, content extends to 1462.
  - `src/index.ts:1422-1457` — the actual prompt body containing "Output Parsing & Priority Rules", "Workflow Execution Rules", "Prohibitions". The current prompt **does NOT specify any language directive** (verified — no `language`, `lang`, `Chinese`, `zh` mention in the prompt block).
  - `src/index.ts:2043` — `add_review_comment` tool definition (issue cites 1929; actual is 2043).
  - `src/index.ts:21-26` — `FindingComment` type: `{id, author: "user" | "agent", text, created_at}` — no `lang` field today.
  - `src/index.ts:1390-1393` — asset resolution for `app.js` (UI assets, not agent-related but in the same handler).
- **What's missing for the user**: the agent is told "summarize each finding in the round summary" and "post a Post-Apply Trace comment via `add_review_comment`" but is never told what language to write in. The agent defaults to English per its system prompt. The user wants: when the user writes Chinese comments, the agent writes Chinese replies.
- **Fix direction** (recommended Option B + Option C fallback per the issue):
  1. **Agent prompt update** (`src/index.ts:1408-1462`): add a "### Language Matching" section near the top of the prompt body with directive text similar to the issue's suggested wording (CJK-ratio heuristic fallback to English).
  2. **Language detection helper** in `src/index.ts`: `detectLanguage(text: string): "zh-CN" | "en" | "mixed"` — simple CJK character ratio check (`text.match(/[\u4e00-\u9fff]/g)?.length ?? 0` vs total length, threshold ~0.3).
  3. **Optional**: add `lang?: string` to `FindingComment` type at `src/index.ts:21-26` (low-risk additive — does NOT break the R4 AC9 snapshot test that locks State + Finding types because FindingComment is nested, but verify with `grep "FindingComment" src/prior-notes.test.ts` in Dev phase).
  4. **README update** in "Auto-apply workflow" section + new bilingual paragraph in `README.zh-CN.md`.
  5. **E2E / unit test** per loop-decision.md multi-round AC rule: synthetic Chinese / English / mixed text → `detectLanguage` returns expected bucket. The `add_review_comment` agent reply itself is outside the harness scope (real agent invocation), so test the helper directly.
- **LOC**: ~80-150 + 1 new test file (e.g., `src/language-detect.test.ts`) + README updates
- **Files**: 1 (`src/index.ts`) + 1 README (`README.md` + `README.zh-CN.md`)

## Scope buckets (R5+, scope-relaxation flag set)

### Bucket A: bundled #7 + #8 + #9 [recommended, user-picked option 3]

- Contains: sub-candidate #7, #8, #9
- Combined user value: 5/5 (highest — covers the full "create code → review → submit → get agent reply" loop)
- Files touched: 3 (`src/index.ts`, `src/ui/review.html`, `src/ui/app.ts`) + 1-2 new test files (`src/language-detect.test.ts`, `src/untracked-files.test.ts` per multi-round AC rule) + README + `README.zh-CN.md`
- Combined LOC: ~400-600 (matches the user's RELAXED Layer 1 cap from option 3)
- Why this bucket: strongest cross-candidate synergy — all 3 sub-candidates share the dashboard's review workflow surface (the "30-second-after-the-edit" window). #8's "notes always visible" surface is the home for the user's round notes (which #9's bilingual output then becomes); #7's `collectWorking` change is small additive (already partly in place per `names()` at line 934); #9's prompt update is a 1-paragraph prompt addition. None of them touch each other's core code paths.
- Layer 1 cap flag: **RELAXED** (user explicit choice — 300 LOC / 3 src files cap exceeded because all 3 issues are in same domain and the user picked option 3)

### Bucket B: backend-only (#7 + #9, no #8) [NOT recommended, surfaced for completeness]

- Contains: sub-candidate #7, #9
- Files touched: 1 (`src/index.ts`) + 2 test files + README
- LOC: ~180-300
- Why this bucket: alternative if user wants tighter scope (NOT recommended — user picked option 3, and #8's notes-surface is the home for the user's bilingual round notes per the synergy argument above)

### Bucket C: UI-only (#8 alone) [NOT recommended, surfaced for completeness]

- Contains: sub-candidate #8
- Files touched: 2 (`src/ui/*`)
- LOC: ~200-300
- Why this bucket: alternative if user wants UI-only (NOT recommended — user picked option 3)

## Recommended candidate

**Bucket A** (bundled #7 + #8 + #9). User-picked option 3 from lead pre-scoping. No alternative proposed — per user directive, the brief is 1 recommended bundle only.

## Self-Critique

**Clarity rating**: 4/5 — sub-candidate stories are clear personas with verifiable evidence; the bundle's synergy argument is concrete (notes surface is the home for the user's bilingual output).

**Hidden ambiguities / risks**:

- **Issue #7's premise is partially incorrect against current main.** The `names()` function at `src/index.ts:922-950` already invokes `git ls-files --others --exclude-standard` at line 934, so untracked files ARE listed in the working-set. The actual user-visible bug may be (a) `stats()` at line 952-972 not returning untracked-file stats (only runs `git diff --numstat` which excludes untracked), (b) the UI rendering path assuming committed-file status, or (c) a different bug entirely (reproduce-and-confirm is required in Dev phase). **The PM-as-user-story-advocate re-frame: the sub-candidate story is "I want to review my new file" regardless of which layer is broken — Dev must size the actual fix.**
- **Issue #8's premise about Submit being "buried inside the drawer" is INCORRECT against current main.** Verified: Submit Review button is at `src/ui/review.html:1690-1697` in the page header (already "always visible" per the existing README). The real pain in #8 is the **notes textarea being hidden in the drawer** (HTML 1818-1819) — this is what the sub-candidate should fix. Dev must re-validate the actual UX problem in a Playwright walkthrough before designing the fix.
- **Issue #9's file:line citations are off** (1320-1366 → actual 1408-1462 for the agent prompt; 1929 → actual 2043 for `add_review_comment`). The intent is correct (prompt has no language directive) — the line numbers need updating in any code-touching work, but the user-pain is valid.
- **Risk: #8 is UI-breaking** — moving the notes textarea out of the drawer changes the DOM structure that the existing 10 e2e scenarios depend on. Playwright walkthrough MUST verify the existing 3-status filter (`setConversationFilter` at `src/ui/app.ts:499-506`) + finding-add flow + Submit button click all still work after the refactor.
- **Risk: #9's language detection is heuristic (CJK ratio)** — false positives on mixed-language comments (e.g., "这个 magic number 25 should be a const" is bilingual). Threshold tuning (~30% CJK = "zh-CN") needed; user-facing edge case documented in README.
- **Risk: #7's `collectWorking` extension must respect .gitignore** — the existing `git ls-files --others --exclude-standard` at line 934 already does this (the `--exclude-standard` flag respects `.gitignore`, `.git/info/exclude`, and core.excludesfile). Dev should NOT switch to `git status --porcelain --untracked-files=all` (which can include `.gitignore`d files unless filtered).
- **Risk: 3 sub-candidates in 1 round increases review fatigue** — if any sub-candidate blows up its LOC estimate during Dev planning, the architect should split per the v2 split-rule (anything > 200 LOC pure code OR > 5 files touched → split into its own round). The bundle is sized for ~400-600 LOC with margin for 1 sub-candidate overage.
- **Open question**: should R4 MINOR followups (AbortController for `loadPriorNotes` at `src/ui/app.ts` `loadPriorNotes` location, UI hint about "current round in Conversation", capture Playwright screenshot of the 4-tab UI) ship opportunistically in this round? The user picked option 3 (all 3 issues), so the brief's recommended scope is the bundle only. The R4 MINORs would push the round into "architecture + 3 polish items" territory — not recommended. **Surface as a PM Manager review question, not a scope addition.**
- **Citation hygiene**: every file:line cite in this brief was verified via `grep -n` / `sed -n` against current main. The 4 corrections (Issue #7's "only git diff" claim, Issue #8's "Submit in drawer" claim, Issue #9's off-by-88-line prompt cite, all 3 issues' off line numbers for HTML/Tool) are called out explicitly so Dev doesn't build on the wrong premise.
- **Multi-round AC test design** (R3 retro rule from `.opencode/skills/team-dev-loop/references/loop-decision.md`): all 3 sub-candidates have multi-round aspects (#7 multi-round because new file → untracked; #8 multi-round because submit-while-notes-visible across rounds; #9 multi-round because bilingual output carries into next round's "Previously discussed" panel). Per the rule, write **direct unit tests on the changed functions** with synthetic input (not 2-round e2e which is structurally impossible in the harness). Pattern: `src/prior-notes.test.ts` (R4, 250 lines).

## User-impact profile

```yaml
user_impact_profile:
  pm_source: "user (explicit option 3 override — picked the all-in bundle over single-issue or 2-issue buckets)"
  U_size: "large (3 src files + 2 new test files + 2 README files, ~400-600 LOC, 5+ new unit tests)"
  U_files: "large (5-7 user-visible: src/index.ts + src/ui/review.html + src/ui/app.ts + 2 README files + 2 new test files)"
  U_new_capability: yes     # #9 adds language helper, #8 adds new notes-while-closed surface, #7 (potentially) fixes the untracked-file render path
  U_behavior_shift: yes     # #8 fundamentally changes the notes-write flow (was drawer-buried, now always-visible); #9 changes agent reply language; #7 may change how new files appear
  U_user_visible: yes       # all 3 surface in UI: #7 in file list, #8 in DOM layout, #9 in agent reply text
  U_data_shape_breaking: no # no state.json schema change (FindingComment lang? field is optional, not required)
  U_data_safety: no         # additive reads, no destructive writes
  U_installs_new_dep: no    # no new deps (language detection is regex-based on existing Bun)
  recommended_profile_override: architecture   # matches Rule 1 (U_behavior_shift=yes); user-explicit profile = architecture
```

## Profile recommendation

PM's intuition: **architecture** (because #8 carries `U_behavior_shift=yes` AND #9 changes the agent's reply language AND #7 may change the file-list render — all 3 are not pure bugfixes and not pure features, they're a coherent UX pass with multi-layer changes). Lead will validate via auto-classification:

- **Rule 1 (architecture)**: `U_behavior_shift==yes` → **architecture** ✓
- All phases run including full Playwright walkthrough (verify existing 3-status filter, finding-add flow, Submit button click after #8 refactor) + 5 review lens (Goal / Code / Security / QA / Context) + (external review if team-mode available, else N/A — last 2 rounds used lead takeover for orchestrator + doc-writer; R5 likely same per R4 retro Gap 2 + Gap 3 patches if those skill patches have landed)
- Per R4 retro Gap 1 (commit SHAs must `git cat-file -e` OK) — every code-touching commit in the audit trail must be verifiable.
- Per R3 retro multi-round AC test rule — direct unit tests on synthetic input, not 2-round e2e.

## Anti-patterns to reject (PM-as-user-story-advocate guard rails)

This brief was written to reject the following patterns that appeared in the upstream issue descriptions:

- ~~Issue #7's "Root cause: collectMerged only invokes git diff"~~ — REJECTED: `names()` at line 934 already includes `git ls-files --others --exclude-standard`. The actual user pain is "my new file doesn't render correctly"; the bug is at a layer Dev must identify. Sub-candidate reframed to the user story.
- ~~Issue #8's "Submit Review button is buried inside the drawer"~~ — REJECTED: Submit is in the header at HTML 1690-1697. The actual pain is "notes textarea hidden in drawer". Sub-candidate reframed to focus on the notes surface + single-responsibility on the drawer.
- ~~Issue #9's "agent prompt at src/index.ts:1320-1366"~~ — CORRECTED: actual is lines 1408-1462. The user pain (agent defaults to English) is valid and preserved.

All 3 sub-candidates are now framed as **user-story-first** (As a / I want / So that) with verified file:line evidence. Dev should NOT use the original issue bodies as the implementation reference — use this brief's re-framed sub-candidates.