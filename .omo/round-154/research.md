# R154 Research — remove R153 stale deprecation comment + add regression net for 3 server-side markers

Lightweight-round compression (≤3 LOC deletion + 1 new test file + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

## The stale deprecation comment

R137 retro flagged `document.execCommand("copy")` as deprecated. R147 added a docstring on the `legacyExecCommandCopy` function. R153 deleted the function. The docstring was supposed to be deleted with the function but the amend focused on artifact wording (per the R148 force-push pattern) and left the docstring as a R153 leftover.

After R153:
- `src/ui/app.ts:663-665` reads "// Deprecated: navigator.clipboard.writeText is the primary copy path; this // is the catch-all fallback for environments where the Clipboard API is // unavailable. Migrate to ClipboardItem API when browser support stabilizes."
- The function this described (`legacyExecCommandCopy`) no longer exists
- R154 SHIPped this leftover

## The 3 server-side markers (R142-R152 retro #3, 10 rounds shelved)

R154 cannot change these (agent parses as literal prefixes). R154 adds a regression test to catch unintended future changes:

| Test | File | Asserts |
|---|---|---|
| T1 | src/r154-server-markers-regression.test.ts | `src/index.ts` writes `Manually reopened: <reason>` prefix |
| T2 | src/r154-server-markers-regression.test.ts | `src/index.ts` writes `Edited by user<summary>` prefix |
| T3 | src/r154-server-markers-regression.test.ts | AGENT_PROMPT references `Manually reopened: <reason>` in comments[] instructions |
| T4 | src/r154-server-markers-regression.test.ts | AGENT_PROMPT references `Edited by user` in comments[] instructions |
| T5 | src/r154-server-markers-regression.test.ts | Meta-test documenting why these are agent contract (not i18n) |

Per-SHIP append discipline preserved.