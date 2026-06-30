# R25 Doc Update Report

> **Generated**: 2026-06-30 (RALPH LOOP iteration 6, R25)
> **Round**: 25
> **Commits**: `c8c79b1` (docs(r25): README + zh-CN update — diff virt toggle + sidebar bulk delete) + `8af1cb7` (chore(round-25): archive entries in proposals.jsonl) + `9f4d2e6` (R25-gap-fix: re-add Diff virtualization visual section)
> **Strategy**: Bilingual lockstep per SG.6 + SG.R22.1 verification (3rd application since v5.3.7 embed)

## Files updated

| File | Locale | Lines added | Section |
|---|---|---|---|
| `README.md` | en | +6 | Diff virtualization toggle + bulk mark sidebar visual sections + 2 feature list entries |
| `README.zh-CN.md` | zh-CN | +6 | 1000+ 行文件 diff 虚拟化 + 批量标记侧边栏文件已审查 visual sections + 2 feature list entries |

## What was added

### English README
1. **Settings panel section** — updated to mention diff virtualization toggle (R25)
2. **Diff virtualization for 1000+ line files** (NEW visual section + R23 + R25 feature list entries)
3. **Bulk mark sidebar files as reviewed** (NEW visual section + R25 feature list entry)

### Chinese README (zh-CN)
1. **设置面板（集中偏好）** — updated to mention diff 虚拟化 toggle (R25)
2. **1000+ 行文件 diff 虚拟化** (NEW visual section + R23 feature list entry)
3. **批量删除最近搜索（多选）** — preserved from R23 docs
4. **批量标记侧边栏文件已审查** (NEW visual section + R25 feature list entry)

## SG.R22.1 verification (3rd application since v5.3.7 embed)

Pre-commit `grep -c` verification:

```bash
--- 'Settings panel' section count ---
README.md: 1, README.zh-CN.md: 1 ✓ MATCH

--- 'Diff virtualization for 1000+ line files' section count ---
README.md: 1, README.zh-CN.md: 1 ✓ MATCH (zh-CN uses '1000+ 行文件 diff 虚拟化')

--- 'Bulk mark sidebar files as reviewed' section count ---
README.md: 1, README.zh-CN.md: 1 ✓ MATCH (zh-CN uses '批量标记侧边栏文件已审查')

--- 'Bulk mark sidebar' feature list entry count ---
README.md: 2 (visual + feature list), README.zh-CN.md: 2 ✓ MATCH

--- 'Diff virtualization' feature list entry count ---
README.md: 3 (R23 section + R23 entry + R25 entry), README.zh-CN.md: 3 ✓ MATCH
```

**All visual sections + feature list entries match between README.md and README.zh-CN.md**.

## SG.R19.8 in-round gap-fix applied (R25-gap-fix)

Oracle caught a gap: the R25 doc edit accidentally removed the English `### Diff virtualization for 1000+ line files` visual section (R23 original) and missed adding the zh-CN `### 批量标记侧边栏文件已审查` visual section. SG.R19.8 mandatory gap-fix applied:

- Re-added English visual section between Settings panel and Bulk mark sidebar
- Added zh-CN visual section between 批量删除最近搜索 and IME 安全的搜索
- Captured in `proposals.jsonl` as separate R25-gap-fix entry per SG.R19.8 protocol

## Verdict

**PASS** — bilingual lockstep honored per SG.6. SG.R22.1 verified (all counts match). SG.R19.8 in-round gap-fix applied.