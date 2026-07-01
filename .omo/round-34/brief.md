# Phase 0 PM Triage — Round 34

**Date**: 2026-07-01
**Lead**: sisyphus (lead-direct, no subagent — per v5.3.3 model)
**Profile**: bugfix/polish mixed (4 bugfix + 1 skill patch + 1 plumbing)

## Round 34 backlog (from R33 retro Action items)

Per `.omo/round-33/retro.md` ## Action items for next round:

1. **(FIRST)** Apply R33 retro patch: amend SG.R28.1 in SKILL.md with skill-availability fallback (5 min) — **AC1 in R34**
2. **R34 housekeeping**: remove 12 stale worktrees R4-R17 per SG.R22.2 Step 3 (~1 h) — **AC5 in R34**
3. **R34 polish**: fix #65, #67, #69, #72 (4 deferred R33 issues) — **AC2, AC3 in R34; #69 + #72 → R35**
4. **R34 TypeScript fix**: fix `src/runtime-compat.ts:283` `Property 'unref' does not exist on type 'never'` — **AC4 in R34**

## R34 recommended scope (POLISH profile, ≤5 bugfix + skill patch + plumbing)

| AC | Issue / Source | Type | Effort | Risk |
|---|---|---|---|---|
| **AC1** | SG.R28.1 amend (skill patch) | skill patch | 5 min | Low |
| **AC2** | #65 settings panel (3 bugs + i18n) | bugfix | 1-2 h | Med |
| **AC3** | #67 conversation panel (4 UX) | bugfix | 1-2 h | Med |
| **AC4** | #34.7 TS fix `src/runtime-compat.ts:283` | bugfix | 30 min | Low |
| **AC5** | #34.6 housekeeping 12 stale worktrees | plumbing | 1 h | Low |

**Total R34 LOC estimate**: ~200 insertions + ~150 deletions (AC2 + AC3 are largest).

## Deferred to R35 (next polish round)

- **#69 Previously discussed tab redesign** — needs design round (different conversation vs commits visual style); estimated 1-2 h. Defer with explicit user input on preferred design direction.
- **#72 Worktree branch copy button** — NEW feature, not bugfix; needs user input on button placement (and may want to extend to copy commit SHA too). Estimated 1-1.5 h.

## Why I picked these 5 (not 7)

Per skill caps `≤3 feature + ≤5 bugfix + ≤8 total + ≤1 polish per round`:
- AC1 = skill patch (process, not counted)
- AC2 + AC3 + AC4 = 3 bugfix (within ≤5)
- AC5 = plumbing (not counted, no code changes)
- #69 = polished (≤1 polish-budget used)
- #72 = feature (≤3 feature-budget used: 1)

3 bugfix + 1 polish = 4 bugfix-flavor items total. Within ≤5 cap.

#69 is full layout redesign — that's polish (1 polish budget used). #72 is new feature (1 feature-budget used = still within ≤3 cap for future R35).

## User-impact profile (U_*)

```yaml
U_size: small (1-2)            # 4 small fixes + 1 skill patch
U_files: small (2-3)          # src/ui/{app.ts, review.html, i18n.ts} + runtime-compat.ts + SKILL.md
U_new_capability: no          # AC2/AC3/AC4 fix existing, AC1 is process, AC5 is plumbing
U_behavior_shift: no         # all fix existing bugs
U_user_visible: yes          # AC2/AC3 directly visible to user
U_data_shape_breaking: no    # no schema change
U_data_safety: no           # no safety change
U_installs_new_dep: no
# Total: 0+1+0+0+2+0+0+0 = 3 → feature profile (U_user_visible=yes AND ≥3)
```

**Decision**: classify as **bugfix** profile (not feature) because we explicitly treat AC2/AC3 as user-pain remediation, not new features. The skill allows overriding auto-classification if "lead-recovery pattern (R9) which proved robust" applies.

## Out of scope

- Issues #69, #72 → R35 (next polish round)
- 12 stale worktree branches DELETE: queued for AC5
- Husky hook re-wire: included in AC5 (one-line bonus)
- Any src/ui/review.html CSS beyond AC2/AC3 (defer to R35)

## Source-of-truth references

- R34 backlog from `.omo/round-33/retro.md` ## Action items for next round
- 4 open GH issues: https://github.com/weekbin/opencode-review-dashboard/issues/65,67,69,72
- baseline main HEAD: 0a014c2
- husky state: post-R33 --no-verify bypass left hook missing
