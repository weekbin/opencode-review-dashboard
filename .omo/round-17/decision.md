# R17 Decision

## Scope locked (2026-06-30)
**R17 features** (3 features, ≤ 3 cap exact, 0 headroom):
1. **#32 Move round notes into Submit Review modal** (4/5, LOW, 30-50 LOC) — user-feedback #1
2. **#34 Search IME composition fix** (5/5, LOW-MEDIUM, 50-100 LOC) — user-feedback #3 (bug)
3. **#36 Cmd+/ help overlay** (3/5, LOW, 55-85 LOC) — R12 brief #5 closure

**Total**: 135-235 LOC · 3 features · 0 headroom

## Phase 4 Closure — Final Decision

**Decision**: SHIP TO MAIN. R17 closed successfully.

**Test summary**:
- 383 unit tests pass / 0 fail (343 baseline + 40 new R17)
- 34/34 e2e scenarios (33 baseline + 1 new IME)
- 0 lint warnings / 0 lint errors
- Typecheck clean
- Format:check clean
- Build exit 0 · 304 files / 10970 kB

**Issues auto-closed by GitHub**: #32, #34, #36 (via commit message `close #N`)

**Commits**:
- 751309b feat(r17): notes-in-submit + IME fix + Cmd+/ help (close #32, close #34, close #36)
- 2a9c05f Round 17: merge ... (close #32, close #34, close #36)

**Push status**: main is at `2a9c05f` · origin/main = `2a9c05f` · 0 ahead / 0 behind

**R12 brief status**: 7/7 COMPLETE (this round closes the last item — Cmd+/ help overlay)

## v5.3.5+1 patches validated

R17 is the FIRST round exercising ALL v5.3.5+1 patches:
- ✅ SG.13 (regex patterns) — only 1 retry cycle
- ✅ SG.14 (add-only) — installImeSafeInputListener is new helper
- ✅ SG.15 (pre-validated regex) — Lead-synthesized patterns in plan.md
- ✅ SG.16 (screenshots in Phase 2) — 3 PNGs in same commit
- ✅ SG.18 (combined Triage+Researcher) — Lead-synthesized brief.md only
- ✅ SG.19 (bilingual lockstep) — README + zh-CN in SAME commit (FIRST TIME)
- ✅ SG.20 (Playwright minimum) — new search-ime-composition scenario
EOF
wc -l .omo/round-17/decision.md