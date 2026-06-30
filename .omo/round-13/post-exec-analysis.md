# R13 Post-Execution Analysis

## What went well

1. **Atomic commit discipline** — Each feature shipped as 1-2 atomic commits, all independently revertible:
   - `bf92fd8` server (src/index.ts + prior-notes snapshot update)
   - `9941f25` UI (src/ui/app.ts) for #20+#21
   - `c6bca53` full #22 (server is no-op, just UI + CSS)
   - `94cf3e5` unit tests (3 new files)
   - `ed87b4e` e2e scenarios
   - `b1b2d9c` docs

2. **R12 retro Gap 3 / SG.1 applied** — Pre-flight + post-commit wc -l checks logged in dev-report.md. No surprise count drift (R12 retro said "verify each count claim against source-of-truth before committing"; applied).

3. **Type widening pattern from R12 reused** — `Finding` type gained 5 optional fields (R13 #20+#21). The `T5.1` snapshot test in `src/prior-notes.test.ts` was updated the same way R12 did for `pinned` + `reactions` (R12 commit `7accd8a`).

4. **No new dependencies** — All 3 features use existing patterns: `flashFindingPermaHighlight` (R11), `isTextInputFocused` (R12), `writeFileAtomic` (R6), `readStored`/`writeStored` try/catch wrappers (R6). Zero new packages.

5. **sessionStorage (NOT localStorage) for #22** — Critical for the round-scoped contract: the search query should NOT leak across sessions, only within the current round.

## What could have been better

1. **Initial regex over-strictness in unit tests** — 5 unit tests failed on first run because the regexes I wrote didn't match the actual code patterns (e.g., `type ResolveReasonModalResult` was defined at module level, not inside the function; the radio values were in `MARKS_AS_WONTFIX_KINDS` table, not in the function; the 100+ notice used `${DIFF_SEARCH_MAX_MATCHES}` template, not literal "100"). Fixed in 1 iteration (~2 min). All tests pass now.

2. **More granular e2e scenarios vs 1 combined** — The plan said "3 e2e scenarios" (1 per feature). I did exactly that — 3 separate scenarios, each 1-commit setup. Could have made them multi-commit for richer coverage but kept them minimal per R12 R19 template.

3. **#20 and #21 in 2 commits (server + UI) instead of 1** — The plan's commit list suggested "1 commit per feature" but I split into server (bf92fd8) and UI (9941f25). This is more granular and matches the R12 pattern (pin + reaction were also split). The 2-commit split is documented in `dev-report.md ## Deviations from plan`.

## What I would do differently next round

1. **Pre-write unit test regexes against the actual file content** — Read the actual file before writing the regex, to avoid the "code is shaped differently than I assumed" failure mode. Could pre-extract a 5-line snippet and design the regex against it.

2. **Commit the unit test failures earlier** — I had 5 test failures that I fixed in 1 iteration, but I could have caught them earlier by running `bun test src/<new-test>.ts` immediately after writing each test, instead of batching at the end. (R12 retro Gap 5 lesson: "avoid serial re-runs".)

3. **Consider reformatting the `e2e.mjs` mock-server for parallel scenario runs** — The current `e2e.mjs` is sequential, and 34 scenarios × ~3-5 sec each = ~2-3 min wall time. With a 120s tool timeout, this hit the limit once. A future round could refactor to parallel scenario execution (mock-server already binds per-scenario port).

## Hidden gaps discovered

- **E2E tool timeout** — The full e2e suite (34 scenarios) takes ~2-3 min wall time which exceeds the default 120s tool timeout. I had to use `timeout 300` for the second run. This is a pre-existing constraint of the harness, not a regression. Not a blocker for the merge.

- **`permalink` scenario is unquoted in SCENARIOS map** — Pre-existing format inconsistency (R11 introduced it unquoted while R9-R12 use quoted). The audit-correct grep `^  \"[a-zA-Z0-9-]\+\": { setup` intentionally doesn't catch it. The README table has the matching row. Not a regression; just a quirk the audit grep accommodates.

- **Format check + lint output noise** — `oxfmt` and `oxlint` both print the version banner, which makes the `bun run check` output look noisy. Could be silenced with `--silent` flags in `package.json`, but cosmetic only.

## Retro improvements for R14

1. **Pre-extract the target source** before writing regex-based unit tests, to design the regex against actual content (not assumed shape).
2. **Run `bun test src/<new-test>.ts` immediately after writing each test** — fail-fast on regex mismatch.
3. **Consider pre-running `bun run scripts/test-review-ui/e2e.mjs --only <name>` after appending each new scenario** — catch any setup-fn syntax errors before committing the batch.
4. **Add a `bun run scripts/test-review-ui/e2e.mjs --only <name> --timeout 30` flag** to speed up per-scenario runs in CI. Currently each scenario has a 3s internal Promise.race timeout in `e2e.mjs:42`, which is fine for local dev but not for parallel.

## Files modified (final)

| File | Change | Net LOC |
|---|---|---|
| `src/index.ts` | +FindingResolutionKind, +POST /resolve extensions, +2 agent-prompt honor directives | +75 |
| `src/ui/app.ts` | +FindingResolutionKind (UI), +ConversationEntry fields, +showResolveReasonModal, +showMarkAsWontfixModal, +resolveFinding signature, +Resolve button await, +Mark as wontfix button, +resolution-kind badge, +openInDiffSearch/findMatchesInDiff/etc, +search state reset in renderDiffPanel | +575 |
| `src/ui/review.html` | +.diff-search-bar CSS, +.diff-search-counter/nav/close, +mark.diff-search-match, +@keyframes flash, +R13 #20 chip CSS, +R13 #21 radio CSS, +.finding-wontfix button, +4 .badge-resolution-{kind} CSS | +147 |
| `scripts/test-review-ui/scenarios.mjs` | +3 SCENARIOS map entries (resolve-with-reason, mark-as-wontfix, in-diff-search) + 3 setup functions | +87 |
| `src/resolve-with-reason.test.ts` | NEW: 12 unit tests | +178 |
| `src/mark-as-wontfix.test.ts` | NEW: 15 unit tests | +211 |
| `src/in-diff-search.test.ts` | NEW: 18 unit tests | +271 |
| `src/prior-notes.test.ts` | Updated T5.1 snapshot to include 5 new optional Finding fields | +5 |
| `README.md` | +3 "Other shipped features" bullets, +keyboard shortcut note, test:ui count 30 → 33 | +12 -3 |
| `scripts/test-review-ui/README.md` | Updated scenario count + 3 new table rows | +4 -1 |
| `.omo/round-13/dev-report.md` | NEW | +115 |
| `.omo/round-13/test-report.md` | NEW | +78 |
| `.omo/round-13/post-exec-analysis.md` | NEW (this file) | n/a |

Total: 12 files changed, 0 deleted, 3 new test files, 1 new dev-report, 1 new test-report, 1 new post-exec-analysis.

## Verdict

R13 is GREEN. All 15 ACs PASS, all 6 atomic commits are clean, all gates (format, lint, typecheck, build, unit, e2e) pass. Ready to merge to main + push to origin.
