# R126 Discovery — CSS for reconcile badges + listing popup (R123 retro flag)

## Backlog Scan

**Still-deferred items (6+ rounds each):**
- R116 worktree lock (semantic-only, no clear spec)
- **R123 retro flag: CSS for reconcile-badge / reconcile-listing popup (PICKED)**

R118-R125 retros all noted "no CSS for reconcile-listing popup" as a recurring flag. R123 retro explicitly flagged it. R124 retro didn't address. R125 retro didn't address. Now 2 rounds deferred for visual polish.

## Decision

Pick **CSS for reconcile badges + listing popup** as R126's single polish-class fix:

**Scope**: Add CSS rules in `src/ui/review.html` for all reconcile-related elements shipped unstyled by R117/R123:

- `.reconcile-overlay-banner` (top banner shown when reconcile mode active)
- `.card-reconcile-strip` (the strip rendered above each card)
- `.reconcile-badge` (the 3 colored badges: green/amber/red)
- `.reconcile-green` / `.reconcile-amber` / `.reconcile-red` (color variants)
- `.reconcile-listing` (popup from R123)
- `.reconcile-listing-heading`
- `.reconcile-listing-list`
- `.reconcile-listing-item`
- `.reconcile-hunk-badge` (from R125)

Style rules will:
- Give badges meaningful colors (green for resolved, amber for open, red for new)
- Make popup look like a popup (background, border, padding, box-shadow)
- Position listing correctly relative to badge
- Hover effects on listing items + hunk badges

## Why R126

- Pure polish — no schema, no logic, no new dependencies
- Pure CSS — easy to test (just count CSS rules in review.html)
- Closes a 2-round-old retro flag from R123
- Small scope = quick ship + iteration cadence maintained

## Round Profile

- Feature: 0
- Bugfix: 0
- Polish: 1 (R123 retro flag: reconcile CSS)
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)
- Estimated LOC: ~80 (CSS rules in <style> block)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓
- ≤1 polish ✓ (1)
- ≤8 total ✓ (1)