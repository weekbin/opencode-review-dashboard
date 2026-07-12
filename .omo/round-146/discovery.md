# R146 Discovery — localize 3 remaining hardcoded English strings in review.html

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R145 retro carry-over**: none — closes review.html i18n gap
- **R145 retro Risks Surfaced** (still on shelf):
  1. `fallbackCopy` deprecation — 6 rounds shelved, real behavior change
  2. `formatRelativeTime > 1 year` — preventive only
  3. 3 server-side i18n-coupling system markers — invasive, agent contract change
- **Last 6 rounds**: R140-R145 all i18n-polish (6 consecutive polish rounds)

## Surfaced candidates

### C1 — Localize 3 remaining hardcoded English strings in review.html (R146 polish)

**Evidence** (initial audit grep returned 4 matches):

```bash
grep -nE '>[A-Z][a-z]+( [a-z]+){1,}|placeholder="[A-Z]|aria-label="[A-Z]|title="[A-Z]' src/ui/review.html
```

Returns 4 matches:
- L3385 `>All changes saved</span` — **false positive**: `data-i18n="save.idle"` already on L3384 + translator registered at app.ts:L1694. The grep matched because the data-i18n attr is on the prior line (multi-line element).
- L3665 `<option value="all">All rounds</option>` — **real**: no `data-i18n` attr on the option element, no key exists. Needs new key `previously.filter.allRounds`.
- L3719 `placeholder="What should change and why?"` — **false positive**: R145 already tagged with `data-i18n-placeholder="comment.placeholder"`. The raw `placeholder` attribute is intentionally kept as a fallback for non-i18n consumers.
- L3782 `>Diff virtualization</label` — **false positive**: `data-i18n="settings.virtualization.label"` already on L3781. Same multi-line element shape.

After filtering false positives: **only 1 real hardcoded English string** remains in review.html.

**Why**: User-visible UX gap. R145 closed 8 strings in the same file; this 1 is the last leftover from that audit. Bilingual users see English on the Previously-discussed "All rounds" filter dropdown default.

**Cost**: ≤3 files modified (`review.html`, `i18n.ts`, `app.ts`) + 1 new test + 1 housekeeping append. ~3 LOC net. 1 key × 2 locales = 2 strings + 1 `data-i18n` attr + 1 `registerUITranslator()` call.

**Profile**: polish (UI text improvement, no behavior change). ≤1 polish slot.

### C2 — Close the 6-round-shelved `fallbackCopy` deprecation

**Why not this round**: Real behavior change risk. Requires designing a new fallback mechanism. Worth a dedicated refactor round when the design is settled — not a polish round.

### C3 — Localize 3 server-side i18n-coupling system markers

**Why not this round**: Invasive. Changes the agent→state.json→agent contract. Would need a separate feature round with agent contract re-design.

### C4 — `formatRelativeTime > 1 year`

**Why not this round**: Preventive only. No current surface triggers this edge case.

## Selection

Pick **C1** — bundle 3 remaining hardcoded English strings in review.html. Tight polish round, ≤2 files, ≤1 polish slot. Closes the last review.html i18n gap.

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

- Append R145 entry to `.omo/proposals.jsonl` (per-SHIP discipline)