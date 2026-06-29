# R5 Lens #3 — Code Quality

> **Reviewer**: R5 Lens Code (Sisyphus-Junior, fresh subagent)
> **Date**: 2026-06-29
> **Scope**: R5 branch `team-dev-loop-round-5-bundle-3-issues` (4 commits, 8 files, +572/-15 LOC)
> **Bundle**: #7 (untracked files) + #8 (drawer refactor) + #9 (language matching)

## Findings (organized by severity)

### CRITICAL (must fix before SHIP)
- *(none — see HIGH #1 for the closest concern)*

### HIGH (should fix before SHIP)

**H1. CJK regex scope does not match the agent prompt's "日本語 / 한국어" examples**

- **Where**: `src/index.ts:630` (`const CJK_RE = /[\u4e00-\u9fff]/g;`)
- **What**: The regex covers only the **CJK Unified Ideographs** block (`\u4e00-\u9fff`), which is Hanzi / Kanji / Hanja (predominantly Chinese glyphs, shared with Japanese kanji and Korean hanja). It does NOT cover:
  - Hiragana (`\u3040-\u309f`) — Japanese phonetic
  - Katakana (`\u30a0-\u30ff`) — Japanese phonetic
  - Hangul Syllables (`\uac00-\ud7af`) — Korean phonetic
  - CJK Compatibility Ideographs (`\uf900-\ufaff`) — rare/variant
- **Why it's wrong**: The agent prompt at `src/index.ts:1433` advertises detection for "中文, 日本語, 한국어". But pure-hiragana `"こんにちは"`, pure-katakana `"カタカナ"`, and pure-Hangul `"안녕하세요"` all return **ratio = 0 → "en"**. Only `日本語` written with kanji or `한국어` written with hanja would register. A Japanese or Korean user writing naturally in their own script gets the English reply by default — the opposite of the promised behavior.
- **Fix (Quick, ~10 LOC)**: Widen the regex to the union of all four blocks, e.g.:
  ```ts
  const CJK_RE = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;
  ```
  Or — if the team really only wants Chinese detection — narrow the README and agent prompt copy from "CJK" to "Hanzi (Chinese characters)" so the user is not misled. The current naming/claim is internally inconsistent.
- **Verdict**: Definite HIGH because the feature's stated contract is not met for a non-trivial user population (Japanese / Korean dev reviewers). Plan §6 R9-1 flagged "any threshold-based detection has edge cases" but the regex scope was not part of the design conversation.

### MEDIUM (fix in next round)

**M1. Magic numbers `0.3` and `0.1` are duplicated across 4 files with no shared source of truth**

- **Where**: `src/index.ts:637-638` (helper), `src/index.ts:1433` (agent prompt prose), `README.md:108-110` (English), `README.zh-CN.md:108-110` (Chinese)
- **What**: The threshold pair `> 0.3 → zh-CN` / `< 0.1 → en` is documented four times in four different languages/contexts. Any future tweak (e.g. a real-world eval showing 0.25 is the right boundary) requires edits in 4 places. The plan §3 line 80 even said: *"~20 LOC + 10 LOC for the threshold constants in a comment block"* — that 10-LOC comment was never written.
- **Fix (Quick, ~5 LOC)**: Add a `// threshold constants: ZH_CN_RATIO = 0.3, EN_RATIO = 0.1` comment block in the helper, and reference those numbers in the prompt. Better: hoist into a named `const` at the top of the helper and reference from the prompt via a small "see detectLanguage() helper" pointer. The current "magic number in 4 places" is a documentation drift hazard.
- **Verdict**: MEDIUM because the values are stable for now (R5 is the first round that introduced them) but the duplication is real.

**M2. Unnecessary `?.` on a required parameter (`text?.trim() ?? ""`)**

- **Where**: `src/index.ts:633`
- **What**: The signature is `function detectLanguage(text: string): Language` — `text` is required and not nullable. The expression `text?.trim() ?? ""` defensively handles `null`/`undefined` that the type system says is impossible. The `?? ""` fallback is then used to short-circuit empty input, but the empty check would be clearer as `if (!text || !text.trim()) return "en"`.
- **Fix (Quick, 1 line)**: Drop the `?.`: `const trimmed = text.trim();` then `if (!trimmed) return "en";`. This is a real (if tiny) code smell — defensive code that the type system forbids.
- **Verdict**: MEDIUM. Not a bug, but the team has explicitly blocked `as any`/`@ts-ignore` per project standards; the same hygiene should apply to defensive `?.` on non-nullable types.

**M3. README.md scenario count is off by one (15 vs. actual 14)**

- **Where**: `README.md:262` (`bun run test:ui` table) and `README.zh-CN.md:253`
- **What**: Both README files were bumped from "10 git scenarios" to "15 git scenarios" in commit `a598015`. The actual `SCENARIOS` map in `scripts/test-review-ui/scenarios.mjs:230-248` has **14 entries** (13 pre-existing + 1 new `untracked-file-in-tree`). The inner `scripts/test-review-ui/README.md:21` still says "14 git scenarios" — that one is correct.
- **Fix (Quick, 2 chars)**: Change `15` → `14` in both `README.md` and `README.zh-CN.md`.
- **Verdict**: MEDIUM because the count is user-visible (developers see this when reading the test setup) and the inner README was not touched, creating a contradiction between two repo docs.

**M4. AC8-1 test in `drawer-refactor.test.ts` is overly thin — does not verify the binding works at runtime**

- **Where**: `src/drawer-refactor.test.ts:40-46` ("the notes surface is OUTSIDE the drawer")
- **What**: The test only checks that the drawer DOM substring does not contain `id="notes"`. It does NOT verify that `state.notes` is actually bound to the new surface — it relies on `app.ts:324` (`notesRoot = document.querySelector("#notes")`) still finding the (moved) textarea because the same `id="notes"` is reused. This is correct, but the AC8-1 acceptance criterion ("the new surface has a stable `data-testid` like `notes-surface` so e2e can target it") is satisfied by a string-match, not by an actual binding test.
- **Fix (Short)**: Add a static assertion in `app.ts` that the new section is positioned ABOVE the drawer in the DOM (e.g. parse the HTML, find `data-testid="notes-surface"` and `<aside id="drawer"`, assert surface index < drawer index). OR document in a code comment why the test is intentionally structural (DOM is built once at load, `app.ts:324` does a single `querySelector`).
- **Verdict**: MEDIUM because the contract is "state.notes binds to the new surface" — verifying the DOM shape and the `app.ts` selector are two sides of the same coin, and the current test covers only one.

### LOW (nice-to-have, optional)

**L1. `text` parameter in `detectLanguage` has both `?.` and `??` defensive layers (covered by M2 above; lifted separately for visibility)**

- Same finding as M2 — flagging here so reviewers see the same root cause is counted once at MEDIUM severity, not double-counted.

**L2. `__test` export surface grows monotonically (now 4 internal helpers)**

- **Where**: `src/index.ts:2118-2126`
- **What**: R5 added `collectWorking`, `names`, `stats`, `detectLanguage` to the pre-existing 3 (`validateSessionId`, `parsePriorNotes`, `readPriorNotesFromSession`). That's 7 internal helpers exposed via the public `__test` const. Each one widens the test-only attack surface. Plan §6 R9-3 acknowledged this; acceptable for now, but worth tracking.
- **Fix (no action)**: Document in a single comment above `__test` that the export is for test-only access and will not be tree-shaken in non-test builds (Bun's behavior). Or move to a separate `src/__test-exports.ts` for cleaner tree-shaking guarantees. Not blocking.

**L3. Type-cast pattern inconsistency between new R5 tests and existing R4 tests**

- **Where**: `src/language-detect.test.ts:18-20` and `src/untracked-files.test.ts:20-37` use `as unknown as { ... }` double-cast. The existing `src/prior-notes.test.ts:17` uses bare destructuring: `const { validateSessionId, parsePriorNotes, readPriorNotesFromSession } = __test;`
- **What**: Both work — the new pattern is more defensive (self-documents the function signature) while the existing pattern is more terse. This is a taste call, not a bug.
- **Fix (no action)**: Pick one convention in a future round and update all `__test` consumers. R5 is not the round to do that housekeeping.

**L4. Plan called for a separate `src/agent-prompt.test.ts`; dev folded it into `src/language-detect.test.ts`**

- **Where**: `src/language-detect.test.ts:96-116` (the "agent-prompt structural check" describe block)
- **What**: The plan §3 line 110 said *"Could be folded into `src/language-detect.test.ts` as a single `describe` block; split for clarity."* Dev chose fold. The file is now 116 lines, the upper end of the plan's 80-120 LOC estimate. The folded-in test is unrelated to `detectLanguage()` semantics — it reads `src/index.ts` and asserts the agent prompt contains a string.
- **Verdict**: LOW. The fold is a reasonable simplification; if `src/language-detect.test.ts` grows past 150 LOC, split it in a future round.

**L5. Boundary tests in `language-detect.test.ts` are partially redundant with regular bucket tests**

- **Where**: `src/language-detect.test.ts:37, 60, 83` (the "boundary" tests added at the end of each describe)
- **What**: The 4 boundary tests (`"中ab"`, `"中abcdefghijk"`, `"中abcde"`, plus AC9-4's extra newline test) are useful documentation of the threshold values but overlap with the regular bucket tests (`T9.1`, `T9.2`, `T9.3`). Not redundant enough to be harmful — boundary cases deserve explicit coverage — but the file could be trimmed to ~10 tests without losing signal.
- **Verdict**: LOW. 15 tests for a 9-line helper is at the upper bound of reasonable; the project is better with too many tests than too few.

**L6. `drawer-refactor.test.ts:23-25` uses `indexOf('<aside class="drawer"')` to locate the drawer**

- **Where**: `src/drawer-refactor.test.ts:23-25`
- **What**: Any future change to the drawer's opening tag (e.g. adding `data-testid` or an ARIA attribute) would break the test, even if the drawer's *contents* are unchanged. The test would be more robust to a `<aside[^>]*\bid="drawer"` regex or a stable `data-testid` marker on the drawer itself.
- **Verdict**: LOW. The current pattern is fine for now — the drawer markup is stable — but lock in a stable test hook when the test count grows.

## Per-file findings

### `src/index.ts` (detectLanguage + agent prompt + `__test` export)

- **:630** — `CJK_RE = /[\u4e00-\u9fff]/g` — see H1. Regex scope does not cover Hiragana, Katakana, or Hangul, contradicting the prompt's "日本語 / 한국어" examples.
- **:633** — `text?.trim() ?? ""` — see M2. Defensive `?.` on a non-nullable parameter.
- **:637-638** — Magic numbers `0.3` / `0.1` — see M1. Documented in 4 places with no shared source.
- **:1431-1435** — Agent prompt "Language Matching" section is well-structured: directive → heuristic → fallback → scope. The prompt language ("### Language Matching" as a section header, the CJK ratio examples, the `3+ comments` mixed-language fallback) is consistent with the helper. **No issue here** — the issue is purely in the helper's regex scope (H1).
- **:2118-2126** — `__test` export grew to 7 helpers. See L2. Acceptable but worth tracking.

### `src/ui/review.html` (notes-surface refactor)

- **:1657-1700** — New `.notes-surface` CSS uses `light-dark(...)` tokens consistent with the rest of the stylesheet. Both light and dark mode are covered. `summary::before` rotates `▸` → `▾` on `[open]` — clean, no JS needed. **No issue.**
- **:1772-1782** — New `<section class="notes-surface">` is positioned between `#range-banner` and `<div class="layout">`, so it appears above both the sidebar and the diff cards. Stable `data-testid="notes-surface"` and `data-testid="notes-textarea"` selectors are present. The `<details open>` element collapses by user click — discoverable, no JS state.
- **:1817-1820** — The old `<div>` containing `<label for="notes">` and `<textarea id="notes">` was **correctly removed** from the drawer. The `id="submit"` button is correctly in the header at `:1737-1740`, not the drawer. The drawer at `:1837-1867` now contains only the finding fields. **DOM surgery is clean.**
- **:1779** — Drawer title remains `<h2>Review</h2>`. Plan §3 line 89 said the title could be changed to `<h2>Add Finding</h2>` as "optional polish" — dev chose to skip the polish. Acceptable. (If changed in a future round, update the README which still says "Review drawer" — currently still accurate.)
- **:1737** — Header `<button id="submit" title="Submit this review round (your round notes are above)">` — the `title` attribute is now a discoverable tooltip explaining the new flow. Good.

### `src/ui/app.ts` (state.notes rebinding)

- **No file change in R5** — `app.ts:324` (`const notesRoot = document.querySelector("#notes") as HTMLTextAreaElement;`) was retained, and the `id="notes"` element was kept (just moved to a new DOM location). This is the right call: zero app.ts change → zero regression risk on existing handlers at `:2651` (input event), `:2688` (set value), `:2570` (disable on submit). **No issue.** This is a clean example of "preserve the contract, change the markup."

### `src/language-detect.test.ts` (NEW, 116 LOC, 5 describe blocks, 15 tests)

- **Test naming**: T9.1, T9.2, ..., T9.10 are well-named with explicit "T<id>" prefixes that trace back to plan §5 test IDs. The "boundary" tests added at the end of each describe block are *not* tagged with T-ids — slight drift from the plan's test ID scheme, but the test bodies are clear.
- **Test data smells**: Magic strings (Chinese sentences) are appropriate — they exercise the heuristic against real bilingual patterns. No hardcoded paths. No brittle assertions.
- **Test isolation**: Each test case is independent (no shared state, no beforeEach). **Clean.**
- **:96-116** — The "agent-prompt structural check" describe block is the AC9-5 test folded in per L4. The regex `template:\s*\[([\s\S]*?)\]\.join\("\\n"\)` is brittle to template-array refactors but correct for the current shape of `src/index.ts:1423-1482`. The non-greedy `[\s\S]*?` will match the FIRST `].join("\n")` after `template: [`, which is the right one (line 1482, the only `template: [` in the file). **No issue.**
- **:18-20** — `const { detectLanguage } = __test as unknown as { detectLanguage: (text: string) => "zh-CN" | "en" | "mixed" };` — see L3. Pattern inconsistency with R4 test file, but more self-documenting.

### `src/untracked-files.test.ts` (NEW, 219 LOC, 7 describe blocks, 18 tests)

- **Test isolation**: Each describe block has its own `beforeEach` + `afterEach` that creates + cleans a `mkdtemp` workdir. The 7 describes duplicate the setup function 7 times — could be refactored to a `describe.each` pattern or a shared setup helper. **Not blocking** — the duplication is mechanical and easy to read. LOW refactor opportunity.
- **:7-23** — Type cast `as unknown as { ... }` is more thorough than the R4 pattern (L3). Self-documents all 4 function signatures.
- **:120-138** — `T7.1` is the AC7-1 test: real `git init` + `git commit` + write untracked file + invoke `collectWorking`. The test exercises the actual `git ls-files --others --exclude-standard` codepath (not a mock). **Correct** — the test would catch a regression where someone changed `--others` to `--others --untracked-files=all` and accidentally exposed `.gitignore`d files.
- **:185-203** — `names() — AC7-1` test is a low-level companion to T7.1. Same pattern, but isolates the unit under test. Good defense-in-depth.
- **:205-219** — `stats() — AC7-2` test asserts `stats()` returns an empty map for untracked files (the contract: stats covers tracked diffs; untracked is handled by the `prev ? ... : count(next)` fallback in `collectWorking` at `:1103`). **Correct.**
- **AC7-3 (regression: no untracked files → no behavior change)**: T7.3 at `:140-156` tests this. **Correct.**
- **AC7-4 (.gitignore'd untracked file excluded)**: T7.4 at `:166-180` tests this by writing `.gitignore` with `dist/`, then creating `dist/should-ignore.js`. **Correct** — locks in the `--exclude-standard` contract (see Plan R7-2).
- **AC7-5 (10-line untracked file)**: T7.5 at `:80-95` tests `additions === 10` for a 10-line untracked file. This is a *second* test for the same path as T7.1 (which tests `additions === 2`). Useful as a sanity check that the `count()` fallback handles non-trivial line counts, but the project's bar is "one test per behavior" — having two tests for "additions equals line count" is mild over-coverage. **LOW.**
- **AC7-6 (`__test` export includes `collectWorking`)**: T7.6 at `:184-189` is a 3-line smoke test. **Sufficient.**
- **Test data smells**: `console.log("hello")\nconsole.log("world")\n` is used as the test fixture for untracked content. This is fine — it's a synthetic but representative file content. Not a smell.
- **Coverage gaps**: None. All AC7-1 through AC7-6 are covered (and the plan said T7.7 was "optional" — binary untracked file, which dev correctly skipped).

### `src/drawer-refactor.test.ts` (NEW, 102 LOC, 4 describe blocks, 8 tests)

- **Test naming**: AC8-1, AC8-3, AC8-4, AC8-6 are referenced in describe titles. **Clean.**
- **:23-25, 31-33** — `findDrawer()` and `findHeader()` use `indexOf` to locate DOM blocks. See L6 — works for current HTML, brittle to attribute changes.
- **:36-39** — "the notes surface is present in the new top-level location (above the layout)" — the test asserts the data-testid attributes are present, but does NOT verify "above the layout" in the DOM order. The test name overpromises — only the data-testid presence is checked. **M4.**
- **:62-70** — "drawer DOES contain the finding fields (positive assertion)" — the plan §6 R8-3 mitigation said "Write AC8-6 as a POSITIVE assertion ... and a SEPARATE negative assertion". The drawer-refactor.test.ts follows this pattern exactly. **Good.**
- **:78-82** — "there is exactly ONE id='submit' in the document" — a good regression check. Prevents a future re-introduction of the submit button into the drawer.
- **:89-93** — Final snapshot: `drawer block does NOT contain <textarea id="notes"> or <button id="submit">`. Belt-and-suspenders assertion. **Good.**

## Patterns observed

### Patterns to PRESERVE (good code, repeat in future rounds)

1. **DOM-snapshot tests with `indexOf` / `readFile`** — `drawer-refactor.test.ts` and the existing `prior-notes.test.ts:243-249` use static HTML inspection rather than spinning up JSDOM. This is fast, deterministic, and avoids the JSDOM-vs-real-DOM drift problem. Keep this pattern.

2. **Real `git init` + `mkdtemp` integration tests for git code** — `untracked-files.test.ts:84-92` and the existing `prior-notes.test.ts` use a real git binary in a temp directory. The cost (one subprocess per test) is worth the gain (catches regressions where someone changes a `git` flag, like the `--exclude-standard` risk in plan R7-2). Don't replace with mocks.

3. **Positive + negative assertion pairs in DOM-shape tests** — `drawer-refactor.test.ts:62-82` follows the plan §6 R8-3 mitigation: one positive assertion (the right elements ARE in the drawer) + one negative assertion (`#notes` and `#submit` are NOT in the drawer). This pattern locks in the structural intent and resists drift.

4. **`__test` export as a single testability surface** — `src/index.ts:2118-2126` is a single const that exposes internal helpers for testing. It's not perfect (see L2), but it's better than scattering `// @ts-ignore` annotations or refactoring production functions to be importable. Keep using it; just track the surface area.

5. **Test-id selectors in the DOM** — `data-testid="notes-surface"` and `data-testid="notes-textarea"` in the new HTML, mirrored in the test file. Stable Playwright hooks that don't depend on `id` or class attributes that might change for styling reasons. **Good.**

6. **Per-AC describe blocks with explicit AC-id in the title** — `drawer-refactor.test.ts:35, 48, 75, 89` all reference "AC8-N" in the describe title. Reviewers can map tests back to the plan ACs in one click. **Good.**

7. **README documentation of out-of-harness manual verification** — `README.md:115-116` documents the manual verification step for AC9-7 ("post 1 Chinese finding, trigger auto-apply, confirm Chinese reply") with a `**To verify manually**` callout. Honest about e2e harness limitations. **Good.**

### Patterns to AVOID (or fix before next round)

1. **Defensive code on non-nullable types** — `text?.trim() ?? ""` in M2. The `?.` is dead code per the type signature. Type the parameter as nullable if you want to be defensive; otherwise, drop the `?.`. The project's "no `as any` / `@ts-ignore`" standard should extend to "no defensive `?.` on non-nullable types."

2. **Magic numbers duplicated across files** — M1. If a value appears in code, a prompt, and two READMEs, the code should declare it as a named constant and the other 3 places should reference it ("see `detectLanguage()` for thresholds"). Today, the threshold pair lives in 4 places with no shared source.

3. **Inconsistent test-import patterns** — L3. `as unknown as { ... }` double-cast in R5 tests vs. bare destructuring in R4 tests. Pick one. The new pattern is more defensive but harder to read; the old pattern is terse but relies on TypeScript inference. Future test files should follow whichever wins.

4. **Promising more than the regex delivers** — H1. The agent prompt says "日本語, 한국어" will be detected as CJK, but the regex only covers Hanzi. Either widen the regex or narrow the docs. Do not ship with a feature that is documented to work for a user population and silently misclassifies for them.

5. **Test names that overpromise** — M4. "the notes surface is present in the new top-level location (above the layout)" — but the assertion only checks the data-testid is present, not the position. Either tighten the assertion to check DOM order, or soften the test name.

## Verdict

**PARTIAL** — 0 CRITICAL, 1 HIGH, 4 MEDIUM, 6 LOW.

H1 (CJK regex scope vs. agent prompt examples) is the only ship-blocker-shaped concern. The fix is ~10 LOC in one file. The other MEDIUMs are all real but non-blocking for SHIP:
- M1 (magic numbers): doc drift hazard, not a bug
- M2 (`?.` on non-nullable): code smell, not a bug
- M3 (off-by-one in README): documentation error
- M4 (test name overpromise): test design issue

The bundle as a whole is **high quality**: the 4-commit structure is clean, the DOM surgery is genuinely minimal (zero `app.ts` change is a feat), the test files are well-organized, and the patterns from R4 (DOM-snapshot tests, `__test` export, per-AC describe blocks) are correctly extended. The HIGH finding is a real bug — but it's localized, fixable in one commit, and not a structural problem with the R5 design.

## Recommendations

1. **Before SHIP**: Fix H1 by either (a) widening the CJK regex to include Hiragana, Katakana, and Hangul, OR (b) narrowing the agent prompt + README to "Chinese characters (Hanzi / Kanji / Hanja)" so the contract matches the implementation. Option (a) is more user-friendly; option (b) is faster. Pick (a) unless the team's intent was Chinese-only.

2. **In a follow-up commit (can ship-after)**: Address M1, M2, M3 as a single "R5 cleanup" commit. Each is 1-5 LOC; together they take 30 minutes of work and remove the only MEDIUM code-quality items.

3. **No action needed for the 6 LOWs**: track them in the next round's brief as "code quality housekeeping" if the team wants to tighten the codebase, but they are not regressions and do not block SHIP.
