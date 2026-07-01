# R16 Decision — Scope = Hide-ws + Copy MD + Expand-all (3 features)

## Locked scope (2026-06-30, after multi-round scheduling from user)

**R16 features** (3 features, ≤ 3 cap exact, 0 headroom):
1. **Hide-whitespace toggle** (#29, 5/5 user-value, **80-110 LOC**, **LOW-MEDIUM risk**) ← PM Researcher reclassified
2. **Copy finding as Markdown** (#30, 4/5 user-value, **50-70 LOC**, LOW risk)
3. **Diff expand-all / collapse-all** (#31, 4/5 user-value, **50-80 LOC**, LOW risk)

**Total (PM Researcher corrected)**: **180-260 LOC** · 4-6 files · 1 LOW-MEDIUM + 2 LOW risk

**Defer to R17** (user-authorized multi-round schedule):
- Cmd+/ help overlay (R12 brief #5 closure, 3/5)
- A11y audit + fixes (4/5)
- Toast notification system (3.5/5)

**Rationale**:
- R16 closes 2 plausible-unique gaps (Copy MD + Expand-all) + 1 every-competitor gap (Hide-ws)
- R17 closes R12 brief 7/7 + 2 supporting ergonomics
- Each round feasible (≤ 3 cap, ≤ 500 LOC, all additive or 1 additive-schema)

## Profile
**feature** (per Rule 2: U_user_visible=yes + total=3 ≥ 3 triggers feature profile). All additive. No architecture shift. No new deps (Pierre205 already in use).

## Risk register
| # | Risk | Mitigation |
|---|---|---|
| R1 | Pierre205 setOptions runtime toggle behavior | Verify via Pierre205 d.ts; if setOptions doesn't update render, destroy+recreate instance |
| R2 | Copy MD format opinionated | Spec defined in test (AC6); user can re-spec post-implementation |
| R3 | State.fileDiffInstances memory leak | Clean up on unmount (existing pattern in app.ts) |

## Pipeline
Phase 0.25 PM Researcher (verify subagent claims + Pierre205 reality) → Phase 0.75 Planner (lead-synthesized) → Phase 1 Architect (lead-synthesized plan.md) → user "go" → Phase 2 Dev (subagent, 18-22 min budget) → Phase 2.5 Pre-Commit Audit (lead-direct per v5.3.3) → Phase 2.6 Lead Merge+Push (NEW v5.3.3) → Phase 3a-3.5 (lead-synthesized per R4 Gap 2 + R5 Patch A) → Phase 4 + 4.5-4.9 lead-owned.

## Sync baseline
SHA: `121c4dd` (R16 audit-trail prep) + `350efba` (R+ retro SG.12) + `0bed398` (R15 closure)

## Test gates target
- 262 + N unit tests (N = feature tests; expect ~25-30 new)
- 33 e2e scenarios (no new R16 e2e — Dev uses unit tests; SG.5 quota-override)
- Lint 0/0 · typecheck clean · format:check clean

---

## Phase 4 Closure — Final Decision

**Decision**: SHIP TO MAIN. R16 closed successfully.

**Test summary**:
- 342 unit tests pass / 0 fail (262 baseline + 80 R16 new)
- 33/33 e2e scenarios (no drift)
- 0 lint warnings / 0 lint errors
- Typecheck clean
- Format:check clean
- Build exit 0 · 304 files / 10944 kB

**Issues auto-closed**: #29, #30, #31 (all 3 by GitHub via commit message `close #N`)

**Commits**:
- 0fa959d feat(r16): Hide-whitespace toggle + Copy as Markdown + Diff expand-all
- 91611cf Round 16: merge ... (close #29, close #30, close #31)

**Push status**: main is at `91611cf` · origin/main = `91611cf` · 0 ahead / 0 behind
