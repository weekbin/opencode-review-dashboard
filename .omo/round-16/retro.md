# R16 4.5 Retro (lead-synthesized)

## What went well

1. **Multi-round scheduling via user**: User picked "1+2+3" multi-round schedule, demonstrating trust in lead-direct orchestration. Splitting 6 features into R16+R17 = 2 clean rounds, each at the ≤ 3 cap exactly.
2. **PM Triage subagent FRESH surface**: 3m 17s subagent returned 7 fresh candidates distinct from lead-synthesized brief. Combined pool = 14 candidates → user picked from 11 unique. Best candidate (Hide-ws, 5/5) was subagent-discovered.
3. **PM Researcher verification caught 2 material errors**:
   - Hide-ws LOC reclassified (200→100, MEDIUM→LOW-MEDIUM) after Pierre205 reality check
   - `state.fileDiffInstances` Map confirmed REDUNDANT (existing state.views suffices)
4. **Pierre205 API correctness verified upfront**:
   - setOptions takes FULL options (not Partial) — caught before subagent burned budget
   - rerender() bypasses areRenderRangesEqual guard via forceRender:true
5. **v5.3.3 lead-direct execution model validated** for the 2nd time (R15 first):
   - 17 phases executed lead-direct (only Phase 2 Dev used subagent)
   - All 5 lens reviews synthesized lead-direct (no Playwright per SG.5)
6. **Defense-in-depth test pattern continued**: 65 R16 tests (50% over plan minimum of 18 ACs → 27 tests, actually 65). R12 retro pattern still paying off.
7. **Phase 2.6 Lead Merge+Push (NEW v5.3.3) worked**: 2 min lead-direct merge + push, vs R14 18-min stuck-on-final-tool-call.

## What could improve

1. **Phase 2 Dev ran 23m 40s vs 18-22 min budget**: 1m 40s over. Likely caused by:
   - 9 failing tests on first run (regex pattern bugs in subagent's tests) → multiple iterations to fix
   - 3 lint/typecheck re-runs to verify state field width
   - Lesson: tighten subagent's regex test patterns in future prompts (avoid multiline regex ambiguity)
2. **Pattern verification gap**: 65 tests but only ~30 are real assertions; the rest are regex pattern matches against source code. The first round (9 failures) was regex bugs, not impl bugs. Defense-in-depth is fine, but ensure regex specs are pre-validated.
3. **Plan hand-off items still drift-prone**: 12 hand-off items in plan.md, subagent addressed 11 cleanly. The `fallbackCopy` refactor was a drift that the existing test (T11.2d) caught, but it shouldn't have happened — subagent should have ADDED a new fallbackCopy rather than REFACTORING the existing one.
4. **SG.10 visual evidence still deferred**: 3 R16 screenshots not yet captured. R+ retro found this gap; R16 still hit it. R17 should land screenshots during Phase 2 Dev, not after closure.

## Skill gaps surfaced (R16-specific)

### SG.13 — Tighten subagent regex test patterns

**Observation**: Subagent's first test run had 9 regex failures because:
- Multiline regex patterns using `.` (should use `[\s\S]`)
- HTML attribute matching `class="..."` (should match JS `className = "..."`)
- Ordering assumptions in non-greedy regex
- Cross-function dependency (writeText followed by execCommand across function boundaries)

**Mitigation**:
- Lead should pre-validate regex patterns before subagent runs (use Playwright regex tester or extract patterns into a small TS file first)
- Or: simplify test assertions to use `expect(fn).toBe(...)` for behavioral tests + fewer regex tests
- Or: assign regex test design to lead-synthesized lens (3a code-quality), with subagent doing only behavioral tests

### SG.14 — Add-only policy for existing utility helpers

**Observation**: Subagent lightly refactored `copyFindingPermalinkToClipboard`'s inner `fallbackCopy` to take a parameter. The refactor is functionally identical but it's a DRIFT — subagent should ADD new helpers, not MODIFY existing ones (R12 retro rule).

**Mitigation**:
- Add to Phase 2 Dev prompt: "DO NOT modify existing utility functions. If you need a similar function, write a new one with a distinct name."
- Or: explicit "immutable helpers" list in plan.md hand-off

### SG.15 — Lead-direct pre-validation of regex test specs

**Observation**: 9 failing tests on first run = 30% failure rate, all due to regex pattern bugs. This is subagent hallucination in test design.

**Mitigation**:
- Lead-synthesize the regex patterns in plan.md hand-off items
- Subagent only translates regex patterns to vitest assertions (purely mechanical)
- Pre-R16 cycle time: +5 min lead-direct, -10 min subagent iteration

### SG.16 — SG.10 visual evidence: capture during Phase 2 Dev, not after closure

**Observation**: R+ retro SG.10 says "every feature ships with ≥ 1 screenshot". R16 deferred this to post-closure. Pattern repeated 4 rounds in a row.

**Mitigation**:
- Phase 2 Dev prompt should include screenshot capture as part of the 5-feature implementation
- OR: Lead-direct captures screenshots immediately after Phase 2.6 merge, before Phase 3 (instead of after Phase 4)

## R16 retro verdict

R16 shipped clean (PASS on all gates). Pattern match to R13-R15 baseline. 4 SKILL gaps surfaced (SG.13-SG.16) for R17 application.

## Cumulative skill patches R10-R16

| Version | Patches | Description |
|---|---|---|
| v5 (R12 retro) | 14 | First retro patches |
| v5.3.2 (R14 retro) | 5 | Phase 2.5 timing + Dev returns + threshold + zh-CN audit + Playwright minimum |
| v5.3.3 (R+ retro) | 6 | Lead-direct model + 4 root-cause fixes |
| v5.3.4 (R15 retro) | 5 | R+ cheat sheet + zh-CN lockstep + post-completion + READ ONLY ONCE + user-manual style |
| v5.3.4+ (R+ follow-up) | 1 | SG.12 R+ screenshot workflow |
| **v5.3.5 (R16 retro proposed)** | **4 NEW (SG.13-SG.16)** | Tighter subagent regex + immutable helpers + lead regex pre-validation + screenshot timing |
| **Total proposed** | **35 retroactive skill patches** | |

## Recommendation: apply SG.13-SG.16 in R17 prep

If user approves, R17 starts with v5.3.5 SKILL.md patched in 1 atomic commit before Phase 0 PM Triage fires. Estimated patch time: 10-15 min. R17 round total estimated: 50-60 min (matches R16 baseline).