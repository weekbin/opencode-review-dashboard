# R144 Discovery — close R143 retro signal #3 (source-side audit + localize)

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R143 retro carry-over**: none; R143 retro surfaced 3 future candidates (none carry-over list):
  - `fallbackCopy` deprecated `document.execCommand("copy")` — real behavior change, deferred
  - `formatRelativeTime > 1 year` — preventive only
  - **"Other hardcoded UI labels might still exist elsewhere"** — R143 retro suggested running source-side audit; THIS round picks it up
- **Last 6 rounds profile**: R138 housekeeping, R139 refactor, R140 polish, R141 polish, R142 housekeeping, R143 polish

## Surfaced candidates

### C1 — Localize `uncommittedBadge.title` (R144 polish, source-side audit signal #3 closure)

**Evidence** (verified via source-side audit grep):

```bash
grep -nE '\.textContent\s*=\s*"[A-Z]|\.title\s*=\s*"[A-Z]|...'
```

Returns exactly **1 real hardcoded English user-facing string** in `src/ui/app.ts`:

- **L5696**: `uncommittedBadge.title = "Working-tree only (not in diff base)";`
  - Tooltip on the "uncommitted" badge shown next to file paths in the diff panel (rendered when `file.source === "working"`, i.e., the file has changes that aren't in the diff base).
  - Stays English on zh-CN locale.

Adjacent `uncommittedBadge.textContent = "uncommitted"` (L5694) stays English (it's a status-badge word, identical semantic across locales; matches the `→` / `☆` / `✓` English-rendering precedent established by R17/R25 badge work).

**Why**: User-visible UX gap (the only one remaining in src/ui/app.ts after R140/R141/R143). Bilingual users see English tooltip. Closes the R143 retro directive exactly.

**Cost**: ≤2 files modified (`app.ts`, `i18n.ts`) + 1 new test + 1 housekeeping append. ~5 LOC net. 1 key × 2 locales = 2 strings.

**Profile**: polish (UI text improvement, no behavior change, ≤1 polish slot).

### C2 — Localize remaining 3 R142-audit server-side system markers (deferred)

- **C2a**: `edit-finding.test.ts:92 "Edited by user"` — server-side system comment marker in src/index.ts (R10 audit_trail pattern). Goes into state.json that the agent reads. Localizing changes the agent-facing contract — invasive.
- **C2b**: `previously-hint.test.ts:57 "Conversation tab"` — UI hint reference; UI-side, but the reference points to a tab that exists primarily in English.
- **C2c**: `reopen-stale.test.ts:84 "Manually reopened:"` — server-side system comment marker (reopen audit prefix). Same agent-facing concern as C2a.

**Why not this round**: C2a/C2c change the server→agent contract; out of polish scope. C2b bundles naturally with C1 but doesn't materially improve its own surface. Per R143 brief lesson ("bundle surfaces in same block"), only the L5694/L5696 badge block qualifies as a bundle.

### C3 — Worktree work

**Why not this round**: pure hygiene, no user-visible value.

## Selection

Pick **C1**. Tight, isolated, closes the R143 retro directive. ~5 LOC, ≤2 files, ≤1 polish.

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

- Append R143 entry to `.omo/proposals.jsonl` (per-SHIP discipline per R134 retro lesson #4)