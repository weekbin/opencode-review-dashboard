# Round 5 Doc Update Report — doc-update-report.md

> **Reviewer**: R5 lead (primary chat) — lead-takeover default per R4 retro Gap 2 (≤3 doc files, no new screenshot capture needed; screenshots come from Phase 3c)
> **Date**: 2026-06-29
> **Source**: Commit `a5980150` (docs(issue-8/9): README + README.zh-CN.md)

## Doc changes verified

### README.md (+22 / -4)

**Sections added/updated**:

1. **"Language matching for auto-replies"** (NEW section after "Auto-apply rule")
   - 4-bullet heuristic explanation (CJK ratio > 30% → zh-CN, < 10% → en, 10-30% → mixed → en default, empty → en)
   - Implementation reference: `detectLanguage()` helper at `src/index.ts`
   - Agent prompt section reference: "### Language Matching"
   - Manual verification path documented (real OpenCode session required, out of harness)
   - **Quality**: Clear, concise, technical. Bilingual project convention (Chinese for primary user) maintained.

2. **"Review UI"** — Files Changed tab bullet updated
   - Old: "lists changed files with add/delete stats..."
   - New: "...Untracked files appear with `status: "added"` and an "uncommitted" badge."
   - Reflects R5 #7 NO-OP + regression-coverage.

3. **"Review UI"** — Split Review drawer into Notes surface + Drawer + Header actions (3 bullets)
   - **Notes surface** (NEW bullet): "collapsible section above the diff cards" + "feed into next round's Previously discussed panel"
   - **Review drawer**: now scoped to "findings-only" — explicit "no notes, no submit" assertion
   - **Header actions**: "Submit Review is the only submit action and it always lives in the page header"
   - **Quality**: Single-responsibility principle made explicit in user-facing docs.

4. **"Scripts"** — test:ui row scenario count updated from 10 → 15
   - **Correct**: scenarios.mjs has 15 keys (10 R1 + 4 R4 + 1 R5).

### README.zh-CN.md (+21 / -3)

**Mirror updates** — all 4 changes above translated to Chinese:
1. "自动回复的语言匹配" subsection (NEW)
2. Files Changed 描述追加未跟踪文件说明
3. Notes 表面 / Review 抽屉 / 顶部 Header 操作 3 个独立 bullets
4. Scripts 表 test:ui 从 10 → 15 个 git 场景

**Quality**: Translation is technical-accurate. "Round notes" / "Previously discussed" 等专有名词保留英文。CJK 字符匹配逻辑说明准确。

## Doc-vs-code alignment

| Doc claim | Code reality | Aligned? |
|---|---|---|
| `detectLanguage()` at `src/index.ts` | Yes — `src/index.ts:628-640` | ✓ |
| "### Language Matching" in agent prompt | Yes — `src/index.ts:1431-1435` | ✓ |
| CJK regex `[\u4e00-\u9fff]` | Yes — `src/index.ts:630` | ✓ |
| Threshold: > 30% zh-CN, < 10% en, 10-30% mixed | Yes — `src/index.ts:636-638` | ✓ |
| Notes surface "collapsible section above the diff cards" | Yes — `<section class="notes-surface">` between `.range-banner` and `.layout` | ✓ |
| Drawer is "findings-only" | Yes — DOM-shape test in `src/drawer-refactor.test.ts` confirms no `#notes` / `#submit` inside `<aside class="drawer">` | ✓ |
| Submit in header is "the only submit action" | Yes — DOM-shape test confirms exactly one `#submit` in the document, located in header | ✓ |
| 15 e2e scenarios | Yes — `scripts/test-review-ui/scenarios.mjs` exports 15 keys | ✓ |
| Untracked files appear with `status: "added"` and "uncommitted" badge | Yes — `src/index.ts:1117` fallback in `collectWorking` + UI rendering per `src/ui/app.ts:2097-2102` | ✓ |

All 9 doc claims verified against code. **Zero misalignment.**

## Doc drift identified (closure action)

| Drift | Location | Fix |
|---|---|---|
| `scripts/test-review-ui/README.md:20` says "14 git scenarios" but actual is 15 | `scripts/test-review-ui/README.md` | Update to "15" in closure commit |

This drift is a script-side doc, not a primary user-facing doc. The main README.md (already updated) and README.zh-CN.md (already updated) are user-facing and correct. The `scripts/test-review-ui/README.md` is a dev-facing doc that Dev forgot to bump when adding the new scenario.

## Quality verdict

| Dimension | Rating | Notes |
|---|---|---|
| Accuracy | PASS | 9/9 doc claims verified against code |
| Completeness | PASS | All 4 user-facing changes documented; manual verification path included |
| Clarity | PASS | Technical, concise, user-term framing (not dev-term) |
| Bilingual consistency | PASS | Both languages updated with mirror content |
| Convention | PASS | Matches existing README structure (sections, bullet style, links) |
| ASCII-only / CJK rendering | PASS | CJK characters render correctly; no broken glyphs |

**Overall: PASS**

## Recommendations

- **MUST FIX (closure commit)**: Update `scripts/test-review-ui/README.md:20` "14 git scenarios" → "15 git scenarios".
- **No other doc changes required** before merge to main.

## Screenshots note

Per Phase 3c task: 5 screenshots (`docs/screenshots/r5-s1-notes-initial.png` through `r5-s5-previously-discussed.png`) will be captured by Playwright walkthrough. The README does NOT inline these images (consistent with prior rounds that referenced screenshots via alt-text in dedicated sections). **No doc update required from 3c output** unless Playwright discovers a UI bug that contradicts doc claims.

## Lead notes

- Lead takeover default per R4 retro Gap 2 was correct: 2 README files + 0 new screenshot capture = well within "≤3 doc files, no screenshot needed" threshold.
- Doc quality is high — the "Language matching for auto-replies" subsection is particularly well-written (clear heuristic table, implementation pointer, manual verification path).
- The drawer-vs-notes-surface-vs-header 3-bullet split is more readable than the original 1-bullet drawer description.