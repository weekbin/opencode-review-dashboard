# R115 Retro — Finding edit enhancement (#79)

## What Shipped

- **Modal extension**: Edit finding modal now supports full edit: file path, start_line, end_line, category, severity, status (open/closed_auto/resolved), comment.
- **Inline-comment-edit**: Click a finding's comment body to inline-edit. Saves on blur or Ctrl+Enter; reverts on Escape.
- **Server schema**: PATCH endpoint accepts `file`, `start_line`, `end_line`, `status` in addition to existing `category/severity/comment`.
- **Audit trail extension**: `FindingAuditRow` now optionally records `before_anchor/after_anchor` (when anchor changed) and `before_status/after_status` (when status changed). Strict subset extension — old audit rows deserialize unchanged.
- **i18n**: 5 new STRINGS keys × 2 locales (fileLabel, lineLabel, statusLabel, inlineEdit.hint, commentUpdated).

## Files Touched

| File | Change |
|------|--------|
| `src/ui/app.ts` | +90 LOC (showEditFindingModal extension, inline-edit hook + helper, editFinding signature, editBtn handler) |
| `src/index.ts` | +85 LOC (FindingStatus type + guard, FindingAuditRow extension, PATCH handler extension) |
| `src/ui/i18n.ts` | +5 STRINGS rows (10 lines) |
| `src/ui/r115-finding-edit-enhancement.test.ts` | NEW (109 lines) |
| `src/edit-finding.test.ts` | patchBlock window 6000→9000 |
| `src/r15-features.test.ts` | T15.6b regex update |

## Quality Metrics

- Tests: 848/849 PASS (1 expected: R105 conformance — fixed by writing this round's artifacts)
- Pre-commit: 8/8 PASS
- LOC net: +~180 production, +109 test, -4 sibling test maintenance
- Cap compliance: 1 feature (≤3) ✓, 0 bugfix (≤5) ✓, 1 polish (≤1) ✓, 1 total (≤8) ✓

## Gaps & Lessons

1. **patchBlock window too small** — Pre-existing test helper `patchBlock()` read 6000 chars from PATCH handler start. R115 grew the handler ~70 lines. Bumped to 9000. Lesson: when adding to a long handler, audit test-helper window sizes. Could be made dynamic (read until function end) but the static window is more deterministic.

2. **Refactored audit-row push loses regex match** — Original `target.audit_log.push({...literal...})` was an inline literal. R115 needed conditional fields (`before_anchor`, `before_status`) so introduced `auditRow` variable. Sibling test T15.6b regex matched only the literal `{`. Updated to `push(`. No production regression — the audit row push still happens identically.

3. **Inline-edit Escape handler** — Added Escape key to cancel inline-edit. Picked "blur OR Ctrl+Enter" per UX spec — avoids accidental saves on every keystroke (the user's `what if I just want to fix a typo` case). Ctrl+Enter mirrors GitHub comment UX.

## What's Next

R116: 3 features per 20-round directive. Candidates: #81 (draft diff preview), #83 (dual-button confirm pattern), #74 (reconcile overlay). Will pick top-3 by importance + scope fit.

## Loop-Internal Status

Open loop-internal: **0**
- No pending housekeeping
- No stale backlogs
- No orphan issues
- All R115 retro items closed in current round (no deferral)

## Open Loop-Internal at Retro Time

**EMPTY** (per v6 NO DEFERRAL gate).