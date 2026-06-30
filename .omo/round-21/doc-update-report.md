# R21 Doc Update Report

> **Generated**: 2026-06-30
> **Round**: 21
> **Commit**: `93bc1c7` (docs(r21): README + zh-CN update)
> **Strategy**: Bilingual lockstep per SG.6 (single atomic commit for both languages)

## Files updated

| File | Locale | Lines added | Section |
|---|---|---|---|
| `README.md` | en | +6 | "What it looks like" section + Features list |
| `README.zh-CN.md` | zh-CN | +6 | "看起来是什么样的" + 功能列表 |

## What was added

### English README
1. **New section "Smart search-history commit"** — describes debounce behavior + GitHub/VS Code comparison
2. **New section "Settings panel (centralized preferences)"** — describes ⚙ button, 4 sections, Reset
3. **Feature list entry**: "Search history debounce (added R21)"
4. **Feature list entry**: "Settings panel (added R21)"

### Chinese README (zh-CN)
1. **新章节「搜索历史智能提交」** —— 描述 debounce 行为
2. **新章节「设置面板（集中偏好）」** —— 描述 ⚙ 按钮、4 个分区、恢复默认
3. **功能列表条目**：「搜索历史 debounce *(R21 新增)*」
4. **功能列表条目**：「设置面板 *(R21 新增)*」

## Verification

```bash
$ git show 93bc1c7 --stat
 README.md         | 6 ++++++
 README.zh-CN.md   | 6 ++++++
 2 files changed, 12 insertions(+)
```

Both files updated, +6 lines each (parallel structure for bilingual lockstep).

## Screenshot references

Per SG.12, screenshots should be captured during Phase 3c Playwright walkthrough. R21 candidates:
- `r21-s1.png` — dashboard with new ⚙ button visible
- `r21-s2.png` — settings modal open (Appearance section)
- `r21-s3.png` — settings modal open (Language section, zh-CN)
- `r21-s4.png` — recent-searches dropdown with single "func" entry (debounce verification)

**Status**: Screenshots referenced in README (existing `r20-s1-progress-1of3.png` reused for in-diff search since R21 changed only the timing of commits, not the visual layout of the dropdown). New r21-s*.png capture deferred to manual run or R21-gap-fix.

## Verdict

**PASS** — bilingual lockstep honored per SG.6. Single atomic commit (no separate en + zh-CN commits). Sections added to both READMEs in parallel structure.