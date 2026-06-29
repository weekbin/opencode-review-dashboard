# Round 6 Plan — R5 Polish Bundle

> **Date**: 2026-06-29
> **Architect**: Round 6 Architect (Sisyphus-Junior, fresh subagent)
> **Profile**: feature (Rule 2: U_user_visible=yes + total=3)
> **Bundle**: #1 CJK regex widen + #2 threshold constants/?. cleanup + #3 docs sync
> **Expected LOC**: ~30 production + ~50 test (~80 total — feature profile Layer 1 cap is 250)
> **R5 anchors verified**: `66027f8` (Patch H) / `f76caa7` (R5 retro) / `e3a6d9e` (R5 retro opt) at `git log --oneline -3` ✓; brief.md pre-check PASS inherited per Patch G.

## 1. Goal

R6 ships 3 small polish items deferred from R5 retro (`retro.md:31-36`): (a) widen `CJK_RE` at `src/index.ts:630` from Hanzi-only to Hanzi + Hiragana + Katakana + Hangul, fixing a documented H1 contract mismatch where the agent prompt advertises "日本語, 한국어" detection that the regex didn't deliver; (b) extract the 0.3/0.1 thresholds into named constants and remove the dead `?.` on the non-nullable `text` param; (c) sync the agent prompt + 2 READMEs to match the post-#1 regex. Net result: 1 line of regex, 6 lines of named-constant refactor, 3 lines of doc text — small, low-risk, high-signal polish that closes the only R5 review-code HIGH finding.

## 2. Acceptance Criteria

### Sub-candidate #1 ACs (CJK regex widen — R5 H1)
- **AC6-1.1** [unit-test]: `detectLanguage("안녕하세요")` returns `"zh-CN"` (pure Hangul, ratio = 1.0)
- **AC6-1.2** [unit-test]: `detectLanguage("こんにちは")` returns `"zh-CN"` (pure Hiragana, ratio = 1.0)
- **AC6-1.3** [unit-test]: `detectLanguage("カタカナ")` returns `"zh-CN"` (pure Katakana, ratio = 1.0)
- **AC6-1.4** [unit-test]: `detectLanguage("中文 mixed 日本語")` returns `"zh-CN"` (mixed CJK, ratio > 0.3)
- **AC6-1.5** [unit-test]: existing 15 tests in `src/language-detect.test.ts` still pass (no regression on the Hanzi / English / mixed / empty / boundary / agent-prompt-structural suites)
- **AC6-1.6** [typecheck]: `src/index.ts:630` reads `const CJK_RE = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;` — all 4 blocks present (verified by `bun run typecheck` + `grep`)

### Sub-candidate #2 ACs (constants + `?.` cleanup — R5 M1 + M2)
- **AC6-2.1** [code-shape]: `detectLanguage` references named constants `CJK_RATIO_ZH_CN = 0.3` and `CJK_RATIO_EN = 0.1` declared at module scope (no bare `0.3` / `0.1` literals in the function body)
- **AC6-2.2** [code-shape]: `src/index.ts:633` reads `const trimmed = text.trim();` — no `?.` on the `text` param (which is typed `text: string` non-nullable at `:632`)
- **AC6-2.3** [regression]: all 15 existing `src/language-detect.test.ts` tests still pass (constants are equal values; no behavior change)

### Sub-candidate #3 ACs (agent prompt + README sync — R5 M3 + M1 cleanup)
- **AC6-3.1** [code-shape]: `src/index.ts:1431-1435` agent prompt "### Language Matching" section has an updated heuristic line that reflects the post-#1 regex scope — either by rephrasing the "中文, 日本語, 한국어" example with a clarifying note ("regex covers CJK Unified Ideographs + Hiragana + Katakana + Hangul") or by tightening the threshold text to reference `CJK_RATIO_ZH_CN` / `CJK_RATIO_EN` constants
- **AC6-3.2** [doc-shape]: `README.md:105-114` "Language matching for auto-replies" subsection mentions the widened CJK scope (Hangul/Hiragana/Katakana covered, not just Hanzi) — the line 114 regex range `[\u4e00-\u9fff]` is replaced with the post-#1 4-block range OR a prose note is added explaining the script coverage
- **AC6-3.3** [doc-shape]: `README.zh-CN.md:105-114` "自动回复的语言匹配" subsection mirrored in Chinese (same shape as AC6-3.2)
- **AC6-3.4** [regression]: existing AC9-5 structural test at `src/language-detect.test.ts:102-115` ("### Language Matching" section is present in src/index.ts agent prompt) still passes after the agent prompt edit

