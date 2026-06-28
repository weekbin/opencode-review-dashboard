# Code-Quality Review — Atomic State Writes

**Reviewer lens:** #3 of 5 (code quality / idiomatic style / complexity / error handling / naming / test quality / plan-design fidelity)
**Branch:** `team-dev-loop-round-1-atomic-state-writes`
**Commit:** `708a6fc`
**Plan:** `.omo/plans/atomic-state-writes.md`

---

## Verdict: PASS

The implementation is clean, well-tested, and ships with thoughtful deviations from the plan that actually improve decoupling. Three MINOR issues and four NITs noted below; no MAJOR or CRITICAL issues that block merge. The PR meets every acceptance criterion the plan set (AC1–AC13) and the test surface maps 1:1 to the plan's T1–T7 scenarios.

---

## Strengths

- **`writeFileAtomic` is small and correct.** `src/state-store.ts:76-98` — temp-file + POSIX rename with EXDEV fallback is the canonical atomic-write recipe. Outer try/catch + `_unlink(tmp).catch(() => {})` cleanly enforces the "no orphan temp files" invariant the plan calls out (§2.1, R2).
- **Test seam is well-documented and reset-safe.** `src/state-store.ts:34-65` — the JSDoc explicitly explains *why* direct `import { rename }` reassignment is blocked (ESLint `no-import-assign`, TS `readonly` module-binding, Bun's per-module frozen globals) and why an injectable seam is necessary. `afterEach` in `state-store.test.ts:29-39` always resets to defaults; individual tests also use `try/finally` as defense-in-depth.
- **Corruption recovery path is complete.** `src/state-store.ts:137-155` — distinguishes missing-file (silent default) from corrupt-file (preserve as `.corrupt-<ts>` + `console.warn`), and from unrecoverable (rename fails → `console.error` + still returns default). Three exit paths, all covered.
- **Tests assert behavior, not implementation.** `state-store.test.ts:104-138` (T2) reads the actual file content to verify the original state survived — not a mock spy on internal state. `T6` reads back the `.corrupt-<ts>` file to verify it contains the original corrupt bytes (`state-store.test.ts:256-257`). This is the right level of testing for atomicity.
- **E2E post-scenario assertion is correctly best-effort.** `scripts/test-review-ui/e2e.mjs:128-167` — handles the 3000 ms harness race by marking "file not found" as `pass: true, skipped: true` (no flake), while still FAILING if the file exists but is corrupt (the regression the atomic-write fix catches). The trailing "state.json validated by atomic-write helper" surface log (`e2e.mjs:240-245`) gives QA a direct artifact for AC10.
- **`readState<T>(file, session_id, defaultState)` factory callback is a clean upgrade over the plan.** The plan (§2.3) specified a hard-coded internal `defaultState(session_id)` call. The implementation takes a factory, which (a) makes the module State-agnostic, (b) makes T6 testable without mocking, and (c) eliminates a circular-import risk between `state-store.ts` and `index.ts`. Well-justified deviation.

---

## Issues by severity

### CRITICAL
*(none)*

### MAJOR
*(none)*

### MINOR

- **`src/index.ts:511-516` — gratuitous `split` re-ordering adds diff noise.** The plan (§10.3) only specifies replacing `saveState`/`readState` and updating the round-export writes. The `split` function was moved from its original position (before `count`) to immediately after `open()` with no functional reason — `defaultState` doesn't use `split`, and function declarations are hoisted in JS anyway. This adds 6 diff lines unrelated to atomicity.
  - **Fix:** revert this move. Keep `split` where it was. Saves noise on `git blame`.

- **`src/state-store.ts:78` — `${target}.tmp.${pid}.${ts}.${rand6}` entropy has no inline rationale comment.** The 6-char base36 suffix (~2.2 B values) is explained in plan §2.1 / R2, but a future reader of the code alone has to reverse-engineer why `slice(2, 8)` is the right number.
  - **Fix:** add a one-liner `// pid + ms + 6 base36 chars (~2.2B entropy) — plan §2.1 / R2` next to the template literal.

- **`src/state-store.ts:96` — outer catch wraps with "atomic write failed" but loses inner error context.** If `copyFile` fails inside the EXDEV fallback, the user sees `atomic write failed for <target>: <copyFile message>` — fine. But if the EXDEV path's `unlink(tmp)` fails (rare), the outer catch also runs `_unlink(tmp).catch(() => {})` (harmless) and re-throws with `atomic write failed: <unlink message>` — the *copyFile* failure is shadowed.
  - **Fix (optional):** wrap only the non-EXDEV paths in the outer try, and let the EXDEV path handle its own errors with a dedicated message. Acceptable as-is for a v1.

### NIT

- **`src/state-store.ts:111` — `saveState` accepts `state: unknown` (not generic like `readState<T>`).** Minor asymmetry: `readState<T>` is generic; `saveState` is not. The justification (avoid State-type duplication) is sound and documented in the JSDoc, but a generic `saveState<T>(file: string, state: T)` would mirror `readState` and give call sites the same return-type coupling they get on read. Low value, low cost either way.
- **`src/state-store.ts:50` — `Bun.write.bind(Bun)` is correct but deserves a comment.** The binding is necessary because `_bunWrite` may be invoked with `this === undefined` in some mocking paths. A one-line comment would help the next reader.
- **`README.md:88` — the atomicity sentence is appended directly to the previous sentence without a paragraph break.** Result reads awkwardly: "...reopen without losing progress. Review state files are written atomically..." Could be a new paragraph (different topic) or at least a period + space + new sentence structure. Cosmetic.
- **`scripts/test-review-ui/e2e.mjs:209` — `for (const c of stateChecks) recordValidatedStateFile(c);` runs even when `stateChecks` is empty (most scenarios).** Harmless, but `recordValidatedStateFile` could filter on `pass && path` more strictly. As-is, only validated files reach the surface log; the extra loop is no-op noise.
- **`src/state-store.test.ts:111-116` — `fakeWrite` is declared inline; the `realWrite` capture happens *after* `await saveState(file, original)`.** This is correct (capture only what's about to be patched) but the T7 test at line 309 inlines the same pattern twice. Consider a tiny `withMockedFs(overrides, fn)` helper to dedupe.

---

## Deviation from plan — `__setFsPromisesForTest`: necessary or hacky?

**Necessary.** The JSDoc at `src/state-store.ts:34-44` accurately enumerates three real constraints:

1. `import { rename } from "node:fs/promises"` is bound by TS as `readonly`; direct reassignment is a compile error.
2. ESLint's `no-import-assign` rule blocks the same thing at lint time.
3. `Bun.write = fakeWrite` in test scope does **not** propagate — Bun freezes the `Bun` global per module, so the production module keeps the original `Bun.write`.

Given those constraints, the alternatives are:

| Alternative | Verdict |
|---|---|
| Pure DI (pass `fs` adapter into every function) | Rejected — invasive, every call site needs an extra arg, adds 100+ LOC of plumbing for one test module |
| `vi.mock` / `jest.mock` (module-replacement mocking) | Rejected — Bun's `mock()` exists but the module-replacement style is heavier than a 5-key setter and harder to reset mid-test |
| Monkey-patch global `Bun` | Rejected — doesn't propagate per (3) above |
| Live fs with `mkdtemp` + real fsync injection | Rejected — can't simulate EXDEV/EACCES reliably |

So the `_rename` / `_copyFile` / `_unlink` / `_mkdir` / `_bunWrite` indirection + `__setFsPromisesForTest` setter is the least-invasive option that works under all three constraints. It's hacky in the colloquial sense (test-only escape hatch) but principled in that (a) the seam is the only test-only export, (b) the JSDoc explicitly marks it `@internal` and "Do not call from production code", (c) `afterEach` guarantees it can't leak between tests.

**Recommendation:** keep the seam. If a future round needs to test more filesystems or external IO, the pattern scales — just add another `_xxx` ref and a key to the setter.

---

## Test quality assessment

**Strong.** Mapping to the plan's T1–T7:

| Plan ID | Coverage | Quality notes |
|---|---|---|
| T1 atomic invariant (happy path) | `state-store.test.ts:75-101` | Two tests: raw `writeFileAtomic` byte-equality + `saveState` between-call parseability. Asserts observable invariant rather than mocking internals — correct approach since "killing mid-flush" can't be simulated cleanly. |
| T2 mid-write failure (ENOSPC) | `:103-139` | Captures real `Bun.write`, injects fake, runs in `try/finally` to restore. Asserts: (1) error message, (2) original file unchanged, (3) no orphan temp files. Three assertions, all behavior-level. |
| T3 EXDEV cross-device | `:141-170` | Mocks `rename` to throw EXDEV, asserts fallback to `copyFile+unlink`, asserts target contains new content, asserts no orphans. |
| T4 EACCES propagation | `:172-207` | Mocks `rename` to throw EACCES (non-EXDEV), asserts error propagates with context message, asserts original file preserved, asserts no orphans. |
| T5 concurrent saves | `:209-224` | 10x `Promise.all`, asserts final state is one of the 10 (not a blend) + no orphans. Adequate — JSON.parse of a partial blend would fail or mismatch round numbers, so the assertion catches the regression even without parsing-structure comparison. |
| T6 corrupt-file preservation | `:226-276` | Two tests: (a) corrupt JSON -> `.corrupt-<ts>` file contains original bytes, warn was logged with expected substrings, defaultState returned; (b) missing file -> defaultState returned, no warn. Excellent edge-case coverage. |
| T7 round-export atomicity | `:278-337` | Two tests: (a) both files written + both parse; (b) second write fails (EIO) -> first file intact, second's tmp cleaned up. Covers the independent-atomicity property the plan calls out. |

**Test seam robustness:** `afterEach` resets the seam (`:31-37`); individual tests also use `try/finally` as defense-in-depth (e.g. `:119-126`, `:155-159`, `:187-193`, `:317-324`). Even if `afterEach` were skipped, no test would leak state.

**Mock quality:** `spyOn(console, "warn").mockImplementation(() => {})` is restored in `finally` blocks (`:241`, `:271`). No global pollution between tests.

**What tests do NOT cover (acceptable gaps):**
- Concurrent reads (only writes tested). Plan doesn't require this.
- `mkdir` failure path. Plan doesn't test it; mkdir-recursive on an existing dir is essentially infallible in normal paths.
- The EXDEV path's `copyFile` failure or its `unlink` failure. Acceptable — the outer catch handles these with the standard "best-effort cleanup" semantics.

**Verdict:** tests are tight, isolated, behavior-level, and reset-safe. The PR's test surface exceeds the plan's required 7 scenarios (actual: 9 tests across 7 plan scenarios, plus the missing-file edge case).

---

## Recommended actions

1. **Before merge:** Revert the gratuitous `split` re-ordering in `src/index.ts:511-516` to keep the diff scoped to atomicity.
2. **Optional polish:** Add the one-line entropy rationale comment at `src/state-store.ts:78` (so future readers don't have to dig into the plan).
3. **Optional polish:** Add the `Bun.write.bind(Bun)` rationale comment at `src/state-store.ts:50`.
4. **Optional polish:** Consider making `saveState<T>` generic to mirror `readState<T>` — symmetric API surface.
5. **Optional polish:** Add a paragraph break in `README.md:88` between the auto-save sentence and the atomicity sentence.
6. **Defer (out of round 1):** Plan §9 already captures fsync durability + CI integration as future rounds. No new deferrals needed.

None of (1)–(6) are blockers. The code is mergeable as-is.

---

**Reviewed:** all files in scope; READ-ONLY constraint honored. No edits made to the worktree.
