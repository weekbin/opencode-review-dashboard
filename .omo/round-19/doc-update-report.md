# R19 Doc Update Report

> **Reviewer**: lead (R4 retro Gap 2 default — lead-direct, R+ v5.3.3)
> **Date**: 2026-06-30
> **Files updated**: README.md + README.zh-CN.md (R19 feature sections added)

## Sections added (lockstep, both files)

### "What it looks like" section additions

**README.md** (3 new feature bullets added after R17 "Round notes inside the submit modal"):

- ### Switch languages (English / Chinese) — links to r19-s1-dashboard-initial.png
- ### Toast notifications for your actions — references 3-second lifetime + aria-live polite
- ### Better keyboard and screen-reader accessibility — references skip-link, role=tablist, role=status, modal focus trap

**README.zh-CN.md** (same 3 sections, Chinese):

- ### 切换语言（英文 / 中文）
- ### 操作触发的轻量 Toast 通知
- ### 更好的键盘与屏幕阅读器可访问性

## Screenshot references

- `docs/screenshots/r19-s1-dashboard-initial.png` — toolbar with "EN | 中文" toggle visible (used in language toggle section)
- (Toast + a11y sections are text-only — screenshots would be more illustrative but deferred to R20 if AC1.2 needs visual evidence)

## Bilingual lockstep verification (SG.6)

- README.md: +3 sections
- README.zh-CN.md: +3 sections (1:1 mapping)
- Same screenshot reference in both
- Same caption structure in both

**Lockstep**: PASS

## Style verification (SG.11 — user-manual style)

- All 3 sections use "you" voice
- All 3 sections describe what the feature does, not how it's built
- No `src/`, no `state.json` internals, no test references
- File references limited to `docs/screenshots/`

**Style**: PASS

## Backward compatibility

- All existing sections preserved (R12-R17 features untouched)
- New sections inserted after R17 "Round notes inside the submit modal"
- Position: BEFORE "IME-safe search" (chronological ordering)

## Limitations / follow-ups

- **Toast section is text-only**: No specific toast trigger screenshot. R20 follow-up could add `r19-toast-{action}.png` for each trigger site (copy permalink, copy MD, etc.)
- **A11y section is text-only**: No screen-reader output capture (would require VoiceOver/NVDA run). Text-only is acceptable per SG.11 (no implementation jargon)
- **Language toggle screenshot** is `r19-s1` (English state) — could add `r19-s2-zh-cn-active.png` to show toggle state

## Verdict: PASS

3 sections × 2 languages = 6 README updates committed. Bilingual lockstep + user-manual style verified.

## Commits

This R19 doc update is part of the same closure commit pattern as R12-R17. Single docs commit per round per SG.19.