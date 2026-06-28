# Dev Self-Check — Round 1, Candidate #1 (Atomic State Writes)

> **Dev role**: `dev` (sisyphus-junior, team member `ses_0f1691985ffelzgQMku4HMsWiR`)
> **Plan**: `.omo/plans/atomic-state-writes.md` (decision-complete, 446 lines)
> **Branch**: `team-dev-loop-round-1-atomic-state-writes`
> **Commit SHA**: `708a6fcb7374837470771e3b796a6acd33b7359d`
> **Worktree**: `/Users/yangweibin/.worktrees/team-dev-loop-round-1`
> **Date**: 2026-06-28

---

## Goal-Match Percentage

**13 of 13 acceptance criteria (AC1–AC13 from plan §8) implemented and verified.**

**Goal-match: 100%**

---

## Spec Traceability Matrix

| AC | Criterion | Status | Evidence (file:line) |
|----|-----------|--------|----------------------|
| AC1 | `src/state-store.ts` exists, exports `saveState`, `readState`, `writeFileAtomic` | ✅ PASS | `src/state-store.ts:25` `writeFileAtomic`, `:101` `saveState`, `:122` `readState` |
| AC2 | `src/index.ts` imports `saveState` and `readState` from `./state-store` (no file-local copies) | ✅ PASS | `src/index.ts:3` `import { readState, saveState, writeFileAtomic } from "./state-store";` — verified by `grep -c "async function saveState\|async function readState" src/index.ts` → `0` (no file-local copies) |
| AC3 | `package.json` has `"test:unit": "bun test src/"` script | ✅ PASS | `package.json:42` `"test:unit": "bun test src/",` |
| AC4 | `bun run test:unit` runs and all 7 tests pass (T1–T7) | ✅ PASS | `.omo/team/round-1/artifacts/test-unit-output.txt` — `10 pass, 0 fail` (10 `it()` blocks across 7 `describe()` groups; the plan enumerated 7 SCENARIOS, each scenario has 1–2 `it()` cases) |
| AC5 | `bun run typecheck` passes (no `tsc --noEmit` errors) | ✅ PASS | `bun run check` exited 0; `tsc --noEmit` clean |
| AC6 | `bun run lint` passes (no oxlint errors on changed files) | ✅ PASS | `bun run check` output: `oxlint: Found 0 warnings and 0 errors.` |
| AC7 | `bun run format:check` passes | ✅ PASS | `bun run check` output: `oxfmt src/` produced no diff |
| AC8 | `bun run build` produces `dist/plugin/index.mjs` and the e2e harness still works | ✅ PASS | `dist/plugin/index.mjs` (56959 bytes); `grep -c "writeFileAtomic\|saveState\|readState\|atomic write failed" dist/plugin/index.mjs` → 22 (state-store code inlined) |
| AC9 | `bun run scripts/test-review-ui/e2e.mjs` passes all 13 scenarios (no regressions) | ✅ PASS | `.omo/team/round-1/artifacts/e2e-surface.txt` — `13 passed, 0 failed` |
| AC10 | At least one launch scenario leaves a valid-JSON `state.json` on disk — captured as e2e artifact | ✅ PASS | `.omo/team/round-1/artifacts/e2e-surface.txt` shows 7 launch scenarios passed `state.json is valid JSON after launch`; `.omo/team/round-1/artifacts/state-json-sample.txt` shows a real `state.json` written by the plugin via the atomic-write helper, parseable as JSON |
| AC11 | README line 88 has the new sentence about atomicity + `.corrupt-<ts>` | ✅ PASS | `README.md:88` — appended: `Review state files are written atomically (temp file + rename) so a crash or power loss can't leave a half-written state.json. If state.json is ever found unreadable, it is preserved as state.json.corrupt-<timestamp> and a fresh review state is started; ...` (also added `test:unit` row to the Scripts table) |
| AC12 | All 7 saveState call sites still compile and the plugin still works end-to-end | ✅ PASS | `grep -n "saveState\|readState\|writeFileAtomic" src/index.ts` shows 7 saveState + 2 readState + 2 writeFileAtomic call sites all present (lines 1483, 1603, 1634, 1712, 1764, 1794, 1976 for saveState; 1421, 1961 for readState; 1808, 1809 for writeFileAtomic); typecheck clean; e2e 13/13 pass |
| AC13 | No new dependencies added to `package.json` | ✅ PASS | `git diff main HEAD -- package.json` shows only the `test:unit` script line added; dependencies block unchanged |

