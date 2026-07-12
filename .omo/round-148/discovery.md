# R148 Discovery — close R142 retro preventive flag: add 1-year boundary to `formatRelativeTime`

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R147 retro carry-over**: none — closes R139 retro loop-internal
- **R147 retro Risks Surfaced** (still on shelf across many rounds):
  1. `fallbackCopy` ClipboardItem migration — **11 rounds shelved** (R137-R147). Real behavior change.
  2. `formatRelativeTime > 1 year` — **6 rounds shelved** (R142-R147). Preventive only.
  3. 3 server-side i18n-coupling markers — invasive.

## Surfaced candidates

### C1 — Add 1-year boundary to `formatRelativeTime` (R148 polish)

**Evidence** (verified):

```ts
// src/ui/app.ts:4202-4214
function formatRelativeTime(ts: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return t("view.stats.locked.ago.justNow");
  if (diff < 3_600_000) return t("view.stats.locked.ago.minutes", { n: Math.floor(diff / 60_000) });
  if (diff < 86_400_000)
    return t("view.stats.locked.ago.hours", { n: Math.floor(diff / 3_600_000) });
  if (diff < 2_592_000_000)
    return t("view.stats.locked.ago.days", { n: Math.floor(diff / 86_400_000) });
  return t("view.stats.locked.ago.months", { n: Math.floor(diff / 2_592_000_000) });
}
```

Function has 5 thresholds (justNow / minutes / hours / days / months). Anything > 30 days returns "n mo ago" with `n = Math.floor(diff / 30 days)`. So:
- 35 days → "1 mo ago" (slightly imprecise but OK)
- 60 days → "2 mo ago" (OK)
- 365 days → "12 mo ago" (imprecise — should be "1y ago")
- 730 days → "24 mo ago" (should be "2y ago")
- 5000 days → "166 mo ago" (should be "13y ago")

**Why**: User-visible UX gap. The "months ago" rendering becomes increasingly imprecise past 12 months. Adding a 1-year boundary closes the R142-R147 retro preventive flag.

**Cost**: ≤2 files modified (`i18n.ts`, `app.ts`) + 1 new test + 1 housekeeping append. ~3 LOC net. 1 key × 2 locales = 2 strings.

**Profile**: polish (UI text improvement, no behavior change for current usage). ≤1 polish slot.

### C2 — Migrate `fallbackCopy` to ClipboardItem API

**Why not this round**: Real behavior change. ClipboardItem API doesn't work in jsdom + requires test environment fixes. Worth a dedicated refactor round when the test environment is settled.

### C3 — Localize 3 server-side i18n-coupling markers

**Why not this round**: Invasive. Changes the agent→state.json→agent contract.

## Selection

Pick **C1** — add 1-year boundary to `formatRelativeTime`. Closes a 6-round-shelved preventive flag. Tight polish, ≤2 files, ≤1 polish slot.

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

- Append R147 entry to `.omo/proposals.jsonl` (per-SHIP discipline)