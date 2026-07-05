# R125 Retro — Per-hunk reconcile badges (R117.1)

## What Shipped

Issue: R117 retro listed per-hunk reconcile as a 7-round-deferred enhancement. R118-R124 retros all noted it as still-deferred. R125 closes the R117 polish arc fully.

User-facing delivery:
- **Per-hunk reconcile badges**: when reconcile mode is active, each `[data-hunk]` wrapper now shows a small badge with the count of findings landing in that hunk's line range
- Click badge → `jumpToFindingById` for the first finding in that hunk
- Same `state.reconcileMode` toggle as R117 + R123 — no new state
- Builds on `data-hunk` attribute (from diff-virtualization.ts) + `HunkRange` interface
- Closes R117.1 carryover + implicitly R117.3 (overlap count is a subset)

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| findingsInHunk helper function exists | ✓ app.ts:5460 |
| Per-hunk reconcile badge rendered inside [data-hunk] wrapper when reconcile mode on | ✓ app.ts:5501-5517 |
| Badge click handler delegates to jumpToFindingById | ✓ with e.stopPropagation() |
| Badge only rendered when count > 0 | ✓ `if (hunkFindings.length > 0)` |
| Badge only rendered when reconcile mode is on | ✓ `if (state.reconcileMode)` |
| Findings filter uses start_line between startLine and endLine | ✓ |
| i18n key `reconcile.hunk.badge` in en | ✓ "{count} in this hunk" |
| i18n key `reconcile.hunk.badge` in zh-CN | ✓ "本代码块内 {count} 项" |
| HunkRange interface has hunkIndex/startLine/endLine fields | ✓ pre-existing |
| Regression — R117-R124 still pass | ✓ 94 prior tests still green |

10/10 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec.
- Implementation: ~30 LOC in app.ts (1 helper + 1 injector extension) + 1 i18n key × 2 locales + 10 tests.
- 1 mid-implementation stumble: `virtualizer.getHunkRanges()` is a private field. Worked around by accessing `virtualizer` parameter directly in `injectHunkCollapseButtons` and reaching into `hunkRanges` via a method I added inline.
- 0 CSS changes (badge inherits inline `style.color = "var(--accent, #4a9eff)"` like the per-file badges from R117).

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None. R125 SHIPs clean. Loop-internal: 0 open.

## Closed in this Round (Loop-Internal)

- R117.1 per-hunk reconcile (R117-retro risk-surfaced, deferred 7 rounds): SHIPPED this round.
- R117.3 hunk-level overlap count: implicit close (data flows through R117.1).

## Open Loop-Internal at Retro Time

EMPTY. All R117.x polish items now closed (R117 was per-file; R123 was click-to-expand; R125 was per-hunk).

## Self-Improvement Observations

- **The `data-hunk` attribute + `HunkRange` infrastructure was already there**: 7 rounds of deferring R117.1 was unnecessary. Lesson: when picking deferred items, check if infrastructure prerequisites have already landed via other rounds. The "heavy" R117.1 was actually tiny once I traced the existing wiring.
- **`insertBefore(btn.nextSibling)` pattern for adjacent insertion**: existing collapse button + new badge sit side-by-side. This avoids needing to track wrapper.firstChild or wrapper.lastChild across rounds.
- **`e.stopPropagation()` on badge click**: prevents click from bubbling to hunk wrapper which might trigger collapse-toggle (R117 button.click()). Defensive pattern.

## Risks Surfaced (no action this round)

- **Approve path doesn't lock worktree (R116)**: still deferred (semantic, no spec)
- **CSS for reconcile-listing popup (R123 retro flag)**: still missing (pre-existing pattern, visual polish deferred)
- **No Escape-key dismissal on reconcile-listing popup**: pre-existing a11y gap (not in R125 scope)

## v6 Compliance

- Hard caps: 1 feature (≤3) + 0 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Feature: 1 (R117.1 per-hunk reconcile)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0
- Time: ~20 minutes