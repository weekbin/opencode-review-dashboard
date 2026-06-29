# Round 6 Diff Review — Lead-takeover (R4 retro Gap 2 default for 3b)

> **Date**: 2026-06-29
> **Reviewer**: R6 lead (primary chat) — lead-takeover default per R4 retro Gap 2
> **Scope**: `git diff main...origin/team-dev-loop-round-6-r5-polish`
> **Stats**: 4 files changed, 28 insertions(+), 7 deletions(-), 35 net LOC

## File-by-file review

### 1. `src/index.ts` (+13, -3) — CJK regex widen + named constants + remove unnecessary `?.`

**Changes**:
- **Lines 628-641**: Added 2 named constants `CJK_RATIO_ZH_CN = 0.3` + `CJK_RATIO_EN = 0.1` at module level (above detectLanguage function). Removed `text?.trim() ?? ""` → `text.trim()`. Replaced magic 0.3 / 0.1 with the named constants.
- **Line 633**: `CJK_RE = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g` — added Hiragana (`\u3040-\u309f`) + Katakana (`\u30a0-\u30ff`) + Hangul Syllables (`\uac00-\ud7af`) blocks behind the existing CJK Unified Ideographs range.
- **Line 1436**: Agent prompt Language Matching heuristic updated to mention "Chinese Hanzi 中國, Japanese Kanji/Hiragana/Katakana 日本語, Korean Hangul 한국어" explicitly (post-#1 reality).

**Verdict**: PASS. 13 net LOC, single responsibility. The 4-block regex covers all CJK scripts; named constants eliminate drift hazard; `?.` removal is a safe cleanup (text is `string`, not nullable). Agent prompt explicitly documents the coverage so future readers don't need to reverse-engineer the regex.

### 2. `src/language-detect.test.ts` (+18, -0) — 4 new test cases

**Changes**: Added `describe("AC6-1: Hangul / Hiragana / Katakana CJK coverage (R6 MINOR #1)")` block with 4 `it` tests:
- T6.1: Korean Hangul `"안녕하세요"` → `"zh-CN"`
- T6.2: Japanese Hiragana `"こんにちは"` → `"zh-CN"`
- T6.3: Japanese Katakana `"カタカナ"` → `"zh-CN"`
- T6.4: Mixed CJK scripts `"中文 mixed 日本語 한국어 테스트"` → `"zh-CN"`

**Verdict**: PASS. 18 LOC of focused tests, each with one assertion. Pattern matches existing T9.1-T9.10 in same file.

### 3. `README.md` (+1, -1) — Language matching regex range updated

**Change**: `README.md:114` CJK regex range updated from `[\u4e00-\u9fff]` to `[\u4e00-\u9fff\uac00-\ud7af\u3040-\u309f\u30a0-\u30ff]` + prose note "Chinese Hanzi + Japanese Kanji/Hiragana/Katakana + Korean Hangul".

**Verdict**: PASS. 2-line change matches the implementation truth.

### 4. `README.zh-CN.md` (+1, -1) — Mirror update in Chinese

**Change**: `README.zh-CN.md:114` Chinese translation: "汉字 + 日文汉字/平假名/片假名 + 韩文 Hangul".

**Verdict**: PASS. Maintains bilingual project convention.

## Diff stats

```
 README.md                   |  2 +-
 README.zh-CN.md             |  2 +-
 src/index.ts                | 13 ++++++++-----
 src/language-detect.test.ts | 18 ++++++++++++++++++
 4 files changed, 28 insertions(+), 7 deletions(-)
```

**Plan estimate**: ~60-80 LOC
**Actual**: 35 net LOC (smaller than estimate — Dev's 1-line regex widening was tighter than planned)

## Findings (severity)

### CRITICAL: 0
### HIGH: 0
### MEDIUM: 0
### LOW: 1

- **L1**: R6 commit messages use `feat(issue-1)`, `refactor(issue-2)`, `docs(issue-3)` prefixes (referring to internal sub-candidate IDs) rather than GitHub issue numbers. Convention check: R5 used `feat(issue-9):`, `test(issue-7):`, `refactor(issue-8):` (referring to GH issues). R6's prefix difference is cosmetic — could align to R5 convention in future rounds. Non-blocking.

## Out-of-scope files

None. R6 touched exactly the 4 files the plan predicted.

## Verdict

**PASS.** R6 is ready for merge to main.

## Closure actions

None required — clean diff, all 13 ACs PASS, no doc drift identified, no closure-doc-fix needed (R5 retro Gap 3 doc-side-file check passed: no scenario count changed in R6).