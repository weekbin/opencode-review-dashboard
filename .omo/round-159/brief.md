# R159 Brief — [USER ISSUE #1] ban all remote CI

## Steps (4 steps, no surprises)

1. `rm -rf .github/` — delete the entire directory.
2. Update `README.md` and `README.zh-CN.md` — add "Project rules" section before "## Features" / "## 功能列表". Both languages must have the same section structure (R60 parity test enforces this).
3. Update v6 SKILL.md — add "## Project rules (HARD — never violate)" section with rule #0 about no remote CI.
4. Update `.husky/pre-commit`:
   - Add check #9 (after #8 lint+typecheck): block `.github/workflows/*`, `vercel.json`, `netlify.toml`, `render.yaml`.
   - Update header comment from "8 mechanical checks" → "9 mechanical checks".
   - Update final echo from "ALL 8 CHECKS PASS" → "ALL 9 CHECKS PASS".

## Files affected (5 files)

- `README.md` — +18 lines
- `README.zh-CN.md` — +18 lines (parallel section)
- `.opencode/skills/team-dev-loop/SKILL.md` — +4 lines
- `.husky/pre-commit` — +20/-2 lines (check #9 + comment updates)
- `.omo/proposals.jsonl` — 1 append (R159 entry)

## Risk

- **No behavior change** to runtime code. Pure policy / docs / enforcement.
- **No test code change** — R60 bilingual parity test already exists; it must keep passing.
- **Pre-commit gate itself becomes stricter** — any future commit attempting to add remote CI files will FAIL check #9.

## Hardening

- Pre-commit check #9 enforces the rule locally on every commit.
- v6 SKILL.md records the rule under § Project rules, ensuring future loop iterations cannot bypass it.
- README + README.zh-CN.md document the rule so anyone reading the repo understands why no remote CI is used.

## Profile

Housekeeping. 1 user-driven round. Closes USER ISSUE #1.