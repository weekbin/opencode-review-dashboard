# QA / Hands-on Verification — Round 1, Candidate #1: Atomic State Writes

> **Verifier:** QA / Hands-on Verifier (Review-Work lens #2 of 5)
> **Date:** 2026-06-28
> **Worktree:** `/Users/yangweibin/.worktrees/team-dev-loop-round-1`
> **Branch:** `team-dev-loop-round-1-atomic-state-writes`
> **Commit:** `708a6fc`
> **Dev self-check:** `.omo/team/round-1/dev-self-check.md` (PASS)

---

## Verdict: **PASS**

Every gate in the brief ran green and the atomicity guarantee was observed end-to-end on a real filesystem:
- format / lint / typecheck clean
- 10/10 unit tests pass (T1–T7 with subtests)
- 13/13 e2e scenarios pass, with 7 launch scenarios actually leaving valid JSON state on disk
- `dist/plugin/index.mjs` inlines all 11 expected call sites
- Ad-hoc corruption round-trip: write → overwrite → corrupt → read → default + preserved corrupt file all behave as specified

No code was modified in the worktree. Test artifacts live in `/tmp/atomic-test-98615/` and `/tmp/qa-evidence/`.

---

## Commands run + results

| # | Command | Status | Key output excerpt |
|---|---|---|---|
| 1 | `pwd && git status && git log -1 --stat 708a6fc` | OK | Worktree clean on `team-dev-loop-round-1-atomic-state-writes`, commit `708a6fc` matches. Stat: `README.md`, `package.json`, `scripts/test-review-ui/e2e.mjs`, `src/index.ts`, `src/state-store.test.ts` (+338), `src/state-store.ts` (+156). |
| 2 | `bun run format:check` | clean | `$ oxfmt src/` — no diff reported. |
| 3 | `bun run lint` | clean | `Found 0 warnings and 0 errors. Finished in 80ms on 4 files with 95 rules using 8 threads.` |
| 4 | `bun run typecheck` | clean | `tsc --noEmit` — no errors. |
| 5 | `bun run test:unit` | 10/10 pass | 10 pass, 0 fail, 37 expect() calls, 282ms. All 7 plan scenarios (T1–T7) green with subtests. Full output captured below. |
| 6 | `bun run build` | OK | `dist/plugin/index.mjs` 56,959 bytes; build complete in 315ms. |
| 7 | `grep -n "saveState\|readState\|writeFileAtomic" dist/plugin/index.mjs \| head` | OK | 11 inlined call sites at bundle lines 1261, 1299, 1372, 1397, 1450, 1488, 1509, 1530 (writeFileAtomic for round-NNN.json), 1531 (writeFileAtomic for round-NNN.md), 1635, 1648. Plus the helper definitions at lines 61 (`writeFileAtomic`), 89 (`saveState`), 106 (`readState`). |
| 8 | `bun run scripts/test-review-ui/e2e.mjs` (with manual kill after PASS line) | 13/13 pass | `13 passed, 0 failed`. Process did NOT exit on its own (matches dev self-check note) — killed after PASS summary printed. |

### `bun run test:unit` full output

```
bun test v1.3.14 (0d9b296a)

src/state-store.test.ts:
(pass) writeFileAtomic — T1 atomic invariant (happy path) > writes content that is byte-equal to the input on disk [12.03ms]
(pass) writeFileAtomic — T1 atomic invariant (happy path) > saveState: on-disk file is the most-recent state and parses as JSON between/after every call [4.31ms]
(pass) writeFileAtomic — T2 mid-write failure isolation (ENOSPC) > when Bun.write throws, the target file is left untouched and the temp file is cleaned up [5.97ms]
(pass) writeFileAtomic — T3 EXDEV cross-device fallback > when rename throws EXDEV, falls back to copyFile + unlink and the target ends up with new content [5.84ms]
(pass) writeFileAtomic — T4 EACCES rename failure propagation > when rename throws EACCES, error propagates with context AND temp file is cleaned up [2.99ms]
(pass) writeFileAtomic — T5 concurrent saves (race) > 10 parallel saveState calls: final file is one of the 10 inputs (not a blend), no orphan temp files [5.15ms]
(pass) readState — T6 corrupt-file preservation > corrupt JSON: renames to .corrupt-<ts>, logs warn, returns defaultState [4.23ms]
(pass) readState — T6 corrupt-file preservation > missing file: returns defaultState without warning [0.68ms]
(pass) writeFileAtomic — T7 round-export atomicity > round-NNN.json + round-NNN.md both written atomically and both parse [2.29ms]
(pass) writeFileAtomic — T7 round-export atomicity > mid-write failure of second write leaves the first intact (independent atomicity) [1.75ms]

 10 pass
 0 fail
 37 expect() calls
Ran 10 tests across 1 file. [282.00ms]
```

### `bun run scripts/test-review-ui/e2e.mjs` — evidence (excerpt)

```
  PASS  no-worktree-clean
  PASS  has-worktree-unpushed  (some checks skipped — best-effort)
  PASS  multiple-worktrees-pick-most  (some checks skipped — best-effort)
  PASS  base-branch
  PASS  base-commit-single
  PASS  base-commit-range
  PASS  working-tree-changes
  PASS  files-filter
  PASS  worktree-flag-override  (some checks skipped — best-effort)
  PASS  empty-repo
  PASS  uncommitted-with-commits
  PASS  range-changed-banner
  PASS  default-base-on-main

13 passed, 0 failed

state.json validated by atomic-write helper:
  ✓ /var/folders/.../rd-scenario-z8kh9y/.opencode/reviews/test-1782658540840-d4dg/state.json
  ✓ /var/folders/.../rd-scenario-4fmpNJ/.opencode/reviews/test-1782658541258-28yu/state.json
  ✓ /var/folders/.../rd-scenario-b3oiGP/.opencode/reviews/test-1782658541916-rzpj/state.json
  ✓ /var/folders/.../rd-scenario-XGF0sb/.opencode/reviews/test-1782658542319-53yf/state.json
  ✓ /var/folders/.../rd-scenario-SoOFWO/.opencode/reviews/test-1782658542873-jevi/state.json
  ✓ /var/folders/.../rd-scenario-ygK4IQ/.opencode/reviews/test-1782658544568-rgky/state.json
  ✓ /var/folders/.../rd-scenario-l9CMA5/.opencode/reviews/test-1782658545043-t343/state.json
```

**Note vs. dev self-check:** the dev self-check marked AC10 as PARTIAL because the e2e state.json assertion was deemed "best-effort". On this run, **all 7 launch scenarios produced valid JSON state** — AC10 is effectively PASS in practice, not just architecturally best-effort. The harness still hangs at process exit (matches dev-self-check §3.3) — handled by manual kill after PASS line, not a code defect.

---

## Hands-on atomicity verification: what I actually observed

Test harness: a fresh `/tmp/atomic-test-98615/` directory, importing `saveState` / `readState` / `writeFileAtomic` directly from the worktree's `src/state-store.ts`. Script: `/tmp/atomic-test-98615/atomicity-test.ts` (122 LOC, no project files modified).

### Step-by-step observed behavior

**Step 1 — `saveState(stateA)` to `state.json`:**
- dir listing after: `atomicity-test.ts, state.json`
- on-disk JSON parsed back to `{session_id:"sess-A", round:1, notes:"first save"}`

**Step 2 — `saveState(stateB)` to same path:**
- dir listing after: `atomicity-test.ts, state.json` (no `.tmp.*` orphans)
- on-disk JSON parsed back to `{session_id:"sess-B", round:2, notes:"second save"}`
- Confirmed: B fully replaced A — no blend, no leftover A fields.

**Step 3 — `writeFileAtomic("round-001.md", "# Round 1\n\nNo findings.\n")` direct call:**
- File contents byte-equal to input. No orphan tmp.

**Step 4 — Corruption round-trip (the critical behavior):**

| When | dir listing |
|---|---|
| Before corruption | `atomicity-test.ts, round-001.md, state.json` |
| After writing `{ this is not json ::: ` to `state.json` | `atomicity-test.ts, round-001.md, state.json` (still present but invalid) |
| After `readState(STATE, "fresh-session-id", defaultState)` | `atomicity-test.ts, round-001.md, state.json.corrupt-2026-06-28T14-56-59-650Z` |

Returned value: `{"session_id":"fresh-session-id","round":0,"notes":""}` — fresh default state, no throw.

Captured `console.warn` (1 message):
```
[diff-review-dashboard] state.json at /tmp/atomic-test-98615/state.json was unreadable; preserved as /tmp/atomic-test-98615/state.json.corrupt-2026-06-28T14-56-59-650Z. Starting fresh. Original error: Failed to parse JSON
```

Preserved corrupt file content (verified by reading the file directly):
```
{ this is not json :::
```
Exact byte-equal to the corrupt content — **no data lost**.

**Step 5 — Post-recovery read of missing `state.json`:**
- `readState` returned default state for `another-session`, **no warn emitted** (silently treats missing file as fresh start, as planned).

### Final result

```
Failures: 0
ALL ASSERTIONS PASSED
```

Total assertions: 13 (3 in step 1, 5 in step 2, 1 in step 3, 6 in step 4, 2 in step 5). All 13 passed.

---

## Code structure spot-check

Verified in `src/index.ts` (worktree):

- `import { readState, saveState, writeFileAtomic } from "./state-store";` at line 3.
- **No file-local copies** of `saveState`, `readState`, or `writeFileAtomic` (grep for `^(async )?function (saveState|readState|writeFileAtomic)` returned 0 matches).
- **11 call sites**: 7 `saveState(...)`, 2 `readState(...)`, 2 `writeFileAtomic(...)` (round-export JSON + MD). Matches plan §1.1 rows 4–6 (7+2+2=11).
- `dist/plugin/index.mjs` inlines all 11 call sites plus the three helper definitions (`writeFileAtomic` at bundle line 61, `saveState` at 89, `readState` at 106).

---

## Gaps in test coverage observed

None that block this round. Items worth noting for future rounds (already captured in plan §9 or by me here):

1. **No fsync test.** Plan §2.1 documented this as a known limitation (atomic on rename, not durable across kernel panic). The current code path is unchanged from the architect's decision. Not a regression.
2. **No real-filesystem EXDEV test.** T3 only mocks `rename` to throw `EXDEV`; it doesn't actually exercise cross-device rename. Acceptable — EXDEV is hard to reproduce in CI without bind mounts. The fallback path is verified by direct mock.
3. **E2e harness exit hang.** Not a code bug; HTTP server doesn't shut down cleanly when 3000ms timeout fires before `saveState` completes. Dev self-check §3.3 already flagged this. The script reports `13 passed, 0 failed` correctly; the process needs to be killed externally. Recommend the next round add a `process.exit(0)` after the summary line in `e2e.mjs:runScenario` or use a short `setTimeout(() => process.exit(0), 100)` after summary.
4. **No load test beyond 10× concurrent.** T5 fires 10 parallel `saveState` calls. The plan marked this "realistic concurrent load"; production traffic could be higher. No defect observed in the 10× case.
5. **No test that an orphan `.tmp.*` from a previous crashed write is recovered or cleaned up.** If a process is hard-killed between `Bun.write(tmp, ...)` and `rename(tmp, target)`, the next `saveState` will create a new `.tmp.*` with a different random suffix; the old one sits there forever. Recovery of stranded `.tmp.*` files is not implemented. This is out of scope for round 1 (plan §1.2), but worth a follow-up.
6. **`__setFsPromisesForTest` test seam.** Exported with `@internal` JSDoc but not blocked at runtime. Production callers could theoretically import and call it. Acceptable risk — accidental use would just no-op or replace fs primitives with no-ops, easy to spot. Could be moved to a separate `__tests__/internals.ts` module in a future hardening pass.

---

## Recommended actions

**None required for merge.** The atomic-state-writes PR is ready to merge as-is.

Optional follow-ups (not blockers; capture as round-2+ candidates):

1. Add `process.exit(0)` after the e2e summary line so the harness exits cleanly without manual kill. 1-line change.
2. Add a janitor pass on plugin startup that deletes stale `state.json.tmp.*` files older than N minutes (e.g. 60). Recovers from hard-killed writes. Closes gap #5 above.
3. Move `__setFsPromisesForTest` into a `state-store.__test__.ts` or behind a `BUN_TEST` env gate so production builds cannot accidentally call it. Closes gap #6.

---

## Verdict: **PASS**
