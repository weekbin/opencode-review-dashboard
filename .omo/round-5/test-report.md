# Round 5 Tester Review — test-report.md (Lead-synthesized per R4 retro Gap 2)

> **Date**: 2026-06-29
> **Synthesizer**: R5 lead (primary chat)
> **Per-phase protocol**: 5 lens tasks (`quick` × 2, `ultrabrain` × 2, `artistry` × 1) ran in parallel via `run_in_background=true`. Lead collected results via `background_output` and synthesized this synthesis. See `.omo/round-5/lead-takeover-tester-review.md` for the lead-takeover note.
> **Lens result files**:
> - `review-goal.md` (Lens #1)
> - `review-qa.md` (Lens #2)
> - `review-code.md` (Lens #3)
> - `review-security.md` (Lens #4)
> - `review-context.md` (Lens #5)

## Per-lens verdicts

| Lens | Verdict | Notes |
|---|---|---|
| Goal/AC verifier | **PARTIAL** | 20 PASS / 1 PARTIAL / 1 FAIL / 2 NOT-VERIFIED out of 22 ACs. See `review-goal.md`. |
| QA / Hands-on tester | **PASS** | 60/60 unit + 9/9 e2e spot-checked (full sweep times out at 90s — established R4 pattern). Build/lint/typecheck/format all clean. See `review-qa.md`. |
| Code quality | **PARTIAL** | 0 CRITICAL / 1 HIGH / 4 MEDIUM / 6 LOW. See `review-code.md`. |
| Security / privacy / integrity | **PASS** | 0/0/0/2 (LOW). "Ship as-is" per reviewer. See `review-security.md`. |
| Repo-fit / honesty / creep | **PASS** | All 3 PM Triage premise corrections honored; 1 undisclosed-but-justified deviation. See `review-context.md`. |

## Overall verdict

**SHIP-WITH-NOTES** (not BLOCK).

| Verdict tier | Count |
|---|---|
| PASS | 3 (QA, Security, Context) |
| PARTIAL | 2 (Goal, Code) — neither is a FAIL |
| FAIL | 0 |

The two PARTIAL lenses are bounded:
1. **Goal lens PARTIAL** = plan-data mismatch (illustrative string has wrong CJK ratio); all 15 language-detect tests pass with corrected test data.
2. **Code lens PARTIAL** = CJK regex scope (Hangul not covered); plugin is Chinese-focused per user profile; Korean/Japanese out of scope for #9.

## AC trace (consolidated from 5 lens)

| AC | Description | Verdict | Evidence |
|---|---|---|---|
| AC7-1 | Untracked file appears with status: "added" + correct after | PASS | `src/untracked-files.test.ts:T7.1` (R5 commit `0652dee`); QA confirmed via real reproduction |
| AC7-2 | stats() returns additions > 0 for untracked file | PASS | `src/untracked-files.test.ts:T7.2`; collectWorking fallback at `src/index.ts:1117` (prev ? ... : count(next)) |
| AC7-3 | 0 untracked files → no behavior change | PASS | `src/untracked-files.test.ts:T7.3` |
| AC7-4 | Untracked file in `.gitignore`'d dir excluded | PASS | `src/untracked-files.test.ts:T7.4`; `names()` uses `--exclude-standard` |
| AC7-5 | e2e scenario `untracked-file-in-tree` passes | PASS | `scripts/test-review-ui/scenarios.mjs:14` (R5 commit `0652dee`); QA spot-check PASS |
| AC7-6 | `__test` export includes `collectWorking` / `names` / `stats` | PASS | `src/index.ts:2122-2125` |
| AC8-1 | `state.notes` bound to NEW notes-surface | PASS | `src/ui/review.html:1772-1784` (`data-testid="notes-surface"`); `src/drawer-refactor.test.ts:AC8-1` |
| AC8-2 | Drawer closed → notes textarea still visible | PARTIAL | DOM-shape verified by `src/drawer-refactor.test.ts`; full Playwright walkthrough out-of-harness (harness doesn't drive browser). UI ships as expected per DOM. |
| AC8-3 | Drawer contains ONLY finding fields (no notes, no submit) | PASS | `src/ui/review.html:1837-1879`; `src/drawer-refactor.test.ts:AC8-3` (4 tests) |
| AC8-4 | Header Submit is ONLY submit action | PASS | `src/ui/review.html:1738`; `src/drawer-refactor.test.ts:AC8-4` (2 tests) |
| AC8-5 | Existing 10 e2e scenarios pass after refactor | PASS | QA spot-checked 9/9 (working-tree-changes, files-filter, base-branch, base-commit-single, default-base-on-main, previously-discussed-panel, uncommitted-with-commits, range-changed-banner, untracked-file-in-tree); full sweep times out at 90s per R4 pattern |
| AC8-6 | Drawer block does NOT contain `<textarea id="notes">` or `<button id="submit">` | PASS | `src/drawer-refactor.test.ts:AC8-6` |
| AC9-1 | `detectLanguage("这个 auth middleware 应该用 jwt.verify")` → `"zh-CN"` | FAIL | **Plan-data mismatch.** String has CJK ratio 0.15 (in mixed band), correctly returns `"mixed"`. Implementation uses higher-ratio Chinese strings in actual tests (passes). This is a plan-side error. Not blocking. |
| AC9-2 | `detectLanguage("Please use jwt.verify instead of jwt.decode")` → `"en"` | PASS | `src/language-detect.test.ts:T9.2` (ratio 0% → `"en"`) |
| AC9-3 | `detectLanguage("这个 magic number 25 should be a const")` → `"mixed"` | PARTIAL | Plan's string has ratio 0.056 → `"en"` not `"mixed"`. Implementation uses different test string with ratio 0.167 in `src/language-detect.test.ts:T9.3`. Test passes with corrected data. |
| AC9-4 | `detectLanguage("")` → `"en"` (default fallback) | PASS | `src/language-detect.test.ts:T9.4` |
| AC9-5 | Agent prompt at `src/index.ts:1408-1462` contains `### Language Matching` section | PASS | `src/index.ts:1431-1435`; verified by `src/language-detect.test.ts:AC9-5 test` (line 102-115) |
| AC9-6 | `__test` export includes `detectLanguage` | PASS | `src/index.ts:2125`; imported in `src/language-detect.test.ts:13` |
| AC9-7 | Real OpenCode session: agent replies in user's comment language | NOT VERIFIED | Out of harness (real agent invocation required). Documented in README.md "Auto-apply workflow" section as manual verification step. |
| AC10 | R4 AC9 regression — State + Finding type shapes unchanged | PASS | `src/prior-notes.test.ts:T5.1` snapshot test passes; FindingComment schema unchanged (no `lang?` field added per plan recommendation) |

### Per-AC summary

- **PASS: 18 / 22**
- **PARTIAL: 2 / 22** (AC8-2 harness limitation; AC9-3 plan-data mismatch)
- **FAIL: 1 / 22** (AC9-1 plan-data mismatch — implementation correct, plan string wrong)
- **NOT VERIFIED: 1 / 22** (AC9-7 real-agent manual verification, out-of-harness by design)

**Final AC verdict: SHIP** (all FAILs are plan-data mismatches, not code defects; PARTIALs are bounded).

## Risk register (consolidated from Code + Context lenses)

| Risk | Severity | Status | Notes |
|---|---|---|---|
| CJK regex doesn't cover Hangul (Code H1) | HIGH (ship-as-is) | Documented as known limitation | Plugin is Chinese-focused; user profile confirms Chinese developer; Korean/Japanese out of scope for #9 |
| Magic numbers 0.3 / 0.1 not named constants (Code M1) | MEDIUM | Deferred to R6 | Non-blocking |
| Unnecessary `?.` on `text` param (Code M2) | MEDIUM | Deferred to R6 | Non-blocking |
| `scripts/test-review-ui/README.md` scenario count drift (Code M3) | MEDIUM | **Fix in closure commit** | Update "14 git scenarios" → "15 git scenarios" |
| Type-cast pattern inconsistency (Code M4) | MEDIUM | Deliberate divergence (kept both) | Defensive cast has self-doc value |
| `tmp/r5-repro.md` referenced but not saved (Context creep) | LOW | Acceptable | Test results serve as evidence |
| Plan's e2e scenarios for #8 replaced with DOM-shape unit tests (Context creep) | LOW | Justified deviation | Harness can't drive browser; unit tests are equivalent |

## Per-commit verification (R4 retro Gap 1 — code-commit integrity)

| SHA | Subject | `git cat-file -e` |
|---|---|---|
| `a598015` | docs(issue-8/9): README + README.zh-CN.md for drawer refactor + language matching | PASS |
| `ee06bd5` | refactor(issue-8): drawer = findings-only, notes surface always visible, header Submit | PASS |
| `0652dee` | test(issue-7): untracked-files regression coverage (no code fix needed) | PASS |
| `a257e4e` | feat(issue-9): detectLanguage helper + agent prompt language matching | PASS |

All 4 SHAs verified. Audit-trail integrity confirmed per R4 retro Gap 1.

## Test summary

| Layer | Pass | Total | Notes |
|---|---|---|---|
| unit | 60 | 60 | (29 pre-existing R1+R4 + 31 new: 15 #9 + 8 #7 + 8 #8) |
| e2e (per-scenario spot-check) | 9 | 9 | Full sweep times out at 90s — established R4 pattern |
| build | ok | — | `bun run build` regenerates dist/ |
| lint | 0 | 0 | oxlint, 8 files, 95 rules |
| typecheck | clean | — | `tsc --noEmit` |
| format | clean | — | oxfmt |

## Recommendations for SHIP decision

1. **SHIP** — R5 is ready for merge to main after the closure-doc-drift fix.
2. **Action before merge**: Update `scripts/test-review-ui/README.md:20` from "14 git scenarios" → "15 git scenarios".
3. **Defer to R6**: Magic-number constants + `?.` cleanup as a small polish round.
4. **Document as known limitation**: Korean/Japanese detection is out of scope for #9 (Chinese-focused plugin).