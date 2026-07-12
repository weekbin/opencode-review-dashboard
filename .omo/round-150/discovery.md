# R150 Discovery — close R146/R147 audit gap: localize 2 hardcoded English strings in app.ts

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R149 retro carry-over**: none — closes i18n.ts hygiene flag
- **R149 retro Risks Surfaced** (still on shelf):
  - `fallbackCopy` ClipboardItem API migration — **13 rounds shelved** (R137-R149). Real behavior change.
  - 3 server-side i18n-coupling markers — **8 rounds shelved** (R142-R149). Invasive.
- **Profile cadence last 14 rounds**: 11 polish + 2 housekeeping + 1 refactor — **heavy polish fatigue**. R147 was a housekeeping pivot; R149 was a second housekeeping pivot. Both pivots only shifted by 1 each. Real pivot needed.

## Surfaced candidates

### C1 — Localize 2 hardcoded English strings in app.ts missed by R140-R149 audit (R150 polish)

**Evidence** (R146 audit gap):

```bash
grep -nE 'textContent\s*=\s*"`[A-Z][a-z]+|innerHTML\s*=\s*"`[A-Z][a-z]+|innerHTML\s*=\s*"[A-Z][a-z]+' src/ui/app.ts
```

Returns **1 match**: `app.ts:619 el.innerHTML = "Press <kbd>n</kbd> / <kbd>p</kbd> to navigate findings";` (nav hint).

Plus the prior-rounds hint at `app.ts:5358`: `hint.textContent = `Showing prior rounds only (round ${currentRound - 1} and earlier). The current round's findings are in the Conversation tab.`;`

Both are user-visible English strings, hardcoded outside the i18n system. R140-R149 audited `review.html` and `app.ts` textContent assignments in innerHTML literals but missed these two.

**Why**: User-visible UX gap. Bilingual users see English on the nav hint and prior-rounds hint.

**Cost**: ≤2 files modified (`app.ts`, `i18n.ts`) + 1 new test file + 1 housekeeping append. ~6 LOC net. 2 keys × 2 locales = 4 strings.

**Profile**: polish (UI text improvement, no behavior change). ≤1 polish slot.

### C2 — `fallbackCopy` ClipboardItem API migration

**Why not this round**: Real behavior change. R147 retro explicitly noted "Worth a dedicated refactor round with ClipboardItem API migration + jsdom test environment fixes" — jsdom doesn't support `navigator.clipboard.write` (only `writeText`). Would need extensive test infrastructure work. Best handled as a dedicated refactor round with explicit design discussion.

### C3 — 3 server-side i18n-coupling markers

**Why not this round**: Invasive. Changes the agent→state.json→agent contract. The agent reads `Manually reopened:` and `Edited by user` as literal prefixes when parsing comments[]. Localizing would break agent parsing. Out of polish scope.

### C4 — App.ts 7105 LOC refactor (extract helper module)

**Why not this round**: Big refactor (would need to identify what to extract + new file + new tests + update imports). Out of scope for a tight round.

## Selection

Pick **C1** — localize 2 hardcoded English strings in app.ts missed by R140-R149 polish streak. Closes an implicit audit gap. Tight polish, ≤2 files, ≤1 polish slot.

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

- Append R149 entry to `.omo/proposals.jsonl` (per-SHIP discipline)
- Expand audit grep pattern to cover app.ts textContent/innerHTML literal assignments (regression net for future polish rounds)