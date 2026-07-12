# R138 Brief — worktree hygiene

## Scope

1. Move 4 R132 visual-evidence PNGs from repo root into `.omo/round-132/evidence/`. Done on disk.
2. Add 3 entries to `.gitignore`:
   - `.agents/` — opencode skill-manager scratch (9 subdirectories)
   - `skills-lock.json` — skill hash cache (regenerable)
   - `.omo/round-*/evidence/` — round visual evidence that R132 explicitly chose to keep untracked
3. Append R137 entry to `.omo/proposals.jsonl` (per-SHIP append discipline).

## Why

R132 retro explicitly stated visual evidence "remain untracked because the project does not ship per-round captures" — which `git status ?? r132-stats-*.png` for 5 rounds violated in spirit (the files existed at repo root). Moving them under the round directory respects the original "don't ship per-round captures" intent while organizing them by origin. Adding `.agents/` and `skills-lock.json` covers the opencode skill-manager scratch pattern (parallel to the existing `.opencode/cache/`, `.opencode/state.json` patterns).

## Risk

- **None operational.** No src/ files change. No test surface affected.
- Risk of mis-ignoring tracked files: `.agents/` and `skills-lock.json` don't match any existing tracked file. `.omo/round-*/evidence/` doesn't match any tracked file either (existing tracked evidence lives elsewhere or has different paths).
- The PNG files no longer appear in `git status` (verified via `git check-ignore -v`).

## Acceptance

- `bash .husky/pre-commit` PASS (no src changes → mechanical gate is trivial)
- `git status` shows only `.gitignore`, `.omo/proposals.jsonl`, and the 6 R138 round artifacts as candidates for commit
- `git check-ignore -v .agents skills-lock.json .omo/round-132/evidence/r132-stats-lock-375.png` returns all 3 entries as ignored

## Profile

Housekeeping. 1 file modified (.gitignore) + 1 file updated (proposals.jsonl) + 6 round artifacts created. 0 features / 0 bugfixes / 0 polish.