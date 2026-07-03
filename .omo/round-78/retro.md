# R78 Retro

## What worked
- Same fix pattern as R57-R72 (template literal → t() call)
- All 4 sites identified by fresh scan
- 4/4 tests RED → GREEN after test refinement

## What didn't
- First test pass had overly complex regex extraction (extracted around now-deleted markers). Simplification: directly regex against full file for the t() call pattern.
- Required 2 cycles to converge on a robust test.

## Carry-over
- (none — last 4 hardcoded English empty-state messages in app.ts localized)
