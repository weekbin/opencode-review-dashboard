# R139 Research — hoist `fallbackCopy` to file scope

Lightweight-round compression: per v6 SKILL, capabilities 2 (Research) + 3 (Frame) compress into a single artifact when total ≤50 LOC + ≤2 src files + no behavior change. R139 ships below those thresholds, so research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The 4 duplicate bodies are byte-equivalent (verified via grep -B1 -A12). Each is a `const fallbackCopy = (text: string) => { try { document.createElement("textarea")...; document.execCommand("copy")... } catch { return false } }` shape. The hoisted function preserves this exactly — no signature change, no behavioral change.

One existing test covers part of the contract: `r73-copied-timer-leak.test.ts` asserts the timer-leak invariant on `copyAsMarkdown` and `copyFindingPermalink`. The new direct test will cover the `fallbackCopy` function in isolation (mocked DOM), so the contract is anchored independent of any single caller — preventing future regressions if the function shape changes.

No new i18n keys, no schema changes, no behavior changes. Pure duplication removal.