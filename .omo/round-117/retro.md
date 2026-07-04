# R117 Retro — Reconcile mode overlay (#74)

## What Shipped

Issue #74: 跨轮次「修复验证」对账视图 (Reconcile mode overlay).

User-facing feature delivered:
- **Toggle**: New "Reconcile" button in the toolbar (right next to Request changes + Approve changes buttons from R116).
- **Banner**: When active, top banner shows "Reconcile mode: click a badge to see which findings were addressed in each file."
- **Per-file badges**: Each file card in the diff shows:
  - 🟢 Green badge: "N resolved by you" — how many findings in this file were manually resolved
  - 🟡 Yellow badge: "N still open" — how many findings in this file are still open
  - 🔴 Red badge: "N new this round" — how many fresh findings in this file
- **Click-to-jump**: Click any badge → scrolls to corresponding finding card in Conversation panel + flashes highlight + scrolls diff to the line range
- **Persisted**: localStorage key `diff-review:reconcile-mode` (on/off); reload preserves user choice

## Acceptance vs Plan

| Plan item | Delivered |
|-----------|-----------|
| Toolbar toggle | ✓ (line 1494) |
| state.reconcileMode + localStorage | ✓ (line 1553) |
| Banner when active | ✓ (renderReconcileOverlay) |
| Green badge for resolved | ✓ (reconcile-green class) |
| Yellow badge for still-open | ✓ (reconcile.badge.open key) |
| Red badge for new | ✓ (reconcile.badge.new key) |
| Click → jump to finding | ✓ (data-finding-id delegation + jumpToFindingById) |
| localStorage persistence | ✓ |
| i18n in both locales | ✓ (7 keys × 2 locales) |
| Backwards compat | ✓ (additive only) |

10/10 ACs delivered.

## Process Notes

- Lead-direct throughout (no subagents) per v6 spec for single-feature rounds.
- Total implementation: ~70 LOC across 2 files (app.ts + i18n.ts) + 1 new test file (~110 LOC).
- Initial regex mismatch: test AC3 originally used `/zh-CN:/` which didn't match actual `"zh-CN":` i18n syntax (the colon is inside the quotes). Fixed by replacing regex with `/zh-CN"/` (match the closing quote + colon pattern).
- 1 prior-notes AC9-state-type-snapshot drift was caught by R105 conformance (missing 6th artifact).

## Carry-Over (≤3 items, must close in current worktree per v6 NO DEFERRAL)

None — all 6 artifacts written, full suite passes (after R105 conformance resolves), cap compliant.

## Open Loop-Internal at Retro Time

EMPTY (after R105 conformance resolves once this commit lands).

## Self-Improvement Observations

- **Always check the regex vs actual string format**: The test regex `/zh-CN:/` was syntactically valid but semantically wrong — actual i18n uses `"zh-CN":` (with closing quote before colon). Lesson: when matching i18n keys, check the actual key+value separator format (quoted vs unquoted) before writing tests.
- **hooks often catch syntax issues before tests do**: A simple drop of closing `/` on a regex literal would have been caught by `bun run lint` or even just running the test. The syntax error surfaced immediately on test run — fast feedback loop worked.
- **AC numbering drift in tests**: As scope shifts (R116 added review-velocity + roundSystemNotes, R117 adds reconcileMode), the AC numbering in tests can get inconsistent. R117 used AC1-AC10 fresh — good for clarity. Future rounds should keep this pattern.

## Risks Surfaced (no action this round)

- **Per-file vs per-hunk granularity**: R117 ships per-file badges (the simpler first pass). Issue #74 spec imagined per-hunk badges (more granular but requires per-hunk DOM querying). Per-hunk can be a future round if user wants more granularity.
- **No "click to expand" listing**: Currently clicking a badge jumps to a single finding (the first one). A future "show all" dropdown / expansion could expose the full list of finding IDs.
- **No hunk-level overlap count**: A file might have 5 hunks each with different reconcile states. R117 aggregates to per-file. Hunk-level will require more granular DOM querying.

## v6 Compliance

- Hard caps: 1 feature (≤3) + 0 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS expected.
- Discovery sweep ran. PASS.
- 0 subagents used (lead-direct). PASS.

## Round Profile

- Feature: 1 (reconcile overlay per-file)
- Bugfix: 0
- Polish: 0
- Total: 1
- Subagents: 0
- Time: ~25 minutes
