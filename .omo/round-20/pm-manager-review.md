# R20 PM Manager — Gate Review

> **Generated**: 2026-06-30 (v5.3.6 R+ retro follow-up)
> **Round**: 20
> **Input**: `.omo/round-20/brief.md` + `.omo/round-20/competitor-landscape.md`
> **Pre-check**: PASS (R+ retro closure baseline `03cd113` verified via `git cat-file -e`)

## Verdict: **APPROVE** ✓

All 3 candidates validated. All within hard caps. GH issues opened.

## Pre-check (R3-fabrication defense)

```bash
$ git cat-file -e 03cd113
[exit 0]  # PASS
```

Baseline R+ retro closure commit (`03cd113` — AC1.2 fix + 7 skill patches) exists. PM Manager does not propagate R3-style fabricated audit trails.

## Per-candidate gate check

### Candidate #1 — Sidebar review progress indicator (issue #40)

- **Product-value gate 3-test**:
  1. README 缺段? **No** — README doesn't claim a sidebar progress counter. ✓ honest
  2. Non-developer visible? **Yes** — sidebar header counter visible to all reviewers. ✓ user-visible
  3. 竞品已有? **Yes** (GitHub PR + GitLab MR + Gerrit + Reviewable). ✓ defensible gap-fill
- **DUPLICATE check**: Searched codebase for "reviewed" progress counter UI — no existing implementation. `state.read` set + `toggleRead` function + `readBtn` exist (lines 2305, 4332) but no progress counter UI. ✓ no duplicate
- **SPECULATION check**: All claims have file:line evidence or external source. ✓
- **CONTRADICTION check**: None found. ✓
- **INFLATED check**: LOC estimate 50-80 is reasonable for ~1 DOM element + CSS. ✓
- **OBSCURE check**: Sidebar progress counter is universally understood UX. ✓
- **VERDICT**: **APPROVE** — issue #40 created with `pm-manager-approved,round-20,user-feedback`

### Candidate #2 — Sidebar filter: show only unread files (issue #41)

- **Product-value gate 3-test**:
  1. README 缺段? **No** ✓
  2. Non-developer visible? **Yes** ✓
  3. 竞品已有? **Yes** (GitLab MR + Gerrit auto-hide + Reviewable "Hide reviewed" toggle) ✓
- **DUPLICATE check**: Searched codebase for "filter unread" / "filter read" — no existing implementation. ★ Pinned filter chip pattern exists (precedent for chip UI). ✓ no duplicate
- **SPECULATION check**: All claims have evidence ✓
- **CONTRADICTION check**: None ✓
- **INFLATED check**: LOC 60-90 is reasonable for filter chip + state + filtered list. ✓
- **OBSCURE check**: Filter chips are standard UX. ✓
- **VERDICT**: **APPROVE** — issue #41 created with `pm-manager-approved,round-20,user-feedback`

### Candidate #3 — Search history (issue #42)

- **Product-value gate 3-test**:
  1. README 缺段? **No** ✓
  2. Non-developer visible? **Yes** ✓
  3. 竞品已有? **Yes** (GitHub + GitLab Cmd+F dropdown) ✓
- **DUPLICATE check**: Searched for "search history" / "recent searches" — no existing implementation. `DIFF_SEARCH_KEY` localStorage pattern at `src/ui/app.ts:605` (precedent). ✓ no duplicate
- **SPECULATION check**: All claims have evidence ✓
- **CONTRADICTION check**: None ✓
- **INFLATED check**: LOC 70-100 is reasonable for localStorage history + dropdown UI + keyboard nav. ✓
- **OBSCURE check**: Recent searches dropdown is standard UX. ✓
- **VERDICT**: **APPROVE** — issue #42 created with `pm-manager-approved,round-20,user-feedback`

## Hard caps verification

| Cap | Limit | This round | Status |
|---|---|---|---|
| feature | ≤ 3 | 3 | ✓ at cap |
| bugfix | ≤ 5 | 0 | ✓ |
| total | ≤ 8 | 3 | ✓ |
| polish | ≤ 1 | 0 | ✓ |
| architecture | ≤ 1 | 0 | ✓ |

## GH issues status

| # | Title | State | Labels |
|---|---|---|---|
| 40 | Sidebar review progress indicator | OPEN | pm-manager-approved, user-feedback, round-20 |
| 41 | Sidebar filter: show only unread | OPEN | pm-manager-approved, user-feedback, round-20 |
| 42 | Search history | OPEN | pm-manager-approved, user-feedback, round-20 |

## Validated for next round (Planner input)

| # | Issue | Type | User-value | LOC | File count | Profile |
|---|---|---|---|---|---|---|
| 40 | Sidebar review progress | feature | 3.5/5 | 50-80 | 1-2 src + 1 test | feature |
| 41 | Unread-only filter | feature | 3/5 | 60-90 | 1-2 src + 1 test | feature |
| 42 | Search history | feature | 3/5 | 70-100 | 1-2 src + 1 test | feature |
| **TOTAL** | | | | **180-270** | **3-6** | **feature** |

## Notes

- R20 is the first round applying SG.R19.8 (end-of-round mandatory gap-fix). Any R20 gaps MUST be fixed in-round.
- SG.R19.3 STRINGS_USAGE_PLAN included in brief.md — Dev MUST verify all 5 keys have `en` + `zh-CN` translations.
- Backlog freshness: 2 stale candidates (#12, #13) at boundary, no fresh-investigation signal.
- Profile gate passes all 3 → Phase 1 Architect full plan required.