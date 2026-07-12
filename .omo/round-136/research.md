# R136 Research — localize audit-trail timestamps

Lightweight-round compression: per v6 SKILL, when total ≤50 LOC + ≤2 src files + no behavior change, capabilities 2 (Research) + 3 (Frame) compress into a single artifact. R136 ships below those thresholds, so research lives inline in `brief.md` ## Files involved / ## Existing patterns / ## Simplest change / ## Risk sections.

The only external dependency is `formatRelativeTime` from `src/ui/app.ts:4191` (R134), which is the canonical bilingual relative-time helper. It already handles the 5-threshold ladder and never returns HTML special characters, so `escapeHtml(ts)` wrapping in the existing audit-trail row template stays a safe no-op.

No new i18n keys needed; this round's payoff is 100% reuse of R134's helper.