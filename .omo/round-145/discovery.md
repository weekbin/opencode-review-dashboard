# R145 Discovery — close R144 stale review.html i18n surface

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R144 retro carry-over**: none — closed R143 retro #3
- **R144 retro Risks Surfaced** (still on shelf across R139-R144):
  - `fallbackCopy` deprecation — 5 rounds shelved, real behavior change
  - `formatRelativeTime > 1 year` — preventive only
  - 3 server-side i18n-coupling system markers in src/index.ts — invasive (changes agent→state.json→agent contract)

## Surfaced candidates

### C1 — Localize 6 hardcoded English strings in `src/ui/review.html` (R145 polish)

**Evidence** (audit ran per R143 retro pattern):

```bash
grep -nE '>[A-Z][a-z]+( [a-z]+){1,}|placeholder="[A-Z]|aria-label="[A-Z]|title="[A-Z][a-z]+( [a-z]+){1,}' src/ui/review.html
```

Returns 6 real hardcoded English user-facing strings (excluding the 11 already-`data-i18n`-keyed strings like `Skip to main content`, `Files changed`, etc.):

| Line | String | Element |
|---|---|---|
| L3642 | `Newest first` | `<option value="newest">` |
| L3643 | `Oldest first` | `<option value="oldest">` |
| L3645 | `File path (A–Z)` | `<option value="file">` |
| L3653 | `Prior rounds — what you told the agent + how it replied` | `<div class="pane-title">` |
| L3696 | `Select lines in the diff to start.` | `<div id="selection">` |
| L3697 | `Click a line number to start, click another to set range.` | `<div class="hint">` |

Plus L3710 placeholder `"What should change and why?"` — additional candidate for input placeholder.

These strings stay English on zh-CN locale. R140-R144 only polished `src/ui/app.ts`; `review.html` was untouched.

**Why**: User-visible UX gap. The dropdown sort options, the empty-state selection hint, and the pane-title all stay English on zh-CN. This is the natural next step after the app.ts polishing streak (R140-R144).

**Cost**: ≤3 files modified (`review.html`, `i18n.ts`) + 1 new test + 1 housekeeping append. ~12 LOC net. 6-7 keys × 2 locales = 12-14 strings.

**Profile**: polish (UI text improvement, no behavior change). ≤1 polish slot.

### C2 — `fallbackCopy` deprecation (5 rounds shelved)

**Why not this round**: Real behavior change. `document.execCommand("copy")` is deprecated but still works in all major browsers. Replacing it requires designing a new fallback mechanism (retry `navigator.clipboard.writeText` is wrong — that's what already failed). Worth a dedicated refactor round when the design is settled.

### C3 — 3 server-side i18n-coupling system markers

**Why not this round**: In src/index.ts. Changes the agent→state.json contract. Would need a separate feature round with agent contract re-design.

### C4 — `formatRelativeTime > 1 year`

**Why not this round**: Preventive only. No current surface triggers this edge case.

## Selection

Pick **C1** — review.html has 6 (7 with placeholder) untouched English strings. R140-R144 polished app.ts but missed review.html. Tight polish, ≤3 files, ≤1 polish slot. Closes the natural next stage of the i18n sweep.

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

- Append R144 entry to `.omo/proposals.jsonl` (per-SHIP discipline)