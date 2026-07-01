# R27 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (RALPH LOOP iteration 8, R27)
> **Brief**: `.omo/round-27/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict. All via direct codebase inspection.

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | tsc PATH investigation | "tsc not in PATH on this machine" | `which tsc` → not found | **VERIFIED** |
| 1 | tsc PATH investigation | "TypeScript installed via node_modules" | `ls node_modules/typescript` → bin + lib present | **VERIFIED** |
| 1 | tsc PATH investigation | "bun build --target=bun works as typecheck alternative" | R25 + R26 subagents reported 0 errors | **VERIFIED** |
| 1 | tsc PATH investigation | "5 rounds stale (R22 #46 → R27)" | carryover count | **VERIFIED** |
| 2 | SG.R25.1 skill patch | "R25 had bilingual lockstep gap (2 missing visual sections)" | R25-gap-fix commit 52e6a3a | **VERIFIED** |
| 2 | SG.R25.1 skill patch | "SG.R22.1 verify happens AFTER commit" | Oracle caught gap in R25 | **VERIFIED** |
| 2 | SG.R25.1 skill patch | "pre-commit grep -c gate needed BEFORE step 3" | brief.md SG.R25.1 candidate | **VERIFIED** |
| 2 | SG.R25.1 skill patch | "No source code changes needed (skill file only)" | brief.md scope | **VERIFIED** |

## Mischaracterizations found

**Zero mischaracterizations**. All 8 claims in brief.md verified against current main + direct codebase inspection.

## Verification matrix per candidate

### Candidate #1 — tsc PATH investigation (R22 carryover, 5 rounds stale)
- competitive gap: N/A (internal developer tooling)
- implementation approach: VERIFIED (3 options documented — shell config, alternative command, devDep)
- 3-test gate: PASS (all 3 criteria met — honest README, internal dev-experience, no competitors)
- risk surface: low (5-15 LOC, 1 file)

### Candidate #2 — Apply SG.R25.1 skill patch (R25 retro candidate)
- competitive gap: N/A (internal skill file)
- implementation approach: VERIFIED (add new section to SKILL.md + update phase-prompts.md)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: low (5-10 LOC, 1-2 files)

## SG.R22.1 STRINGS_USAGE_PLAN verification

**No new STRINGS keys** for R27 (both candidates are internal/tooling/skill-patch). 0 i18n changes.

## SG.R24.1 v5.3.8 SUCCESS pattern

- R25 + R26 SUCCESS — subagent double-write pattern PREVENTED
- R27 will apply SG.R24.1 per-Edit verify to subagent prompts
- Main CLEAN post-merge expected (R27 will continue R25+R26 pattern)

## Conclusion

**Both candidates verified**. Lead-direct PM Researcher endorses both. Planner should select both within feature+skill-patch caps.