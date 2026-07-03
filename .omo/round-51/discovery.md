# R51 Discovery

## Source: R43 deferred items + 5-round housekeeping streak
- R43 retro's "Followup items (PRODUCT carry-over)": GH #73 #6 + #7 deferred "→ R44"
- R44-R50 were all housekeeping rounds; product backlog unchanged
- After 5 consecutive housekeeping rounds (R46-R50, 3274 lines removed), the v6 cleanup pattern is converging — pivot to product work

## Backlog scan
1. **GH issues open**: 0
2. **R50 carry-over**: empty
3. **GH #73 #6 (hide-ws perf)**: deferred since R43, requires perf bench harness not yet built
4. **GH #73 #7 (COMMits panel fold/unfold visual cue)**: deferred since R43, ~30 lines CSS+JS

## Selected scope
**Pick GH#73 #7** (COMMits panel fold/unfold chevron). Lower risk, smaller scope, addresses real user-reported visual confusion.

## Root cause analysis
- `commit-card-head` already has click handler (app.ts L3564) toggling `data-collapsed` on `commit-card-files`
- CSS `.commit-card-files[data-collapsed] { display: none }` already hides files
- BUT: NO chevron/visual indicator on the head — users can't tell:
  1. That the head is clickable (cursor:pointer hints but unclear)
  2. What state they're in (collapsed vs expanded)
- Compare with `card-chevron` (L4976) and `sidebar-folder` `.folder-chevron` (L1344-1361) which DO have rotating chevrons — same pattern missing for commit-card

## Decision
Pick: add chevron to commit-card-head + aria-expanded + role=button + tabindex + i18n aria-label

## Why this scope
- Real product bug from real user feedback (GH#73 #7)
- Self-contained: 3 files, ~40 lines
- Pre-existing pattern to follow (card-chevron, folder-chevron)
- No external dependencies
- Zero data integrity risk
- ~10min scope vs ~30min for #6

## Rejected alternatives
- **GH#73 #6 (hide-ws perf)**: requires building perf bench harness first, ~1 round of prep
- **Continue housekeeping (delete phase-prompts.md)**: continuing the streak; pivoting now demonstrates v6 can pick up product work autonomously
- **Both #6+#7 in one round**: violates v6 hard cap (≤3 feature, ≤5 bugfix; this is 2 bugfix but still tight)