# Round 6 Brief — R5 Polish Bundle (R5 MINOR #1 + #2 + #3)

> **Date**: 2026-06-29
> **Author**: R6 PM Triage
> **Status**: PM brief, awaiting PM Manager review
> **Source**: R5 retro Followup items (R5 MINOR #1-3) + R5 test-report.md Known limitations + R5 review-code.md Findings
> **Pre-check result**: PASS (all 12 R5 SHAs verified OK — see ## Source)

## Title
Refine the auto-apply language-matching feature shipped in R5: widen CJK regex to full CJK coverage, extract threshold constants, cleanup agent prompt + README example.

## Source
- **R5 retro Followup items**: `.omo/round-5/retro.md` ## Followup items — R5 MINOR #1 (CJK widen), R5 MINOR #2 (constants/?.), R5 MINOR #3 (agent prompt + README cleanup)
- **R5 test-report.md Known limitations**: `.omo/round-5/test-report.md` lines 33-36 (CJK regex scope PARTIAL; magic numbers + `?.` deferred to R6) + lines 75-77 (Risk register: H1 ship-as-is; M1+M2 deferred to R6)
- **R5 review-code.md Findings**: `.omo/round-5/review-code.md` — **H1** CJK regex scope (lines 15-28) + **M1** magic numbers 0.3/0.1 (lines 33-37) + **M2** unnecessary `?.` on `text` (line 40) + **M3** docs cleanup (line 47)
- **R5 audit-trail code-commit verification**: ALL 12 R5 SHAs verified OK via `git cat-file -e` — `a3f04aa` ✓, `7ecea28` ✓, `bfbcaa2` ✓, `75cb49d` ✓, `a257e4e` ✓, `0652dee` ✓, `ee06bd5` ✓, `a598015` ✓, `c21f4a0` ✓, `66027f8` ✓, `e3a6d9e` ✓, `f76caa7` ✓. R5 audit-trail is grounded.
- `src/index.ts:628-640` (current `detectLanguage` implementation) + `src/index.ts:1428-1435` (current agent prompt "### Language Matching" section) + `README.md:105-114` ("Language matching for auto-replies") + `README.zh-CN.md:105-114` ("自动回复的语言匹配")
- `git log --oneline -20` (most recent: `66027f8` Patch H perf; `f76caa7` R5 retro QA scope)

## User pain (1-3 sentences, user terms)
After R5 shipped the auto-apply language matching, three minor refinements remain: Korean/Japanese users writing in their native scripts (Hangul/Hiragana/Katakana) still get English replies because the regex only covers CJK Unified Ideographs (Hanzi/Kanji/Hanja) — but the agent prompt advertises "日本語, 한국어" as detectable. The threshold values (0.3, 0.1) are duplicated across 4 files (helper, agent prompt, README, README.zh-CN.md) and easy to drift. The agent prompt's "한국어" example overpromises what the original regex can detect.

## Candidates ranked (3 sub-candidates, bundled)

### Sub-candidate #1 — Widen CJK regex to full CJK coverage (R5 MINOR #1)
> **As a** Korean or Japanese developer running `/diff-review-dashboard`,
> **I want** the agent's auto-reply to match my Hangul/Hiragana/Katakana text the same way it matches my Chinese Hanzi text,
> **So that** I get replies in my native script instead of English.

- **User value**: 3/5 (medium; affects Korean + Japanese users; Chinese users unaffected since Hanzi already in regex)
- **File:line evidence (verified)**: `src/index.ts:630` — `const CJK_RE = /[\u4e00-\u9fff]/g;` — only covers U+4E00–U+9FFF (CJK Unified Ideographs / Hanzi / Kanji / Hanja)
- **What's missing for the user**: pure-Hiragana `"こんにちは"`, pure-Katakana `"カタカナ"`, pure-Hangul `"안녕하세요"` all return ratio = 0 → `"en"`. Agent prompt at `src/index.ts:1433` advertises "中文, 日本語, 한국어" detection. Contract mismatch.
- **LOC**: ~5 (1-line regex change at `src/index.ts:630` from `/[\u4e00-\u9fff]/g` to `/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g`)
- **Files**: 1 (`src/index.ts`)
- **Test**: Add 3 unit tests for Hangul/Hiragana/Katakana detection to `src/language-detect.test.ts`

### Sub-candidate #2 — Extract threshold constants + remove unnecessary `?.` (R5 MINOR #2)
> **As a** maintainer adjusting the language detection heuristic,
> **I want** the threshold values (0.3, 0.1) to be named constants and the dead `?.` defensive code removed,
> **So that** future tweaks happen in 1 place (the helper), not 4 (helper + agent prompt + 2 README files).

- **User value**: 2/5 (low; maintainer-facing, no end-user-visible change)
- **File:line evidence (verified)**:
  - `src/index.ts:632-639` — `detectLanguage` function body
  - `src/index.ts:633` — `const trimmed = text?.trim() ?? "";` — `?.` is dead code (param is typed `text: string`, non-nullable; `trim()` returns `string`, not nullable)
  - `src/index.ts:637-638` — `if (ratio > 0.3) return "zh-CN";` / `if (ratio < 0.1) return "en";` — magic numbers duplicated at `src/index.ts:1433` (agent prompt) + `README.md:109-110` + `README.zh-CN.md:109-110`
- **What's missing for the user**: Constant drift hazard across 4 files; dead `?.` code is noise
- **LOC**: ~10 (named constants at top of `detectLanguage` + remove `?.` from `text?.trim()`)
- **Files**: 1 (`src/index.ts`)
- **Test**: Existing 15 `src/language-detect.test.ts` tests should still pass with the named constants (no test changes needed; verify threshold values are the same 0.3/0.1)

### Sub-candidate #3 — Agent prompt + README cleanup (R5 MINOR #3)
> **As a** reader of the README.md + agent prompt "### Language Matching" section,
> **I want** the example list + threshold text to accurately reflect what the regex can detect (after #1 lands, "中文, 日本語, 한국어" all work; before #1, "한국어" doesn't),
> **So that** the docs match the implementation truth and readers aren't misled by an over-promising example.

- **User value**: 2/5 (low; docs accuracy, no behavior change beyond what #1 already changes)
- **File:line evidence (verified)**:
  - `src/index.ts:1431-1435` — agent prompt "### Language Matching" section line 1433 has "中文, 日本語, 한국어" example
  - `README.md:105-114` — "Language matching for auto-replies" section: line 109-110 thresholds, line 114 "CJK character range `[\u4e00-\u9fff]`" — must add note about Hangul/Hiragana/Katakana coverage post-#1
  - `README.zh-CN.md:105-114` — "自动回复的语言匹配" section: same structure
- **What's missing for the user**: Post-#1, "한국어" works (Hangul is now in regex). Doc was written before #1 was even proposed. Sync the doc with the post-#1 reality.
- **LOC**: ~10 (small text updates in 3 files — agent prompt example clarification + README regex range + README.zh-CN.md regex range)
- **Files**: 3 (src/index.ts agent prompt + README.md + README.zh-CN.md)

## Scope buckets

### Bucket A: bundled #1 + #2 + #3 [recommended, user-picked]
- Contains: sub-candidate #1, #2, #3
- Combined user value: 4/5
- Files touched: 3 (src/index.ts + README.md + README.zh-CN.md)
- Combined LOC: ~25-30
- Why this bucket: All 3 polish items touch the same code path (R5 #9's language detection feature). Tight scope, low risk, high signal. Saves a separate round vs. running them individually. All 3 deferred together from R5 retro as a "polish round" — natural bundle.

### Bucket B: single sub-candidate #1 alone
- Contains: just the CJK regex widen
- Combined user value: 3/5
- Files touched: 1
- Combined LOC: ~5
- Why this bucket: Smallest scope, lowest risk. Skip #2 + #3 for a future round. Use case: user only cares about Korean/Japanese users getting correct detection, not about code-quality polish.

## Recommended candidate
**Bucket A** (bundled #1 + #2 + #3).

## Self-Critique
- Clarity: 4/5. Sub-candidates are clear and each is anchored to a specific file:line citation that has been verified against the current source.
- Hidden ambiguities: After #1, the Korean Hangul test (ratio ~1.0 for pure Hangul) returns `"zh-CN"` but is more accurately `"ko"` or `"ja"`. The current 3-bucket classification (`zh-CN` / `en` / `mixed`) doesn't distinguish Korean from Chinese. **This is a known limitation** — could surface as a future round if the user wants Korean-vs-Chinese distinction. For R6, we widen the regex and accept the over-broad `"zh-CN"` classification for Korean/Japanese (better than the current English default for those users). The 3-bucket design assumes "non-English CJK" is treated as Chinese-style reply, which is acceptable for the agent's prose mirroring heuristic.
- Risks:
  - **#1 (CJK widen)** changes `detectLanguage` behavior for Korean/Japanese users (English → Chinese-style reply). This is the **desired** behavior change but is user-visible. README must be updated to reflect this. Affected user population is currently zero (no Korean/Japanese users reported in R5 retro), so blast radius is small.
  - **#2 (constants + `?.`)** is maintainer polish, no runtime risk. Pure refactor; existing 15 `src/language-detect.test.ts` tests should pass unchanged.
  - **#3 (docs cleanup)** is docs only, no runtime risk. The 4-line regex change in #1 should be mirrored in the 2 README files and the agent prompt's example.
  - **Bundle order dependency**: #1 (regex widen) should land first so #3 (docs) can accurately describe what the regex covers. #2 (constants) is independent and can land in any order. Lead should consider sequencing #1 → #2 → #3 in the implementation phases.
- Out-of-scope: Adding a 4th language bucket (`ja` / `ko`) — that's a separate, larger feature. R6 just widens the regex and accepts the over-broad classification.

## User-impact profile

```yaml
user_impact_profile:
  pm_source: "user (deferred from R5 retro Followup items)"
  U_size: "small (1-2 user-visible files)"
  U_files: "small (2-3: src/index.ts + README.md + README.zh-CN.md)"
  U_new_capability: no
  U_behavior_shift: no
  U_user_visible: yes
  U_data_shape_breaking: no
  U_data_safety: no
  U_installs_new_dep: no
  recommended_profile_override: feature
```

## Profile recommendation
PM's intuition: **feature**. Lead validates against the 3 classification rules:
- **Rule 1 (architecture)**: U_behavior_shift=no, U_data_shape_breaking=no, U_installs_new_dep=no, total = U_size(0) + U_files(1) + U_user_visible(2) = 3. < 8 → skip.
- **Rule 2 (feature)**: U_user_visible=yes AND total >= 3 (3 >= 3) → **MATCH**.
- **Rule 3 (bugfix)**: default — not matched (no bug report, just polish).

→ **Profile = feature**. All 5 review-work lenses run (Goal/QA/Security/Code/Context).

**Note for Lead**: Feature profile mandates 5-lens review. This is a small polish round, but the bundle still has user-visible (#1 CJK widen) and maintainer-visible (#2 constants) components — the 5-lens coverage is appropriate. Lead may override to bugfix profile if the round feels too small for full 5-lens, but PM's recommendation is feature per the rules.
