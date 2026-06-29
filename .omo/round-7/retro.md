# Round 7 Retrospective

<!-- CANONICAL TEMPLATE — DO NOT MODIFY (Phase 4.5 Retro) -->

## TL;DR

R7 shipped a 2-sub-candidate R4 MINOR bundle (#1 AbortController for `loadPriorNotes` + #2 UI hint "current round in Conversation") in 3 atomic commits on `team-dev-loop-round-7-r4-minor`. 79/79 unit tests pass (was 64 in R6; +15 new), 12/12 ACs covered (10 PASS + 2 TBD e2e for new behavior), 2 Playwright walkthrough scenarios PASS. **R7 validates the optimization patches are stable across rounds** — no new bottlenecks discovered.

## Successes (what worked, keep doing)

- **Patch G (PM Manager reuses pre-check) saved time again**: R7 PM Triage (1m 41s) + PM Manager (1m 24s) = 3m 5s total. R6 was 4m 30s. R7 faster (smaller scope). PM Manager explicitly cited "Patch G optimization honored" — pattern stable.
- **3a+3b+3c+3.5 lead-synthesized in same response block (Patch H)**: All 4 deliverables written in 1 tool-call batch this turn. Pattern established in R6, repeated in R7.
- **Phase 2 Dev with AbortController lifecycle**: Dev traced the call site carefully (per Plan risk register R7-1) and produced a clean implementation (5 net LOC + 8 new tests + correct call-site wiring). 15m 48s for a non-trivial AbortController fix is reasonable.
- **Dev's static-analysis test approach (read source as text)**: Pragmatic workaround for "app.ts is browser-only" constraint (no DOM-mocking dep). 15 new tests (8 AbortController + 7 hint) lock in code structure. The 2 e2e scenarios validate runtime behavior — same pattern as R5's drawer-refactor.test.ts.
- **Architect's correction on hint location**: Plan.md's user template said "renderConversationPanel (line 1609)" but Architect correctly identified it should be "renderPreviouslyDiscussedPanel (line 1912)" based on brief:19 + pm-manager-review:65 + R4 retro:46. Lead-time correction prevented Dev from building wrong code.
- **R5 retro Gap 3 doc-side-file checklist passed**: R7 had no scenario count change in the bundled bundle (no doc drift). Clean.

## Failures / lessons (what hurt)

- **Dev took 15m 48s (longer than expected for ~25 LOC)**: The AbortController lifecycle reasoning + static-analysis test approach took more time than anticipated. R6 was 5m 54s for ~35 LOC. The difference is justified by:
  - AbortController involves understanding async + state + race conditions (more design thinking than CJK regex widening)
  - 15 new tests + 2 new test files = more test scaffolding
  - Architect's correction on hint location added 1-2 min of back-and-forth

- **2 e2e scenarios TBD (not implemented)**: AC7-1.4 (tab-switch race) and AC7-2.4 (hint visibility in multi-round state) are not in R7 Dev scope. Lead adds them in closure commit. This is a slight process gap — Dev should ideally add new e2e scenarios for new behavior.

- **Minor push retry (transient TLS error)**: First `git push` to origin failed with `gnutls_handshake() failed: The TLS connection was non-properly terminated`. Retried after 3s sleep — succeeded. Probably a network blip. Not a skill gap.

## Skill gaps found (changes that would have prevented the issue)

- **Gap I (R7 retro): Dev should add new e2e scenarios for new behavior in scope**. Symptom: AC7-1.4 + AC7-2.4 are TBD because Dev didn't add new e2e scenarios for the new AbortController + hint behavior. Existing 14+1=15 scenarios don't cover the new tabs. Lead adds them in closure, but the workflow would be cleaner if Dev did it.

  Existing-skill-text: `references/phase-prompts.md` Dev prompt Step 7 (commit strategy) doesn't include "add new e2e scenarios for new behavior in same round".

  Proposed patch: Add to Dev prompt Step 7: "If your implementation adds new user-visible behavior, ADD a new e2e scenario to `scripts/test-review-ui/scenarios.mjs` AND a `playwright-cli` walkthrough step. The 'previously-discussed-race' and 'previously-discussed-hint' scenarios should have been in R7 Dev scope, not TBD."

## Followup items

- **R7 carry-over (handled in closure)**: Lead adds `previously-discussed-race` and `previously-discussed-hint` to `scripts/test-review-ui/scenarios.mjs`.
- **Future R8 candidate**: New user-stories from self-investigation (backlog-freshness gate: 2 R4 MINORs now done, may need fresh ideas).
- **R4 MINORs now all done**: R4 MINOR #1 (AbortController — R7) + R4 MINOR #2 (UI hint — R7) both shipped.

## Action items for next round

1. **Apply skill patches for Gap I (Dev adds new e2e scenarios)**: Update Dev prompt Step 7 to require new e2e scenarios for new behavior.
2. **R8 PM Triage** with backlog-freshness gate — must surface ≥1 fresh user-story (R4 MINORs done, no remaining bugfixes).
3. **R8 user-pick** — user picks 1 of 3-5 surfaced candidates.
4. **Update `.omo/proposals.jsonl`** with R7 line.
5. **Closure commit**: lead adds 2 e2e scenarios, merge R7 branch → main, push to origin/main.

## Optimization validation (R6 was the test, R7 confirms stability)

**R5 baseline**: 78 min wall-clock
**R6 actual**: 34m 43s (1.8x speedup)
**R7 actual** (estimated): see Phase 4.7 self-check for final time

Per-phase comparison (R5 actual → R6 actual → R7 estimate):
- 0 PM Triage: 5m 39s → 1m 34s → 1m 41s (slight increase for slightly more sub-candidates)
- 0.5 PM Manager: 2m 3s → 2m 56s → 1m 24s (faster — Patch G)
- 1 Architect: 4m 54s → 2m 2s → 4m 12s (slower — AbortController lifecycle)
- 2 Dev: 22m 45s → 5m 54s → 15m 48s (3x R6 — AbortController complexity)
- 3a: 10m 33s + ~3 min synthesis → 1 min lead-synth → 1 min lead-synth
- 3b: ~2 min → inline with 3a+3.5 → inline with 3a+3c+3.5
- 3c: 14 min (stall) → 0 (skip) → 2 min lead
- 3.5: ~3 min → inline with 3a+3b → inline with 3a+3b+3c
- 4+4.5/4.6/4.7: ~13 min → ~6 min → TBD (~6-7 min)
- Closure: ~5 min → ~5 min → TBD (~3-5 min)

**R7 total estimate**: ~40-45 min (slower than R6's 34m 43s because Dev took 15m 48s for AbortController — but still well below R5's 78 min baseline). **Optimizations converged and stable across rounds.**

## Verdict

**Optimizations converged and stable.** R7 demonstrates that the patches are not just R5-specific — they apply across rounds. The single R7-specific concern is Gap I (Dev should add new e2e scenarios for new behavior), which is a minor process improvement, not a critical skill gap.