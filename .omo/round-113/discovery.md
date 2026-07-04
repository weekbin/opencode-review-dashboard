# R113 Discovery

## Open GH issues (pm-manager-approved, round-113 tagged)

- **#77** 基于内容匹配的 finding 自动 resolve — content-hash auto-resolve
- **#78** Submit 时显示 AI 计划预览 — expected apply footprint
- **#84** Finding 任意时点直接删除 — Layer 1 polish + Layer 2 new feature (200-300 LOC combined)

## Carry-over (from R112 retro)

- (none — R112 closed clean)

## Decision

Pick top 2 by impact + scope:

**R113 profile = 2-feature bundle + 1 polish.**

- **#77** content-hash auto-resolve — `anchor.selected` already populated; on submit, hash + adjacent 3 lines, store in finding. On round-N+1, if hash matches → mark auto-resolved. ~150-180 LOC.
- **#78** Submit modal footprint preview — read pending findings, compute local heuristic (count by category, total lines touched), display in modal before submit. ~80-120 LOC.
- **#84 Layer 1** polish — fresh-draft delete adds confirm modal + label rename to `action.deleteDraft`. ~50 LOC.

Defer #84 Layer 2 to R114 (separate round).

Total ≤ 350 LOC, ≤ 10 files (cap is ≤10 for feature). Hard cap: 3 features + 1 polish = 4 total, within ≤8.