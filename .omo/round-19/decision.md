# R19 Decision

> **Lead**: sisyphus primary chat
> **Date**: 2026-06-30
> **Round**: 19
> **Verdict**: **SHIP-WITH-NOTES** (per R5 retro pattern, 13/14 ACs PASS + 1 PARTIAL)

## Round profile

- **Profile**: feature (auto-classified from U_* fields, Rule 2: U_user_visible=yes + total=7 ≥ 3)
- **Profile gating**: feature → Phases 0/0.25/0.5/0.75/1/2/2.5/2.6/3a/3b/3c/3.5/4/4.5/4.6/4.7/4.8/4.9 all run

## Sync

- **Baseline SHA**: `a0e0361d0efce2f0cabb09d452f3c2f0976bf318` (R18 macOS cleanup)
- **Network**: PASS (no new remote commits)
- **macOS Chrome cleanup gate**: PASS (no residue pre-cleanup)
- **Tool pre-flight**: PASS (all 7 tools present, playwright-cli 0.1.14)
- **gh labels pre-created**: PASS (pm-manager-approved + round-19)

## Planner

- **Scope**: 3 features / 0 bugfix / 0 polish / total 3 (at feature ≤ 3 cap)
- **Candidates selected**: #33 Language toggle + #37 Toast + #38 A11y audit
- **Backlog freshness gate**: 2 stale candidates at boundary, no fresh-investigation trigger
- **Hard caps**: PASS (feature=3/3, total=3/8)

## Pre-Commit Audit (Phase 2.5)

- **3 SHAs verified**: `git cat-file -e` × {846a67f, d45bf4e, 84a6f3a} all PASS
- **3 fast gates**: bun test 417/417 pass, bun run check 0 warnings/errors, bun run build clean (304 files)
- **Doc-side-file drift caught**: scripts/test-review-ui/README.md:20 claimed "33 git scenarios" but actual was 34. Pre-existing R17-era drift. **Fixed in commit 4dfb08e before merge** (Phase 2.5 audit drift fix)
- **Verdict**: PASS (after drift fix)

## Merge + Push (Phase 2.6)

- **Merge strategy**: `git merge --no-ff team-dev-loop-round-19-polish-bundle`
- **Merge commit**: `9867ce2 Round 19: i18n + toast + a11y polish bundle (close #33, #37, #38)`
- **Push to origin**: PASS (a0e0361..c8fbee5 main)
- **GH auto-close verification**: #33, #37, #38 all CLOSED ✓ (via commit msg syntax)

## Dev subagent AC trace

All 14 ACs self-claimed PASS by Dev (per inline AC trace in Dev's return):

| AC | Dev claim | Phase 3c verified | Notes |
|---|---|---|---|
| AC1.1 | PASS | PASS | Toolbar language toggle button visible |
| AC1.2 | PASS | **PARTIAL** | Toggle works + localStorage persists, but only 2 of 30+ UI strings wrapped in `t()` calls. Toolbar/sidebar labels remain English. |
| AC1.3 | PASS | PASS | localStorage `diff-review:language` persists correctly |
| AC1.4 | PASS | PASS | applyLanguage() runs at module load before render |
| AC1.5 | PASS | PASS | UTF-8 verified via /\p{Script=Han}/u regex |
| AC2.1 | PASS | PASS | Toast container role/aria-live polite |
| AC2.2 | PASS | PASS | 3s lifetime architecture verified |
| AC2.3 | PASS | PASS | 5 trigger sites wired (exceeds AC floor of 4) |
| AC2.4 | PASS | PASS | Close button + dismissToast() verified |
| AC3.1 | PASS | PASS | Sidebar tabs role=tablist + role=tab visible |
| AC3.2 | PASS | PASS | save-indicator role=status visible |
| AC3.3 | PASS | PASS | 5 modals wired with installModalA11y |
| AC3.4 | PASS | PASS | Skip-to-content link visible + functional |
| AC3.5 | PASS | PASS | `<main>` landmark wraps content |

**13/14 PASS + 1 PARTIAL (AC1.2)** — Gap #14 subagent claim verification caught the partial.

## Doc updates (Phase 3.5)

- README.md: 3 new "What it looks like" sections added (language toggle, toast, a11y)
- README.zh-CN.md: 3 corresponding sections (1:1 lockstep per SG.6)
- 4 screenshots: `docs/screenshots/r19-s{1,2,3,4}-*.png`
- Commit: `c8fbee5 docs(r19): README + zh-CN update`

## Verdict

**SHIP-WITH-NOTES** per R5 retro pattern. 13/14 ACs PASS + 1 PARTIAL. AC1.2 (language toggle label translation) is partial — toggle infrastructure works (button visible, language persists, click toggles state), but only 2 of 30+ UI strings wrapped in `t()` calls. Documented as R20 follow-up.

## Lead takeovers

- **phase-2.5-pre-commit-audit**: lead-direct (always)
- **phase-2.6-lead-merge-push**: lead-direct (v5.3.3 SG.4)
- **phase-3a-tester-review**: lead-synthesized 5 review-*.md + test-report.md (R4 Gap 2 default + R+ v5.3.3)
- **phase-3b-tester-diff**: lead-synthesized diff-report.md (R4 default)
- **phase-3c-tester-playwright**: lead-direct via playwright-cli (R14 SG.5 + R5.3.5+1 SG.20 mandatory for UI changes)
- **phase-3.5-doc-writer**: lead-direct (R4 default)
- **phase-4.5-retro**: lead-direct (mandatory)
- **phase-4.6-post-exec**: lead-direct (mandatory)
- **phase-4.7-self-check**: lead-direct (mandatory)

## Decision: SHIP to main

- 13/14 ACs PASS, 1 PARTIAL (AC1.2)
- 417/417 unit tests pass
- 0 console errors during Playwright walkthrough
- 4 Playwright screenshots captured
- README + zh-CN lockstep (SG.6 PASS)
- 3 GH issues auto-closed via commit msg (`close #33 #37 #38`)

**Rationale**: Most features complete and verified. AC1.2 partial is an integration gap (t() not wired to existing strings), but infrastructure works and can be completed in R20 as a polish follow-up without blocking R19 ship.

## Follow-up items (R20 backlog)

1. **AC1.2 PARTIAL completion** (HIGH PRIORITY) — wire t() calls to remaining 28+ UI strings (toolbar buttons, sidebar tabs, action buttons, modal labels). Add `onLanguageChange` subscribers to re-render text. Add integration test that toggles language AND verifies labels changed.
2. **Process gap from R19** — Phase 2.5 audit must rebuild in MAIN worktree post-merge (today built in worktree, main's dist stayed stale). Add this to SKILL.md.
3. **`setsid` not on macOS** — R18 cleanup pattern referenced `nohup setsid ...` which is Linux-only. Document macOS-compatible variant.
4. **SG.11 visual evidence for toast** — add per-trigger screenshots (r20-toast-{action}.png) in R20 to match R19 visual evidence standard.
5. **R18 leftover stale issues** — #12 Bulk actions + #13 Live file-watcher remain open (aged_rounds=6, user-rejected 6x). R12 retro rule says they're at violation threshold; consider closing as not-planned.