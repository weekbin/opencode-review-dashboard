# R130 Discovery — Dark mode CSS variants for reconcile UI (R126 retro flag)

## Backlog Scan

**Still-deferred items:**
- **R126 retro flag: no dark mode CSS variants (PICKED)** — for R126's reconcile-listing popup + R125 hunk-badge + R117 reconcile badges
- R116 worktree lock (semantic, no clear spec)

## Decision

Pick **dark mode CSS variants for reconcile UI** as R130's single polish-class fix:

**Scope**: Add `@media (prefers-color-scheme: dark)` overrides for R126's reconcile CSS rules:
- `.reconcile-overlay-banner` — currently light yellow; dark mode needs darker yellow/dim
- `.card-reconcile-strip` — currently light gray; dark mode needs darker
- `.reconcile-badge` + variants (`.reconcile-green`, `.reconcile-amber`, `.reconcile-red`) — light pastels need darker tints with readable text
- `.reconcile-listing` — white card needs dark card
- `.reconcile-listing-item:hover` — light blue needs dark blue
- `.reconcile-hunk-badge` — light blue needs dark blue

## Why R130

- Pure polish — visual dark mode variants for already-shipped R117/R123/R125/R126 elements
- Small scope (~30-50 LOC CSS appended to existing `<style>` block)
- Closes a R126 retro flag that's been deferred since R126

## Why R130 ≠ alternatives

- **R116 worktree lock**: semantic-only, no clear implementation
- **New feature**: too much scope for a polish round
- **Other polish items (a11y, focus, etc.)**: R123/R127/R128 already closed those arcs

## Round Profile

- Feature: 0
- Bugfix: 0
- Polish: 1 (R126 retro flag: dark mode CSS variants)
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~40 (CSS @media overrides)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓ (none)
- ≤1 polish ✓ (1)
- ≤8 total ✓ (1)