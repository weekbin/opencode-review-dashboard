# Round 5 PM Manager Review

> **Date**: 2026-06-29
> **Reviewer**: Round 5 PM Manager (Sisyphus-Junior, fresh subagent)
> **Verdict**: APPROVE
> **Pre-check result**: PASS

## Pre-check (code-commit verification)

### Explicit R4 SHAs (15/15 OK)

| SHA | Status |
|---|---|
| `f2790e5` | OK |
| `e7cde56` | OK |
| `6c87b43` | OK |
| `a3f04aa` | OK |
| `870a507` | OK |
| `315169f` | OK |
| `be6b93d` | OK |
| `13bff5e` | OK |
| `1f31275` | OK |
| `af2554c` | OK |
| `ad1efe7` | OK |
| `dae05fd` | OK |
| `d0d4c2b` | OK |
| `e3e545b` | OK |
| `961345d` | OK |

### SHAs extracted from R4 audit-trail (14 unique, classified)

`grep -ohE '[0-9a-f]{7,40}' .omo/round-4/{decision,diff-report,test-report,retro}.md` returned 14 strings. Of these, **9 are not git commit SHAs** (they are OMO subagent session IDs / background task IDs, or R3 SHAs that R4 already correctly flagged as missing):

| String | Status | Classification |
|---|---|---|
| `0eeab0f4fffe6e` | MISSING | OMO subagent session ID `ses_0eeab0f4fffe6ejpfQRNRL5g7X` (R4 `lead-takeover-doc-writer.md:4`, `retro.md:18`) — not a git SHA |
| `258cc019` | MISSING | Background task ID `bg_258cc019` (R4 `lead-takeover-tester-review.md:4`, `test-report.md:17`, `retro.md:17`) — not a git SHA |
| `2e4a8ea4` | MISSING | Background task ID `bg_2e4a8ea4` (same as above) — not a git SHA |
| `5103b4d0` | MISSING | Background task ID `bg_5103b4d0` (same as above) — not a git SHA |
| `f5eb441a` | MISSING | Background task ID `bg_f5eb441a` (same as above) — not a git SHA |
| `fbed88e7` | MISSING | Background task ID `bg_fbed88e7` (same as above) — not a git SHA |
| `57a447a` | MISSING | **R3 fabricated commit SHA** (correctly flagged as missing by R4 itself: `brief.md:6,140`, `decision.md:67`, `pm-manager-review.md:38`, `retro.md:9,26`, `review-context.md:106`, `test-report.md:128`) — NOT a real R4 issue; the regex just picked it up |
| `b4bc02e` | MISSING | **R3 fabricated commit SHA** (same context as above) |
| `e14c943` | MISSING | **R3 fabricated commit SHA** (same context as above) |
| `870a507` | OK | R4 fix(audit-trail) commit |
| `961345d` | OK | R3 retro commit |
| `e7cde56` | OK | R4 docs commit |
| `f2790e5` | OK | R4 Previously discussed tab commit |
| `f2790e5bd4bf07a9d2d3d23b05b6858356ca14e4` | OK | Full hash of `f2790e5` (long-form) |

