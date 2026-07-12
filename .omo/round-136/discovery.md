# R136 Discovery

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R135 retro carry-over**: none — all flags closed (R134 surfaced-risk #3 + R134 retro self-improvement #4 + worktree drift)
- **proposals.jsonl last entry**: R135 (per-SHIP append discipline restored)
- **R135 retro surfaced 3 risks**: (1) lock banner click-to-jump, (2) formatRelativeTime > 1yr, (3) **audit-trail timestamps not localized**

## Surfaced candidates

### C1 — Localize audit-trail timestamps via formatRelativeTime (R135 retro risk #3)

**Evidence** (1 site in `src/ui/app.ts`):
- L4961: `const ts = new Date(row.at).toLocaleString();` — renders as `"7/13/2026, 1:23:45 AM"` (system-locale dependent)
- L4998: `<span class="audit-ts">${escapeHtml(ts)}</span>` — embedded in audit-trail row
- Inconsistent with: conversation panel comment timestamps (R134 bilingualized), pinned badge tooltips (R135 bilingualized), finding creation timestamps (R134 bilingualized)

**Why**: User-visible UX gap. Audit-trail entries show English-style timestamps to bilingual users even though the rest of the conversation panel is bilingual. Also inconsistent with the conversation-panel "X minutes ago" style — audit trail uses calendar date format while comments use relative time. R135 retro explicitly flagged this: "audit-trail `ts` line uses `new Date(row.at).toLocaleString()` — not localized. Out of R135 scope; flagging as future candidate."

**Cost**: ≤1 src file modified (`app.ts`) + 1 new test + 1 proposals.jsonl append. ~5 LOC net. ZERO new i18n keys — reuses the R134 `formatRelativeTime` helper directly.

**Profile**: polish (UI text improvement, no behavior change, no new strings).

### C2 — Lock banner click-to-jump-to-locked-round (R132 retro original risk #1)

**Why not this round**: Reconsidered after R135. The locked round IS the current round (R131 lock fires on the approve button). There's no UI surface to "jump to" because the locked round's findings are already in the active conversation panel. Would need a scroll-into-view on a DOM element that doesn't have a stable selector. Skip — not actionable as a polish.

### C3 — formatRelativeTime > 1 year as calendar date

**Why not this round**: Preventive only, no current surface triggers this. Same as R133 retro's "data-i18n-placeholder" risk.

## Selection

Pick **C1 — localize audit-trail timestamps**. Closes the R135 retro surfaced-risk. ~5 LOC. ≤1 polish.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 1 | ≤1 | OK |
| total | 1 | ≤8 | OK |
| subagent | 0 | ≤15min wall | OK |
| AC/subagent | n/a (lead-direct) | 1 | OK |

## Hardening included

- Append R135 entry to `.omo/proposals.jsonl` (per-SHIP append discipline per R134 retro lesson)
- Skip the `.agents/` + 5 untracked PNGs housekeeping — they're scratch artifacts from R132 visual QA, not blocking anything