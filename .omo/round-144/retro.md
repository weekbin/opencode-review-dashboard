# R144 Retro — close R143 retro #3 (source-side audit + localize uncommittedBadge.title)

## What worked

Lead-direct polish round across 2 src files modified (`app.ts`, `i18n.ts`) + 1 new test + 1 housekeeping append. Closes R143 retro "Risks Surfaced" #3 (source-side audit + localize any remaining hardcoded UI labels). The audit grep returned exactly 1 real source-side hardcoded English string — `uncommittedBadge.title` at L5696 — and R144 ships the localization.

The audit pattern that worked: `grep -nE '\.textContent\s*=\s*"[A-Z]|\.title\s*=\s*"[A-Z]|\.placeholder\s*=\s*"[A-Z]|aria-label\s*=\s*"[A-Z]|ariaLabel\s*=\s*"[A-Z]' src/ui/*.ts`. Most matches were in test files (declarative replacement records like `{ old: 'removeBtn.textContent = "Remove";', key: "action.remove" }`) or innerHTML template literals (already wired to `escapeHtml(t(...))` / `data-i18n`). Filtering to **app.ts source code only** left exactly 1 real string — the R143 retro-flagged uncommittedBadge tooltip.

For R144's key naming: chose `file.uncommitted.title` (under the existing `file.*` namespace, near `diff.hunk.*`). The `.uncommittedBadge.textContent = "uncommitted"` 1-word status label stays English per the R17/R25 badge convention (git terminology stays English across locales; bilingual users understand "uncommitted" without translation).

Pre-commit 8/8 PASS after fixing 1 brittle regex in the test (initial match for `/uncommittedBadge\.title\s*=/` only captured the LHS; widened to `src.slice(idx, idx + 120)` to include the RHS). R144 contract tests 3/3 pass. Project suite 1082/1082. R103 translation-completeness invariant preserved. Per-SHIP append discipline maintained.

## What didn't

- First iteration of test #2 used a regex that only matched the LHS of the assignment (`uncommittedBadge.title =`), so the RHS where `t("file.uncommitted.title")` lives wasn't captured. Caught immediately by running the test before the full pre-commit. Fixed by switching from regex match (greedy to first `=`) to a 120-char window slice starting at the assignment's index. Lesson: when asserting "the RHS uses pattern X", capture enough of the source to include the RHS — don't trust `\s*=` regexes to span a multi-token expression.
- Initial R144 candidate scan was incomplete because the audit grep's `\b` boundary in the R143 retro suggestion didn't work in the PCRE2-disabled mode I used. Switched to a more inclusive pattern `\.textContent\s*=\s*"[A-Z]` (no `\b`) and got the right hits.

## Carry-over list (≤3 items)

None — R144 closes R143 retro #3. No new loop-internal flags.

## Closed in this round (loop-internal)

- **R143 retro "Risks Surfaced" #3**: source-side audit + localize any remaining hardcoded UI labels — **closed**. Audit ran, found 1, R144 ships.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **The R143 retro suggestion was precise enough to act on directly.** "Run source-side grep `-nE 'textContent\s*=\s*"\b[A-Z]' src/ui/*.ts`" turned into a 1-match audit with a clear action item. Future retros should keep retro surfaced-risk suggestions *actionable* with the exact grep pattern. This pattern: retro names the grep, next round names the action.
- **Test regex assertions need to span the full RHS**, not just the LHS. The brittle-test upgrade pattern (R137→R144) was good for "function body contains X" but insufficient for "this assignment expression uses X". Lesson: when asserting call-site behavior, capture enough characters after the operator to include the RHS.
- **Source-side audit > test-side audit for i18n completeness.** R142 audited test files for byte-equivalence brittleness. R143 retro suggested auditing source files for hardcoded English — that's where bilingual users actually see English. The real polish wins come from the source-side audit, not the test-side one.
- **Per-SHIP proposals.jsonl append discipline held for 9 rounds** (R134 retro caught the gap; R135–R144 all restored). Mechanical per-round action.

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` uses deprecated `document.execCommand("copy")`** (R142/R143 retro #1, real behavior change). Future housekeeping.
- **`formatRelativeTime > 1 year`** (R142/R143 retro, preventive only).
- **The 3 remaining R142-audit i18n-coupling sites** (`edit-finding.test.ts:92 "Edited by user"`, `previously-hint.test.ts:57 "Conversation tab"`, `reopen-stale.test.ts:84 "Manually reopened:"`) are server-side system markers that go into state.json the agent reads. Localizing them changes the agent-facing contract — invasive. Out of polish scope; would need a separate feature round with agent contract re-design.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **1 polish** (≤1) = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.
- R103 i18n coverage invariant honored — `en ≠ zh-CN` for the new key.

## Round Profile

- Polish: 1 (localize uncommittedBadge.title)
- Total: 1
- Subagents: 0
- Time: ~10 min wall-clock including the regex-fix iteration.