# R26 Doc Update Report

> **Generated**: 2026-06-30 (RALPH LOOP iteration 7, R26)
> **Round**: 26
> **Commits**: `4b0bf72` (docs(r26): README + zh-CN update — per-finding delete + bulk delete conversation) + `33b1d3b` (chore(round-26): archive entries in proposals.jsonl)
> **Strategy**: Bilingual lockstep per SG.6 + SG.R22.1 verification (4th application since v5.3.7 embed)

## Files updated

| File | Locale | Lines added | Section |
|---|---|---|---|
| `README.md` | en | +6 | Per-finding delete from history + Bulk delete in Conversation tab visual sections + 2 feature list entries |
| `README.zh-CN.md` | zh-CN | +6 | 从历史中删除单条 + 批量删除 Conversation tab visual sections + 2 feature list entries |

## What was added

### English README
1. **Per-finding delete from history** (NEW visual section + R26 feature list entry)
2. **Bulk delete in Conversation tab** (NEW visual section + R26 feature list entry)

### Chinese README (zh-CN)
1. **从历史中删除单条** (NEW visual section + R26 feature list entry)
2. **批量删除 Conversation tab** (NEW visual section + R26 feature list entry)

## SG.R22.1 verification (4th application since v5.3.7 embed)

Pre-commit `grep -c` verification:

```bash
--- 'Per-finding delete from history' section count ---
README.md: 1, README.zh-CN.md: 1 ✓ MATCH

--- 'Bulk delete in Conversation tab' section count ---
README.md: 1, README.zh-CN.md: 1 ✓ MATCH

--- 'Per-finding delete' feature list entry ---
README.md: 2 (visual + feature list), README.zh-CN.md: 2 ✓ MATCH

--- 'Bulk delete Conversation' feature list entry ---
README.md: 2 (visual + feature list), README.zh-CN.md: 2 ✓ MATCH

--- Verify NO accidental section removals (R23/R24/R25 sections still present) ---
README.md Diff virtualization: 1 ✓
README.md Bulk mark sidebar: 1 ✓
README.zh-CN 设置面板: 1 ✓
```

**All visual sections + feature list entries match between README.md and README.zh-CN.md**. R23/R24/R25 sections preserved (no accidental removal this time, unlike R25).

## Verdict

**PASS** — bilingual lockstep honored per SG.6. SG.R22.1 verified pre-commit (4th application, zero silent failures).