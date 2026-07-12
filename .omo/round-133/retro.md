# R133 Retro — bilingual tooltips + aria-labels wire-up

## What worked

Lead-direct round across 2 src files + 1 new test file. R81 retro's 51-round-dormant "Other hardcoded English `title=` attributes in review.html" carry-over was closed in a single round because the root cause was a one-function gap in `applyUITranslator`. Widening the translator to also walk `[data-i18n-title]` and `[data-i18n-aria-label]`, plus a `discoverAttributeKeys` scan + `MutationObserver`, registered 22 unique tooltip keys and 7 unique aria-label keys automatically — no per-key wiring. Pre-commit 8/8 passes on the first attempt (after correcting one test regex that didn't accept multi-line template literals). All 10 R133 contract tests red→green on the second iteration. Full project suite still 1049 pass.

## What didn't

- The first test file used regex `\(\s*` to match `querySelectorAll<HTMLElement>(...)` which failed because the source uses multi-line template literals (`(\n  \`[data-i18n-title="...{ecap}"]\`,\n)`). Simplified to a literal substring match without escape gymnastics.
- R105 conformance test fires on the v6 round-dir invariant. The first `bun test` after writing 3 of 6 artifacts tripped it (verify.md, retro.md, decision.md not yet written). That is expected during in-flight work; the round completes only when all 6 land.
- I almost let R132 sit idle after committing (the "5-min auto-pilot" promise was never backed by a real continuation mechanism). User had to ping me with `卡住了`. The fix was to immediately begin R133 instead of waiting for an external trigger. Captured this in a durable `CONSTRAINTS` memory entry.

## Carry-over list (≤3 items)

None — R133 closes the long-lived R81 retro flag. No new carry-over surfaced.

## Closed in this round (loop-internal)

- R81 carry-over "Other hardcoded English `title=` attributes in review.html" — **closed** (22 `data-i18n-title` + 7 `data-i18n-aria-label` keys now translate on language switch).
- v6 hard-cap puzzle: "loop stops saying 'wait 5min' without a real continuation" — **closed** by immediately beginning R133 in the same session after R132 SHIPped (memory entry 472).

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **One root-cause fix beats 51 rounds of partial work**: `applyUITranslator` was missing two selector branches. Patching both branches + auto-discovering attribute keys is the same LOC as a single per-key wiring would have been.
- **Match the source shape in tests**: regex assertions on TS template literals need to allow whitespace and newlines between the call's `(` and the backtick; using a literal-substring match (`/\[data-i18n-title="\$\{ecap\}"\]/`) is more robust than parsing call-site punctuation.
- **Browser screenshots add nothing for a wiring fix** when the equivalent red→green textual assertions exist. Documented in verify.md so future rounds skip the unnecessary `take-screenshots.sh` invocation.

## Risks Surfaced (not actioned this round)

- `data-i18n-placeholder` and similar attributes are not yet wired. Surface scan: zero matches in `review.html`, so this is preventive, not present.
- If a future round adds a new attribute flavor (e.g. `data-i18n-aria-describedby`), it will need a new branch in `applyUITranslator`. The `discoverAttributeKeys` scan will silently leave it untouched. Future-friendly: extend to a generic attribute map.

## v6 Compliance

- Hard caps: **1 polish** (≤1) + **0 feature** + **0 bugfix** = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).

## Round Profile

- Polish: 1 (close dormant i18n attribute-translator gap)
- Total: 1
- Subagents: 0
- Time: ~25 min wall-clock including user ping to recover from the R132 auto-pilot dead-end.