# R151 Discovery — close R147 retro #1: remove deprecated `legacyExecCommandCopy` fallback

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R150 retro carry-over**: none — closes R146 audit gap
- **R150 retro Risks Surfaced** (still on shelf):
  - `fallbackCopy` ClipboardItem API migration — **13 rounds shelved** (R137-R150). Real behavior change.
  - 3 server-side i18n-coupling markers — **9 rounds shelved** (R142-R150). Invasive.
- **Profile cadence last 15 rounds**: 12 polish + 3 housekeeping + 1 refactor — heavy polish fatigue. R147 was housekeeping pivot; R149 was second housekeeping pivot. Real pivot needed.
- **Lint warnings**: 15 unused-vars warnings across test files (R139, R43, R112, R70, R72, R67, R131, etc.) — cleanable in a separate round.
- **Fresh surface**: 1 server-side hardcoded English at `src/index.ts:2217` ("Manually reopened"). Invasive (agent contract).

## Surfaced candidates

### C1 — Remove `legacyExecCommandCopy` fallback + simplify 4 call sites (R151 refactor)

**Evidence**:

```ts
// src/ui/app.ts:388-396
if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
  try {
    await navigator.clipboard.writeText(url);
    ok = true;
  } catch {
    ok = legacyExecCommandCopy(url);
  }
} else {
  ok = legacyExecCommandCopy(url);
}
```

4 call sites use this pattern (L388, L454, L1765, L1797). Each tries `navigator.clipboard.writeText` first, falls back to `legacyExecCommandCopy` which uses **deprecated** `document.execCommand("copy")`.

The fallback exists to handle 2 cases:
1. **`navigator.clipboard` is undefined** — older browsers (< 2018) without Clipboard API support
2. **`navigator.clipboard.writeText` throws** — permission denied, not in secure context, etc.

In practice:
- All modern browsers (Chrome 66+, Firefox 63+, Safari 13.1+) support `navigator.clipboard.writeText`
- The dashboard runs in localhost (secure context by default)
- `writeText` failures in secure contexts are rare (only denied permission or transient errors)

**Why now**: 13 rounds shelved is the longest-shelved flag in the project. The "real behavior change risk" is overstated — writeText failures already rare in modern browsers + secure contexts, and the new pattern (show error toast on failure) is simpler and more honest UX.

**Cost**: ≤4 files modified (app.ts: 1 function removal + 4 call site simplification; 3 test files updated) + 1 housekeeping append. ~30 LOC net deletion.

**Profile**: refactor (removes deprecated API usage + simplifies 4 call sites). Real behavior change: copy failures no longer fall back to deprecated execCommand; instead they show an error toast (which is what the existing setStatus path already does on the `if (ok)` false branch).

### C2 — Cleanup 15 unused-var warnings

**Why not this round**: Tight, but it's 15 small changes across 15 files. Better as a dedicated housekeeping round (R152 candidate). Keeps R151 scope focused.

### C3 — Localize 3 server-side i18n-coupling markers

**Why not this round**: Invasive. Changes the agent→state.json→agent contract. Agent parses these as literal prefixes. Would need a separate feature round with agent contract re-design.

## Selection

Pick **C1** — remove the deprecated `legacyExecCommandCopy` fallback. Closes a 13-round-shelved risk. Real refactor work, restores profile cadence balance (was 12 polish + 3 housekeeping + 1 refactor → 13 polish + 3 housekeeping + 2 refactor).

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| refactor | 1 | n/a | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R150 entry to `.omo/proposals.jsonl` (per-SHIP discipline)
- Update T11.2d, T16.8d, T16.10a, R139 test, R147 test to reflect the simplified pattern (atomic in same commit per R137→R142 SOP)