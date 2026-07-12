# R154 Discovery — close R153 leftover stale deprecation comment + add regression net for 10-round-shelved server-side markers

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R153 retro carry-over**: 3 server-side i18n-coupling system markers (10 rounds shelved, R142-R152 retro #3) — invasive agent contract change. Documented in R153 retro as future feature round.
- **Profile cadence last 17 rounds**: 12 polish + 4 housekeeping + 1 refactor — heavy polish fatigue
- **Test pass rate**: 1098/1098 PASS (post-R153)
- **Fresh surface audit**: 1 stale deprecation comment at app.ts:663-665 (R153 leftover) + 0 lint warnings + 0 orphans

## Surfaced candidates

### C1 — Clean R153 leftover stale deprecation comment (R154 housekeeping)

**Evidence**:

```bash
$ sed -n '662,665p' src/ui/app.ts
const PERMALINK_FLASH_MS = 1600;

// Deprecated: navigator.clipboard.writeText is the primary copy path; this
// is the catch-all fallback for environments where the Clipboard API is
// unavailable. Migrate to ClipboardItem API when browser support stabilizes.
```

This 3-line deprecation docstring is a **stale leftover from the pre-R153 era**. R153 deleted the `legacyExecCommandCopy` function that the comment described. The comment now references a function that no longer exists. It's pure dead documentation that misleads future readers into thinking a fallback still exists.

**Why now**: R153 SHIPped without cleaning this up. R154 closes the loop by removing the stale docstring.

**Cost**: ≤1 src file modified (3-line deletion in app.ts) + 1 new test file (regression net for the 3 server-side markers) + 1 housekeeping append. ~15 LOC net.

**Profile**: housekeeping (0 features / 0 bugfixes / 0 polish). Closes a real R153 leftover.

### C2 — 3 server-side i18n-coupling system markers

**Why not this round**: Invasive. Agent parses these as literal prefixes (`Manually reopened:`, `Edited by user`). Localizing would break agent parsing. Documented as future feature round. R154 adds a regression test to **prevent unintended future changes** — the lightest-possible closure of the carry-over.

## Selection

Pick **C1** — clean R153 leftover + add regression net. Tight housekeeping, ≤2 files, ≤1 housekeeping slot.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| refactor | 0 | n/a | OK |
| housekeeping | 1 | n/a | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R153 entry to `.omo/proposals.jsonl` (per-SHIP discipline)
- Add regression-net test for 3 server-side markers (prevents unintended future changes)