### Cross-cutting
- **AC6-X1** [regression]: all 60 unit tests in `src/` still pass (`bun run test:unit` — 15 language-detect + 18 untracked-files + 8 drawer-refactor + 19 prior-notes/atomic-writes = 60; post-R6 should be 64-65 with 4-5 new tests)
- **AC6-X2** [gates]: `bun run check` clean (format:check + lint + typecheck all 0 errors) and `bun run build` succeeds (dist/ produced)
- **AC6-X3** [R4 retro Gap 1]: every R6 commit SHA passes `git cat-file -e <sha>` post-push (Dev self-verifies in §4 Step 8)

## 3. File changes

### `src/index.ts` (3 small surgical edits — #1 + #2 + #3 prompt)
- **Line 630** (was: `const CJK_RE = /[\u4e00-\u9fff]/g;`) — change to:
  `const CJK_RE = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;` (1-line widen, adds Hiragana + Katakana + Hangul blocks)
- **Above line 630** (new, 2 lines) — add named constants:
  ```
  const CJK_RATIO_ZH_CN = 0.3;
  const CJK_RATIO_EN = 0.1;
  ```
- **Line 633** (was: `const trimmed = text?.trim() ?? "";`) — change to:
  `const trimmed = text.trim();` (drop the `?.` and the `?? ""` fallback, since the next line `if (!trimmed) return "en"` at line 634 already handles empty input correctly)
- **Lines 637-638** (was: `if (ratio > 0.3) return "zh-CN"; if (ratio < 0.1) return "en";`) — change to:
  `if (ratio > CJK_RATIO_ZH_CN) return "zh-CN"; if (ratio < CJK_RATIO_EN) return "en";` (replace magic numbers with constants)
- **Lines 1431-1435** (agent prompt "### Language Matching" section) — update the heuristic bullet at line 1433 to either (a) reference the named constants or (b) add a clarifying note about the 4-block CJK scope. Lead's call on phrasing — both meet AC6-3.1.
- **Estimated total**: ~10 LOC net change (1 line regex + 2 lines constants + 1 line `?.` removal + 2 lines constants-use + 3-4 lines agent prompt rephrase)

### `src/language-detect.test.ts` (#1 — add 4-5 new test cases)
- **After line 48 (end of AC9-1 describe block)** — add 4 new `it` tests: pure-Hangul, pure-Hiragana, pure-Katakana, mixed-CJK-multiple-scripts. Each follows the existing `expect(detectLanguage("...")).toBe("zh-CN")` pattern.
- **Test naming**: follow existing T9.1-T9.10 + boundary convention. New tests can be untagged (boundary tests are) or tagged T6.1-T6.4.
- **Estimated total**: ~25-35 LOC

### `README.md` (#3 — English doc sync)
- **Line 114** (was: `The heuristic is regex-based on the CJK character range \`[\u4e00-\u9fff]\` ...`) — replace the regex range with the post-#1 4-block range AND add a 1-sentence note: "The regex covers CJK Unified Ideographs (Hanzi / Kanji / Hanja), Hiragana, Katakana, and Hangul Syllables, so any of those scripts will register as CJK."
- **Estimated total**: ~3-5 LOC text change (1 line regex replace + 1-2 line prose addition)

