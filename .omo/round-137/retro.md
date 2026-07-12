# R137 Retro — Copy round notes button

## What worked

Lead-direct round across 2 src files modified (`app.ts`, `i18n.ts`) + 1 new test + 1 brittleness fix (R131 byte-slice test). First feature round since R132 (R133–R136 were all polish). The break in profile was overdue: after 4 consecutive polish rounds, the polish backlog was empty and the loop was due for a feature.

Implementation replicated the established copy pattern at `copyBranchNameToClipboard` (L1762). All 5 R137 contract tests red→green. Pre-commit 8/8 PASS. 1068 tests in the project suite. Per-SHIP append discipline maintained: R136 entry appended to `.omo/proposals.jsonl` in this round.

The R131 fix was direct: my R137 changes added `copyRoundNotesToClipboard` (~60 lines at app.ts:1818) which shifted byte offsets downstream. The R131 test was using `appTs.slice(264157, 266000)` — a brittle byte-slice that worked through R132–R136 because those rounds added lines at the END of app.ts or in non-offset-shifting ways, but R137 added a new function in the middle of the file. Replaced with `appTs.indexOf("function showPostSubmit")` + 2000-char window — anchor-based, drift-resistant. This is exactly the test quality gap the v6 SKILL shouldered onto "be a hard gate": when my changes break existing assertions, the move is fix the test, not move the bytes.

## What didn't

- Hardcoded byte slice in R131 test caught me out. **Lesson**: byte-slice tests are technical debt. Future tests must anchor on markers, not absolute offsets. R131 was written when app.ts was a smaller file; the slice drifted through R132–R136 silently and broke on R137's first significant mid-file insertion.
- I almost missed adding 2 new i18n keys in the same commit as the call sites. Splitting would have caused "t(...) returns the key itself" fallback for the duration of the commit. Adding both together was the right move.
- The button label and tooltip are currently the same string. Could DRY this with a single `data-i18n-title` attribute (per R133's auto-discovery), but that's a polish round — out of R137 scope.

## Carry-over list (≤3 items)

None — R137 closes all loop-internal flags surfaced by R131-136.

## Closed in this round (loop-internal)

- Last 5 rounds were all polish (R133–R136). R137 breaks the streak with a real feature, restoring the v6 loop's intent (≤3 features per round means we should ship 1+ per round ideally).
- R131 test brittleness — **closed**. Byte-slice replaced with marker-anchor.
- v6 procedure gap (R134 retro lesson #4): `.omo/proposals.jsonl` missing R136 entry — **closed**.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **Byte-slice tests = technical debt.** R131 was written for a specific byte range that worked at R131 commit. Any future src growth could break it. v6 lesson: all tests must use marker-based anchors (`indexOf("function X")` + reasonable window), not raw `slice(start, end)`. The R131 fix demonstrates the pattern; future rounds should follow.
- **Feature profile vs polish streak.** After 4 polish rounds (R133-R136) the polish backlog naturally empties. Continuing polish without new candidates would force invented work — v6 anti-pattern. The "no new value" trigger for switching from polish to feature is: backlog empty + ≥2 rounds since last feature. R137 honors this.
- **Same-pattern replicates are cheap.** R137's `copyRoundNotesToClipboard` is ~70% identical to `copyBranchNameToClipboard`. Inlining a new `fallbackCopy` was the right call (kept the scope within ≤3 src files), but a future housekeeping round should hoist `fallbackCopy` to file scope and reuse across all 4 callers (copyFindingPermalink, copyAsMarkdown, copyBranchName, copyRoundNotes). Out of R137 scope; flag for next housekeeping round.
- **Per-SHIP proposals.jsonl append discipline has stuck.** R134 retro caught the gap; R135 and R137 both restored it. This is now a mechanical per-round action.
- **Hook guidance for necessary comments was correct** — R136's `// Anchor on audit-ts span` comment was flagged unnecessary, removed. No false positives so far.

## Risks Surfaced (not actioned this round)

- `fallbackCopy` is duplicated in 4 functions (was 3 before R137). A future housekeeping round could hoist it to file scope and de-duplicate. Pure refactor, no behavior change. Out of R137 scope.
- The "Copy" button label reuses `t("previously.notes.copyButton")` for both `textContent` and `title`. Could leverage R133's `data-i18n-title` auto-discovery but the explicit lookup is consistent with the rest of app.ts's button-rendering pattern. Future polish round.
- Worktree has 5 untracked PNGs from R132 visual QA + `.agents/` + `skills-lock.json`. Not blocking; future housekeeping round if needed.

## v6 Compliance

- Hard caps: **1 feature** (≤3) + **0 bugfix** (the R131 fix counts as part of the feature, not a separate bugfix slot) + **0 polish** = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.

## Round Profile

- Feature: 1 (Copy round notes button)
- Bugfix: 1 (R131 byte-slice brittleness, side-fix directly caused by R137 edits)
- Total: 1 (per R137 discovery — R131 fix is bundled with the feature since it was caused by R137's edits, not a separate increment)
- Subagents: 0
- Time: ~25 min wall-clock including the R131 bugfix discovery + fix.