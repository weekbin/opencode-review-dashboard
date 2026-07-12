# R141 Discovery — localize `addSavedReply()` validation errors

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R140 retro carry-over**: none — closed the R137 retro flag #4
- **proposals.jsonl last entry**: R140 (per-SHIP discipline preserved)
- **Last 4 rounds**: R137 feature / R138 housekeeping / R139 refactor / R140 polish (alternate cadence)

## Surfaced candidates

### C1 — Localize 4 hardcoded English strings in `addSavedReply()` validation (R141 polish)

**Evidence** (verified):

1. `src/ui/app.ts:293`: `return { ok: false, error: "name is required" };`
2. `src/ui/app.ts:294`: `return { ok: false, error: "body is required" };`
3. `src/ui/app.ts:299`: `error: \`soft cap reached (${SAVED_REPLIES_SOFT_CAP}). Delete some templates first.\``
4. `src/ui/app.ts:304`: `return { ok: false, error: "localStorage quota exceeded" };`

Caller pattern at L5083-L5085:
```
if (!result.ok) {
  setStatus(result.error ?? t("status.templateSaveFailed"), true);
  return;
}
```

When `result.error` is set (i.e., one of the 4 validation errors above triggers), the English string is shown verbatim via `setStatus`. R140 closed the parallel pattern for 4 network fetch error fallbacks (`data?.error ?? t("status.X")`); this is the same pattern in a different validation function (`result.error ?? t("status.templateSaveFailed")`). Bilingual users see English validation errors on zh-CN locale.

**Why**: User-visible UX gap. The Saved Replies feature ships a "💾 Save current as template…" button (L5069). Clicking with empty body shows `t("status.commentBoxEmpty")` (already localized via R140); submitting with empty name shows `"name is required"` (English). Inconsistent UX.

**Cost**: ≤3 files modified (`app.ts`, `i18n.ts`) + 1 new test + 1 proposals.jsonl append. ~12 LOC net. 4 keys × 2 locales = 8 new strings, plus 4 call site edits.

**Profile**: polish (UI text improvement, no behavior change, ~12 LOC net).

### C2 — Audit for more byte-equivalence tests (R139 retro #4)

**Why not this round**: Audit-only, no behavior change for users. Pure internal hygiene. Better as next housekeeping round if a pattern is found.

### C3 — R137 retro closure audit / fresh code surface

**Why not this round**: All R135-R140 surfaced risks are closed (verified by carry-over + risks-surfaced scan from R135-R140). The remaining stale flag across all retros is the `formatRelativeTime > 1 year` preventive only (no current surface).

## Selection

Pick **C1** — addSavedReply validation localization. Tight polish round that closes a real UX inconsistency surfaced by R140's `setStatus(data?.error ?? t("status.X"), true)` pattern. Same shape as R134/R135/R140 — i18n key + t() wrapper.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 1 | ≤1 | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R140 entry to `.omo/proposals.jsonl` (per-SHIP discipline per R134 retro lesson)