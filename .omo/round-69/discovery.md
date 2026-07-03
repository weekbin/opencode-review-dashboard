# R69 Discovery

R68 carry-over: empty. Fresh scan for next product bug found:

**a11y gap in card-header (renderDiffPanel):**
- app.ts:4999 — `card-header` is a `<div>` with click handler but no role/tabindex/keydown
- Same pattern as R59 (sidebar folder div) and R51 (commit-card-head)
- Keyboard users cannot collapse/expand file cards via Enter/Space
- 100+ files means 100+ click-only divs

Selected scope: same fix pattern as R59 — role="button" + tabindex="0" + aria-expanded (initial + on click) + keydown Enter/Space handler.