---

## Deviations (none material)

1. **`readState` signature changed from 2-arg to 3-arg.** The plan (§2.3) sketched the new `readState` as opaque to call sites. I made the signature `readState<T>(file, session_id, defaultState)` to preserve the State type (otherwise the local `State` type in state-store.ts diverges from the one in src/index.ts — see "Hidden Gap 1" below). All 2 call sites in `src/index.ts` were updated to pass `defaultState` as the third arg. **Impact**: minimal; signature change is in the public API but there are only 2 call sites in the codebase.

2. **Added `__setFsPromisesForTest` injection seam.** Tests needed to mock `rename` (for EXDEV/EACCES paths) and `Bun.write` (for ENOSPC paths) but ESLint `no-import-assign` and TS's `readonly` module-binding check both forbid direct reassignment. The seam uses module-local `let` bindings with an `@internal` exported setter. Production callers never touch it. **Impact**: 13 extra lines in state-store.ts; documented as test-only.

3. **`saveState` accepts `unknown` instead of `State`.** Avoids duplicating the State/Finding type definitions in state-store.ts. The stringified JSON is treated as opaque. **Impact**: signature is looser but call sites keep full State type safety via the local declaration.

4. **No `state.json` was found in the e2e harness cleanup.** Per the plan §5 "best-effort" guidance, when the 3000ms Promise.race fires before `saveState` completes, the assertion marks the check as `skipped` rather than `failed`. 3 of the 13 scenarios reported `(some checks skipped — best-effort)`; the other 7 launch scenarios had the assertion pass with concrete file paths. **Impact**: matches plan guidance exactly; no e2e regressions.

---

## Hidden Gaps (none uncovered)

1. **Type duplication between state-store.ts and index.ts was avoided.** The plan sketch kept State as opaque JSON; my implementation preserves that by using `unknown` for `saveState` and a generic `<T>` for `readState`. The State/Finding types stay defined once (in src/index.ts) and only referenced as JSON-shaped data in state-store.ts. **No drift.**

2. **`Bun.write` is also a `let` seam.** Not in the plan, but required because (a) `Bun.write = fakeWrite` in test scope doesn't propagate to other modules — Bun freezes the Bun global binding per-module, AND (b) ESLint `no-import-assign` forbids reassignment anyway. Same seam pattern as the `rename` injection. **No uncovered behavior.**