### `README.zh-CN.md` (#3 — Chinese doc sync)
- **Line 114** — mirror update in Chinese. Replace `[\u4e00-\u9fff]` with the 4-block range and add a Chinese prose note: "正则覆盖 CJK 表意文字（汉字 / 日本汉字 / 韩国汉字）、平假名、片假名和韩文音节，这些文字都会被识别为 CJK。"
- **Estimated total**: ~3-5 LOC text change

### TOTAL ESTIMATED: ~45-55 LOC production + tests + docs (well within feature profile's Layer 1 cap of 250 LOC)

## 4. Steps

1. **Pre-flight**: Verify R5 SHAs on main: `git log --oneline -3` should show `66027f8` / `f76caa7` / `e3a6d9e` (per `git log --oneline -20` output captured 2026-06-29). Create worktree at `$HOME/.worktrees/team-dev-loop-round-6-r5-polish/` on branch `team-dev-loop-round-6-r5-polish` from main HEAD. Verify: `git -C $HOME/.worktrees/team-dev-loop-round-6-r5-polish branch --show-current` returns `team-dev-loop-round-6-r5-polish`. R3 path-templating fix: use `$HOME`, NOT absolute path.

2. **Reproduce the H1 contract mismatch first** (small scope, low risk): Run `bun test src/language-detect.test.ts` from the worktree to confirm baseline 15 tests pass. Then in a temporary `bun -e 'const { detectLanguage } = require("./src/index"); console.log(detectLanguage("안녕하세요"))'` REPL (or a one-off `.ts` script) — confirm the output is `"en"` (current buggy behavior). This documents the H1 finding reproducibly for the commit message of #1.

3. **Implement #1 first** (lowest risk, ~6 LOC + 25-35 LOC tests): Widen `CJK_RE` at `src/index.ts:630` to the 4-block regex. Add 4 new test cases to `src/language-detect.test.ts` after line 48. Run `bun test src/language-detect.test.ts` — expect 19 tests passing (15 existing + 4 new). Commit #1 atomically.

4. **Implement #2** (~6 LOC, depends on #1 being on the branch but independent functionally): Add `CJK_RATIO_ZH_CN` / `CJK_RATIO_EN` constants above `CJK_RE` at `src/index.ts:630`. Change `text?.trim() ?? ""` to `text.trim()` at `:633`. Replace `0.3` / `0.1` literals with constants at `:637-638`. Run `bun test src/language-detect.test.ts` — expect 19 tests still passing (no behavior change). Commit #2 atomically.

5. **Implement #3 last** (~10 LOC across 3 files, depends on #1 being on the branch): Update `src/index.ts:1433` agent prompt heuristic bullet to reflect post-#1 scope (and/or reference the named constants from #2). Update `README.md:114` and `README.zh-CN.md:114` to mirror. Run the existing AC9-5 structural test at `src/language-detect.test.ts:102-115` — should still pass. Commit #3 atomically.

6. **Verify all ACs**: `bun run check` (format:check + lint + typecheck all clean) + `bun run test:unit` (60 → 64 tests pass) + `bun run build` (dist/ produced). Cross-check `git grep "0\.3\|0\.1" src/index.ts | grep -v test` — should return 0 hits (both literals now replaced by constants).

7. **Commit strategy** (per R4 retro — per-sub-candidate atomicity, 3 atomic commits for traceability):
   - `feat(issue-1): CJK regex widen to include Hiragana + Katakana + Hangul`
   - `refactor(issue-2): extract CJK_RATIO_ZH_CN / CJK_RATIO_EN constants + drop dead ?.`
   - `docs(issue-3): sync agent prompt + 2 READMEs to post-#1 regex scope`
   - Each commit message references the R5 review-code finding (H1 / M1+M2 / M3 respectively) and the AC it satisfies.

8. **Push worktree branch** to `origin/team-dev-loop-round-6-r5-polish`. Verify: `git ls-remote --heads origin team-dev-loop-round-6-r5-polish` returns the latest commit SHA. Then self-verify with `git cat-file -e <sha>` for every commit (R4 retro Gap 1).

9. **Hand-off** to Lead for Phase 3a-3.5 review per R5 patched flow (Patch H: 3b/3c/3.5 in per-phase table, 3a still parallel).

