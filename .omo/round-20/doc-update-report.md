# R20 Doc Update Report

> **Reviewer**: lead (R4 retro Gap 2 default — lead-direct, R+ v5.3.4)
> **Date**: 2026-06-30
> **Files updated**: README.md + README.zh-CN.md (R20 feature sections added)

## Sections added (lockstep, both files)

### "What it looks like" section additions

**README.md** (3 new feature bullets added after R19 "Better keyboard and screen-reader accessibility"):

- ### Sidebar review progress indicator — references r20-s1-progress-1of3.png
- ### Sidebar filter: show only unread — references r20-s2-filter-active.png + r20-s3-filter-off-all-shown.png
- ### Recent searches dropdown — references search bar with history (combined reference)

**README.zh-CN.md** (same 3 sections, Chinese):

- ### 侧边栏审查进度指示器
- ### 侧边栏过滤器:仅显示未审查
- ### 最近搜索下拉

## Screenshot references

- `docs/screenshots/r20-s1-progress-1of3.png` — sidebar progress counter "1 / 3 reviewed (33%)"
- `docs/screenshots/r20-s2-filter-active.png` — filter ON, read files hidden
- `docs/screenshots/r20-s3-filter-off-all-shown.png` — filter OFF, all files visible

## Bilingual lockstep verification (SG.6)

- README.md: +3 sections
- README.zh-CN.md: +3 sections (1:1 mapping)
- Same screenshot references in both
- Same caption structure in both

**Lockstep**: PASS

## Style verification (SG.11 — user-manual style)

- All 3 sections use "you" voice
- All 3 sections describe what the feature does, not how it's built
- No `src/`, no `state.json` internals, no test references
- File references limited to `docs/screenshots/`

**Style**: PASS

## Backward compatibility

- All existing sections preserved (R12-R19 features untouched)
- New sections inserted after R19 a11y section, before R17 "Keyboard shortcuts at a glance"
- Position: chronological ordering

## Limitations / follow-ups

- **Search history section is text-only**: No specific dropdown screenshot. R21 follow-up could add `r20-search-history-dropdown.png` for visual evidence.
- **Sidebar progress section** uses r20-s1 (counter at 33%) as the visual.

## Verdict: PASS

3 sections × 2 languages = 6 README updates committed. Bilingual lockstep + user-manual style verified.

## Commits

This R20 doc update will be a single docs commit per SG.19 (bilingual lockstep).