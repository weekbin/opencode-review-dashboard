# Round 8 Retrospective

<!-- CANONICAL TEMPLATE — DO NOT MODIFY (Phase 4.5 Retro) -->

## TL;DR

R8 shipped Bucket A (#1 in-tab search + #2 sidebar keyboard nav) in 3 atomic commits + 1 emergency fix + 1 screenshots. **TDZ bug caught by lead Playwright walkthrough** (Patch A working as designed) — Dev's static-analysis tests + unit tests passed but UI was broken at runtime. Fix minimal (1 const moved). 84/84 unit tests pass + 19/19 e2e scenarios. **2 new skill gaps surfaced** for R9.

## Successes (what worked, keep doing)

- **Patch A + Gap I combination caught the TDZ bug**: Dev's self-check passed all 16 ACs, but lead Playwright walkthrough found `ReferenceError: Cannot access 'navbarTabs' before initialization`. Combined effect of (a) Gap I requiring walkthrough verification + (b) Patch A making 3c lead-by-default → walkthrough HAPPENS → bug caught.
- **5-min lead fix**: After TDZ detection, lead moved `const navbarTabs` declaration from line 471 (after init call at line 455) to line 447 (before init call). One-file change. Re-verified 0 console errors + search input renders.
- **Gap I retroactive honored**: Dev added 2 new e2e scenarios (`in-tab-search` scenario 18 + `sidebar-keyboard-nav` scenario 19) — R7 retro Gap I patch working. R8 e2e scenarios: 17 → 19.
- **ARIA tablist semantics expanded**: Dev went beyond PM Triage's AC and added `role="tablist"` + `role="tab"` + `aria-selected` + roving tabindex. Architect's Risk R8-4 (WAI-ARIA APG divergence) was properly documented.
- **Dev's static-analysis test pattern** (R7 retro pattern): Extracted `filterByQuery` to `src/search-utils.ts` (browser-safe) and `cycleTab` to `src/sidebar-keyboard.ts` (pure functions) for direct unit-test import. 5 new unit tests, no DOM globals needed.
- **PM Triage's "auto-save draft is already shipped" rejection**: PM Triage self-investigated and correctly removed candidate #5 from R7 Loop Summary. Backlog-freshness gate working perfectly.

## Failures / lessons (what hurt)

- **Dev's self-check missed a CRITICAL runtime bug**: TDZ error broke the entire search feature at runtime. Dev's `bun run check` + `bun run build` + `bun test` all passed, but the dashboard was broken in the browser. **Lesson**: Static-analysis tests + typecheck are NECESSARY but NOT SUFFICIENT for UI changes. Playwright walkthrough is REQUIRED.
- **3c took 8 min instead of 2 min**: The TDZ bug discovery + fix + re-verify ate 5 min. Without the bug, 3c would have been 3 min (pre-warm + 4 scenarios). **Lesson**: TDZ errors are quick to fix once caught but require real browser verification.
- **Bundle vs single candidate tradeoff**: PM Triage + Manager recommended Bucket A (#1+#2). Lead auto-picked per R4 policy. If user wanted just #1 (smaller scope), would have been faster — but no way to know without asking. **Lesson**: User-pick gate is HARD GATE; auto-pick is OK if user is silent, but tighter user-pick interaction could reduce wasted work.

## Skill gaps found (changes that would have prevented the issue)

- **Gap J (R8 retro): Make browser walkthrough MANDATORY for UI changes**
  - **Symptom**: Dev's self-check missed a CRITICAL TDZ runtime error that broke the search feature at runtime. Playwright 3c caught it.
  - **Existing-skill-text**: `references/phase-prompts.md` Gap I section says "verify via playwright-cli walkthrough" — but as OPTIONAL guidance, not MANDATORY gate. Dev didn't follow it.
  - **Proposed patch**: Strengthen Gap I: change "verify via walkthrough" to MANDATORY before returning PASS. Add explicit Dev-side check: "before claiming self-check PASS, run `playwright-cli` for at least 1 scenario + verify 0 console errors". Add to Phase 4.7 self-check: "Dev's self-check MUST include playwright-cli walkthrough evidence for UI changes (or explicit profile-justified skip)".

- **Gap K (R8 retro): Playwright walkthrough should include "console errors = 0" check explicitly**
  - **Symptom**: Lead's Playwright walkthrough happened to check console errors (`playwright-cli console error`) which caught the TDZ. But this check isn't part of the standard 3c walkthrough checklist.
  - **Existing-skill-text**: 3c prompt says "verify walkthrough + screenshot + verdict" but doesn't explicitly require "0 console errors".
  - **Proposed patch**: Update 3c Playwright prompt (in `references/phase-prompts.md`) to include mandatory `playwright-cli console error` check after page load. If any errors, FAIL verdict.

## Followup items

- **R9 candidate (deferred from R8)**: #4 "Reopen stale findings" — PM Manager noted this is a REAL gap (`app.ts:1739` hides button + `src/index.ts:1796` server rejects). Different review lens (server-contract + agent-prompt). Not bugfix despite being a gap.
- **R8 Gap J skill patch**: Apply to `references/phase-prompts.md` Gap I section (mandatory walkthrough).
- **R8 Gap K skill patch**: Apply to 3c Playwright prompt (mandatory console error check).

## Action items for next round

1. **Apply R8 skill patches** (Gap J + Gap K) — `references/phase-prompts.md` updates.
2. **R9 PM Triage** with backlog-freshness gate — surface fresh user-stories (R4 MINORs + R5 MINORs + #4 reopen from R8 backlog).
3. **Update `.omo/proposals.jsonl`** with R8 line (including TDZ bug-fix narrative).
4. **Closure commit**: lead merges R8 → main + pushes.
5. **Phase 4.8 Loop Summary** (mandatory per Gap J) — visible to user.
6. **Phase 4.9 Issue Auto-Close** (mandatory per Gap K) — scan for related GH issues.

## Optimization validation (R8 is the 3rd round after patches)

**R5 baseline**: 78 min wall-clock
**R6 actual**: 34m 43s (1.8x speedup)
**R7 actual**: 33m 49s (1.8x speedup, stable)
**R8 actual**: TBD (closure commit pending) — expected ~40-45 min (Dev 14m 14s + Phase 3a/3b/3c/3.5 ~8 min including TDZ fix + closure ~5 min)

R8 is the first round where the optimization patches **caught a real bug** (TDZ). The combination of Patch A + Gap I prevented a broken R8 from being shipped. Net effect: optimizations not just faster, but **more correct**.

## Verdict

**Optimizations converged AND add correctness value.** R8 demonstrates that the patches aren't just about speed — they also catch runtime bugs that Dev's self-checks miss. **2 new skill gaps surfaced** (Gap J + Gap K) for R8 retro. Apply in closure commit.