# R133 Discovery — fix dead i18n tooltips + aria-labels

## Backlog scan

- `gh issue list --label pm-manager-approved --state open` → `[]` (none open)
- `.omo/proposals.jsonl` (last 25 entries) → only round-recap lines, no housekeeping proposals
- R132 carry-over list (from `.omo/round-132/retro.md ## Carry-over`) → empty

## Decision

Backlog is empty. Per v6 "no backlog — DECIDE housekeeping" rule I sweep the codebase for low-LOC, no-new-behavior candidates.

## Housekeeping candidates surfaced from the codebase

### H1 — Dead `data-i18n-title` attributes (22 occurrences in `src/ui/review.html`)

`i18n.ts:931-943`'s `applyUITranslator(key, fn)` only walks `[data-i18n="<key>"]` nodes (text content). It does not touch `[data-i18n-title="<key>"]` or `[data-i18n-aria-label="<key>"]`. R81 retro carried "Other hardcoded English `title=` attributes in review.html" because of this exact pattern. 51 rounds later the attributes are still present but never read — bilingual users see English tooltips forever.

Surfaced keys (22 tooltips):
```
toolbar.copyBranch.title, saveIndicator.title, toolbar.layout.unified.title,
toolbar.layout.split.title, toolbar.ignoreWs.description, toolbar.export.title,
submitReview.title, sidebar.files.tooltip, sidebar.commits.tooltip,
sidebar.conversation.tooltip, sidebar.previously.tooltip, sidebar.stats.tooltip,
sidebar.mode.tree.title, sidebar.mode.flat.title, conversation.filter.open.title,
conversation.filter.resolved.title, conversation.filter.all.title,
conversation.filter.pinned.title, conversation.filter.reacted.title,
conversation.sort.title, previously.filter.title,
settings.virtualization.description
```

### H2 — Dead `data-i18n-aria-label` attributes (29 occurrences in `src/ui/review.html`)

Same root cause, separate attribute. 29 aria-labels silently stay English:
```
toolbar.ignoreWs.ariaLabel, settings.btn.ariaLabel, drawer.toggle.ariaLabel,
navbar.tabs.ariaLabel, sidebar.resize.ariaLabel, drawer.close.ariaLabel,
settings.close.ariaLabel, (plus 22 more across the same surface)
```

### H3 — Stale R81 carry-over in `proposals.jsonl`

R81 retro explicitly wrote: "Other hardcoded English `title=` attributes in review.html (search for more)". H1+H2 are the literal answer to that carry-over. Closing H1+H2 closes the longest-lived retroactive flag in the loop.

## Selection (1 polish)

- **Pick H1+H2 (single round, single root cause).** They share the same fix (extend `applyUITranslator` to also walk `data-i18n-title` and `data-i18n-aria-label`). One polish line item, low LOC, zero behavior change for non-i18n users, meaningful improvement for bilingual users.
- Defer H3 (proposals.jsonl housekeeping) — not a functional bug.
- Deeper housekeeping (raw hex colors, stale TODOs) is not "no src/" enough; out of scope this round.

## Round profile

`polish` — no new behavior, no schema change, single root cause, ≤3 src files (`src/ui/i18n.ts`, `src/ui/review.html`, optional `src/ui/app.ts`), ~10-30 LOC net.

## Hard caps compliance (pre-flight)

- Features: 0 (≤3) ✓
- Bugfixes: 0 (≤5) ✓
- Polish: 1 (≤1) ✓
- Total: 1 (≤8) ✓