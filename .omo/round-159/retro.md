# R159 Retro — [USER ISSUE #1] ban all remote CI

## What worked

User-driven round. Closed ISSUE #1: ban all remote CI. 4-step implementation went cleanly:

1. `rm -rf .github/` (1 line, immediate)
2. README.md + README.zh-CN.md: parallel "Project rules" / "项目规则" sections (bilingual parity required by R60)
3. v6 SKILL.md: added "## Project rules (HARD — never violate)" with rule #0
4. `.husky/pre-commit`: added check #9, renumbered final echo, updated header comment

Profile pivot from R154-R158 self-feedback-loop housekeeping. This round came from a real user directive, not a stale carry-over or stale i18n surface. Net +83/-23 across 5 source files + 6 round artifacts + 1 proposals.jsonl entry.

Pre-commit ran clean (9/9 PASS after adding the new check). bun test stayed at 1119/1119 PASS (R60 bilingual parity check held).

## What didn't

- R60 test initially failed because I added the "Project rules" section to README.md but not README.zh-CN.md. Fixed by adding the matching "## 项目规则" section. Lesson: when touching README, check both EN and ZH together.
- The pre-commit header comment still says "8 mechanical checks" — should have been updated as part of the same commit (this is the kind of detail that drifts over time). Caught and fixed in the same commit.

## Carry-over list (≤3 items)

None. R159 closed the only item.

## Closed in this round (loop-internal)

- USER ISSUE #1: ban all remote CI — closed via pre-commit check #9 + SKILL.md rule + README docs.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **User-driven rounds produce better signal than carry-over-driven rounds.** This round closed a real rule with 5 files modified + tests still green. Compare to R154-R158 which were 8 housekeeping rounds in a row closing each other's carry-overs. USER ISSUES are the right input.
- **Bilingual parity is a real test surface.** R60 caught the README.md / README.zh-CN.md drift. Future rounds touching docs should always update both files.
- **Pre-commit extension is the right enforcement mechanism.** Adding check #9 ensures the rule holds even if a future round forgets. The check is cheap (one `find` command) and atomic with the commit.

## Risks Surfaced (not actioned this round)

None — user-driven round closed cleanly.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **0 polish** (≤1) + **1 housekeeping** = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 9/9 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.

## Round Profile

- Housekeeping: 1 (delete .github/workflows/ + ban remote CI)
- Total: 1
- Subagents: 0
- Time: ~5 min wall-clock.
- **Driver**: USER DIRECTIVE (ISSUE #1) — not carry-over / not stale i18n surface.