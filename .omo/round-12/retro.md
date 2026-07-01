# Round 12 Retrospective

<!-- CANONICAL TEMPLATE — DO NOT MODIFY (Phase 4.5 Retro) -->

## TL;DR

R12 shipped 3 additive features (★ Pinned findings + Emoji reactions + Keyboard `n`/`p` nav, 1460+ insertions across 12 files) with 100% brief match. Round outcome = SHIP. Biggest lesson: **doc-side-file drift detection (R5 retro Gap 3) regressed again** — captured by lead's pre-commit audit, fixed in `22864bf`, audit-blocked.md retained as R12 transparency record.

## Successes (what worked, keep doing)

- **S.1** 15/15 AC verification via Dev AC trace + lead reverse-verification (every AC has file:line evidence) — see `decision.md` `## Dev Self-Check` table
- **S.2** 185/185 unit tests pass (`bun test`) — 50 new tests (20 finding-pin + 14 finding-reaction + 16 keyboard-nav) added without regression; reflects the canonical "50 unit tests per feature" density established in R10-R11
- **S.3** Pattern reuse from prior rounds saved implementation time + reduced surprise: R1 atomic-write (`saveState`), R9 `manually_reopened` → R12 `manually_pinned` server-widening, R10 `manually_edited` → R12 emoji pattern, R11 `flashFindingPermaHighlight` reused for keyboard nav highlights
- **S.4** PM Researcher advisory handled cleanly: 2 verified / 5 unverified / 4 mischaracterized citations in `competitor-landscape.md`, but features were sound (3-test product-value gate passed). Advisory surfaced in plan.md ## Risk register, honored in README + code, no rework needed
- **S.5** Pre-commit audit-blocked.md mechanism (R8 retro "don't hide bugs") worked exactly as intended: drift caught on R12 commit, surfaced transparently, fix landed in `22864bf`, audit trail preserved
- **S.6** Lead-synthesized 5-lens pattern (R5 default + Patch H) held up at R12 scale: zero orchestrator stalls, all 5 lenses reached PASS in ~10 min total wall-clock

## Failures / lessons (what hurt)

- **F.1** Doc-side-file drift detection (R5 retro Gap 3) **regressed** — symptom: Dev claimed `e2e: 31/31` per plan.md (25 + 6 = 31), but actual pre-R12 scenario count was 24 → 30 not 31. Root cause: plan.md was wrong about the baseline count, Dev followed plan.md without `wc -l` reverse-verification first. Fix done now: `22864bf` patches `31 → 30` in 2 files; audit-blocked.md records as R12 lesson. **Preventative**: Architect (or Dev) must `wc -l scripts/test-review-ui/scenarios.mjs` before claiming scenario count in plan.md.
- **F.2** Self-check at Dev time would have caught F.1 before commit — symptom: Dev committed and merged to main, then lead's pre-commit audit caught the drift. Root cause: Dev followed plan.md instructions literally without verifying the source-of-truth. Fix done now: lead audit caught it. **Preventative**: add a "Pre-commit side-file drift detection" template to Dev prompt — Dev must grep the source-of-truth before claiming any count.
- **F.3** Tab-switch focus issue in Playwright walkthrough prevented 1 of 4 interactive scenarios from completing (3rd click on Conversation tab retried due to auto-save PUT interleaving) — symptom: `star button click` + `emoji picker click` flows not fully E2E-tested; only surface verification via snapshot. Root cause: `mock-server.py` doesn't support PUT for /draft endpoint, 501 from auto-save retries. Fix done now: R8 retro Gap K console-error check verified the 501 is pre-existing (not R12-caused); unit tests cover pin/react/keyboard-nav logic (50 new). **Preventative**: lead should use a different tab-click strategy in R13+ (e.g., set focus first via JS evaluate, then click tab from same eval).
- **F.4** 4 system-reminder prompts fired during user gate (waiting on `go`) → lead emitted repetitive "等。" filler briefly. Root cause: my pattern was tight-loop ultra-terse, but the framework's TODO CONTINUATION fires per turn regardless of pending state. Fix done now: project memory 1800 ("stay silent between phases") honored — at end of round the user explicitly OK'd the auto-pilot default in `fix`, so future rounds can be tighter.

## Skill gaps found (changes that would have prevented the issue)

- **SG.1** Plan.md hand-off items should include "Pre-commit side-file drift detection" — read your prior claim value via `wc -l scenarios.mjs SCENARIOS` or equivalent, and **reverse-validate against source-of-truth** before declaring the count. **Symptom**: `decision.md` + `plan.md` referenced "31 scenarios" but actual was 30. **Existing-skill-text missing**: `references/phase-prompts.md` § 4 Dev prompt has no "reverse-validate before committing" step. **Proposed patch**: add a section "Pre-commit side-file drift detection" to `phase-prompts.md` § 4 with the R5 retro Gap 3 checklist + a "wc -l source-of-truth before committing" rule.

## Followup items

- F.1: Document how the cumulative scenario-count drift accumulated (R10 + R11 closure retros both reported "23 → 25" but actual was 24 baseline) — possible v5 retrospective lesson on closure retro self-honesty
- F.3: Investigate `playwright-cli click` retry behavior on tabs that share keyboard focus with auto-save drafts — may be a playwright-cli bug or a mock-server limitation
- SG.1: Apply skill patch in `.opencode/skills/team-dev-loop/references/phase-prompts.md` (R13+ task)
- Code M.1: Extract `withFinding(id, base)` helper if R13+ adds more `find-by-id + 400/404` endpoints
- Code M.2: Move `EMOJI_WHITELIST` to a shared utility if R13+ adds emoji picker surfaces elsewhere

## Action items for next round

1. **FIRST: Apply SG.1 skill patch** to `references/phase-prompts.md` § 4 — add "Pre-commit side-file drift detection" section with R5 retro Gap 3 checklist + "wc -l source-of-truth before committing" rule
2. Run `/skill-creator` audit on the patched skill (must hit 100% PASS, 0 blockers, 0 majors)
3. Commit the skill patch separately from any product work (so audit gate is visible in git history)
4. Surface completed R12 in `.omo/proposals.jsonl` (next round activity)
5. Run `gh issue list --state closed` to confirm #17/#18/#19 auto-closed
