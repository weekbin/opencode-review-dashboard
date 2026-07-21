# src/ — plugin runtime, persistence, and shared helpers

**Parent:** [`/AGENTS.md`](../AGENTS.md). This file covers only what is unique inside `src/`.

## OVERVIEW

Node-side TypeScript for the OpenCode plugin: HTTP server, atomic state persistence, Bun/Node portability shim, and a small set of pure helpers reused by the UI bundle.

## WHERE TO LOOK

| Task                                               | Location                                                                                     | Notes                                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Plugin factory and slash-command/tool registration | `src/index.ts`                                                                               | Default export `{ id, server }` at line 2942                                                     |
| HTTP server lifecycle (Bun or Node)                | `src/runtime-compat.ts`                                                                      | `serve()` at line 316                                                                            |
| File/process/portability primitives                | `src/runtime-compat.ts`                                                                      | `fileExists`, `readFileText`, `readFileJson`, `writeFile`, `which`, `spawnText`, `spawnDetached` |
| Review state read/write                            | `src/state-store.ts`                                                                         | `readState`, `saveState`, `writeFileAtomic`                                                      |
| Pure helpers reused by UI                          | `src/sort-utils.ts`, `src/search-utils.ts`, `src/format-utils.ts`, `src/sidebar-keyboard.ts` | UI imports these from `../...`                                                                   |
| Unit tests                                         | `src/*.test.ts`                                                                              | Co-located bun:test files; many use `r<N>-...` round names                                       |

## CODE MAP

| Symbol                    | Type            | Location                    | Role                                                                        |
| ------------------------- | --------------- | --------------------------- | --------------------------------------------------------------------------- |
| `DiffReviewPlugin`        | export/function | `src/index.ts:1648`         | Plugin factory wired to `default`                                           |
| `default`                 | export          | `src/index.ts:2942`         | `{ id: "diff-review-dashboard", server }` shape required by OpenCode loader |
| `saveState` / `readState` | functions       | `src/state-store.ts`        | Atomic `state.json` boundary                                                |
| `writeFileAtomic`         | function        | `src/state-store.ts`        | Rename-from-tmp pattern                                                     |
| `serve`                   | function        | `src/runtime-compat.ts:316` | Bun/Node/edge HTTP adapter                                                  |
| `spawnDetached`           | function        | `src/runtime-compat.ts`     | Opens browser in detached child process                                     |
| `sortConversationEntries` | function        | `src/sort-utils.ts`         | Severity/file/round reducer; re-exported by `src/ui/app.ts`                 |

## CONVENTIONS

- All Bun-specific APIs (`Bun.write`, `Bun.serve`, `Bun.spawn`) are forbidden at module top level; route through `src/runtime-compat.ts`.
- All filesystem writes for `state.json` go through `writeFileAtomic`; raw `fs.writeFile` is not acceptable for state files.
- Server-side test coverage lives next to each module as `*.test.ts`; do not create a parallel `tests/` tree.
- Browser-side modules inside `src/ui/` import the helpers above from `../<name>`; preserve that import path so the bundler treats them as shared code.

## ANTI-PATTERNS

- No `Bun.*` at top level (R32 lesson); test the plugin under Node with `node scripts/verify-plugin-load.mjs` before SHIP.
- No `fsync(fd)` before rename in `state-store`; the atomic-rename invariant is intentional and tracked as a follow-up.
- Never silently drop a corrupt `state.json`; preserve it as `state.json.corrupt-<ISO timestamp>` and fall back to a fresh state.
- Do not change the `{ id, server }` default export shape; `scripts/verify-plugin-load.mjs` HARD-STOPS SHIP if it regresses.
- Do not call `addEventListener` / DOM globals here; this layer is Node-only.

## NOTES

- `src/runtime-compat.ts` is the only safe place to add Bun-aware branches; new helpers should mirror its `if (IS_BUN) { ... } else { ... }` shape.
- `state.json` sits at the project root and is rewritten atomically on every mutation endpoint (`/finding`, `/resolve`, `/react`, `/draft`, `/submit`, etc.).
- Round exports `round-NNN.json` and `round-NNN.md` are written by the submit path; do not introduce alternative locations.
- The UI bundle (`src/ui/app.ts`) imports `sortConversationEntries`, `sidebar-keyboard`, and `search-utils` from this directory; removing or renaming these breaks the dashboard build.
