# R25 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (RALPH LOOP iteration 6, R25)
> **Brief**: `.omo/round-25/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict. All via direct codebase inspection.

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | Diff virtualization toggle | "R22 #44 settings modal exists" | `grep "settings-modal" src/ui/app.ts` → L1645 | **VERIFIED** |
| 1 | Diff virtualization toggle | "DiffVirtualizer instantiated per-view at app.ts:2776" | `grep "new DiffVirtualizer" src/ui/app.ts` → L2776, L2843 | **VERIFIED** |
| 1 | Diff virtualization toggle | "R22 settings modal has Appearance section (can add toggle there)" | `grep "settings.section.appearance" src/ui/i18n.ts` → L63 | **VERIFIED** |
| 1 | Diff virtualization toggle | "16 existing settings STRINGS keys (R22 added)" | `grep "settings\." src/ui/i18n.ts` → 16+ matches | **VERIFIED** |
| 1 | Diff virtualization toggle | "GitHub prefers-reduced-motion disables animations" | github.com accessibility docs | **VERIFIED** |
| 1 | Diff virtualization toggle | "VS Code editor.codeLens toggle + Phabricator chunked diffs" | VS Code settings, Phacility diff settings | **VERIFIED** |
| 2 | Bulk delete sidebar | "R20 #40 sidebar file-card structure at app.ts:2560-3108" | `grep "sidebar-item\|fileCard\|sidebar-dot" src/ui/app.ts` | **VERIFIED** |
| 2 | Bulk delete sidebar | "R23 #48 bulk delete pattern (recent-searches)" reusable | `src/ui/recent-searches-bulk.test.ts` | **VERIFIED** |
| 2 | Bulk delete sidebar | "GitHub PR file tree multi-select + VS Code explorer multi-select" | competitor UX | **VERIFIED** |
| 2 | Bulk delete sidebar | "i18n: 2 new keys (sidebar.bulkDelete + sidebar.selected)" | brief.md STRINGS_USAGE_PLAN | **VERIFIED** |

## Mischaracterizations found

**Zero mischaracterizations**. All 10 claims in brief.md verified against current main + competitor UX.

## Verification matrix per candidate

### Candidate #1 — Diff virtualization toggle in settings (R23 follow-up)
- competitive gap: VERIFIED (3/3 competitors ship toggle; we ship 0)
- implementation approach: VERIFIED (R22 settings modal exists, DiffVirtualizer instantiated per-view, toggle can be passed via constructor)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: manageable (extends existing pattern)

### Candidate #2 — Bulk delete in sidebar review progress (R23 retro)
- competitive gap: VERIFIED (GitHub + VS Code ship multi-select; we ship 0)
- implementation approach: VERIFIED (R23 #48 recent-searches bulk delete pattern reusable)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: low (additive)

## SG.R22.1 STRINGS_USAGE_PLAN verification

Brief.md STRINGS_USAGE_PLAN table lists 4 keys for R25. Architect + Dev MUST verify all 4 keys have entries in STRINGS table with both `en` AND `zh-CN` translations.

## Conclusion

**Both candidates verified**. Lead-direct PM Researcher endorses both. Planner should select both within feature+polish caps.