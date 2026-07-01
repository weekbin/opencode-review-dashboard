# R40 brief (lightweight)

**Profile**: housekeeping + tooling enhancement (SG.R26.1 enforcement script)
**Trigger**: v5.3.13 SG.R29.6 manual lightweight mode (scripts/ change, no src/ logic, no docs)
**Scope**: 1 new file (`scripts/check-rounds.mjs`, 120 LOC), validates all 41 R+ rounds

## Discovery
R36 retro identified "loop self-monitoring fabricated" as a top systemic gap. SKILL.md v5.3.10 added SG.R26.1 (file-existence verify gate) but it required manual `ls -1 .omo/round-N/ | wc -l` injection. R37 added KNOWN-GAP.md markers per user-accepted strategic accept. R40 closes the loop with a **standalone enforcement tool** that future rounds can invoke.

## What shipped
`scripts/check-rounds.mjs` — 120 LOC Node.js script that:
- Verifies `ls -1 .omo/round-N/ | wc -l` against profile threshold (bugfix ≥3, feature ≥8, architecture =13, housekeeping ≥3)
- Auto-detects profile from `decision.md` (if present)
- Supports single-round check (`check-rounds.mjs 38`) or sweep (`check-rounds.mjs --all`)
- Emits clear PASS/FAIL with missing file count
- Exit codes: 0 (PASS), 1 (FAIL artifact shortage), 2 (setup error)

## Validation
- Test 1: R38 → PASS (4 ≥ 3 housekeeping)
- Test 2: R36 → PASS (16 ≥ 3 housekeeping)
- Test 3: R30 → PASS (7 ≥ 3, was 6 + 1 KNOWN-GAP.md from R37)
- Test 4: --all R1-R41 → 37 PASS, 4 FAIL (R18 on Mac, R32 audit phase, R40/R41 not shipped)
- Test 5: R99 (nonexistent) → FAIL correctly

## Skip per v5.3.12 + v5.3.13
PM Triage + Planner + 5 lens + Test Report + Diff Report + Playwright + Doc Writer (no src/ logic change, scripts/ only)