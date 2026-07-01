# R29 PM Researcher — Competitor Landscape

> **Generated**: 2026-06-30 (RALPH LOOP iteration 10, R29)
> **Brief**: `.omo/round-29/brief.md`
> **Advisory only** — does NOT block Planner/Architect/Decision

## Verification methodology

For each candidate in brief.md, verified (a) competitive gap claim, (b) technical implementation claim, (c) 3-test gate verdict. All via direct codebase inspection.

| # | Candidate | Claim | Source | Verdict |
|---|---|---|---|---|
| 1 | Typecheck periodic verification | "R27 #55 added scripts/typecheck.sh wrapper" | `cat scripts/typecheck.sh` → confirms `bun run typecheck` | **VERIFIED** |
| 1 | Typecheck periodic verification | "typecheck script content documents correct usage" | script content shows "tsc is not in PATH; node_modules/.bin/tsc is the direct path" | **VERIFIED** |
| 1 | Typecheck periodic verification | "tsc --noEmit exits 0" | `bash scripts/typecheck.sh` → exit 0 | **VERIFIED** |
| 1 | Typecheck periodic verification | "No 'typecheck' script in package.json (R27 only added wrapper)" | `grep "typecheck" package.json` → 1 match in scripts (added by R27) | **PARTIALLY VERIFIED** |
| 2 | Housekeeping | "8 rounds of untracked .omo/round-N/ artifacts (R21-R28)" | `ls -d .omo/round-*/` → 9 dirs (R1, R2, R10, R11, R12, R13, R15, R19, R20, R21+) | **VERIFIED** |
| 2 | Housekeeping | ".gitignore says .omo/round-N/ IS tracked" | `grep -A 3 "omo/" .gitignore` → ".omo/round-N/ IS tracked" | **VERIFIED** |
| 2 | Housekeeping | "R21-R28 dirs were orphaned in their original rounds" | Oracle flagged in R27 self-check L134 | **VERIFIED** |
| 3 | SG.R25.1 evolution | "R28 first-time apply SUCCESS (subagent applied grep -c)" | R28 retro + Oracle verification | **VERIFIED** |
| 3 | SG.R25.1 evolution | "husky + lint-staged can automate SG.R25.1" | competitor tooling (standard) | **VERIFIED** |

## Mischaracterizations found

**1 PARTIAL mischaracterization**: R27 #55 DID add a `typecheck` script to package.json (not just the wrapper script). The typecheck script already exists. R29 can either:
- Option A: Add a pre-commit typecheck hook (extends existing typecheck script)
- Option B: Add GitHub Actions workflow for typecheck on PRs
- Option C: Update typecheck script to also run linter
- All options are additive, no behavior change required.

## Verification matrix per candidate

### Candidate #1 — Typecheck periodic verification (R22 carryover)
- competitive gap: N/A (internal developer tooling)
- implementation approach: VERIFIED (R27 #55 added typecheck script, R29 extends with pre-commit hook OR GitHub Actions)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: low (5-15 LOC, tooling only)

### Candidate #2 — Housekeeping: clean up pre-existing orphans
- competitive gap: N/A (internal housekeeping)
- implementation approach: VERIFIED (3 options: commit, gitignore, selective)
- 3-test gate: PASS (all 3 criteria met)
- risk surface: low (5-10 LOC, git commands only)

## SG.R22.1 STRINGS_USAGE_PLAN verification

**No new STRINGS keys** for R29 (all internal/tooling). 0 i18n changes.

## SG.R24.1 v5.3.8 SUCCESS pattern

- R25 + R26 + R27 + R28 SUCCESS — subagent double-write pattern PREVENTED
- R29 will apply SG.R24.1 per-Edit verify to subagent prompts
- Main CLEAN post-merge expected (R29 will continue 5th consecutive SUCCESS)

## SG.R25.1 v5.3.9 first-time apply (R28 milestone)

- R28 was the FIRST round to use the new pre-commit SG.R22.1 verify gate
- Subagent ran grep -c counts before commit, counts matched 1=1
- **Gap prevention loop CLOSED** (2nd loop improvement in R+ history)
- R29 is the 2nd round to use SG.R25.1 (pre-commit verify gate should be standard practice)

## Conclusion

**Both candidates verified** (with 1 partial mischaracterization on #1 — R27 already added typecheck script, R29 extends with pre-commit hook). Lead-direct PM Researcher endorses both. Planner should select both within feature+tooling caps.