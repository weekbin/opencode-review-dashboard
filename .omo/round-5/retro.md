# Round 5 Retrospective

<!-- CANONICAL TEMPLATE — DO NOT MODIFY (Phase 4.5 Retro) -->

## TL;DR

R5 shipped a 3-issue architecture-profile bundle (#7 untracked files / #8 drawer refactor / #9 agent language matching) in 4 atomic commits on `team-dev-loop-round-5-bundle-3-issues`. 60/60 unit tests pass, 9/9 e2e spot-checked, 5/5 Playwright scenarios PASS, 9/9 doc claims verified. Biggest lesson: **bundle-bundling saved ~1 round's worth of orchestration overhead but exceeded Layer 1 cap; user's explicit scope-relaxation flag worked as designed**. 3 lead takeovers (43%, matching R1 pattern) + 1 emergency lead takeover after Phase 3c subagent stalled 12+ min.

## Successes (what worked, keep doing)

- **Premise corrections caught at PM Triage stage**: PM Triage surfaced 3 issue-body errors before any code was written (#7's "collectMerged only invokes git diff" was wrong, #8's "Submit buried in drawer" was wrong, #9's line numbers were off-by-88). These corrections saved Dev from building on wrong premises. Evidence: `.omo/round-5/brief.md:53-58` (PM Triage premise corrections), `.omo/round-5/pm-manager-review.md` (PM Manager independently verified all 3).
- **#7 turned out to be NO-OP, correctly handled**: Reproduction at `src/index.ts:1072-1113` confirmed `collectWorking()` already handles untracked files end-to-end via `--others --exclude-standard` + fallback at line 1117. Dev added 8 regression unit tests + 1 e2e scenario as a regression lock-in instead of fabricating a fake fix. Evidence: `.omo/round-5/brief.md:55` (premise correction), R5 commit `0652dee` body.
- **Zero `src/ui/app.ts` changes** despite plan estimating 30-50 LOC needed. The `<textarea id="notes">` retained its `id` so `app.ts:324` (`notesRoot = document.querySelector("#notes")`) and `app.ts:2651-2652` (`state.notes = notesRoot.value`) continued to work. Evidence: `git diff main...origin/team-dev-loop-round-5-bundle-3-issues -- src/ui/app.ts` → empty.
- **5.7x speedup on Phase 3c after lead takeover**: Pre-warm + goto pattern (R4 retro integration) reused. Cold start 1.5s + 5 warm gotos (~65ms each) + 5 screenshots (~200ms each) = ~2 min total vs. 12+ min stuck subagent. Evidence: `.omo/round-5/playwright-report.md` Performance section.
- **Bilingual README updates both shipped in 1 commit**: Single bilingual commit `a598015` updated both README.md + README.zh-CN.md with mirror content. Maintained project convention. Evidence: `git show a598015 --stat` (+22/-4 + +21/-3).

## Failures / lessons (what hurt)

- **Phase 3c subagent stalled 12+ min** — symptom: launched mock-server + Chrome + cliDaemon at 14:19, no artifacts by 14:31. Root cause: unknown (possibly playwright-cli daemon hung waiting for input that never came; possibly interaction with pre-existing playwright-mcp npm exec processes from prior sessions). Fix done now: cancelled `bg_d6504730`, killed 9 orphan processes (3427326-3428902), lead did walkthrough directly in 2 min.
- **PLAN-DATA MISMATCH on AC9-1** — symptom: plan's illustrative string `"这个 auth middleware 应该用 jwt.verify"` has CJK ratio ≈ 0.15 → correctly returns `"mixed"`, not `"zh-CN"`. Implementation uses different test strings (passes). Root cause: PM Triage + Architect both verified the implementation against the plan's strings without computing the actual ratio. Fix done now: documented in test-report.md as plan-side error. Future round lesson: when AC has illustrative strings, compute the actual threshold value before committing to a verdict.
- **PLAN-DATA MISMATCH on AC9-3** — symptom: plan's string `"这个 magic number 25 should be a const"` has ratio 0.056 → returns `"en"`, not `"mixed"`. Root cause: same as AC9-1. Fix done now: documented.
- **`scripts/test-review-ui/README.md:20` doc drift** — symptom: still says "14 git scenarios" but actual is 15 after R5 added `untracked-file-in-tree`. Root cause: Dev's docs commit updated main README.md but forgot the dev-facing e2e harness README. Fix done now: in closure commit.
- **3 planned #8 e2e scenarios replaced with DOM-shape unit tests** — symptom: scenarios `notes-always-visible`, `drawer-is-findings-only`, `header-submit-only` were not added to `scenarios.mjs`. Root cause: the existing e2e harness doesn't drive a browser (only tests plugin entry points), so the planned scenarios couldn't actually be implemented. Fix done now: 8 DOM-shape unit tests in `src/drawer-refactor.test.ts` (functionally equivalent, possibly better). Documented as justified deviation in `.omo/round-5/review-context.md` + decision.md.

## Skill gaps found (changes that would have prevented the issue)

- **Gap 1: PM Triage should compute actual threshold values for illustrative AC strings before passing them to Dev**. Symptom: AC9-1 + AC9-3 plan-data mismatches — illustrative strings don't actually exercise the claimed bucket. Existing-skill-text: `references/phase-prompts.md` PM Triage prompt + `references/loop-decision.md` profile classification rules. Proposed patch: add a "Threshold verification" step to PM Triage when AC has numerical thresholds — PM Triage should run the actual ratio calculation on illustrative strings and either correct the strings or update the AC's expected output.
- **Gap 2: Phase 3c subagent needs a 5-min timeout / watchdog to detect stall**. Symptom: Phase 3c subagent ran 12+ min with no output. Lead had to manually check `ps aux` to discover it was alive but not producing artifacts. Existing-skill-text: `references/phase-prompts.md` Phase 3c prompt has no timeout/watchdog. Proposed patch: add a 5-min heartbeat check — if no screenshot file appears within 5 min of `playwright-cli open`, lead should cancel and takeover.
- **Gap 3: Closure commit checklist should include doc drift fixes identified during the round**. Symptom: `scripts/test-review-ui/README.md:20` drift was identified mid-round but Dev forgot to fix it in commit `a598015`. Lead discovered it in Phase 3b/3.5 review. Existing-skill-text: Dev prompt Step 7 (commit strategy) doesn't include "doc side-files updated". Proposed patch: add a "doc side-file checklist" to Dev prompt — e.g., if main README count is bumped from X to Y, also check `scripts/test-review-ui/README.md` + any other dev-facing docs that might cite the same number.

## Followup items

- **R5 MINOR #1**: Code lens H1 — widen CJK regex to include Hangul Syllables (`\uac00-\ud7af`) + Hiragana (`\u3040-\u309f`) + Katakana (`\u30a0-\u30ff`) for full CJK coverage. ~1 line change. Defer until user expresses need (current user is Chinese-speaking; Korean/Japanese out of scope).
- **R5 MINOR #2**: Code lens M1+M2 — extract threshold constants (0.3/0.1) as named constants + remove unnecessary `?.` on `text` param in `detectLanguage`. Polish round.
- **R5 MINOR #3**: Cleanup agent prompt's "한국어" example — either remove the Korean word or add a caveat that the regex is Chinese-specific. The example overpromises.
- **R6 candidate**: Address R5 MINOR #1-3 as a single polish round.
- **R6 candidate**: Investigate Playwright subagent stall root cause — was it daemon-related, MCP-interference, or something else? Add per-step timeouts to prevent future stalls.

## Action items for next round

1. **Apply skill patches for the 3 gaps above** (Gap 1: threshold verification in PM Triage; Gap 2: 5-min watchdog in Phase 3c prompt; Gap 3: doc side-file checklist in Dev prompt Step 7).
2. **After skill patches land**, run R6 Phase 0 (PM Triage) to surface 3-5 fresh user-stories from current main state.
3. **R6 user-pick gate**: user picks 1 of 3-5 surfaced candidates. Likely candidates: (a) R5 MINOR #1-3 polish, (b) R4 MINOR followups (AbortController for loadPriorNotes, UI hint "current round in Conversation", capture Playwright screenshot of the 4-tab UI), (c) new user-stories from self-investigation.
4. **Update `.omo/proposals.jsonl`** with R6 line.
5. **Closure commit**: merge R5 worktree branch → main, including e2e README drift fix.