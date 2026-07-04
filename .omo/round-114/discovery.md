# R114 Discovery

## Open GH issues (round-114 tagged)

- **#82** Silent round auto-summary comment (round-114 tagged)
- ~~#74~~ Cross-round reconcile overlay — defer to R115 (larger scope: 250-400 LOC, needs renderDiffPanel badges + click handlers + cross-round scan)

## Carry-over (from R113 retro)

- (none — R113 closed clean)

## Decision

**R114 profile = 1 feature (#82).** 1 round of payload. Per v6 hard cap (≤3 feature per round), under-shipping is fine — pacing matters more than filling caps.

- **#82** Silent round auto-summary — Add `RoundSystemNote` entity to state.json. Post-submit hook detects silent round (0 new findings + 0 notes in this round) and appends a template-rendered summary. Display in conversation pane header. ~250-320 LOC.

Defer #74 to R115. Defer #79 #81 #83 #80 to R116+.

Total 1 feature ≤ 3 cap.