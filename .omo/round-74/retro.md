# R74 Retro

## What worked
- Direct pattern reuse from R73 (per-element timer ID)
- Both functions had the same shape (force-reflow + class remove via setTimeout) — same fix applies
- TDD: 2 tests, RED→GREEN in 2 cycles

## What didn't
- First regex attempt was too strict (`clearTimeout\(el._x\)` failed on multi-line cast) — fixed by widening

## Carry-over
- 1 more stale setTimeout at L3869 (`URL.revokeObjectURL`, 1000ms) — uses different element (`URL.createObjectURL` return)
