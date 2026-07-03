# R68 Discovery

R67 carry-over: empty (R63-R67 i18n sweep closed all 6 sites).

R53 retro carry-over finally picked up: bench the per-file inner loop of renderDiffPanel.

Decision tree (Capability 1):
- jsdom devDep (50MB): too heavy for one bench function
- Synthetic pure-JS workload: provides regression gate for object-allocation cost
- Defer: wastes round; user wants progress

Chose: synthetic pure-JS bench (Option C-modified) for the testable allocation slice. Captures lower-bound baseline (string + object construction) so future opt rounds have a regression gate. Real DOM ops require jsdom or browser — explicitly out of scope for bun:test.

R53 retro said: "renderDiffPanel (app.ts:4953) is the suspected bigger bottleneck (innerHTML clear + full DOM rebuild per file). Bench it in a follow-up round." R68 closes that carry-over, with the explicit caveat that this is a proxy bench (JS allocation), not a DOM paint bench.
