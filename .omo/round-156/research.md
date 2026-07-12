# R156 Research — add `src/runtime-compat.test.ts` + tighten `bun()` return type

Lightweight-round compression (≤30 LOC + ≤3 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

## Module: src/runtime-compat.ts

The runtime-compat module is the bridge between Bun (the test/dev runtime) and Node.js (the production plugin runtime). It exports:
- `IS_BUN` — boolean constant
- `bun()` — lazy lookup of `globalThis.Bun` (returns `any`)
- `fileExists(path)` — `Bun.file(p).exists()` or `fs.access(p)`
- `readFileText(path)` — `Bun.file(p).text()` or `fs.promises.readFile(p, "utf8")`
- `writeFileAtomic(path, content)` — atomic write (write to .tmp + rename)
- `which(bin)` — `Bun.which` or `which` npm package
- `serve(opts)` — `Bun.serve` or Node `http.createServer`
- `spawnDetached(...)` / `spawnText(...)` — process spawning

## Type tightening options for `bun()`

Option A: `Bun.RuntimeNamespace | undefined` (requires `@types/bun`)
- Bun has its own types: https://bun.sh/docs/cli/typescript
- Most precise

Option B: `unknown | undefined`
- Forces callers to narrow
- Safer than `any`
- No external type dependency

Option C: `any` (current)
- Least safe
- Defeats type checking

**R156 picks Option B** (`unknown | undefined`) for maximum safety + minimum external dependency. If a specific call site needs Bun-specific APIs, that site can narrow the type.

## Test coverage for `src/runtime-compat.ts`

The module has 4 categories of tests to add:
1. `IS_BUN` detection (set `globalThis.Bun` to undefined, check `IS_BUN`)
2. `bun()` lazy lookup (set `globalThis.Bun` to a fake, verify return)
3. `fileExists(path)` (test both Bun + Node paths)
4. `readFileText(path)` (test both Bun + Node paths)

Bun's actual runtime detection is complex (the test file might run in either Bun or Node). Tests should be env-agnostic — they should set up `globalThis.Bun` or leave it undefined and verify the right code path runs.

Per-SHIP append discipline preserved.