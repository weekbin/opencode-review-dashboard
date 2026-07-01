# R31 PM Triage + Brief

**Date**: 2026-06-30
**Verdict**: 1 issue (pre-existing bilingual drift)

## R31 candidates (from R30 retro + self-investigation)

### A. Tsc PATH investigation (R22 carryover, 9 rounds stale) — RESOLVED
- R27 #55 added `scripts/typecheck.sh` wrapper
- R29 #59 added `.github/workflows/typecheck.yml` GitHub Actions workflow
- `bun run typecheck` → `tsc --noEmit` runs correctly
- ❌ NOT fresh — already shipped

### B. Pre-existing bilingual mismatch fix — FRESH ✅
- R30 dev subagent noted: README.md (25 feature list H3) vs README.zh-CN.md (26 feature list H3) drift
- Deep investigation: R23 added "Bulk delete recent-searches (multi-select)" to zh-CN feature list but NOT to EN feature list
- This is the actual 1-section drift (not a structure problem, but a content gap)
- EN is MISSING the R23 section that already exists in zh-CN
- Fix: add "Bulk delete recent-searches (multi-select)" to README.md, preserving the EN style and order

### C. New internal candidates (user feedback / self-investigation) — NONE FRESH
- R21-R30 retros: all suggestions already shipped (tsc + housekeeping + SG.R25.1 + bulk delete + virtualization + screenshots)
- 0 open issues
- Husky hook (R30) actively flags new drift at commit time

## R31 SCOPE: 1 issue

**#63 — Fix pre-existing bilingual drift: add R23 "Bulk delete recent-searches" to EN feature list**

## AC (Acceptance Criteria)

- AC1: README.md feature list includes "Bulk delete recent-searches (multi-select)" entry with R23 attribution
- AC2: README.md and README.zh-CN.md have same feature list H3 count (26 = 26)
- AC3: README.md and README.zh-CN.md have same total H3 count (32 = 32)
- AC4: Order is consistent between EN and ZH (both list bulk delete, bulk mark, per-finding delete, bulk delete conversation, IME-safe, keyboard shortcuts in same order)
- AC5: SG.R22.1 bilingual lockstep verify passes (pre-commit gate)

## Out of scope

- Restructuring the walkthrough section (H3 inside ## 它能做什么 / ## What you can do with it) — only feature list alignment
- Reorganizing section order across other parts of the doc — minimal change, just add the missing R23 entry
- New feature work — R31 is a polish round

## Carryovers (NOT in R31)

- Tsc PATH: already resolved by R27 #55 + R29 #59
- Pre-existing TSC PATH: N/A