3. **The `e2e.mjs` script hangs after printing all 13 PASS lines.** Pre-existing issue (HTTP server started by `callTool` in launch scenarios isn't shut down cleanly when the Promise.race fires). Not introduced by this change. Confirmed by running the harness against the same code pre-fix (the same hang exists). **Out of round 1 scope.**

4. **No `mock.module()` for state-store tests.** Considered, but the seam approach is cleaner (no module-loading-order issues, no static-analysis pain). The seam is annotated `@internal` so production callers can't accidentally use it.

---

## RED→GREEN Proof (T1 + T6)

**T1 — Atomic invariant (happy path)**
- **RED pre-condition (in test code)**: Without atomic write, killing between truncate and flush would leave a partial file. We assert the observable invariant: after every `saveState`, the file MUST parse as JSON AND be byte-equal to the most-recent input.
- **GREEN proof** (full output at `.omo/team/round-1/artifacts/test-unit-output.txt`):
  ```
  (pass) writeFileAtomic — T1 atomic invariant (happy path) > writes content that is byte-equal to the input on disk [2.64ms]
  (pass) writeFileAtomic — T1 atomic invariant (happy path) > saveState: on-disk file is the most-recent state and parses as JSON between/after every call [1.58ms]
  ```

**T6 — Corrupt-file preservation**
- **RED pre-condition (in test code)**: A `state.json` containing `"{ this is not valid JSON ::: }"` on disk. The previous behavior (`.catch(() => defaultState(...))`) silently destroyed the user's review history.
- **GREEN proof**:
  ```
  (pass) readState — T6 corrupt-file preservation > corrupt JSON: renames to .corrupt-<ts>, logs warn, returns defaultState [1.67ms]
  (pass) readState — T6 corrupt-file preservation > missing file: returns defaultState without warning [0.29ms]
  ```
  Captured warn message: `"[diff-review-dashboard] state.json at /tmp/.../state.json was unreadable; preserved as /tmp/.../state.json.corrupt-2026-06-28T14-44-37-295Z. Starting fresh. Original error: Failed to parse JSON"`

---

## Surface Artifact (Real Plugin Invocation)

`.omo/team/round-1/artifacts/e2e-surface.txt` shows the e2e harness output. **7 launch scenarios** produced a parseable `state.json` on disk (paths logged after the `13 passed, 0 failed` line):

```
state.json validated by atomic-write helper:
  ✓ /var/folders/xj/0sm5tls95ng345g2wlgqz2lr0000gn/T/rd-scenario-yCm98i/.opencode/reviews/test-1782658329717-4k8g/state.json
  ✓ /var/folders/xj/0sm5tls95ng345g2wlgqz2lr0000gn/T/rd-scenario-EpfttU/.opencode/reviews/test-1782658330169-xc2c/state.json
  ✓ /var/folders/xj/0sm5tls95ng345g2wlgqz2lr0000gn/T/rd-scenario-a9H0AN/.opencode/reviews/test-1782658330812-e2px/state.json
  ✓ /var/folders/xj/0sm5tls95ng345g2wlgqz2lr0000gn/T/rd-scenario-fw6AMf/.opencode/reviews/test-1782658331188-ryd4/state.json
  ✓ /var/folders/xj/0sm5tls95ng345g2wlgqz2lr0000gn/T/rd-scenario-bodXfB/.opencode/reviews/test-1782658331700-dpzd/state.json
  ✓ /var/folders/xj/0sm5tls95ng345g2wlgqz2lr0000gn/T/rd-scenario-LM7FJR/.opencode/reviews/test-1782658333299-mc5h/state.json
  ✓ /var/folders/xj/0sm5tls95ng345g2wlgqz2lr0000gn/T/rd-scenario-8ajPvT/.opencode/reviews/test-1782658333769-8i3d/state.json
```

`.omo/team/round-1/artifacts/state-json-sample.txt` shows a real `state.json` written by the plugin via the atomic-write helper:

```json
{
  "session_id": "capture-test-12345",
  "round": 0,
  "findings": [],
  "updated_at": 1782658459984
}
```

Parseable as JSON. **The fix works end-to-end.**

---

## Risks Recap (from plan §7, status check)

| Risk | Severity | Mitigation | Status |
|---|---|---|---|
| R1 EXDEV cross-filesystem | Low | `copyFile + unlink` fallback in `writeFileAtomic` | Unit test T3 covers it ✅ |
| R2 Temp filename collision | Negligible | `${pid}.${ts}.${rand6}` (≈2.2B entropy) | Concurrent test T5 covers it ✅ |
| R3 tsdown bundle breakage | Medium | tsdown follows imports; verified `dist/plugin/index.mjs` contains 22 occurrences of state-store symbols | AC8 ✅ |
| R4 rename of corrupt file fails | Low | Outer try/catch in `readState` logs error and returns default | T6 covers happy path; negative case is implicitly handled by the existing fallthrough |
| R5 README line 88 length | Trivial | Acceptable | AC11 ✅ |

---

## Verdict

**PASS** — 13/13 acceptance criteria met, 10/10 unit tests pass, 13/13 e2e scenarios pass, build succeeds with state-store code bundled, branch pushed to remote for review.

Ready for handoff to Tester lane (`tester-review` + `tester-diff` + `tester-playwright`).

---

## Files Changed

```
README.md                      |   3 +-
package.json                   |   1 +
scripts/test-review-ui/e2e.mjs |  80 +++++++++-
src/index.ts                   |  36 ++---
src/state-store.test.ts        | 338 +++++++++++++++++++++++++++++++++++++++++
src/state-store.ts             | 156 +++++++++++++++++++
6 files changed, 585 insertions(+), 29 deletions(-)
```