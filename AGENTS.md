# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-22
**Commit:** 886d901
**Branch:** main

## OVERVIEW
Single-package Bun/TypeScript OpenCode plugin with two ESM bundles: a Node-side review server and a vanilla browser dashboard. The package uses tsdown, oxlint, oxfmt, Bun tests, and a local Husky gate instead of remote CI.

## STRUCTURE
```text
opencode-review-dashboard/
├── src/                      # plugin runtime, persistence, shared helpers, UI
│   └── ui/                   # browser dashboard and UI-focused tests
├── scripts/                  # validation and test tooling
│   └── test-review-ui/       # git-scenario + mock-server Playwright harness
├── dist/                     # committed package artifacts
├── .husky/                   # local pre-commit gate
├── .opencode/skills/         # tracked project skills
├── .omo/                     # tracked round artifacts and loop state
├── docs/                     # design/process documentation
└── package.json              # Bun scripts and package exports
```

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Plugin entry and HTTP endpoints | `src/index.ts` | `DiffReviewPlugin`; large runtime monolith |
| Bun/Node portability | `src/runtime-compat.ts` | Route file I/O, process, browser-open, and serving through this boundary |
| Atomic review state | `src/state-store.ts` | `state.json` persistence and corrupt-file recovery |
| Dashboard entry | `src/ui/app.ts` | Browser module; top-level `init()` invocation |
| UI strings | `src/ui/i18n.ts` | EN/zh-CN source of truth |
| UI end-to-end scenarios | `scripts/test-review-ui/` | `e2e.mjs`, `scenarios.mjs`, `mock-server.py` |
| Commit gate | `.husky/pre-commit` | Local authoritative gate; do not add remote CI |
| Visual rules | `DESIGN.md` | State colors, spacing, motion, typography |
| Loop rules | `.opencode/skills/team-dev-loop/SKILL.md` | v6 workflow and artifact policy |

## CODE MAP
CodeGraph is indexed; TypeScript LSP is unavailable in this environment.

| Symbol | Type | Location | Role |
|---|---|---|---|
| `DiffReviewPlugin` | export/function | `src/index.ts:1648` | OpenCode plugin factory, command/tool registration, server lifecycle |
| `default` | export | `src/index.ts:2942` | PluginModule `{ id, server }` contract |
| `serve` | function | `src/runtime-compat.ts:316` | Bun/Node HTTP adapter used by runtime entry |
| `saveState` / `readState` | functions | `src/state-store.ts` | Atomic state boundary consumed by runtime handlers |
| `init` | function | `src/ui/app.ts:7041` | Dashboard initialization; called at module load |
| `DiffVirtualizer` | class | `src/ui/diff-virtualization.ts:27` | IntersectionObserver hunk virtualization |
| `t` / `translate` | functions | `src/ui/i18n.ts` | Bilingual UI translation surface |
| `SCENARIOS` | export | `scripts/test-review-ui/scenarios.mjs` | 34 git fixture definitions for e2e testing |

## CONVENTIONS
- Use Bun for package scripts, tests, and dependency lockfile; do not introduce npm/pnpm/yarn commands.
- Format with `oxfmt`, lint with `oxlint`; no Prettier, ESLint, or Biome configuration exists.
- TypeScript is strict, `noEmit`, Bun-configured, and includes `src/` only. Scripts are checked by their own runtime/tests.
- `tsdown.config.ts` builds `src/index.ts` for Node and `src/ui/app.ts` for the browser; the build then copies `src/ui/review.html`.
- Tests are co-located (`*.test.ts`); many regression tests use `r<N>-...` names tied to loop rounds.
- `dist/` is intentionally committed and shipped; do not treat it as disposable ignored output.
- Keep `README.md` and `README.zh-CN.md` synchronized for user-facing behavior.

## ANTI-PATTERNS (THIS PROJECT)
- Do not add `.github/workflows/`, `vercel.json`, `netlify.toml`, or `render.yaml`; the pre-commit gate forbids remote CI/hosting configuration.
- Do not use Bun-only APIs at module top level in the plugin; route portability-sensitive operations through `src/runtime-compat.ts`.
- Do not add a top-level `id` to `opencode.json` for the `file:.` plugin registration.
- Do not reintroduce the removed `execCommand` clipboard fallback.
- Do not silently discard corrupt `state.json`; preserve the corrupt file and use the state-store recovery path.
- Do not remove existing public helper methods or fields where the local tests define additive compatibility.
- Do not commit stale `*.backup-*`, `*.swp`, `*.orig`, or `*.tmp.*` files.

## COMMANDS
```bash
bun run build
bun run check                 # format:check + lint + typecheck
bun run test:unit             # bun test src/
bun run test:ui               # 34-scenario UI harness
node scripts/verify-plugin-load.mjs
bash .husky/pre-commit        # full local gate
```

## NOTES
- The pre-commit hook formats `src/` before running tests to detect formatter-induced anchor drift, then runs lint and typecheck.
- Plugin load depends on the built `dist/` and the `{ id, server }` default export shape.
- Review state is project-root `state.json`, written atomically; round exports are `round-NNN.json` and `round-NNN.md`.
- For Playwright testing, use the project harness and its cleanup rules; the mock server convention is port 8890.
- `.omo/round-N/` and `.omo/proposals.jsonl` are workflow artifacts, not application modules; avoid generating additional guidance beneath round archives.
