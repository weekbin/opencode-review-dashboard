# R159 Research — [USER ISSUE #1] ban all remote CI

User-driven rule, no research needed beyond the obvious:

- `.github/workflows/typecheck.yml` only runs `bun run typecheck` (1 step). This is fully subsumed by `.husky/pre-commit` check #8 (`bun run lint + bun run typecheck`), which runs on every commit.
- No other CI platforms are configured (`vercel.json`, `netlify.toml`, `render.yaml`, `.vercelignore`, `.netlify` — all absent).

Lightweight compression (per v6 SKILL, ≤1 file modification per scope): research lives in `discovery.md` ## Surfaced state section.