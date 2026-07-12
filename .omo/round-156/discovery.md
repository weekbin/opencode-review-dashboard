# R156 Discovery — add `src/runtime-compat.test.ts` + tighten `bun()` return type

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R155 retro carry-over**: None (R155 closed the R142-R152 retro #3 flag)
- **R155 retro Risks**: None (all R137-R152 flags closed). Future rounds will need fresh candidates.
- **Profile cadence last 19 rounds**: 10 polish + 8 housekeeping + 1 refactor — heavy polish fatigue. R149/R151/R154/R155 were housekeeping pivots. R156 = refactor pivot to break the streak.
- **Test pass rate**: 1103/1103 PASS.
- **Fresh surface audit**:
  1. `src/runtime-compat.ts:44-45` — untyped `any` in `bun()` function (lazy Bun global reference). Comment at L41-43 explains the pattern.
  2. `src/ui/toast.ts:52/55/122/133` — `as unknown as { _toastTimerId?: ... }` pattern (DOM event target timer handle workaround)
  3. `src/ui/app.ts:408` — `as unknown as number` (setTimeout return type)
  4. **No `src/runtime-compat.test.ts`** — the runtime-compat module has zero direct test coverage. This is a real gap.

## Surfaced candidates

### C1 — Add `src/runtime-compat.test.ts` + tighten `bun()` return type (R156 refactor)

**Evidence**:

```bash
$ find src -name '*runtime-compat*'
src/runtime-compat.ts

$ grep -rln 'runtime-compat' src/
src/state-store.test.ts
src/state-store.ts
src/index.ts
src/runtime-compat.ts
```

`src/runtime-compat.ts` is imported by `src/index.ts` and `src/state-store.ts` (and tested via `src/state-store.test.ts`). **Zero direct test coverage** — every test goes through `state-store.ts` as an intermediary.

`src/runtime-compat.ts:44-45`:
```ts
function bun(): any {
  return (globalThis as { Bun?: any }).Bun;
}
```

The return type is `any`. The proper type is `Bun.RuntimeNamespace | undefined` (Bun has its own types in `@types/bun`) or at least `unknown` to force callers to narrow.

**Why this matters**:
- `runtime-compat` is the bridge between Bun and Node.js. A bug here would cascade into every server-side operation.
- 0 direct test coverage = any regression in this module goes undetected until a downstream test fails (with confusing root cause).
- The `function bun(): any` is a code smell — `any` defeats TypeScript's type safety.

**Why now**:
- All R137-R152 flags closed (R155). R156 needs a fresh candidate.
- Profile fatigue (10 polish + 8 housekeeping + 1 refactor last 19). R156 = refactor pivot.
- The `bun()` function's `: any` return type is a concrete, scoped refactor — not invasive.

**Cost**:
- ≤3 files modified (`src/runtime-compat.ts`: tighten `bun()` return type; new `src/runtime-compat.test.ts`; possibly 1 test fix in `src/state-store.test.ts` if stricter typing breaks it)
- ~30 LOC net (test file + type tightening)
- No production code path changes

**Profile**: refactor (type tightening + new test file). Real behavior change: stricter type checking at compile time, no runtime change.

### C2 — Tighten `as unknown as` patterns in toast.ts + app.ts

**Why not this round**: DOM event target types are inherently tricky. The `as unknown as { _toastTimerId?: ... }` pattern is a workaround for missing types on `EventTarget` / `Node`. Tightening would require adding type augmentation files. Out of scope for R156.

### C3 — Calendar-accurate formatRelativeTime

**Why not this round**: Preventive only. R148 retro noted "worth a future round if precision matters". No current surface triggers this edge case.

## Selection

Pick **C1** — add `src/runtime-compat.test.ts` + tighten `bun()` return type. Tight refactor, ≤3 files, profile pivot from polish streak.

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

- Append R155 entry to `.omo/proposals.jsonl` (per-SHIP discipline)