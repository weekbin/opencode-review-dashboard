# R123 Retro — Click-to-expand reconcile badge listing (R117.2)

## What Shipped

Issue: R117 retro listed "No click-to-expand listing" as risk-surfaced-no-action. R118-R122 retros all mentioned it as still-deferred. 6 rounds deferred is at v6 NO DEFERRAL threshold.

User-facing delivery:
- **Click expand popup**: Clicking a reconcile badge (green/amber/red) showing count > 1 opens a popup listing ALL finding IDs in that category for that file
- Each finding shown as clickable button: `{file}:{line} — {category} — first 60 chars comment`
- Click an item → jumps directly to that specific finding + dismisses popup
- Click outside popup → dismisses popup
- Single-finding badges keep existing behavior (jump directly)

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| showReconcileListing function exists | ✓ app.ts:6802 |
| Click handler distinguishes 1 vs ≥2 findings | ✓ L6784-6802 |
| Div.reconcile-listing class | ✓ |
| One button per finding | ✓ `for (const f of findings)` |
| Buttons have data-finding-id | ✓ |
| Button click delegates to jumpToFindingById | ✓ |
| i18n reconcile.listing.heading en | ✓ "Findings in this file" |
| i18n reconcile.listing.heading zh-CN | ✓ "本文件中的审查项" |
| R117 reconcile badge wiring preserved | ✓ dataset.category added alongside findingId |
| No regressions | ✓ 90+ prior tests still pass |

10/10 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec.
- Implementation: ~50 LOC in app.ts (showReconcileListing function + click handler branch) + 1 i18n key × 2 locales + 10 tests.
- 1 mid-implementation stumble: AC2 test initially used 5000-char window starting from `findingsRoot.addEventListener` but the badge click handler is at L6784 (~230 lines after the start of the listener). Bumped to 15000.
- 1 mid-implementation stumble: AC4 used `findings.forEach` regex but actual code uses `for (const f of findings)`. Switched to `for...of` regex.
- 1 mid-implementation stumble: AC9 used `className = "reconcile-badge"` but actual code uses compound `"reconcile-badge reconcile-green"`. Switched to compound regex.
- 0 CSS changes (popup uses absolute positioning inline-styled — no new stylesheet entries).

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R123 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R117.2 click-to-expand listing (R117-retro risk-surfaced, deferred 6 rounds): SHIPPED this round.

## Open Loop-Internal at Retro Time

EMPTY.

## Self-Improvement Observations

- **Inline styling for popups avoids CSS-edit cycle**: showReconcileListing uses `el.style.position = "absolute"` etc. inline. This makes the round atomic (no separate CSS review) — could be extracted later if popup pattern recurs.
- **`dataset.category` on badge enables re-derivation**: instead of storing full findings array on badge (serialization cost), store `data-category` and re-derive findings from `state.fresh + state.existing` filtered by filePath. Cleaner + future-proof.
- **setTimeout(() => addEventListener, 0) pattern**: avoids the click-outside-dismiss firing on the click that opened the popup. Tiny detail but prevents UX bug.

## Risks Surfaced (no action this round)

- **Per-hunk reconcile (R117.1)**: still deferred (requires @@ hunk parsing)
- **Hunk-level overlap count (R117.3)**: still deferred
- **Histogram bar baseline = min not zero (R119.2)**: still deferred
- **Approve path doesn't lock worktree (R116)**: still deferred

## v6 Compliance

- Hard caps: 1 feature (≤3) + 0 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Feature: 1 (R117.2 click-to-expand reconcile listing)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0
- Time: ~20 minutes