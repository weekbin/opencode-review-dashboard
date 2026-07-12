# R149 Discovery — close R147 retro #2: orphan i18n key audit + cleanup

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R148 retro carry-over**: none — closes R142 retro #2 preventive flag
- **R148 retro Risks Surfaced** (still on shelf):
  - `fallbackCopy` ClipboardItem API migration — **12 rounds shelved** (R137-R148). Real behavior change.
  - 3 server-side i18n-coupling markers — **8 rounds shelved** (R142-R148). Invasive, agent contract change.
- **Profile cadence last 14 rounds**: 11 polish + 2 housekeeping + 1 refactor — **polish fatigue is real**. R147 was a housekeeping pivot; R148 reverted to polish. R149 should pivot again.

## Surfaced candidates

### C1 — Orphan i18n key audit (R149 housekeeping)

**Evidence**:

```bash
grep -cE '^\s{2}"[a-zA-Z0-9_.]+":\s*\{' src/ui/i18n.ts
```

Returns **343 i18n keys** declared. Many were added by R134-R148 polish rounds. Some may now be unused (e.g., keys added by a round whose UI surface was later refactored away).

**Why**: Housekeeping audit + cleanup. Identifies dead i18n keys that bloat the bundle and confuse future translators. Removing them is low-risk (if a key is actually used, the audit will catch it).

**Cost**: ≤1 file (`i18n.ts`) + 1 new test file + 1 housekeeping append. ~50 LOC net. Audit-then-delete pattern.

**Profile**: housekeeping (0 features / 0 bugfixes / 0 polish = 0 polish slot consumption). Pivots profile balance.

### C2 — `fallbackCopy` ClipboardItem API migration

**Why not this round**: Real behavior change. ClipboardItem API doesn't work in jsdom + requires test environment fixes. R147 retro explicitly noted "worth a dedicated refactor round with jsdom test environment fixes" — still not settled.

### C3 — 3 server-side i18n-coupling system markers

**Why not this round**: Invasive. Changes the agent→state.json→agent contract. Would need a separate feature round with agent contract re-design.

### C4 — Calendar-accurate months/years (R148 retro self-improvement)

**Why not this round**: Preventive only. The current 30-day and 365-day approximations match the user's mental model (most people don't think about calendar months when reading relative timestamps). Out of polish scope.

## Selection

Pick **C1** — orphan i18n key audit. Pure housekeeping, tight scope, pivots profile balance. Closes a new loop-internal flag.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| housekeeping | 1 | n/a | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R148 entry to `.omo/proposals.jsonl` (per-SHIP discipline)
- New audit test that catches any future orphaned i18n keys (regression net)