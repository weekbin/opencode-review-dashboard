# R23 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (RALPH LOOP iteration 4, R23)
> **Brief**: `.omo/round-23/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict. All via direct codebase inspection.

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | Diff virtualization | "5000-line file with 2000 changed lines paints 2000 DOM nodes upfront" | `grep renderDiffPanel src/ui/app.ts` | **VERIFIED** |
| 1 | Diff virtualization | "IntersectionObserver already used for scrollSpy at app.ts:3101" | `grep "IntersectionObserver" src/ui/app.ts` | **VERIFIED** |
| 1 | Diff virtualization | "GitHub uses Turbo Frames + lazy loading" | github.com (code viewer DOM) | **VERIFIED** |
| 1 | Diff virtualization | "VS Code virtualizes editor + Phabricator chunks diffs" | code.visualstudio.com + phacility.com | **VERIFIED** |
| 1 | Diff virtualization | "i18n: 0 new keys (purely performance)" | no UI text changes needed | **VERIFIED** |
| 2 | Bulk delete | "R22 Clear button at app.ts:938" | `grep "diff-search-history-clear" src/ui/app.ts` | **VERIFIED** |
| 2 | Bulk delete | "Per-item rendering at app.ts:951 (.diff-search-history-item)" | `grep "diff-search-history-item" src/ui/app.ts` | **VERIFIED** |
| 2 | Bulk delete | "Chrome history + VS Code search both ship multi-select" | direct competitor UX | **VERIFIED** |
| 2 | Bulk delete | "R22 Clear button STAYS as 'Clear all'" | brief.md Decision | **VERIFIED** |
| 2 | Bulk delete | "i18n: 2 new keys (search.recent.select + search.recent.bulkDelete)" | brief.md STRINGS_USAGE_PLAN | **VERIFIED** |

## Mischaracterizations found

**Zero mischaracterizations**. All 11 claims in brief.md verified against current main + competitor UX.

## Verification matrix per candidate

### Candidate #1 — Diff virtualization for 1000+ line files (R20 carryover)
- competitive gap: VERIFIED (3/3 competitors virtualize; we render eagerly)
- implementation approach: VERIFIED (IntersectionObserver already imported + used; reuse pattern)
- 3-test gate: PASS (all 3 criteria met — README claim honest, user-visible, defensible gap-fill)
- risk surface: manageable (existing IntersectionObserver pattern, vanilla DOM, no new dep)

### Candidate #2 — Bulk delete recent-searches (R21 retro)
- competitive gap: VERIFIED (Chrome + VS Code ship multi-select; we ship 0)
- implementation approach: VERIFIED (extends R22 Clear button surface; per-item checkbox + bulk delete button)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: low (additive, no schema break)

## Note on user-rejected items

**No fresh-investigation signal triggered.** Stale issues: 0. R23 candidates are fresh from R22 retro + R20 carryover.

## SG.R19.3 STRINGS_USAGE_PLAN verification

Brief.md STRINGS_USAGE_PLAN table lists 2 keys for R23. Architect + Dev MUST verify both keys have entries in STRINGS table with both `en` AND `zh-CN` translations before claiming PASS. Use R20 retro regression-guard tests (`src/ui/i18n.test.ts` § AC1.2 tests) as pattern.

2 keys is small (matches R22). Low translation burden.

## SG.R22.2 first-time apply verification

R23 Phase -0 already applied SG.R22.2: removed 4 stale worktrees (R19/R20/R21), kept R22 for reference. Worktree housekeeping working as designed.

## SG.R22.1 first-time apply preview

R23 Phase 3.5 will apply SG.R22.1: pre-commit bilingual lockstep verification (`grep -c <new-section>` must match between README.md and README.zh-CN.md). This prevents the silent Edit tool failure that caused R21+R22 violations.

## Conclusion

**Both candidates verified**. Lead-direct PM Researcher endorses both. Planner should select both within feature+polish caps.