## 5. Test plan

- **Unit tests (R6's primary verification)**: `bun test src/language-detect.test.ts` — 15 existing + 4-5 new = 19-20 tests. The 4 new tests are: pure-Hangul `"안녕하세요"` → `"zh-CN"`, pure-Hiragana `"こんにちは"` → `"zh-CN"`, pure-Katakana `"カタカナ"` → `"zh-CN"`, mixed-CJK-multiple-scripts `"中文 mixed 日本語"` → `"zh-CN"`. All multi-round AC test paths (per R5 §2) are out of scope for R6 — the ACs are all single-round `detectLanguage` unit calls, not 2-round e2e. **2-round e2e is structurally impossible for R6** (no UI changes, no worktree scenarios touched).
- **Build/lint/typecheck/format**: `bun run check` (format:check + lint + typecheck) all clean + `bun run build` succeeds. Magic-number sweep: `git grep "0\.3\|0\.1" src/index.ts | grep -v test` returns 0 hits.
- **E2E (Playwright)**: Not required. R5's 14-scenario suite still passes unchanged — R6 touches no UI code (`src/ui/` is untouched), no review flow, no submit logic. The 4-5 new unit tests on `detectLanguage` are the sufficient verification.
- **Multi-round AC test design**: Per the task brief's "Multi-round AC test design" note — R6 ACs are all **single-round unit tests on `detectLanguage` with synthetic input** (NOT 2-round e2e which is structurally impossible since R6 is a backend helper + doc polish round).

## 6. Risk register

### Risk R6-1: CJK regex widening may cause false positives on non-CJK input
- **Likelihood**: LOW — the 3 new regex blocks (`\u3040-\u309f` Hiragana, `\u30a0-\u30ff` Katakana, `\uac00-\ud7af` Hangul) match specific Unicode blocks, not arbitrary ASCII. Zero overlap with Latin-1 / Cyrillic / Arabic.
- **Impact**: LOW — worst case is a string with 30%+ Hangul chars returning `"zh-CN"` instead of `"ko"` (which doesn't exist as a bucket). The 3-bucket design (`zh-CN` / `en` / `mixed`) over-classifies Korean/Japanese as Chinese-style replies. This is the **intended** behavior per R5 H1's "Option (a) is more user-friendly" verdict.
- **Mitigation**: Documented in `README.md` and `README.zh-CN.md` post-#3 as a known limitation. A future round could add `ko` / `ja` buckets if the user expresses need (not in R6 scope per brief.md ## Out-of-scope).

### Risk R6-2: Removing `?.` breaks TypeScript if `text` param is later changed to nullable
- **Likelihood**: LOW — `text: string` is non-nullable at the signature. Changing it to `string | null` would be an explicit API change that would touch the signature, the call sites, and the `__test` export type cast.
- **Impact**: LOW — TypeScript compile error would catch any future nullable type change at `bun run typecheck`.
- **Mitigation**: AC6-X2 (`bun run check` clean) catches this. No additional guards needed.

### Risk R6-3: 3 atomic commits may fragment the change story
- **Likelihood**: LOW — R4 retro established "per-sub-candidate atomicity" as a discipline; R5 followed it successfully with 3 commits on its 3-issue bundle. R6 follows the same pattern.
- **Impact**: LOW — each commit is self-contained and can be reverted independently. The 3-commit story is MORE traceable than a single squash because the regression can be bisected to a specific sub-candidate.
- **Mitigation**: Step 7 in §4 prescribes exact commit message prefixes (`feat(issue-1)` / `refactor(issue-2)` / `docs(issue-3)`) and references the R5 finding each one closes. Lead's Phase 3b diff review can confirm the per-commit story is coherent.

### Risk R6-4: R6 commit SHAs must `git cat-file -e` PASS (R4 retro Gap 1)
- **Likelihood**: ZERO — single-commit-per-sub-candidate fix, easy to verify. R5's 12-SHA pre-check pattern (reused per Patch G optimization) extends naturally.
- **Mitigation**: Dev self-verifies in §4 Step 8; Lead re-verifies in Phase 3b diff review. `git ls-remote --heads origin team-dev-loop-round-6-r5-polish` returns the latest SHA as a double-check.

## 7. Hand-off

### Dev receives
- This plan (`.omo/round-6/plan.md`)
- `.omo/round-6/brief.md` (3 sub-candidates with file:line evidence)
- `.omo/round-6/pm-manager-review.md` (APPROVE verdict, profile=feature)
- `.omo/round-5/review-code.md` (H1 + M1 + M2 + M3 findings — the source of truth for #1-#3)
- Worktree at `$HOME/.worktrees/team-dev-loop-round-6-r5-polish/` on branch `team-dev-loop-round-6-r5-polish` from main HEAD

### Dev returns
- All 12 ACs (AC6-1.1 through AC6-X3) with PASS evidence — file:line of test or e2e, plus `bun run check` + `bun run test:unit` + `bun run build` clean output
- 3 atomic commits on `team-dev-loop-round-6-r5-polish` branch (one per sub-candidate, per §4 Step 7)
- Branch pushed to `origin/team-dev-loop-round-6-r5-polish` (verified via `git ls-remote --heads origin ...`)
- All 3 commit SHAs pass `git cat-file -e <sha>` self-verification (R4 retro Gap 1)
- Inline self-check appended to Dev's return value (AC trace: PASS / PARTIAL / FAIL per AC, with test name + line)

### Lead does after Dev (per R5 Patch H flow — 3a parallel, 3b/3c/3.5 lead-takeover by default for small work)
- **Phase 3a (Tester Review — 5 lenses)**: 5 parallel sub-agents per R4 default. For a polish round this small, Lead MAY override to lead-synthesized (per R4 Gap 2 — small work doesn't warrant 5 subagent launches) and produce a single synthesized review that touches on each lens briefly. Recommended: **lead-synthesized for R6** given ~45-55 LOC of trivial changes; 5-lens would be over-engineered.
- **Phase 3b (Tester Diff)**: lead takeover default (R4 Gap 3) — `git diff main...origin/team-dev-loop-round-6-r5-polish` review. Write `.omo/round-6/diff-report.md` directly.
- **Phase 3c (Tester Playwright)**: lead takeover default per Patch A — **but only if R6 changes UI** (it does NOT — all changes are `src/index.ts` + 2 README files; no `src/ui/` touched). Recommend **skip 3c** for R6 with a one-line note in `.omo/round-6/test-report.md` explaining why ("R6 is backend helper + doc polish; no UI changes; e2e suite is unaffected").
- **Phase 3.5 (PM Doc Writer)**: lead takeover default per R4 default for small work. Update `.omo/round-6/doc-update-report.md` with the 3 doc changes (agent prompt + 2 READMEs).
- **Phase 4 (Decision)**: SHIP verdict (3 atomic commits, all ACs PASS, gates clean, no e2e regression).
- **Phase 4.5/4.6/4.7**: mandatory retro, post-exec analysis, self-check before closure commit.
- **Merge R6 branch → main** + push to `origin/main` (per R3/R4/R5 pattern).
- **Update `.omo/proposals.jsonl`** with R6 line (per `loop-decision.md:354-383` schema).

---

*Plan generated 2026-06-29 by Round 6 Architect (Sisyphus-Junior, fresh subagent). All file:line citations verified against current `src/index.ts:628-640`, `:1428-1435`, `:2118-2126`, `src/language-detect.test.ts:1-116`, `README.md:105-114`, `README.zh-CN.md:105-114`, and `git log --oneline -20`. Profile=feature (Rule 2: U_user_visible=yes + total=3). $HOME worktree path in §4 Step 1 + §7 (R3 lesson). 3 atomic commits in §4 Step 7 (R4 retro discipline). Target 150-200 lines vs. R5's 367 lines — small scope doesn't warrant 7 sections × 50 lines each.*
