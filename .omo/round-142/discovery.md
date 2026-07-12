# R142 Discovery — close R141 retro #2 (byte-equivalence test audit + fix)

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R141 retro carry-over**: none
- **R141 retro surfaced risks** (still open):
  1. **`fallbackCopy` uses deprecated `document.execCommand("copy")`** — real behavior change risk, deferred
  2. **Audit for more byte-equivalence tests lurking** (R140 + R141 retros both flagged) — preventive, pending
  3. **`formatRelativeTime > 1 year`** — preventive, no surface
- **Last polish streak**: R140 + R141 (2 polish + 1 housekeeping + 1 refactor since R137 feature)

## Surfaced candidates

### C1 — Audit + upgrade byte-equivalence tests in `src/*.test.ts` (R142 housekeeping)

**Evidence** (cross-round pattern):
- R131 R137 retro first surfaced this pattern; promoted to "test brittleness" pattern after T11.2d (R137), T16.8d + T16.10a (R139), T10.1c (R141) all broke when their respective refactors swapped English strings for translation keys.
- The brittle-test pattern: `expect(block![0]).toMatch(/"English string"/)` hardcodes an English literal as evidence of correct implementation. Brittle when the function body's content changes for legitimate reasons (i18n refactor, error message update, copy change).

**Why this round**: This is the 4th consecutive round (R138, R139, R140, R141) to flag "audit for more byte-equivalence tests lurking" without doing the audit. The procrastinated audit has now accumulated 4 retros of evidence that the pattern is real and recurring. R142 closes this stale flag.

**Audit mechanism**:
- Grep `src/*.test.ts` for patterns that hardcode English strings inside `expect(block![0]).toMatch(/.../)` calls
- For each found test, evaluate: is it brittle? Will R140-style future refactors break it?
- If yes: upgrade to behavior-contract per the R137/R139 marker-anchor pattern
- If no: leave alone

**Why not C2/C3**:
- C2 (R137 retro #1 fallbackCopy deprecation): requires real behavior change (different error semantics). v6 loop should batch this when the audit finishes — out of R142 scope.
- C3 (formatRelativeTime > 1 year): preventive only, no current surface triggers this. Fails user-visible test.

## Selection

Pick **C1 — audit + upgrade byte-equivalence tests**. Pure housekeeping, closes a 4-round-old stale retro flag, prevents future churn.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| total | 1 (housekeeping) | ≤8 | OK |

## Hardening included

- Append R141 entry to `.omo/proposals.jsonl` (per-SHIP discipline per R134 retro lesson #4)