# R69 Discovery

R68 carry-over: empty. Fresh scan found:

**a11y gap: card-header divs**
- app.ts:4999 `card-header` is a `<div>` + click handler
- No role/tabindex/keydown (keyboard users can't collapse files)
- 100+ cards = 100+ click-only divs

Same pattern as R59 (folder) and R51 (commit-card-head). One src/ file. ~10 LOC.
