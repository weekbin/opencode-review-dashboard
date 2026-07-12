# R143 Discovery — localize 2 hardcoded English strings in saved-replies dropdown

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R142 retro carry-over**: none — closed the R141 retro #2 stale flag
- **R142 retro surfaced risks** (still open):
  1. **`fallbackCopy` uses deprecated `document.execCommand("copy")`** — real behavior change, deferred
  2. **`savedReplies.saveCurrent` is a future i18n candidate** — flagged by R142 audit #4 as i18n-coupling, ready for fix
  3. **`formatRelativeTime > 1 year`** — preventive only

## Surfaced candidates

### C1 — Localize 2 hardcoded English strings in saved-replies dropdown (R143 polish)

**Evidence** (verified):

1. `src/ui/app.ts:5048` — `savedRepliesBtn.title = "Saved Replies (R10) — type /<name>+space to expand";`
   — hardcoded English tooltip on the saved-replies dropdown toggle button. Stays English on zh-CN.

2. `src/ui/app.ts:5066` — `saveCurrent.textContent = "💾 Save current as template…";`
   — hardcoded English label on the "save current as template" button. R142 audit #4 explicitly flagged this as a future i18n candidate.

Both are in the same dropdown (R10 #1 saved-replies feature). 2 keys × 2 locales = 4 strings.

**Why**: User-visible UX gap (paired with R140/R141 polish on the same dropdown's error fallbacks). Bilingual users see English tooltip and English button label. R142 audit identified these via the byte-equivalence test scan; per the SOP, these are i18n-coupling (the test file asserts them as current contract) — atomic-update with i18n change.

**Side fix**: `src/saved-replies.test.ts:T10.2b` asserts `expect(src).toMatch(/Save current as template/)`. After localizing L5066 to `t("savedReplies.saveCurrent")`, the test breaks. Apply the R140/R141 marker-anchored pattern: upgrade to behavior-contract assertion that checks for the `t("savedReplies.saveCurrent")` lookup, not the English literal.

**Cost**: ≤3 files modified (`app.ts`, `i18n.ts`, `saved-replies.test.ts`) + 1 housekeeping append. ~10 LOC net. 2 keys × 2 locales = 4 strings.

**Profile**: polish (UI text improvement, contract-anchored by the existing T10.2b upgrade). ≤1 polish slot.

### C2 (out of scope) — Localize "💾 Save current as template…" only (skip the tooltip)

**Why not**: The tooltip at L5048 is in the exact same dropdown block (16 lines apart). Splitting would mean two polish rounds for what's effectively one localized surface. Bundle them.

### C3 (out of scope) — Replace deprecated `execCommand("copy")` in `fallbackCopy`

**Why not**: Requires real behavior change (different error semantics). v6 loop should batch this with broader clipboard-fallback modernization. Out of polish scope.

## Selection

Pick **C1** — bundle 2 hardcoded English strings in the saved-replies dropdown. Reuses the R140/R141 pattern. Closes the R142 audit-flagged future candidate.

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

- Append R142 entry to `.omo/proposals.jsonl` (per-SHIP discipline per R134 retro lesson #4)