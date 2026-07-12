# R151 Brief — clean 14 of 15 unused-variable warnings (R147 retro flag closure)

## Scope

1. **`src/ui/r139-fallback-copy.test.ts`** — remove unused `beforeEach`, `mock` imports
2. **`src/ui/settings.test.ts`** — remove unused `afterEach`, `beforeEach` imports
3. **`src/ui/r43-feedback.test.ts`** — remove unused `opening` var + `btnEnd` var (its dependency)
4. **`src/ui/r70-cmdp-and-modal-i18n.test.ts`** — remove unused `I18N_TS_PATH` constant
5. **`src/ui/r67-conversation-badges-i18n.test.ts`** — remove unused `I18N_TS_PATH` constant
6. **`src/ui/r72-edit-finding-modal-i18n.test.ts`** — remove unused `I18N_TS_PATH` constant
7. **`src/ui/r112-out-of-diff.test.ts`** — remove unused `INDEX_TS` constant + `idxSrc` var
8. **`src/ui/diff-virtualization.test.ts`** — remove unused `I18N` constant
9. **`src/r117-reconcile-overlay.test.ts`** — remove unused `INDEX_TS` constant
10. **`src/r131-round-lock-on-approve.test.ts`** — remove unused `i18nTs`, `reviewHtml` constants
11. **`src/ui/app.ts`** — remove unused `addRecentSearch` from `search-history` import
12. Append R150 entry to `.omo/proposals.jsonl` (per-SHIP discipline)

## Files involved

- 11 src files (10 test files + 1 source file)
- `.omo/proposals.jsonl` — 1 append

## Existing patterns

- R139 (legacyExecCommandCopy hoist) introduced `import { describe, expect, it, beforeEach, mock }` for testing purposes. The `beforeEach` and `mock` imports are unused — this is the test setup bloat from R139.
- R67/R70/R72 introduced `I18N_TS_PATH` constants as a "nice to have" reference but never used them in test bodies.
- R131 introduced `i18nTs` and `reviewHtml` constants as references but the test bodies use different variables (`appTs`, `indexTs`).

## Simplest change

Per call-site list. ~15 LOC net deletion (14 vars/imports/constants removed) + 1 housekeeping append.

## Risk

- **No behavior change** — these are dead-code deletions.
- **1 of 15 deliberately kept** (`contextHash` in `src/index.ts:434`): technically unused but acts as a test fixture for R113 AC3 + R131. Documented in R151 verify.
- **All regressions verified** via stash-and-test pattern (R113 + R131 tests pass after R151 changes).

## Acceptance

- `bun run check | grep -c 'no-unused-vars'` returns 1 (was 15) — 14 cleaned
- Full project suite stays green (was 1101)
- `bun run check` PASS (lint + typecheck)
- Pre-commit 8/8 PASS

## Profile

Housekeeping. 11 src files modified + 1 housekeeping append. Pure dead-code cleanup.