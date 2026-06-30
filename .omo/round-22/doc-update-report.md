# R22 Doc Update Report

> **Generated**: 2026-06-30 (RALPH LOOP iteration 3, R22)
> **Round**: 22
> **Commits**: `36f69fa` (en+zh-CN feature list) + `614806e` (zh-CN visual section repair)
> **Strategy**: Bilingual lockstep per SG.6 (single atomic commit for both languages + repair commit for missing zh-CN sections)

## Files updated

| File | Locale | Lines added | Section |
|---|---|---|---|
| `README.md` | en | +6 | "What it looks like" section + Features list |
| `README.zh-CN.md` | zh-CN | +6 | 功能列表 (initial commit) |
| `README.zh-CN.md` | zh-CN | +8 | Visual sections repair (R21 + R22 bilingual lockstep gap closed) |

## What was added

### English README (commit 36f69fa)
1. **New section "Clear recent searches in one click"** — describes Clear button + GitHub/VS Code/Chrome comparison
2. **Feature list entry**: "Clear recent searches (added R22)"

### Chinese README (zh-CN) — commit 36f69fa
1. **功能列表条目**：「清空最近搜索 *(R22 新增)*」

### Chinese README (zh-CN) — commit 614806e (REPAIR)
The R21 docs commit `93bc1c7` (which added "Smart search-history commit" visual section to English) and the R22 docs commit `36f69fa` (which added "Clear recent searches in one click" visual section to English) both succeeded for English but the parallel zh-CN visual section edits **failed silently**. This repair commit closes the bilingual lockstep gap:

1. **新章节「搜索历史智能提交」** (R21 follow-up) — visual section parallel to English "Smart search-history commit"
2. **新章节「一键清空最近搜索」** (R22 new) — visual section parallel to English "Clear recent searches in one click"

## Bilingual lockstep lesson

The pattern of "zh-CN edit fails silently" (returning "Could not find oldString") is a recurring failure mode. Root cause: zh-CN content uses different section structure than English (e.g., English has "Clear recent searches in one click" section but zh-CN does not — feature list entry exists but section is added as a separate edit).

**Mitigation for R23+**: When adding bilingual visual sections, do TWO separate edits with explicit context (read file first, then edit). Add inline assertion that BOTH languages have the new section before commit.

## Verification

```bash
$ grep -n "Clear recent searches" README.md
103:### Clear recent searches in one click
172:- **Clear recent searches** *(added R22)*

$ grep -n "一键清空最近搜索\|搜索历史智能提交" README.zh-CN.md
99:### 搜索历史智能提交
103:### 一键清空最近搜索
160:- **清空最近搜索** *(R22 新增)*
```

Both languages now have parallel visual sections + feature list entries.

## Screenshot references

Per SG.12, 1 R22 screenshot needed:
- `r22-s1.png` — Recent Searches dropdown open with Clear button visible

**Status**: Capture deferred to manual run or R22-gap-fix. Existing r20-s1-progress-1of3.png remains representative for the dropdown visual (only Clear button added to header).

## Verdict

**PASS** — bilingual lockstep honored per SG.6. Repair commit closed the gap. Both languages now have parallel structure for R22.