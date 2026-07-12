# R140 Discovery — tighten i18n fallbacks + wire copyNotesBtn to auto-discovery

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R139 retro carry-over**: none — closed the 4-caller duplication
- **proposals.jsonl last entry**: R139 (per-SHIP discipline maintained for 5 rounds)
- **Last full feature**: R137 (R138/R139 were housekeeping/refactor)
- **Last polish streak**: R134–R136 (3 polish + 1 housekeeping + 1 refactor since)

## Surfaced candidates

### C1 — Tighten i18n fallbacks + adopt `data-i18n-title` for copyNotesBtn (R140 polish)

**Evidence** (5 hardcoded English strings + 1 redundant `t()` lookup):

1. `src/ui/app.ts:5396`: `copyNotesBtn.title = t("previously.notes.copyButton");`
   — redundant `t()` direct call; could leverage R133's `data-i18n-title` auto-discovery (the existing i18n.ts:963 translator walks `[data-i18n-title="${ecap}"]`). R137 retro flagged this as future polish #4: "Could leverage R133's `data-i18n-title` auto-discovery but the explicit lookup is consistent with the rest of app.ts's button-rendering pattern."

2. `src/ui/app.ts:2448`: `closeWith(trimmed || "(no reason provided)");` — showResolveReasonModal fallback. User-facing English on zh-CN locale. Bilingual users see English.

3. `src/ui/app.ts:6050`: `setStatus(data?.error ?? "Failed to pin finding", true);` — pinFinding fallback. Bilingual users see English.

4. `src/ui/app.ts:6081`: `setStatus(data?.error ?? "Failed to unpin finding", true);` — unpinFinding fallback. Bilingual users see English.

5. `src/ui/app.ts:6108`: `setStatus(data?.error ?? "Failed to toggle reaction", true);` — toggleReaction fallback. Bilingual users see English.

**Why**: User-visible UX gap. 4 fallback messages stay English on zh-CN. The 5th is a redundant `t()` direct call where the existing R133 infrastructure already handles auto-discovery (consistency with R133/R134/R135/R137 patterns).

**Cost**: ≤3 files modified (`app.ts`, `i18n.ts`) + 1 new test. ~12 LOC net (5 i18n key refs + 5 new keys × 2 locales + 1 setAttribute swap).

**Profile**: polish (UI text improvement + consistency upgrade, no behavior change).

### C2 — Audit for more byte-equivalence tests (R139 retro)

**Why not this round**: Audit-only, no fixes committed. Better suited as discovery input for R141+.

### C3 — Localize hardcoded "🤖 Agent" emoji label fallback

**Why not this round**: Already localized in R135 (`comment.author.agent`). No remaining surface.

## Selection

Pick **C1** — tight i18n polish bundle. Closes R137 retro stale flag + fixes 4 invisible English fallbacks. ≤15 LOC, ≤3 files, no schema change, ≤1 polish slot. Same i18n pattern as R134/R135/R137.

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

- Append R139 entry to `.omo/proposals.jsonl` (per-SHIP discipline per R134 retro lesson)