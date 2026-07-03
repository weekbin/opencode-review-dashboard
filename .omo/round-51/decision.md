# R51 Decision

## Decision
SHIP

## Lightweight round (if applicable)
NO — 3 src/ files touched (review.html, app.ts, i18n.ts); above ≤2 threshold for lightweight. Regular round.

## Doc updates (SG.R29.8 carry-over)
SKIPPED — internal chevron toggle UX; no user-facing README change needed (existing COMMits panel docs already accurate; chevron is detail).

## Loop summary (1 paragraph)
R51 pivots to product work after 5-round housekeeping streak: implements GH#73 #7 (COMMits panel fold/unfold visual cue). Root cause: existing click handler toggled `data-collapsed` but had no chevron — users couldn't see state. Fix adds `.commit-card-chevron` element with rotate-90deg CSS, `aria-expanded` toggling, `role=button` + `tabindex=0` for keyboard a11y, and i18n `commits.toggle.ariaLabel` (en + zh-CN). 6 new regression tests (632/632 total, was 626). Pre-commit 8/8 PASS. Round follows v6 spec end-to-end (6 artifacts, 7 capabilities, lead-direct 100%, 0 subagent dispatches). Loop-internal items all closed in current worktree. R52 will run next per auto-pilot default — backlog: GH#73 #6 (hide-ws perf, needs bench harness) or continue housekeeping on remaining 2289 lines of references/.