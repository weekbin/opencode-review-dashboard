# R122 Discovery — updateSubmitButtons reactive bugfix (R116.1)

## Backlog Scan

**R116 retro risks-surfaced (deferred 5 rounds now):**
- ~~updateSubmitButtons not wired into renderFindings~~ — R116 retro promised "Will close in current worktree before SHIP" but didn't (see R116.1 hotfix which only addressed the dual-button issue from #83 Oracle-flagged)
- No reopen guard for approved findings
- Approve path doesn't lock the worktree

**R119 + R120 + R121 retro risks-surfaced (still deferred):**
- Histogram bar baseline = min not zero (R119.2)
- Per-hunk reconcile (R117.1)

## Decision

Pick **R116.1 (updateSubmitButtons reactive)** as R122's single bugfix:
- Bug: Approve button enable state only computed at boot (renderFindings initial) or at submit-click time. After user resolves a finding inline, the button stays disabled until they reload the page OR add another finding OR attempt to submit.
- User-visible: open 5 findings → resolve all 5 → button still disabled. User reloads (annoying).
- Fix: call `updateSubmitButtons()` from any state-changing handler (resolve, reopen, add, mark-wontfix, edit).
- Pure bugfix — no UI change, no schema change, no new i18n keys.
- 5 rounds stale per R12 retro stale-bundle rule — picking now to break the chain.

## Round Profile

- Feature: 0
- Bugfix: 1 (R116.1 updateSubmitButtons reactive)
- Polish: 0
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓ (1)
- ≤1 polish ✓
- ≤8 total ✓ (1)