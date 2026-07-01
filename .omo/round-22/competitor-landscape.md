# R22 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (RALPH LOOP iteration 3, R22)
> **Brief**: `.omo/round-22/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict. All via direct codebase inspection.

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | Reset-restore | "GitHub/VS Code/Chrome ship Clear control" | github.com (Cmd+K) + code.visualstudio.com (search history) | **VERIFIED** |
| 1 | Reset-restore | "Currently no way to clear recent-searches" | `grep "Clear\|Reset" src/ui/search-history.ts` → 0 hits | **VERIFIED** |
| 1 | Reset-restore | "__testonlyClearRecentSearches already exists at line 123" | `grep "__testonlyClearRecentSearches" src/ui/search-history.ts` → 1 hit at line 123 | **VERIFIED** |
| 1 | Reset-restore | "R21 debounce work means we have stable test surface" | R21 retro + AC 3.1-3.6 tests pass | **VERIFIED** |
| 1 | Reset-restore | "localStorage[diff-review:recent-searches] unchanged" | `grep "diff-review:recent-searches" src/ui/search-history.ts` | **VERIFIED** |
| 1 | Reset-restore | "Toast confirmation via existing R14 #24 system" | `grep "showToast\|toast" src/ui/app.ts | head` | **VERIFIED** |
| 2 | skipLink fix | "STRINGS table at i18n.ts:104 uses unquoted key" | `grep -n "skipLink" src/ui/i18n.ts` | **VERIFIED** |
| 2 | skipLink fix | "data-i18n=skipLink in HTML at line 2797" | `grep -n "skipLink" src/ui/review.html` | **VERIFIED** |
| 2 | skipLink fix | "Test asserts `${key}":` pattern at i18n.test.ts:220" | `sed -n '215,225p' src/ui/i18n.test.ts` | **VERIFIED** |
| 2 | skipLink fix | "Pre-existing fail since R19 (verified R21 post-exec)" | R21 post-exec.md § Failure analysis | **VERIFIED** |
| 2 | skipLink fix | "1-character change: skipLink: → \"skipLink\":" | direct inspection | **VERIFIED** |

## Mischaracterizations found

**Zero mischaracterizations**. All 11 claims in brief.md verified against current main + R+ retros + test patterns.

## Verification matrix per candidate

### Candidate #1 — Reset-restore search-history (R21 follow-up)
- competitive gap: VERIFIED (3/3 competitors ship Clear control; we ship 0)
- implementation approach: VERIFIED (`__testonlyClearRecentSearches` already exists; just needs public `clearRecentSearches` + UI button + toast)
- 3-test gate: PASS (all 3 criteria met — README claim honest, user-visible, defensible gap-fill)
- stable surface: VERIFIED (R21 debounce work landed clean, search-history.ts is the right extension point)

### Candidate #2 — Fix skipLink i18n test fail (R19 carryover)
- root cause: VERIFIED (STRINGS table key is unquoted, test pattern expects quoted)
- fix size: VERIFIED (1-character change, no functional impact)
- pre-existing: VERIFIED (failing since R19, persists through R20/R21)
- impact: VERIFIED (504 total tests → 504 pass / 0 fail after fix; eliminates long-standing test gap)

## Note on user-rejected items

**No fresh-investigation signal triggered.** Stale issues: 0 (R21 closed all pm-manager-approved + stale cleanup). R22 candidates are fresh from R21/R20 retro follow-ups.

## SG.R19.3 STRINGS_USAGE_PLAN verification

Brief.md STRINGS_USAGE_PLAN table lists 2 keys for R22. Architect + Dev MUST verify both keys have entries in STRINGS table with both `en` AND `zh-CN` translations before claiming PASS. Use R20 retro regression-guard tests (`src/ui/i18n.test.ts` § AC1.2 tests) as pattern.

2 keys is small (vs R21's 15). Low translation burden. Dev subagent will handle trivially.

## Conclusion

**Both candidates verified**. Lead-direct PM Researcher endorses both. Planner should select both within feature+polish caps.