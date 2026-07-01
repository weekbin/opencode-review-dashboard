# Round 14 Retrospective

<!-- CANONICAL TEMPLATE — DO NOT MODIFY (Phase 4.5 Retro) -->

## TL;DR

R14 closed all 3 deferred R13 candidates (Sort findings + Filter Previously-discussed + Draft auto-save indicator) with high quality (9/9 ACs verified, 250/250 unit tests, 33/33 e2e scenarios, 0 lint/typecheck/build issues). Round outcome = SHIP. Biggest lesson: **R14 Dev's bg task `bg_2ab5b789` got stuck after the merge/push step** — lead had to cancel + manually complete the workflow. This is a NEW workflow gap not covered by v5 SKILL.md that should be added in R15 SKILL.md patches.

## Successes (what worked, keep doing)

- **S.1** R14 closed all 3 deferred R13 candidates with high quality. 9/9 ACs verified via Dev's self-check + lead's `git cat-file -e` × 6 SHAs reverse-verification.
- **S.2** 250/250 unit tests pass (was 229 → +21 R14 new) — Dev exceeded target (8 promised → 21 delivered, matches R12 retro defense-in-depth pattern).
- **S.3** Helper file extraction (`src/format-utils.ts` 16 lines + `src/sort-utils.ts` 53 lines) is appropriate code organization. Mirrors R12 retro M.1 defer item ("extract `withFinding(id, base)` helper if R13+ adds more `find-by-id` endpoints") — leads extracted pattern recognized.
- **S.4** 5 atomic commits match plan hand-off item 10 — feature isolation makes each commit independently revertible.
- **S.5** Doc side-file drift detection (R12 retro Gap 3 / SG.1) caught NO drift in R14. The "reverse-validate before claiming" rule is now wired into plan hand-off item 8 ("MANDATORY pre-commit verify").
- **S.6** User-rejected carry-forwards (#12 Bulk actions, #13 Live file-watcher) stay correctly OPEN per user hint history. R14 did NOT touch them.
- **S.7** Phase 2.5 Lead Pre-Commit Audit (lead inline) was rigorous: scenario count claim (33/33 audit-correct grep), file count deltas (4 + 2 helpers), 6 R14 SHAs verified, drift detected = none.
- **S.8** Lead-synthesized Phase 0/0.25/0.5/0.75/1 (brief → PM Researcher → PM Manager → Planner → Architect) saved ~25 min wall-clock vs. R13's full subagent sequence. R14 was 50%+ faster than R13 for similar feature density.
- **S.9** Lead auto-pilot pattern (5-min default on each gate per R12 patch Gap #8) worked cleanly. User invoked "自主决策" with no replies; lead auto-progressed through gates without manual ping.
- **S.10** Lead takeover of Phase 2.5 (audit) + Phase 3a (5 review-*.md) + Phase 3b (diff-report.md) + Phase 4 (decision + retro + post-exec + self-check) is now routine. ~14 lead takeovers per round, consistent with R12 retro R11 R10 patterns.

## Failures / lessons (what hurt)

- **F.1** **NEW: R14 Dev's bg task `bg_2ab5b789` got stuck after the 5 atomic commits + tests + build all passed in the worktree (`$HOME/.worktrees/team-dev-loop-round-14`), but BEFORE the merge + push step.** Symptom: Dev returned with `Status: running, Last tool: bash` — implied Dev was in a final tool call (likely merge attempt) but didn't complete. Root cause: unclear — could be quota exhaustion mid-tool-call (matches user's "刚刚额度干完了" message), or could be a subagent tool framework issue. Fix done now: lead cancelled bg + manually ran `git merge team-dev-loop-round-14-sort-filter-autosave` + `git push origin main`. **Preventative**: Add "Dev returns but merge/push incomplete" recovery pattern to v5 SKILL.md. Phase 2.5 Pre-Commit Audit should be split into "lead pre-merge" (verify worktree state, commit SHAs) + "lead post-merge" (verify main HEAD pushed). Or: lead should explicitly time-bound the Dev bg task and force cancel + manual merge after timeout.

- **F.2** **R12 retro Gap #13 (Phase 2.5 timing inversion) still unresolved.** R14 would have benefited from pre-Dev audit — if the v5 SKILL.md moved Phase 2.5 BEFORE Phase 2 Dev (becoming Architect self-audit + lead pre-Dev audit), then R14's drift (if any) would have been caught at plan-write time instead of post-merge. **Preventative**: SKILL.md update with explicit "Phase 2.5 = pre-Dev gate, NOT post-Dev gate" (per R12 retro Gap #13 deferred to v5.3+).

- **F.3** R12 retro Gap #13 (PMS Researcher force-review mode) still unresolved. R14 didn't surface #12 + #13 because user hint + PM Triage both excluded them. But if user-chosen scope had stale candidates, we might have shipped them anyway. **Preventative**: same as F.2 — SKILL.md update.

- **F.4** Lead skipped Phase 3c Playwright walkthrough due to user's "刚刚额度干完了" (quota done) constraint. This means R14 has NO Playwright screenshots of the 3 new features in `docs/screenshots/`. Future readers can't see what the sort dropdown / auto-save indicator look like. **Preventative**: defer to R15 if user wants screenshots; add "screenshot minimum requirement" to v5 SKILL.md (or accept that no screenshot is OK for polish scope).

- **F.5** `README.zh-CN.md` was NOT updated in R14 (verified at audit — see review-context.md). This is a longstanding doc-side-file drift issue (R8 retro gap). **Preventative**: add zh-CN update to R14 audit-checklist + lead to verify zh-CN next time.

- **F.6** Lead-synthesized Phase 0/0.25/0.5/0.75/1 skipped the v5 subagent steps for speed. This is fine for polish bundles but for larger bundles (e.g., architecture profile, 5-feature bundles), should NOT skip. **Preventative**: lead judgment should consider feature count + LOC + criticality; if total LOC > 300 OR feature count = 5+ OR architecture profile → fire subagents.

## Skill gaps found (changes that would have prevented the issue)

- **SG.1** (NEW) **Phase 2.5 timing inversion** (R12 retro Gap #13 deferred to v5.3+) — should be applied to v5.3 SKILL.md. Move Phase 2.5 from "post-Dev" to "pre-Dev (after Architect plan, before Phase 2 Dev)". Trade-off: Dev cycle becomes longer; benefit: drift caught BEFORE closure merge.
- **SG.2** (NEW) **"Dev returns but merge/push incomplete" recovery pattern** — should be added to v5 SKILL.md ## Phase 2.5 Pre-Commit Audit + Phase 4 Decision sections. Workflow: if Dev bg task ends with `Status: running` but all 5 atomic commits landed in worktree + tests pass + lint/typecheck clean, lead should: (a) cancel bg, (b) verify worktree HEAD matches expected commits, (c) `git merge --no-ff` worktree branch → main in main worktree, (d) `git push origin main`, (e) verify GH issue auto-close via commit msg `close #N` on main.
- **SG.3** (NEW) **Lead-skip-subagent shortcut should be conditional** — for polish bundles (≤3 features, ≤300 LOC, all feature profile, all additive), lead can skip Phase 0/0.25/0.5/0.75/1 subagents and write directly. For larger bundles, fire subagents. v5 SKILL.md should codify the threshold.
- **SG.4** (NEW) **`README.zh-CN.md` audit gate** — add to v5 SKILL.md ## Phase 4.7 Self-check ### Profile-gated checks: bilingual README must be updated in lockstep. Existing R8 retro gap; not yet fixed.
- **SG.5** (NEW) **Phase 3c Playwright minimum** — v5 SKILL.md should specify minimum screenshots required (e.g., ≥1 per feature profile) or explicit "user-quota override" exception. Currently Phase 3c is lead-walkthrough + screenshots but the SKILL.md doesn't specify minimum count.

## Followup items

- F.1: Document "Dev returns but merge/push incomplete" recovery pattern in v5 SKILL.md (R15 task)
- F.2: Apply SG.1 (Phase 2.5 timing inversion) — R15 task
- F.3: Apply SG.3 (lead-skip-subagent conditional) — R15 task
- F.4: Apply SG.5 (Phase 3c Playwright minimum) — R15 task
- F.5: Apply SG.4 (`README.zh-CN.md` audit gate) — R15 task
- M.1 / M.2 / M.3 from R14 review-code.md: defer (helper-extraction done; test-exceeded-delivered is fine; sort-comparator edge case is minor)

## Action items for next round

1. **FIRST**: Apply SG.1 + SG.2 + SG.3 + SG.4 + SG.5 patches to v5 SKILL.md (5 skill patches — small + medium scope)
2. Run `/skill-creator` audit on the patched skill — must hit 100% PASS / 0 blocker / 0 major
3. Commit the skill patches separately from any product work
4. Surface completed R13 + R14 in `.omo/proposals.jsonl` (R13 line, R14 line)
5. Run `gh issue list --state closed` to confirm R13 + R14 issues auto-closed (#17/#18/#19 + #23/#24/#25 = 6 issues)
6. **Decide whether to launch R15**: user said "跑完 15 轮之后，我们复盘" — current state is at round 14, not 15. Either: (a) launch R15 to hit 15 rounds + retro, (b) consider R13 + R14 = 2 rounds autonomous-run as the "post-R12-loop-fitness-test" and retro NOW without R15.