# scripts/ — validation and tooling

**Parent:** [`/AGENTS.md`](../AGENTS.md). This file covers only what is unique inside the `scripts/` tree.

## OVERVIEW
Operational scripts that gate SHIP and exercise the plugin end-to-end. Standalone Node ESM helpers live next to the more elaborate Playwright harness under `test-review-ui/`.

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Plugin-load SHIP gate | `scripts/verify-plugin-load.mjs` | 3-gate runtime probe |
| Round artifact count gate | `scripts/check-rounds.mjs` | Profile-aware (bugfix ≥3, feature ≥8) |
| Cross-round state path invariant | `scripts/verify-effective-scope.mjs` | Asserts `state.json` does not drift |
| Sandbox-safe typecheck wrapper | `scripts/typecheck.sh` | Shells out to `bun run typecheck` |
| End-to-end UI harness | `scripts/test-review-ui/` | See its child `AGENTS.md` |

## CONVENTIONS
- Scripts are Node ESM (`*.mjs`) or POSIX shell; they intentionally fall outside the `tsconfig.json#include: ["src"]` boundary.
- Scripts that probe a built `dist/` must run after `bun run build`; pre-commit gate #6 enforces this for the plugin-load gate.
- Script entry points use either an explicit `main()` + `.catch(...)` pattern (`verify-plugin-load`, `check-rounds`) or top-level await (`verify-effective-scope`); pick whichever the script's flow demands and stay consistent inside the file.
- Anything reusable by a sub-agent shell out to `bun run`; do not reimplement scripts in Python or shell.

## ANTI-PATTERNS
- Do not introduce a CI configuration file (`.github/workflows/`, `vercel.json`, `netlify.toml`, `render.yaml`); pre-commit gate #9 will block the commit.
- Do not bypass `scripts/verify-plugin-load.mjs` before declaring SHIP; failure ⇒ write `.omo/round-N/load-blocked.md` and HARD STOP.
- Do not use `scripts/test-review-ui/take-screenshots.mjs`; the canonical screenshot tool is `take-screenshots.sh` (R1 retro).

## NOTES
- Mock-server convention: `scripts/test-review-ui/mock-server.py` listens on port `8890` for interactive Playwright work and `8891` for the bundled `state-endpoint.test.mjs` integration test.
- `scripts/typecheck.sh` exists so subagents in sandboxed environments without `bun` on PATH can still typecheck.