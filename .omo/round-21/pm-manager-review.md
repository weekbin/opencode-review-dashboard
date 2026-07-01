# R21 PM Manager — Gate Review

> **Generated**: 2026-06-30 (v5.3.6 R+ retro follow-up — 3rd round)
> **Round**: 21
> **Input**: `.omo/round-21/brief.md` + `.omo/round-21/competitor-landscape.md`
> **Pre-check**: PASS (R20 gap-fix closure baseline `521dfb4` verified via `git cat-file -e`)

## Verdict: **APPROVE** ✓

Both candidates validated. All within hard caps. GH issues opened.

## Pre-check (R3-fabrication defense)

```bash
$ git cat-file -e 521dfb4
[exit 0]  # PASS
```

Baseline R20 gap-fix closure commit (`521dfb4` — SG.R20.1 in-round fix) exists. PM Manager does not propagate R3-style fabricated audit trails.

## Per-candidate gate check

### Candidate #1 — Search history debounce (issue #43)

- **Product-value gate 3-test**:
  1. README 缺段? **No** — README mentions "Recent searches" but doesn't specify capture timing. ✓ honest
  2. Non-developer visible? **Yes** — clean history list. ✓ user-visible
  3. 竞品已有? **Yes** (GitHub + VS Code ship debounce). ✓ defensible gap-fill
- **DUPLICATE check**: Searched codebase for debounce/throttle — no existing implementation. AC3.3 dedup+max 5 already in place (`search-history.ts:64`). ✓ no duplicate
- **SPECULATION check**: All claims have file:line evidence. ✓
- **CONTRADICTION check**: None. ✓
- **INFLATED check**: LOC 30-50 is reasonable for ~1 timer + 1 listener. ✓
- **OBSCURE check**: Search history debounce is standard UX. ✓
- **VERDICT**: **APPROVE** — issue #43 created with `pm-manager-approved,round-21,user-feedback`

### Candidate #2 — Settings page (issue #44)

- **Product-value gate 3-test**:
  1. README 缺段? **No** — README mentions theme/layout individually but no centralized settings. ✓ honest
  2. Non-developer visible? **Yes** — settings modal is user-facing. ✓
  3. 竞品已有? **Yes** (5/7 competitors). ✓ defensible gap-fill
- **DUPLICATE check**: Searched for "settings" / "preferences" — no existing implementation. localStorage keys exist (`DIFF_SEARCH_KEY` at app.ts:605, `LANGUAGE_KEY` at i18n.ts, etc.) but no central config UI. ✓ no duplicate
- **SPECULATION check**: All claims have evidence. ✓
- **CONTRADICTION check**: None. ✓
- **INFLATED check**: LOC 200-350 is reasonable for new panel + 15 i18n keys + 4 sections. ✓
- **OBSCURE check**: Settings page is standard UX. ✓
- **VERDICT**: **APPROVE** — issue #44 created with `pm-manager-approved,round-21,user-feedback`

## Hard caps verification

| Cap | Limit | This round | Status |
|---|---|---|---|
| feature | ≤ 3 | 1 (settings page) + 1 polish (search history debounce, counts under feature) | ✓ |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 2 | ✓ |
| polish | ≤ 1 | 1 (search history debounce) | ✓ at cap |
| architecture | ≤ 1 | 0 | ✓ |

## GH issues status

| # | Title | State | Labels |
|---|---|---|---|
| 43 | Search history debounce | OPEN | pm-manager-approved, user-feedback, round-21 |
| 44 | Settings page | OPEN | pm-manager-approved, user-feedback, round-21 |

## Validated for next round (Planner input)

| # | Issue | Type | User-value | LOC | File count | Profile |
|---|---|---|---|---|---|---|
| 43 | Search history debounce | polish | 2.5/5 | 30-50 | 1-2 src + 1 test | polish |
| 44 | Settings page | feature | 3/5 | 200-350 | 2-3 src + 2 tests | feature |
| **TOTAL** | | | | **230-400** | **3-5** | **feature + 1 polish** |

## Notes

- R21 is the 3rd round applying SG.R19.8 (end-of-round mandatory gap-fix). 7 R+ retro patches + SG.R20.1 all in effect.
- R21 CLEANUP: close stale #12 + #13 in decision.md ## Stale backlog section, no separate commit needed.
- Backlog freshness: 2 stale at boundary (does NOT trigger fresh-investigation).
- Profile gates: feature (1) + polish (1) = total 2, all within caps.