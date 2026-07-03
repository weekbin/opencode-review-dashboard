# R79 Retro

## What worked
- 8 hardcoded English messages → t() calls in 1 round (5 setStatus + 3 side-fixed by R73 already)
- Side fix to T16.11a caught a pre-existing literal-English test fragility (R16/R17 era)
- Pattern reuse from R57-R72 modal i18n sweeps

## What didn't
- First run hit a syntax-error cycle (stray keys outside STRINGS table); recovered via git checkout + targeted re-add. i18n.ts corruption isolated to Python regex mismatch.
- Took 3 cycles to converge (script retry after recovery)

## Carry-over
- (none — setStatus message sweep complete)
