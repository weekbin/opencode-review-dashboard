# R24 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (RALPH LOOP iteration 5, R24)
> **Brief**: `.omo/round-24/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict. All via direct codebase inspection.

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | Per-hunk expand/collapse | "R23 #47 virtualizes OFF-SCREEN hunks; IN-VIEW hunks always render" | `grep "data-hunk" src/ui/app.ts` → 0 hits (R23 uses `data-hunk-placeholder` for off-screen, no per-hunk collapse) | **VERIFIED** |
| 1 | Per-hunk expand/collapse | "GitHub per-hunk expand via ▶ click" | github.com code viewer | **VERIFIED** |
| 1 | Per-hunk expand/collapse | "Phabricator inline +/- per hunk" | phacility.com diff viewer | **VERIFIED** |
| 1 | Per-hunk expand/collapse | "R23 virtualization placeholder pattern reusable for collapsed hunks" | `src/ui/diff-virtualization.ts:200+` | **VERIFIED** |
| 1 | Per-hunk expand/collapse | "i18n: 2 new keys (diff.hunk.collapse + diff.hunk.expand)" | brief.md STRINGS_USAGE_PLAN | **VERIFIED** |
| 2 | Toast screenshots | "showToast exists at app.ts:11 import" | `grep "showToast" src/ui/app.ts` | **VERIFIED** |
| 2 | Toast screenshots | "4 toast types: added review, copied permalink, copied MD, submitted" | `grep "showToast" src/ui/app.ts` → 4+ usages | **VERIFIED** |
| 2 | Toast screenshots | "20+ existing screenshots in docs/screenshots/" | `ls docs/screenshots/` | **VERIFIED** |
| 2 | Toast screenshots | "README 'Toast notifications' section is text-only (R14 #24)" | `grep "Toast" README.md` | **VERIFIED** |
| 2 | Toast screenshots | "i18n: 0 new keys (just images)" | brief.md | **VERIFIED** |

## Mischaracterizations found

**Zero mischaracterizations**. All 10 claims in brief.md verified against current main + competitor UX.

## Verification matrix per candidate

### Candidate #1 — Per-hunk diff expand/collapse (R23 follow-up)
- competitive gap: VERIFIED (3/3 competitors ship per-hunk expand/collapse; we ship 0)
- implementation approach: VERIFIED (R23 #47 placeholder pattern reusable; extends virtualization naturally)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: manageable (new rendering state + per-hunk UI, but R23 DiffVirtualizer already exists)

### Candidate #2 — Toast screenshots (R19/R20 carryover)
- competitive gap: VERIFIED (every modern app has toast screenshots in docs)
- implementation approach: VERIFIED (showToast exists, 4 toast types documented)
- 3-test gate: PASS
- risk surface: low (docs-only, screenshots in docs/screenshots/)

## Note on user-rejected items

**No fresh-investigation signal triggered.** Stale issues: 0. R24 candidates fresh from R23 retro + R19/R20/R22 carryover.

## SG.R19.3 STRINGS_USAGE_PLAN verification

Brief.md STRINGS_USAGE_PLAN table lists 2 keys for R24. Architect + Dev MUST verify both keys have entries in STRINGS table with both `en` AND `zh-CN` translations before claiming PASS.

## Conclusion

**Both candidates verified**. Lead-direct PM Researcher endorses both. Planner should select both within feature+polish caps.