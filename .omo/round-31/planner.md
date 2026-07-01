# R31 Planner

**Date**: 2026-06-30
**Round**: 31
**Verdict**: 1 issue (within ≤3 cap, 0 polish since this IS polish)

## PM Manager output

- #63: Fix pre-existing bilingual drift (APPROVED)
- Total: 1 issue (within ≤3 cap)
- 0 new feature issues (R31 is a polish round)
- 0 multi-round AC candidates (single-round, simple fix)

## Composite scoring

| Issue | PM (0-3) | Urgency (0-3) | User-value (0-3) | Effort (0-3) | Composite | Selected? |
|---|---|---|---|---|---|---|
| #63 bilingual drift | 2 | 1 | 2 | 3 | 2*3+1*2+2*3+3*1 = 17 = 4.25 | ✅ |

**Composite formula**: PM(0-3)*3 + Urgency(0-3)*2 + User-value(0-3)*3 + Effort(0-3)*1
- #63: 2*3 + 1*2 + 2*3 + 3*1 = 6+2+6+3 = 17 ÷ 4 = 4.25

## Scope

- 1 polish issue: #63
- 0 feature issues
- 0 multi-round ACs
- Total scope: 1 (well within ≤3 cap, no polish quota concern since this IS the polish)

## Backlog freshness

- R+ carryover: TSC PATH (RESOLVED by R27 #55 + R29 #59)
- R+ carryover: toast screenshots (RESOLVED by R28 #57)
- R+ carryover: housekeeping (RESOLVED by R30 in-round gap-fix)
- R30 retro candidates: bilingual drift (FRESH, R31 picks up)
- 0 new GH issues opened
- 0 open issues from other sources

## Decision rationale

R31 is a focused polish round to fix pre-existing bilingual drift. Single-issue scope is appropriate because:
1. R+ retros are well-tilled — no new feature candidates emerged in R30 retro
2. The drift is a real, measurable, self-contained bug
3. Husky hook (R30) will prevent future drift at commit time
4. Once fixed, the SG.R22.1 lockstep gate (v5.3.9) will keep EN and ZH in sync going forward

## Plan

- Phase 2: Dev subagent fixes #63 (add missing R23 section to README.md, ensure EN and ZH match)
- Phase 2.5: Pre-Commit Audit (3/3 gates PASS, bilingual lockstep verified)
- Phase 2.6: Lead Merge+Push (SG.R20.1 3-step)
- Phase 3: review + reports + docs
- Phase 4: Decision + Retro + Experience summary
- Phase 4.8: Loop Summary
- Oracle verification
