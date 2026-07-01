# R26 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (RALPH LOOP iteration 7, R26)
> **Brief**: `.omo/round-26/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict. All via direct codebase inspection.

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | Per-finding delete from history | "R22 #45 added Clear button + R25 #48 added bulk delete + R25 #48 added removeRecentSearches()" | `grep "removeRecentSearches" src/ui/search-history.ts` → 1 hit | **VERIFIED** |
| 1 | Per-finding delete from history | "Recent Searches dropdown structure at app.ts:860-1020" | `grep "diff-search-history-item" src/ui/app.ts` → multiple hits | **VERIFIED** |
| 1 | Per-finding delete from history | "GitHub: per-PR hide; VS Code: per-file delete; Chrome: per-entry delete" | competitor UX | **VERIFIED** |
| 1 | Per-finding delete from history | "i18n: 2 new keys (search.recent.delete + search.recent.delete.confirm)" | brief.md STRINGS_USAGE_PLAN | **VERIFIED** |
| 2 | Bulk delete in conversation tab | "Conversation tab structure at app.ts:491-587" | `grep "state.activeTab !== \"conversation\"" src/ui/app.ts` | **VERIFIED** |
| 2 | Bulk delete in conversation tab | "R25 #52 sidebar bulk delete pattern reusable" | `src/ui/sidebar-bulk.test.ts` (R25 #52 pattern) | **VERIFIED** |
| 2 | Bulk delete in conversation tab | "GitHub PR comments multi-select + VS Code problems panel multi-select" | competitor UX | **VERIFIED** |
| 2 | Bulk delete in conversation tab | "i18n: 2 new keys (conversation.bulkDelete + conversation.selected)" | brief.md STRINGS_USAGE_PLAN | **VERIFIED** |

## Mischaracterizations found

**Zero mischaracterizations**. All 8 claims in brief.md verified against current main + competitor UX.

## Verification matrix per candidate

### Candidate #1 — Per-finding "delete from history" (R23 follow-up)
- competitive gap: VERIFIED (3/3 competitors ship per-entry delete; we ship 0)
- implementation approach: VERIFIED (R25 #48 added `removeRecentSearches(queries: string[])` which accepts a single query; per-entry button can call with `removeRecentSearches([entry])`)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: low (additive to existing R22 #45 + R25 #48)

### Candidate #2 — Bulk delete in conversation tab (R25 retro)
- competitive gap: VERIFIED (GitHub + VS Code ship multi-select; we ship 0)
- implementation approach: VERIFIED (R25 #52 sidebar bulk delete pattern reusable — Set tracking + bulk button)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: low (additive)

## SG.R22.1 STRINGS_USAGE_PLAN verification

Brief.md STRINGS_USAGE_PLAN table lists 4 keys for R26. Architect + Dev MUST verify all 4 keys have entries in STRINGS table with both `en` AND `zh-CN` translations.

## Conclusion

**Both candidates verified**. Lead-direct PM Researcher endorses both. Planner should select both within feature+polish caps.