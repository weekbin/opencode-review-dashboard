# R138 Verify — worktree hygiene

## Pre-Commit

```
[1/8] git status --porcelain                ✓ only .gitignore + 6 round artifacts + proposals.jsonl
[2/8] SKILL.md drift                        ✓ v6 SKILL.md intact
[3/8] stale backup/tmp files                ✓ none
[4/8] Husky configuration                   ✓ husky configured
[5/8] Orphan pm-manager-approved GH issues  (informational, none)
[6/8] verify-plugin-load.mjs                ✓ plugin load PASS
[7/8] format --write + bun test             ✓ 1069/1069 PASS (no anchor drift)
[8/8] bun run lint + typecheck              ✓ lint PASS / typecheck PASS

✅ v6 pre-commit: ALL 8 CHECKS PASS
```

## Contract Evidence — manual checks (no new tests needed)

```
$ git check-ignore -v .agents skills-lock.json .omo/round-132/evidence/r132-stats-lock-375.png
.gitignore:34:.agents/	.agents
.gitignore:35:skills-lock.json	skills-lock.json
.gitignore:40:.omo/round-*/evidence/	.omo/round-132/evidence/r132-stats-lock-375.png

$ ls .omo/round-132/evidence/  # PNGs at new location
r132-stats-baseline-1280-dark.png   56K
r132-stats-lock-1280-dark.png       63K
r132-stats-lock-375.png             46K
r132-stats-lock-768.png             55K
```

Both checks PASS:
1. New ignore patterns catch the intended scratch files (verified via `git check-ignore -v`).
2. PNG visual evidence is co-located with R132's round dir (organized but untracked, per R132 retro intent).

## Regression Sweep — All Green

- R137, R136, R135, R134, R133, R132, R131, R130, ... R57, R44 regression tests all pass.
- Project suite: **1069 tests pass** (was 1068 pre-R138; R138 ships zero new test files since 0 source code changed).

## What changed

- `.gitignore` — 3 new entries:
  - `.agents/` (opencode skill-manager scratch)
  - `skills-lock.json` (skill hash cache)
  - `.omo/round-*/evidence/` (preserves R132 "don't ship per-round captures" intent)
- `.omo/round-132/evidence/` — 4 PNG files relocated from repo root:
  - `r132-stats-baseline-1280-dark.png` (56 KB)
  - `r132-stats-lock-1280-dark.png` (63 KB)
  - `r132-stats-lock-375.png` (46 KB)
  - `r132-stats-lock-768.png` (55 KB)
- `.omo/proposals.jsonl` — appended R137 entry.

## v6 Hard Gates

| Gate | Status |
|------|--------|
| Pre-commit 8/8 | PASS |
| Discovery sweep | PASS |
| 0 Open-loop-internal | PASS (closes 5-round worktree drift) |
| ≤3 feature / ≤5 bugfix / ≤8 total / ≤1 polish | PASS (0/0/0/0) |
| 1 AC max per subagent | PASS (no subagent used) |

All 5 hard gates PASS. R138 ready to SHIP.