**Conclusion**: All R4 code-commit SHAs are verifiable in `git cat-file -e`. The 9 "MISSING" matches are correctly classified — 6 are OMO `bg_*` / `ses_*` IDs (not git SHAs), 3 are R3 fabricated SHAs that R4 already explicitly disclaimed as missing (the integrity note at `.omo/round-3/AUDIT-TRAIL-INTEGRITY-NOTE.md` and R4's `pm-manager-review.md:38` cover them). **No fabricated R4 audit-trail.**

## Sub-candidate evaluation

### #7 — Untracked files in diff page

- **PM Triage premise correction verified?** **YES** ✓
  - Evidence: `src/index.ts:922-950` — `names()` function body:
    - L926: `await run(root, ["git", "ls-files", "--cached", ...spec])` for tracked
    - L934: `await run(root, ["git", "ls-files", "--others", "--exclude-standard", ...spec])` for untracked
  - So `names()` DOES list untracked files. The brief's "issue body claim is partially incorrect" is **correct**.
  - The actual likely bug surface, per the brief and confirmed by inspection of `stats()` at L952-972 (only runs `git diff --numstat HEAD -- <area>`, which excludes untracked) and `before()` at L974-980 (returns "" for untracked via `git show HEAD:<file>`), is at the `stats()` / `before()` / status-calc / render layer — not at `names()`.
  - The brief explicitly defers "reproduce and confirm" to the Dev phase (L55) — this is the right move because the actual failure mode requires a real untracked-file round to see.

- **Real user pain**: A developer creates `src/foo.ts`, opens the review UI, and either can't find the file in the list or sees it rendered with broken status / empty stats / no diff. The mental model "I edited a file, I should review it" is broken.

- **Pseudo-requirement markers**: NONE
  - Not DUPLICATE — `collectWorking` is the only path for working-tree diff; the untracked-fix is genuine additive work
  - Not SPECULATION — backed by issue #7 (verified via `gh issue view 7`)
  - Not CONTRADICTION — R4's `f2790e5` added "uncommitted files shown in gray" badge per README; #7's fix is upstream of that, in `names()` / `stats()` / render path
  - Not INFLATED — LOC estimate 100-150 is reasonable for a focused `stats()` / render patch + 1 new test file
  - Not OBSCURE — the user persona is concrete (developer who just created a file)
  - Not PREMISE_WRONG — the brief itself corrects the issue body premise

- **Verdict for #7**: **APPROVE**

### #8 — Drawer refactor

- **PM Triage premise correction verified?** **YES** ✓
  - Evidence: `src/ui/review.html:1690-1697` — Submit Review button in the **header** (right after `drawer-toggle` at 1687-1689, before the `</header>` close):
    ```
    1687: <button class="drawer-toggle" id="drawer-toggle" type="button">
    1688:   Review <span class="count" id="finding-count">0</span>
    1689: </button>
    1690: <button
    1691:   class="btn btn-primary"
    1692:   id="submit"
    1693:   type="button"
    1694:   title="Submit this review round (notes can be added in the drawer)"
    1695: >
    1696:   Submit Review
    1697: </button>
    ```
  - Evidence: `src/ui/review.html:1777-1827` — drawer markup. The drawer's `drawer-body` contains: `selection`, `hint`, `category/severity` field-row, `comment` textarea, `clear` + `add` buttons, separator, **`<label for="notes">Notes for this round</label>` + `<textarea id="notes">` at L1818-1819**, separator, `findings` div, `status` div. **No Submit button in the drawer.**
  - Evidence: `src/ui/app.ts:330` — `submitButton = document.querySelector("#submit")` (the header button)
  - Evidence: `src/ui/app.ts:2536` — `async function submit()` and `:2619` — `submitButton.addEventListener("click", submit)`
  - The issue's claim "Submit Review is buried inside the drawer" is **INCORRECT** against current main. The Submit button is already always-visible in the header.
  - The **real** pain, per the brief, is the **notes textarea at L1818-1819** being hidden in the drawer (which is closed by default). PM Triage's correction is **correct**.

- **Real user pain**: Developer finishes a review round, closes the drawer to look at the diff, then remembers they wanted to add round-level notes — and the notes field is hidden inside the closed drawer. Notes end up forgotten, and the next round's "Previously discussed" panel (R4's `f2790e5`) is empty for that round.

- **Pseudo-requirement markers**: NONE
  - Not DUPLICATE — drawer-cleanup + notes-surface-out is a real refactor; nothing similar exists
  - Not SPECULATION — backed by issue #8 (verified via `gh issue view 8`); also cross-references R4's "Previously discussed" panel which depends on round-level notes being filled in
  - Not CONTRADICTION — R4 brief (`f2790e5`) explicitly ties notes → next round's panel; #8 completes the "notes are first-class" design
  - Not INFLATED — LOC estimate 200-300 for DOM surgery on `review.html` + state refactor in `app.ts` is reasonable for a single-responsibility UI refactor
  - Not OBSCURE — concrete user persona
  - Not PREMISE_WRONG — brief itself corrects the issue's "Submit in drawer" claim

- **Verdict for #8**: **APPROVE**

### #9 — Agent language matching

