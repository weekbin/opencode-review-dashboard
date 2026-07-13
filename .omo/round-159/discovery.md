# R159 Discovery — [USER ISSUE #1] ban all remote CI

## User directive (verbatim)

> .github workflow 不要使用,以后也严禁使用。如果有需要的话,完全可以用 pre-commit-hooks 替代,在本地直接执行。

## Scope

1. **Delete** `.github/workflows/typecheck.yml` and the empty `.github/` parent directory.
2. **Document the HARD RULE** in:
   - `README.md` and `README.zh-CN.md` (bilingual parity required by R60 test)
   - v6 SKILL.md (§ Project rules, marked HARD)
3. **Enforce** via pre-commit check #9 — block any future commit that adds:
   - `.github/workflows/*`
   - `vercel.json`
   - `netlify.toml`
   - `render.yaml`
4. Pre-commit header comment updated from "8 mechanical checks" to "9".

## Surfaced state

```
$ find .github -type f
.github/workflows/typecheck.yml

$ ls vercel.json netlify.toml render.yaml .vercelignore .netlify
ls: ...No such file or directory  # none of these exist
```

## Acceptance

- [ ] `rm -rf .github/` lands cleanly
- [ ] `bash .husky/pre-commit` runs check #9 and PASSes on clean tree
- [ ] `bash .husky/pre-commit` FAILS when `.github/workflows/test.yml` is staged
- [ ] `README.md` and `README.zh-CN.md` have matching "Project rules" section
- [ ] v6 SKILL.md has "## Project rules (HARD — never violate)" subsection with rule #0
- [ ] `bun test` still 1119/1119 PASS (R60 bilingual parity check must hold)

## Profile

Housekeeping (0 features / 0 bugfixes / 0 polish). Profile pivot from R154-R158 housekeeping streak. **User-driven, not self-feedback-loop.**