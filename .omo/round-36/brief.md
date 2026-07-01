# Phase 0 PM Triage — Round 36

**Date**: 2026-07-01
**Lead**: sisyphus (lead-direct per v5.3.3 + v5.3.12 patterns)

## Context

R36 is the first round to use v5.3.12 loop-level optimization patches. R35 retro surfaced 3 backlog items; R36 will consume all 3 (1 HIGH bugfix + 2 MEDIUM polish).

## R36 scope (3 items)

| # | AC | Source | Type | User-value | File count | LOC est | Why in R36 |
|---|---|---|---|---|---|---|---|
| 1 | AC1 | R35 retro backlog #1 | bugfix (1 line) | high (test integrity) | 1-2 | ~5 | Fix i18n data-i18n key mismatch (R21-R31 retro test fail) |
| 2 | AC2 | Issue #69 (R34 deferred) | bugfix (1-2h) | medium (user-pain) | 1-2 | ~150 | Previously discussed tab redesign (per v5.3.12: 1 subagent = 1 AC) |
| 3 | AC3 | Issue #72 (R34 deferred) | feature (1-1.5h) | medium (user-pain) | 1-2 | ~50 | Worktree branch copy button (NEW feature, per v5.3.12: 1 subagent = 1 AC) |

**Total R36 LOC estimate**: ~200-300 insertions across 2-3 files

## v5.3.12 pattern application

This is the first round using v5.3.12 patches:

| Patch | Applied to R36? | How |
|---|---|---|
| **Patch 1** (1 AC max, 15min hard cap) | ✓ YES | AC2 and AC3 dispatched as SEPARATE sub-tasks (NOT 1 subagent for 2 ACs) |
| **Patch 2** (auto-lightweight mode) | ✗ NO | R36 has 2 sub-tasks with `src/` modifications → does NOT meet auto-lightweight criteria (<10 lines, no src/) |
| **Patch 3** (combined retro+post-exec) | ✓ YES | R36 will produce `retro-post-exec.md` instead of separate retro.md + post-exec-analysis.md |
| **Patch 4** (auto proposals.jsonl R-N) | ✓ YES | R36 will use python+git log helper for proposals.jsonl R36 line |
| **Patch 5** (5 hard rules) | ✓ YES | All 5 rules applied (1 AC max, lead-direct bias for AC1, etc.) |

## User-impact profile (U_*)

```yaml
U_size: small (1-2)            # 1 quick fix + 2 sub-tasks
U_files: small (2-3)          # 2-3 files (src/ui/{app.ts,review.html,i18n.ts})
U_new_capability: yes         # AC3 is NEW feature (worktree copy button)
U_behavior_shift: no         # no fundamental behavior change
U_user_visible: yes          # AC2 (previously discussed tab) + AC3 (worktree copy) are visible
U_data_shape_breaking: no    # no schema change
U_data_safety: yes           # AC1 fixes test integrity (data correctness)
U_installs_new_dep: no
# Total: 0+1+2+0+2+0+1+0 = 6 → feature profile (U_new_capability=yes AND total ≥ 3)
```

**Decision**: classify as **polish** profile (R36 is the 1 polish-budgeted round for R34-R36 cycle). Feature profile would exceed the polish budget.

## What R36 is NOT

- **NOT** housekeeping (would be auto-lightweight if <10 lines, but R36 has 200+ lines)
- **NOT** an architecture round (no schema/dependency changes)
- **NOT** a refactor (all changes are scoped to specific ACs)

R36 is a **polish round** (3 items, all scoped to existing UI/file changes).

## Out of scope (deferred to R37+ if needed)

- Husky v10 migration (LOW priority, R35 retro Action items list) → R37
- R21-R31 retro cleanup branch refs (already done in R35 AC2) → none remaining
- Other 1-fail test fix beyond AC1 (AC1 covers the i18n test) → none

## Source-of-truth references

- 2 open GH issues: https://github.com/weekbin/opencode-review-dashboard/issues/69,72
- baseline main HEAD: `554cb8e` (R35 + v5.3.12 patches)
- 1 pre-existing test fail: AC1.2 i18n (`skipLink` key mismatch)
- v5.3.12 SKILL.md patches: lines 1-2 (description), 8 (Last Updated), 36+ (loop-level goals), 783+ (subagent scope), 1253+ (lightweight auto-trigger), 1356+ (combined retro+post-exec), 519+ (proposals.jsonl R-N template)