- **PM Triage premise correction verified?** **YES** ✓
  - Evidence: `src/index.ts:1408-1462` — the agent prompt. The brief's claim is correct:
    - L1408: `description: "Open a local @pierre/diffs review UI and collect annotations",`
    - L1409: `template: [`
    - L1422-1457: the actual prompt body (Task Role, Core Objective, Tool Execution Rules, Output Parsing & Priority Rules, Workflow Execution Rules, Prohibitions)
    - L1462 (approx): `].join("\n")`
  - Issue #9's "1320-1366" cite is off by ~88 lines. Actual is 1408-1462. Brief's correction is **correct**.
  - Evidence: `src/index.ts:2043` — `add_review_comment: tool({` (issue cites 1929; actual is 2043). Brief's correction is **correct**.
  - Evidence: `src/index.ts:21-25` — `FindingComment` type with `{id, author, text, created_at}` — no `lang` field. (Brief says L21-26; type spans 21-25, but that's a trivial off-by-one.)
  - Evidence: prompt body grep for `language` / `lang` / `Chinese` / `zh` returns **zero matches** in the prompt block — confirmed the user pain is valid (agent has no language directive).

- **Real user pain**: A Chinese-speaking developer writes 3 findings in Chinese, the auto-apply agent replies in English, and the developer has to mentally translate 3 replies to verify the fix. The R4 "Previously discussed" panel (`f2790e5`) then becomes a bilingual mess.

- **Pseudo-requirement markers**: NONE
  - Not DUPLICATE — agent prompt has no language directive (verified by grep)
  - Not SPECULATION — backed by issue #9 (verified via `gh issue view 9`); user pain is concrete and reproducible
  - Not CONTRADICTION — R4's panel exposes the comment thread, surfacing the bug; #9 is a natural follow-up
  - Not INFLATED — LOC 80-150 (prompt addition + small detection helper + 1 test file + README)
  - Not OBSCURE — concrete user persona (Chinese-speaking developer); README is already bilingual (`README.md` + `README.zh-CN.md`), so the bilingual expectation is established
  - Not PREMISE_WRONG — brief itself corrects the off line numbers

- **Verdict for #9**: **APPROVE**

## Bundle coherence

**Verdict: Natural bundle (not forced).**

- All 3 sub-candidates share the **same 30-second user window**: developer creates/edits code → opens review UI → writes findings + notes → submits → reads agent reply. The brief's "30-second-after-the-edit" framing is accurate.
- **Code-path overlap is shallow but real**:
  - #7 touches `src/index.ts:922-990` + `collectWorking` at 1072-1113 (untracked-file plumbing)
  - #8 touches `src/ui/review.html:1776-1827` (drawer DOM) + `src/ui/app.ts` (state binding, drawer toggle, submit)
  - #9 touches `src/index.ts:1408-1462` (prompt) + `src/index.ts:21-26` (type) + `src/index.ts:2043` (tool def) + README
  - **#7 and #9 both touch `src/index.ts`** but at non-overlapping functions (`names()` / `collectWorking` vs prompt / `add_review_comment` / `FindingComment`). Low merge risk.
  - **#8 is UI-only.** No overlap with #7 / #9.
- **Cross-candidate synergy is real**:
  - #8 makes notes always-visible → the user actually writes notes → the R4 "Previously discussed" panel has better data next round → #9's bilingual output flows through the panel coherently. The synergy is at the user-experience layer, not the code layer.
  - #7's fix is upstream of #8 (the file list must show new files for the developer to find a finding to add). Without #7, #8 is fixing a notes problem on a file list that may not show what the developer created.
- **None of the 3 force overlap on the same code paths.** The brief's "None of them touch each other's core code paths" claim is honest.
- **LOC budget sums to estimate**:
  - #7: 100-150
  - #8: 200-300
  - #9: 80-150
  - **Total: 380-600**, matching the brief's 400-600 cap. Within the user's relaxed Layer 1 limit.

**Conclusion**: Bundle is natural for a single coherent UX pass. The user picked option 3 explicitly; the brief is well-justified.

## Scope-relaxation flag validation

- **Layer 1 default cap**: 300 LOC / 3 src files (per `1f31275 feat(pm-triage): Layer 1 scope buckets`).
- **User-relaxed cap for R5**: ~400-600 LOC / 3 src files.
- **Is the relaxation justified?**
  - **LOC budget (380-600) is at the upper end** but consistent with the bundle size. Justifiable.
  - **3 src files (`src/index.ts`, `src/ui/review.html`, `src/ui/app.ts`) is the same as the default cap.** No file-count relaxation needed.
  - **+ 2 new test files + 2 README updates**: the +2 test files come from the multi-round AC test rule (R3 retro), and the +2 README files come from documenting #9's bilingual behavior. Both are necessary add-ons, not scope inflation.
  - The brief's v2 split-rule (R4 retro) "anything > 200 LOC pure code OR > 5 files touched → split into its own round" is **not triggered**:
    - #7 (100-150 LOC, 1 src file + 1 test) — under threshold
    - #8 (200-300 LOC, 2 src files + 0-1 test) — borderline; brief acknowledges the DOM-surgeon risk
    - #9 (80-150 LOC, 1 src file + 1 test + 2 README) — under threshold
  - Each sub-candidate individually fits a single round; bundling them is the user's choice, not an overscope.

**Conclusion**: 400-600 LOC / 3 src files is **justified** for the bundled bucket. No further splitting required unless Dev planning reveals #8 needs > 200 LOC (in which case Architect should split per the v2 rule).

## Architecture profile validation

- **Rule 1 (U_behavior_shift=yes) holds**:
  - **#8 fundamentally shifts the notes-write flow**: was drawer-buried, now always-visible. This is a discoverability + workflow change, not a pure fix. ✓
  - **#9 changes the agent's reply language** based on user input. The auto-apply loop's output changes per round based on user-language detection. This is also a behavior shift (not a pure feature add — the agent's defaults change). ✓
  - **#7 may shift behavior** depending on which layer is broken (Dev must reproduce). The brief's LOC estimate 100-150 covers both "pure fix at stats()" and "small render path change." Behavior shift is uncertain but plausible.
  - **At least 2 of 3 sub-candidates carry `U_behavior_shift=yes`** — sufficient for Rule 1.
- **Other signals supporting architecture profile**:
  - `U_size: large` (3 src files + 2 new tests + 2 README)
  - `U_new_capability: yes` (#9 adds language helper, #8 adds always-visible notes surface)
  - `U_user_visible: yes` (all 3 surface in UI)
  - `U_data_shape_breaking: no` (FindingComment `lang?` is additive optional)
  - `U_data_safety: no` (no destructive writes)
  - `U_installs_new_dep: no` (regex-based detection on existing Bun)
- **PM's intuition of "architecture" matches Rule 1** — all 7 phases run, including full Playwright walkthrough + 5 review lens (Goal / Code / Security / QA / Context).
- **Architect phase will validate via auto-classification** at planning time; PM's profile recommendation is well-supported.

**Conclusion**: Architecture profile is **correct**.

## Overall verdict

**APPROVE**

The brief is grounded, the 3 premise corrections are independently verified against the codebase with file:line evidence, all 3 sub-candidates are real user pains (not pseudo-requirements), the bundle is natural and code-path-non-overlapping, the scope-relaxation flag is justified, and the architecture profile matches Rule 1.

PM Triage did **excellent** work:
- Caught 3 issue-body premise errors before they reached Dev
- Re-framed each sub-candidate as a user story (not a bug term)
- Provided file:line evidence for every claim
- Self-critiqued the risks (UI-breaking for #8, CJK-ratio heuristic for #9, .gitignore respect for #7)
- Adhered to R3 multi-round AC test rule and R4 v2 split-rule

## Action items

1. **Lead**: route this brief to the Architect phase for plan.md generation. Profile = **architecture** (all 7 phases + 5 review lens).
2. **Dev phase**: **mandatory Playwright walkthrough before designing the #8 fix** — confirm via real browser that the notes textarea at `src/ui/review.html:1818-1819` is the actual user pain (not the Submit button). Brief's premise correction must be re-validated.
3. **Dev phase**: **mandatory reproduce-and-confirm for #7** — create a real untracked file, run the plugin, capture the actual user-visible failure (missing file? empty stats? wrong status? broken render?). The fix location depends on which layer is broken.
4. **Dev phase**: **multi-round AC tests** for all 3 sub-candidates per R3 retro rule (direct unit tests with synthetic input, NOT 2-round e2e):
   - #7: `src/untracked-files.test.ts` (synthetic untracked file → `names()` / `stats()` / `collectWorking`)
   - #8: update `scripts/test-review-ui/scenarios.mjs` to verify new notes-while-closed flow + header-Submit-only flow (DOM selectors change)
   - #9: `src/language-detect.test.ts` (synthetic Chinese / English / mixed text → `detectLanguage` returns expected bucket)
5. **PM Doc Writer**: README "Auto-apply workflow" section + new bilingual paragraph in `README.zh-CN.md` documenting the language-matching behavior (per #9 fix direction).
6. **PM Manager follow-up check at Architect plan time**: confirm the 3 sub-candidate LOC estimates sum to ≤ 600 (within the relaxed cap). If any sub-candidate blows up > 200 LOC, Architect should split per R4 v2 rule.
