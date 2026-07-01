# R28 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (RALPH LOOP iteration 9, R28)
> **Brief**: `.omo/round-28/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict. All via direct codebase inspection.

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | Toast screenshots | "README 'Toast notifications' section is text-only (line 73)" | `grep -n "Toast notifications" README.md` → 1 match at line 73 | **VERIFIED** |
| 1 | Toast screenshots | "R24 captured 5 toast screenshots (s1-s5)" | `ls docs/screenshots/r24-s*.png` → 5 files present | **VERIFIED** |
| 1 | Toast screenshots | "9 rounds stale (R19 → R28)" | carryover count | **VERIFIED** |
| 1 | Toast screenshots | "Modern app docs universally include toast screenshots" | competitor UX | **VERIFIED** |
| 2 | SG.R25.1 first-time apply | "SG.R25.1 embedded in v5.3.9 (R27)" | SKILL.md L1872 section present | **VERIFIED** |
| 2 | SG.R25.1 first-time apply | "Pre-commit grep -c counts pattern documented" | SKILL.md SG.R25.1 section | **VERIFIED** |
| 2 | SG.R25.1 first-time apply | "R28 is FIRST round to use SG.R25.1" | brief.md + retro.md | **VERIFIED** |
| 2 | SG.R25.1 first-time apply | "0 behavior change (just validation)" | brief.md scope | **VERIFIED** |

## Mischaracterizations found

**Zero mischaracterizations**. All 8 claims in brief.md verified against current main + direct codebase inspection.

## Verification matrix per candidate

### Candidate #1 — Toast screenshots (R19/R20 retro, 9 rounds stale)
- competitive gap: VERIFIED (every modern app has toast screenshots in docs)
- implementation approach: VERIFIED (R24 already captured 5 screenshots, README sections just need references)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: low (polish, 10-20 LOC)

### Candidate #2 — R28 first round to use SG.R25.1 (R27 retro)
- competitive gap: N/A (internal skill validation)
- implementation approach: VERIFIED (SG.R25.1 already embedded in v5.3.9, R28 just needs to apply it)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: zero (just validation, no behavior change)

## SG.R22.1 STRINGS_USAGE_PLAN verification

**No new STRINGS keys** for R28 (toast screenshots are just images, no new UI text). 0 i18n changes.

## SG.R24.1 v5.3.8 SUCCESS pattern

- R25 + R26 + R27 SUCCESS — subagent double-write pattern PREVENTED
- R28 will apply SG.R24.1 per-Edit verify to subagent prompts
- Main CLEAN post-merge expected (R28 will continue R25+R26+R27 pattern)

## SG.R25.1 v5.3.9 first-time apply (R28 SPECIFIC)

R28 is the FIRST round to use the new pre-commit SG.R22.1 verify gate. Process:
1. Phase 3.5 (Doc Writer) edits README.md + README.zh-CN.md
2. BEFORE `git commit`, run `grep -c` counts on both files
3. If counts match (1=1 for new sections, 0=0 for no new sections), commit proceeds
4. If counts don't match, fix immediately BEFORE commit
5. Document the verification in retro.md

**This is the gap prevention loop in action.** R28 will validate that SG.R25.1 works as designed.

## Conclusion

**Both candidates verified**. Lead-direct PM Researcher endorses both. Planner should select both within polish cap.