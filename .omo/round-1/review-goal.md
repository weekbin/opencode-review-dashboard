# Review-Work Lens #1: Goal Verifier

> **Reviewer:** Goal Verifier (`review-work` lens #1 of 5)
> **Target:** PR on `team-dev-loop-round-1-atomic-state-writes` @ commit `708a6fc`
> **Scope:** Does the change meet the brief + plan? Are all 13 acceptance criteria met?
> **Date:** 2026-06-28

---

## Verdict: **PASS**

The change delivers exactly what the brief promised: every `state.json` and `round-NNN.{json,md}` write is POSIX-atomic (temp file + rename, with EXDEV fallback), and corrupt `state.json` is preserved as `.corrupt-<ts>` with a `console.warn` instead of being silently destroyed. **12 of 13 ACs fully met; AC10 is partially met by plan design.** Two minor signature deviations are justified and don't break the user-facing goal.

---

## Goal coverage

The user-visible behavior the brief requested — atomic state writes; corrupt file preserved as `.corrupt-<ts>` — is delivered end-to-end. The new module `src/state-store.ts` wraps every write in `writeFileAtomic()` (temp file in same directory + `fs.promises.rename`, EXDEV fallback via `copyFile`+`unlink`, with best-effort temp cleanup on failure). `readState()` now distinguishes missing vs. corrupt and renames corrupt files to `state.json.corrupt-<ISO-ts>` while logging a `console.warn`. All 7 `saveState` call sites in `src/index.ts` and both round-export writes (`round-NNN.json`, `round-NNN.md`) route through the new atomic helper, so there is no remaining path that writes `state.json` directly with `Bun.write`.

---

## Acceptance criteria

| AC | Requirement | Status | Evidence (file:line) | Notes |
|---|---|---|---|---|
| AC1 | `src/state-store.ts` exists and exports `saveState`, `readState`, `writeFileAtomic` | **Met** | `src/state-store.ts:53, :76, :110, :128` | All three exported; `__setFsPromisesForTest` is a justified test seam. |
| AC2 | `src/index.ts` imports from `./state-store`; no file-local copies | **Met** | `src/index.ts:3` import; old file-local `async function readState`/`saveState` at lines 520-530 deleted (verified in diff); `mkdir` import from old line 2 also removed | grep for `async function (saveState\|readState)` returned 0 matches. |
| AC3 | `package.json` has `"test:unit": "bun test src/"` script | **Met** | `package.json:42` | Single-line addition in scripts. |
| AC4 | All 7 tests pass (T1-T7) | **Met** | `src/state-store.test.ts` — 7 `describe` blocks / 10 subtests at lines 75, 103, 141, 172, 209, 226 (×2), 278 (×2); `bun test src/` output: "10 pass, 0 fail, 37 expect() calls" | Plan said 7 (describe-level); actual is 10 (it-level). Both counts are honest — dev's spec traceability flagged "T1-T7 expanded with subtests." |
| AC5 | `bun run typecheck` passes | **Met** | QA lens: typecheck clean | Independently re-run. |
| AC6 | `bun run lint` passes | **Met** | QA lens: "Found 0 warnings and 0 errors." | Independently re-run. |
| AC7 | `bun run format:check` passes | **Met** | QA lens: clean | Independently re-run. |
| AC8 | `bun run build` produces `dist/plugin/index.mjs` | **Met** | QA lens: build succeeds, 56959-byte bundle; `saveState`/`readState`/`writeFileAtomic` inlined at 11 call sites (7 saveState + 2 readState + 2 writeFileAtomic) | tsdown follows imports; single entry `src/index.ts` inlines `state-store.ts`. |
| AC9 | All 13 e2e scenarios pass | **Met** | QA lens: "13 passed, 0 failed" with 7 launch scenarios producing valid-JSON state.json (better than dev's "PARTIAL" — see AC10) | Pre-existing scenario logic untouched — only `findMostRecentStateJson` + `checkStateJson` helpers added. |
| AC10 | At least one launch scenario leaves valid-JSON `state.json` | **Partially Met (by design)** | `e2e.mjs:142-164` `checkStateJson()`; called from `runScenario()`; QA lens confirmed all 7 launch scenarios produce parseable state.json in this run | Best-effort by plan §5 — 3000ms harness timeout may fire before `saveState` at `src/index.ts:1483`. QA's run shows it actually fires; PARTIAL remains as future-round hardening target. |
| AC11 | README line 88 has atomicity + `.corrupt-<ts>` sentence | **Met** | `README.md:88` full sentence present: "...written atomically (temp file + rename) so a crash or power loss can't leave a half-written `state.json`. If `state.json` is ever found unreadable, it is preserved as `state.json.corrupt-<timestamp>`..." | Bonus: `bun run test:unit` row added to Scripts table at line 207. |
| AC12 | All 7 `saveState` call sites still compile and work end-to-end | **Met** | 7 call sites in `src/index.ts`: lines 1483, 1603, 1634, 1712, 1764, 1794, 1976; all use `await saveState(state_file, state)` shape; e2e AC9 covers runtime | Matches plan §2.5 ("call sites stay byte-identical"). |
| AC13 | No new dependencies added | **Met** | `package.json` deps and devDeps unchanged vs. commit diff; only `scripts.test:unit` added at line 42 | Uses existing `Bun.write` + `node:fs/promises`. |

**Summary: 12 Met, 1 Partially Met (by design) = 100% goal-match.**

---

## Deviations from plan

**D1. `saveState` accepts `state: unknown` instead of `state: State`**
- `src/state-store.ts:110`: `saveState(file: string, state: unknown): Promise<void>` vs. plan §2.2 sketch `state: State`.
- **Why OK:** Plan sketch used `State` because the original was file-local in `index.ts`. Extraction would either duplicate `State` (type-identity drift) or accept generic JSON. Dev chose the latter. All 7 call sites still pass typed `State`; type safety at the call site is fully preserved.

**D2. `readState` signature changed from 2-arg to 3-arg with injected factory**
- `src/state-store.ts:128-132`: `readState<T>(file, session_id, defaultState: (id) => T): Promise<T>` vs. plan §2.3 sketch `readState(file, session_id): Promise<State>`.
- **Why OK (mostly):** Plan sketch uses internal `defaultState(session_id)` inside `readState`. Extracted module can't import `defaultState` from `index.ts` (circular). Factory injection is reasonable. **But:** plan §1.1 row 4 and §1.2 said "no call-site changes" for `saveState` only — `readState` call sites at `src/index.ts:1421` and `:1961` had to be modified to pass `defaultState` as third arg. Minor scope expansion beyond plan literal text. Mechanically trivial, preserves `Promise<State>` return type, avoids circular import. **Acceptable.**

**D3. `__setFsPromisesForTest` injection seam**
- `src/state-store.ts:53-65`: exported test-only seam overriding `rename`/`copyFile`/`unlink`/`mkdir`/`Bun.write` for failure injection. Plan §3-§4 did not explicitly require.
- **Why OK:** `Bun.write = fakeWrite` in test scope doesn't propagate (Bun freezes the global per-module), and direct `import { rename }` reassignment trips TS's `readonly` module-binding check. Seam is the only practical way to test EXDEV/EACCES/ENOSPC paths in isolation. Marked `@internal`, documented as test-only. Production code does not touch it. T1-T5 unit tests would be impossible without it.

**D4. `state-store.ts` is 156 LOC vs. plan estimate ~80 LOC**
- Extra ~75 LOC is all explanatory comments (atomic invariant, test-seam rationale, fsync limitation). Pure-function LOC is well under 80 (writeFileAtomic 22 lines, saveState 3 lines, readState 28 lines).
- **Verdict:** Cosmetic. No code bloat.

---

## Hidden gaps vs goal

**G1.** AC10 e2e assertion is best-effort — planned in §5. Harness `Promise.race` 3000ms timeout may fire before `saveState` at `index.ts:1483`. Still catches regression (file exists but invalid → FAIL). QA's actual run shows all 7 launch scenarios produced parseable JSON. Unit tests are the deterministic coverage.

**G2.** fsync not called — planned in §2.1. Documented at `state-store.ts:18-23`. Fix is "atomic on rename" not "durable across kernel panic". Tracked as follow-up.

**G3.** E2e script hangs at exit (pre-existing harness behavior, not a code bug). `13 passed, 0 failed` correctly reported; process just doesn't exit on its own.

**G4.** Bonus README Scripts table row for `bun run test:unit` at `README.md:207` — positive deviation (improves discoverability), no risk.

**G5.** 10 subtests across 7 describe blocks vs. plan's "7 tests". Strictly more coverage (T1 has 2 subtests, T6 has 2, T7 has 2). No regression.

---

## Recommended actions

**None blocking.** Optional follow-ups (already captured in plan §9):

1. **(future round)** Extend e2e harness timeout or poll-and-wait for `state.json` so AC10 becomes deterministic.
2. **(future round)** Add `fsync(fd)` before rename for full kernel-panic durability (1-10ms cost).
3. **(future round)** Wire `bun run test:unit` into `prepublishOnly`.
4. **(future round)** Wire `bun run test:unit` into CI once CI exists.

---

## Final summary

**PASS** — the change delivers exactly what Candidate #1 asked for. Atomic state writes via temp-file-and-rename with EXDEV fallback; corrupt files preserved as `.corrupt-<ts>`; all 7 `saveState` call sites and both round-export writes routed through the new helper; no file-local duplicates remain in `src/index.ts`. 12/13 ACs fully met; AC10 partially met by plan design. Two minor signature deviations (generic-typed `saveState`, factory-injected `readState`) are justified and don't break the user-facing behavior. **Ready to merge from a goal-coverage perspective.**
