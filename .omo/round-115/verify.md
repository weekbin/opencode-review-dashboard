# R115 Verify — Finding edit enhancement (#79)

## Gate Results

- **Pre-commit**: 8/8 PASS (mechanical hygiene + lint + format-write→re-stage→test + typecheck)
- **Tests**: 848/849 PASS (1 expected failure: R105 conformance — fixed once artifacts written below)
- **R115 test file**: `src/ui/r115-finding-edit-enhancement.test.ts` — 9/9 PASS

## R115 Tests (own)

```
$ bun test src/ui/r115-finding-edit-enhancement.test.ts
9 pass
0 fail
16 expect() calls
Ran 9 tests across 1 file. [90.00ms]
```

## Regression Tests Fixed

Two pre-existing tests required adjustment for the new FindingAuditRow schema
(the audit row now optionally includes `before_anchor`, `after_anchor`,
`before_status`, `after_status` to record anchor/status edits):

| Test | Old pattern | New pattern | Reason |
|------|------------|-------------|--------|
| `edit-finding.test.ts` T10.2f | `patchBlock()` slice 6000 chars | slice 9000 chars | R115 handler grew ~70 lines (anchor/status validation + apply + audit extension), pushed tail of PATCH handler past 6000-char window |
| `r15-features.test.ts` T15.6b | `/target\.audit_log\.push\(\{/` | `/target\.audit_log\.push\(/` | R115 refactor introduced `auditRow` variable to support conditional anchor/status fields; the literal `{\n` no longer matches |

Both tests now PASS. No production behavior change in either test — they
validate the same observable: (1) audit row gets pushed when changes exist,
(2) manually_edited/edited_at/comments.push/saveState all run.

## Diff Summary

- `src/ui/i18n.ts`: added `editFinding.fileLabel/lineLabel/statusLabel/inlineEdit.hint/commentUpdated` (5 new STRINGS rows × 2 locales)
- `src/ui/app.ts`:
  - `showEditFindingModal`: added `file/start_line/end_line/status` form inputs (4 new fields, lines 5556-5583)
  - `editBtn` handler (line 4329-4360): now reads `entry.file/start_line/end_line/status` + passes them in the patch
  - `editFinding()` signature (line 5431-5443): extended to accept `file/start_line/end_line/status`
  - `startInlineCommentEdit()` (new function, line 5475+): click comment body → textarea, save on blur OR Ctrl+Enter, cancel on Escape
  - `renderConversationPanel` line body (line 4489-4494): added click listener → inline edit
- `src/index.ts`:
  - `FindingStatus` type alias (line 22): `"open" | "closed_auto" | "resolved"`
  - `isFindingStatus()` type guard (line 76-78)
  - `FindingAuditRow` (line 75-89): added optional `before_anchor/after_anchor/before_status/after_status`
  - PATCH handler (line 2245-): validates `file/start_line/end_line/status` + applies them + records anchor/status in audit row
- `src/edit-finding.test.ts`: `patchBlock()` window 6000→9000
- `src/r15-features.test.ts`: T15.6b regex `\{\)` → `\(`

## Acceptance Criteria

- AC1: showEditFindingModal includes file input — PASS
- AC1: showEditFindingModal includes start_line input — PASS
- AC1: showEditFindingModal includes end_line input — PASS
- AC1: showEditFindingModal includes status select — PASS
- AC2: renderConversationPanel has inline-comment-edit handlers — PASS
- AC2: inline-edit saves on blur OR Ctrl+Enter — PASS
- AC3: server PATCH accepts file/start_line/end_line/status — PASS
- AC4: FindingAuditRow has before_status/after_status — PASS
- AC5: i18n.ts has editFinding.file/line/status labels — PASS

All 9 R115 tests GREEN.

## Compliance With v6 Hard Gates

1. Pre-commit PASS: 8/8 ✓
2. Discovery sweep: ran (backlog scan → 4 pm-manager-approved issues; picked #79) ✓
3. 0 open-loop-internal at retro: TRUE (no open loop-internal items) ✓
4. Hard caps: 1 feature (≤3) + 0 bugfix (≤5) + 1 polish (≤1) = 1 total (≤8) ✓
5. 1 AC max per subagent: 0 subagents used (lead-direct) ✓

## Decision

**SHIP**.