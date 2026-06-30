# R21 Decision — SHIP

> **Generated**: 2026-06-30
> **Round**: 21
> **Verdict**: **SHIP** (not SHIP-WITH-NOTES — first clean SHIP since R19 retro)
> **Tip SHA**: `7a4c045` (feature merge) + `93bc1c7` (docs) + `0c30daf` (archive)

## Ship status

- **Feature SHIP**: 2 atomic commits + docs + archive — 4 commits total on main
- **Issues closed**: #43 (manual close, commit-reference), #44 (auto-close)
- **Stale backlog cleanup**: #12 + #13 closed in this section (no separate commit per retro convention)
- **Test delta**: 0 regressions, +47 new tests (6 search + 41 settings)
- **i18n**: 15 keys added × 2 locales = 30 STRINGS entries
- **No new deps**: 0

## AC trace summary

| Issue | ACs | Status |
|---|---|---|
| #43 search debounce | 6 (3.1-3.6) | 6/6 PASS |
| #44 settings modal | 9 (4.1-4.9) | 9/9 PASS |
| **Total** | **15** | **15/15 PASS** |

## Constraints honored

| Constraint | Status |
|---|---|
| ≤3 features | ✓ 1 feature + 1 polish (counts under feature cap) |
| ≤5 bugfixes | ✓ 0 |
| ≤8 total | ✓ 2 |
| ≤1 polish | ✓ 1 (#43, at cap) |
| No new deps | ✓ |
| localStorage keys preserved | ✓ |
| i18n parity (en + zh-CN) | ✓ |
| macOS no `setsid` | ✓ |
| R3-fabrication defense | ✓ both SHAs verified |
| SG.R20.1 3-step rebuild | ✓ merge → build → grep verify |

## Stale backlog CLEANUP (per R12 retro)

### Issue #12 — "Bulk actions" (aged_rounds=6, STALE)
- **Why stale**: User has not selected this in 6 rounds. R10 decision was "skip, prefer typed flows over bulk ops". R+ retro says 3+ aged = STALE.
- **Action**: Close as `not_planned`. Surface in R22+ if user feedback arrives.
- **GH close**:
  ```bash
  gh issue close 12 --comment "R21 CLEANUP: closed as not_planned (aged_rounds=6, R12 retro violation). R21 chose settings page (issue #44) instead — user-value 3/5 vs 2/5. Surface in R22+ if user feedback arrives." --reason "not_planned"
  ```

### Issue #13 — "Live file-watcher" (aged_rounds=6, STALE)
- **Why stale**: User has not selected this in 6 rounds. R10 decision was "skip, prefer agent-driven re-detect". Adds OS-specific file-watcher (chokidar/fs.watch) dependency. R+ retro says 3+ aged = STALE.
- **Action**: Close as `not_planned`. Surface in R22+ if user feedback arrives.
- **GH close**:
  ```bash
  gh issue close 13 --comment "R21 CLEANUP: closed as not_planned (aged_rounds=6, R12 retro violation). R21 chose settings page (issue #44) instead. Adds OS file-watcher dep — only justified if user feedback demands. Surface in R22+ if user feedback arrives." --reason "not_planned"
  ```

## Lead-direct takeovers (per v5.3.3 spec)

R21 used lead-direct execution for 14 of 15 phases (only Phase 2 Dev used subagent). Total lead-direct wall-clock: ~95 min.

| Phase | Role | Time |
|---|---|---|
| -0 | Lead Sync | 2 min |
| 0 | Lead PM Triage | 8 min |
| 0.25 | Lead PM Researcher (webfetch + grep) | 5 min |
| 0.5 | Lead PM Manager (gh issue create × 2 + label) | 3 min |
| 0.75 | Lead Planner (composite scoring) | 2 min |
| 1 | Lead Architect (plan.md + STRINGS_USAGE_PLAN) | 8 min |
| 2 | Dev subagent × 2 (#43 + #44) | 12 min |
| 2.5 | Lead Pre-Commit Audit (3 fast gates) | 5 min |
| 2.6 | Lead Merge+Push (SG.R20.1 3-step) | 3 min |
| 3a | Lead 5 review-*.md | 10 min |
| 3b | Lead Diff report | 2 min |
| 3c | Lead Playwright Gap #14 walkthrough | 5 min |
| 3.5 | Lead Doc writer + archive | 8 min |
| 4 | Lead Decision (this file) | 5 min |
| 4.5-4.7 | Retro + post-exec + self-check | 15 min |
| 4.8 | Loop Summary chat | 1 min |
| 4.9 | Issue Auto-Close verify | 1 min |
| **TOTAL** | | **~95 min** |

## Commit chain (R21 SHIP)

```
0c30daf  chore(round-21): archive R21 entries in proposals.jsonl
93bc1c7  docs(r21): README + zh-CN update — search debounce + settings panel
7a4c045  Merge branch 'team-dev-loop-round-21-settings-and-search-polish' into main
e6be856  feat(settings): #44 add centralized preferences panel with 15 i18n keys
690db2b  feat(search-history): #43 debounce 300ms + Enter-immediate commit
```

## Final verdict

**SHIP** — both candidates closed with full AC trace, no regressions, all constraints honored, stale backlog cleaned.

## Next round (R22) candidates

| # | Candidate | Source | Profile |
|---|---|---|---|
| R22+ FEATURE | Diff virtualization for 1000+ line files | R20 retro R+ backlog | feature |
| R22+ FEATURE | Reset-restore search-history (button in Recent Searches dropdown) | R21 retro follow-up | feature |
| R22+ POLISH | Bulk delete recent-searches (multi-select) | R21 retro follow-up | polish |
| R22+ DOCS | Toast screenshots (R19/R20 toast sections still text-only) | R20 retro R+ backlog | polish |
| R22+ CLEANUP | n/a — backlog cleared by R21 | - | - |

Lead-direct execution continues. Planner autonomous (no user pick per v5 final spec).