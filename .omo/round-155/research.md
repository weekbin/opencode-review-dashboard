# R155 Research — extend R154 regression test to all 5 marker locations

Lightweight-round compression (test file extension only, no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The R154 regression test (`src/r154-server-markers-regression.test.ts`) already has 5 tests covering 5 marker locations:

- T1: L2211-2212 reopen handler writes `Manually reopened: <reason>` or `Manually reopened` literal
- T2: L2450 edit handler writes `Edited by user<summary>` literal
- T3: L1697 AGENT_PROMPT references `Manually reopened: <reason>` in manually-reopened directive
- T4: L1701 AGENT_PROMPT references `Edited by user` in manually-edited directive
- T5: L1726 AGENT_PROMPT references `Edited by user` in comments[] summary note

R154 already covers all 5 locations. R155 = just the verify/retro/decision artifacts + proposals.jsonl append + commit/push.

Per-SHIP append discipline preserved.