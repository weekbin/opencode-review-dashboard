# R31 Plan

**Round**: 31
**Verdict**: 1 polish issue (#63)
**Date**: 2026-06-30

## #63: Fix pre-existing bilingual drift (R23 bulk delete section missing from EN)

### Problem
- R23 added "Bulk delete recent-searches (multi-select)" to zh-CN feature list but NOT to EN feature list
- R30 dev subagent detected: README.md (25 feature list H3) vs README.zh-CN.md (26 feature list H3) drift
- This is a 1-section content gap, not a structural problem

### Solution
Add the missing R23 section to README.md, preserving EN style and order:
- Insert "### Bulk delete recent-searches (multi-select)" between "### Diff virtualization for 1000+ line files" and "### Bulk mark sidebar files as reviewed"
- EN attribution format: `*(added R23)*` (matches existing pattern)
- Content: 1 bullet point matching the zh-CN translation

### Acceptance Criteria
- AC1: README.md feature list includes "Bulk delete recent-searches (multi-select)" with R23 attribution
- AC2: README.md and README.zh-CN.md have same feature list H3 count (26 = 26)
- AC3: README.md and README.zh-CN.md have same total H3 count (32 = 32)
- AC4: Order is consistent (bulk delete → bulk mark → per-finding delete → bulk delete conversation → IME-safe → keyboard shortcuts)
- AC5: SG.R22.1 bilingual lockstep verify passes (pre-commit gate)

### Out of scope
- Restructuring walkthrough section (H3 inside ## What you can do with it)
- Reorganizing section order across other parts of the doc
- New feature work

### Risk
- LOW: simple content addition, no code changes, no test impact

### Files to modify
- README.md (1 insertion)
- README.zh-CN.md (no change — already has the section)
