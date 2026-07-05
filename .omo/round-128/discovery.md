# R128 Discovery — Focus trap on reconcile-listing popup (R123 retro flag)

## Backlog Scan

**Still-deferred items (10 rounds each):**
- **R123 retro flag: focus trap on reconcile-listing popup (PICKED)** — last remaining R123 retro item
- R116 worktree lock (semantic, no clear spec)
- Dark mode CSS variants (R126 retro flag)

## Decision

Pick **focus trap on reconcile-listing popup** as R128's single polish-class fix:

**Scope**: Use existing `installModalA11y` helper to add:
- Focus trap (Tab cycles within listing items)
- Initial focus (auto-focus first listing item)
- Restore focus (return focus to trigger badge after close)
- Defensive aria-modal="true" + role="dialog" assertions

`installModalA11y` is mature (R19 #38), used 10+ times in app for other modals. Listing just needs to call it.

## Why R128

- Pure a11y polish — closes the LAST remaining R123 retro flag
- Trivial implementation: 5 LOC (1 installModalA11y call + 1 dispose call)
- Reuses battle-tested helper
- Closes 1 of 3 remaining a11y/UX gaps across all retros

## Round Profile

- Feature: 0
- Bugfix: 0
- Polish: 1 (R123 retro flag: focus trap)
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~10 (1 installModalA11y call + 1 dispose call + 10 tests)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓ (1)
- ≤8 total ✓ (1)