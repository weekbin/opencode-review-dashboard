# Test Report — Round 43

**Profile**: bugfix
**Lens count**: 3 (Goal + QA + Security; Code + Context skipped per gating)

## Verdict per lens

| Lens | Verdict | File | Notes |
|---|---|---|---|
| #1 Goal | **PASS** | `review-goal.md` | All 5 ACs traceable to file:line changes |
| #2 QA | **PASS** | `review-qa.md` | 622/622 tests pass, 0 TS errors |
| #3 Code | N/A (skipped) | — | bugfix profile |
| #4 Security | **PASS** | `review-security.md` | Non-security-affecting changes; OpenCode plugin metadata fix added |
| #5 Context | N/A (skipped) | — | bugfix profile |

**3/3 required lenses PASS. Phase 3a verdict: PASS.**

## Round 43 scope verification

**In-scope (5)** — all 5 ship in R43:
1. range-banner empty-state + position (CSS)
2. Conversation mark-as-duplicated → resolution_kind badge (DOM)
3. Settings icon + overflow (HTML/SVG)
4. Previously-discussed z-index (CSS)
5. Default language zh-CN (i18n.ts config)

**Out-of-scope (deferred to R44)** — listed in `brief.md ## Self-Critique`:
- hide-whitespace perf + loading (perf round)
- COMMits panel folded/unfolded visual cue (polish)

## Test summary

| Test file | Total tests | Pass | Fail |
|---|---|---|---|
| `src/ui/r43-feedback.test.ts` (new) | 10 | 10 | 0 |
| `src/ui/i18n.test.ts` (existing, 1 updated) | 41 | 41 | 0 |
| `src/ui/settings.test.ts` (existing, test updated) | 27 | 27 | 0 |
| Full suite (35 files) | 622 | 622 | 0 |

**Test count delta**: +10 (R43 new), +0 (i18n unchanged count, 1 updated), +0 (settings unchanged count, 1 updated).
**Net**: 622 (was 612 before R43).

## 3 Fast Gates (Phase 2.5)

| Gate | Status |
|---|---|
| `bun run check` | PASS (0 errors) |
| `bun run build` | PASS (304 files) |
| `bun test` | PASS (622/622) |

## SG.R27.1 runtime load verification

`scripts/verify-plugin-load.mjs` — all 4 gates PASS:
- runtime-compat ✅
- PluginModule-shape ✅ (default.id="diff-review-dashboard")
- hook-contract ✅ (commands: diff-review-dashboard)
- path-plugin-entry ✅ (opencode.json.id matches default.id)

**Note**: pre-existing bug fix included — `opencode.json` was missing `id` field (1.17.12 strict plugin loader requires it). Fixed as loop-internal item in current worktree per v5.4 NO DEFERRAL rule.

## Phase 3a → 3b → 3c → 3.5 → 4

Phase 3a verdict PASS. Proceed to Phase 3b (Diff) and Phase 3c (Playwright walkthrough).
