# R148 Research — add `years` threshold to `formatRelativeTime` (close R142 retro #2 preventive)

Lightweight-round compression (≤50 LOC + ≤3 files + no behavior change for common case): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

R134 established the 5-key ladder for `formatRelativeTime`: justNow / minutes / hours / days / months. The 30-day boundary (`2_592_000_000` ms) was the highest threshold. For timestamps ≥ 30 days, the function falls through to "n months ago" with `n = Math.floor(diff / 30 days)`.

R142-R147 retro #2 (preventive) flagged that timestamps ≥ 365 days produce grammatically wrong output: a 400-day-old entry shows as "13mo ago" instead of "1y ago". R148 closes this gap by adding a 365-day threshold.

The new threshold constant is `31_536_000_000` ms (= 365 × 86_400_000 ms). When `diff >= 31_536_000_000`, the function returns `t("view.stats.locked.ago.years", { n: Math.floor(diff / 31_536_000_000) })`.

**Why a 365-day boundary instead of 12 months × 30 days = 360 days**: The months branch already uses 30-day approximations. The years branch should use 365-day approximations for consistency. Calendar-aware leap-year handling is out of scope (R148 is a polish round, not a calendar refactor).

**Test upgrade for R134**: the existing 4-threshold ladder test at r134-relative-time.test.ts:60-66 needs to be upgraded from 4 thresholds (60_000 / 3_600_000 / 86_400_000 / 2_592_000_000) to 5 thresholds (add 31_536_000_000). Same R137→R142 byte-equivalence → behavior-contract SOP applies but here it's a threshold-list upgrade not a structural change.

R103 invariant preserved: `en !== zh-CN` for the new key.