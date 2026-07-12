# R138 Research — worktree hygiene

Lightweight-round compression: per v6 SKILL, when total ≤50 LOC + ≤2 files + no behavior change, capabilities 2 (Research) + 3 (Frame) compress into a single artifact. R138 ships below those thresholds, so research lives inline in `brief.md` ## Why / ## Risk sections.

The only external dependency is `.gitignore` semantics. Verified:

```
$ git check-ignore -v .agents skills-lock.json .omo/round-132/evidence/r132-stats-lock-375.png
.gitignore:34:.agents/	.agents
.gitignore:35:skills-lock.json	skills-lock.json
.gitignore:40:.omo/round-*/evidence/	.omo/round-132/evidence/r132-stats-lock-375.png
```

All 3 new patterns match the intended targets and don't catch any tracked file. The `.omo/round-*/evidence/` pattern is a glob in `.gitignore` (git 1.8+ supports `**`-style globs without leading `**`).