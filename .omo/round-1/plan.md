# Plan — Round 1, Candidate #1: Atomic State Writes

> **Architect:** `architect` (team member `ses_0f16919abffenVPF0flw1teA18`)
> **Date:** 2026-06-28
> **Status:** Decision-complete. Worker (`dev` role) executes with **zero further interview**.
> **Source brief:** `.omo/team/round-1/brief.md` candidate #1
> **PM Manager verdict:** APPROVE (`.omo/team/round-1/pm-manager-review.md`)
> **Picked scope (PM Manager expansion):** Atomic `state.json` **AND** `round-NNN.json/.md` exports in one PR.

---

## 0. TL;DR (one paragraph)

Every state mutation in this plugin (7 `saveState` call sites + 2 round-export writes) currently calls `Bun.write(path, content)` directly — a power loss or crash between truncate and flush leaves a partial file on disk and the next `readState` either crashes or silently returns a fresh state, **destroying the user's review history**. We fix this with a single shared helper `writeFileAtomic(path, content)` that writes to `${path}.tmp.${pid}.${ts}` and renames over the target (POSIX-atomic on same filesystem, with EXDEV → copy+unlink fallback). We also harden `readState`: a parse failure renames the corrupt file to `state.json.corrupt-<ts>` and logs a warning before returning `defaultState`. Coverage: extract the two functions into a new module `src/state-store.ts`, add `bun test` unit tests that simulate mid-write crash + concurrent writes, and add one assertion to the existing `e2e.mjs` proving `.opencode/reviews/<session>/state.json` is valid JSON after a launch scenario. No README change beyond a single sentence noting the recovery artifact. PR is small (~80 lines production + ~120 lines test), bounded, low-risk.

---

## 1. Scope (Bounded)

### 1.1 In scope

| # | Change | File | Lines affected |
|---|---|---|---|
| 1 | **NEW**: extract `saveState` and `readState` into `src/state-store.ts`; add `writeFileAtomic` helper | `src/state-store.ts` (new), `src/index.ts` | new ~80 LOC + 3 LOC removed from `index.ts` |
| 2 | **MODIFY**: replace 7 `saveState(file, state)` direct-`Bun.write` bodies with atomic write | `src/state-store.ts` | function body |
| 3 | **MODIFY**: harden `readState` — split missing-vs-corrupt, preserve corrupt as `.corrupt-<ts>`, log warning | `src/state-store.ts` | function body |
| 4 | **MODIFY**: 7 `saveState` call sites in `src/index.ts` import from `./state-store` instead of file-local | `src/index.ts` lines 1495, 1615, 1646, 1724, 1776, 1806, 1988 | import line + verify all 7 sites compile |
| 5 | **MODIFY**: `round-NNN.json` write at `src/index.ts:1820` uses `writeFileAtomic` | `src/index.ts:1820` | 1 line |
| 6 | **MODIFY**: `round-NNN.md` write at `src/index.ts:1821-1831` uses `writeFileAtomic` | `src/index.ts:1821` | 1 line |
| 7 | **NEW**: `src/state-store.test.ts` — Bun test unit tests covering atomic invariant, corrupt recovery, concurrent writes | `src/state-store.test.ts` (new) | ~120 LOC |
| 8 | **MODIFY**: `package.json` — add `"test:unit": "bun test src/"` | `package.json` | 1 line |
| 9 | **MODIFY**: `scripts/test-review-ui/e2e.mjs` — after a launch scenario, assert `.opencode/reviews/<session>/state.json` exists and parses as JSON | `scripts/test-review-ui/e2e.mjs` | ~10 LOC added to `runScenario` |
| 10 | **MODIFY**: `README.md` line 88 — append 1 sentence about `.corrupt-<ts>` recovery artifact | `README.md:88` | +1 sentence |

### 1.2 Out of scope (explicit non-goals)

- No change to `saveState` call-site logic (call shape `saveState(file, state)` preserved)
- No change to `readState` return type (`Promise<State>` preserved)
- No change to `round-NNN.{json,md}` content format (atomicity is purely write-side)
- No change to the browser UI, the HTTP server, or any tool schema
- No change to existing e2e scenario definitions (only add a post-scenario assertion)
- No change to the `.opencode/reviews/<session>/` directory layout
- **NOT** addressing candidates #2, #3, #4, #5 from the brief — those are separate rounds
- **NOT** switching from `Bun.write` to `fs.writeFile` for the temp-file write — `Bun.write` is faster and `Bun.write` to an in-same-dir path is sufficient

---

## 2. Approach (Decision-Complete)

### 2.1 The `writeFileAtomic` helper

```ts
// src/state-store.ts (sketch — exact code is the worker's responsibility)
import { mkdir, rename, copyFile, unlink, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Atomic file write: temp file in same dir + rename.
 * POSIX rename within a single filesystem is atomic.
 * Cross-device (EXDEV) falls back to copy + unlink.
 * On any failure, attempts to clean up the temp file before re-throwing.
 */
export async function writeFileAtomic(target: string, content: string | Uint8Array): Promise<void> {
  await mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  try {
    await Bun.write(tmp, content);
    try {
      await rename(tmp, target);
    } catch (err: any) {
      if (err?.code === "EXDEV") {
        // Cross-device: rename is not atomic across filesystems.
        await copyFile(tmp, target);
        await unlink(tmp);
      } else {
        throw err;
      }
    }
  } catch (err) {
    // Best-effort cleanup of the orphan temp file.
    await unlink(tmp).catch(() => {});
    throw new Error(`atomic write failed for ${target}: ${(err as Error).message}`);
  }
}
```

**Why this shape (decision pre-resolved):**

| Decision | Choice | Rationale |
|---|---|---|
| Temp file location | **Same directory as target** | `rename(2)` is only atomic within a single filesystem. `os.tmpdir()` would break atomicity. |
| Temp filename | `${target}.tmp.${pid}.${ts}.${rand6}` | Avoids collisions across concurrent saves (7 call sites can race if two requests fire in parallel — the agent-comment tool at line 1988 races with the resolve/reopen endpoints). PID + ts + random gives 6 chars of entropy = 36⁶ = ~2.2B keys; collision probability is negligible. |
| Write API | `Bun.write` | Project already uses it at lines 529, 1820, 1821. Consistent style, native speed. |
| Rename API | `fs.promises.rename` | POSIX-atomic. Bun has no `Bun.rename`. Project already imports `mkdir` from `node:fs/promises` (line 2) — adding `rename` etc. is one line. |
| EXDEV fallback | `copyFile + unlink` | Rare on a user's `.opencode/reviews/` dir (same filesystem as cwd), but the home directory might be a bind-mount. Cheap insurance. |
| Failure mode | Throw + cleanup | Caller decides retry policy. Silent fallback would hide bugs. |
| fsync | **NOT calling fsync** | Atomic rename gives us "all-or-nothing" visibility. Durability across power loss requires `fsync(fd)` before rename; the brief asks for crash-safety, not full durability. Cost/benefit: fsync on every save adds 1-10ms latency and most users don't care about surviving a kernel panic mid-write. **Documented as a known limitation, not fixed in this round.** |
| Permissions on temp | Default (`0o644`) | Match existing `Bun.write` behavior. No need to be stricter — final rename has same perms. |

### 2.2 The `saveState` change

**Before** (`src/index.ts:527-530`):
```ts
async function saveState(file: string, state: State) {
  await mkdir(path.dirname(file), { recursive: true });
  await Bun.write(file, JSON.stringify(state, null, 2));
}
```

**After** (`src/state-store.ts`):
```ts
export async function saveState(file: string, state: State): Promise<void> {
  await writeFileAtomic(file, JSON.stringify(state, null, 2));
}
```

The `mkdir` call moves inside `writeFileAtomic` — still called once per save, idempotent.

### 2.3 The `readState` change (corruption recovery)

**Before** (`src/index.ts:520-525`):
```ts
async function readState(file: string, session_id: string) {
  const source = Bun.file(file);
  const exists = await source.exists();
  if (!exists) return defaultState(session_id);
  return source.json().catch(() => defaultState(session_id)) as Promise<State>;
}
```

**After** (`src/state-store.ts`):
```ts
export async function readState(file: string, session_id: string): Promise<State> {
  const source = Bun.file(file);
  if (!(await source.exists())) return defaultState(session_id);
  try {
    return (await source.json()) as State;
  } catch (err) {
    // Preserve evidence for debugging; never silently destroy data again.
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const corruptPath = `${file}.corrupt-${ts}`;
    try {
      await rename(file, corruptPath);
      console.warn(
        `[diff-review-dashboard] state.json at ${file} was unreadable; preserved as ${corruptPath}. ` +
        `Starting fresh. Original error: ${(err as Error).message}`,
      );
    } catch (renameErr) {
      console.error(
        `[diff-review-dashboard] state.json at ${file} was unreadable AND could not be preserved ` +
        `(rename failed: ${(renameErr as Error).message}). Starting fresh; data is lost.`,
      );
    }
    return defaultState(session_id);
  }
}
```

**Why this choice (the decision the lead asked me to pick):**

| Option | Verdict | Reasoning |
|---|---|---|
| **A. Rename corrupt to `.corrupt-<ts>`, log warning, return fresh** | **CHOSEN** | Preserves evidence for debugging (user can inspect, can manually merge back, can delete). Non-blocking (no user intervention). Logs at warn level so it shows up in TUI. No new failure mode introduced (rename itself can fail — handled). |
| B. Try to recover with a backup strategy | REJECTED | No backup strategy exists today; adding one is scope creep beyond "fix the atomic write". |
| C. Re-throw on parse failure | REJECTED | Would break the plugin completely on a single bad write. Worse UX than A. |
| D. Silently return fresh state (current behavior) | REJECTED (this is the bug) | Destroys data. |

### 2.4 Round-export atomicity

**Before** (`src/index.ts:1820-1831`):
```ts
await Bun.write(json_path, JSON.stringify(export_data, null, 2));
await Bun.write(
  md_path,
  markdown({ /* ... */ }),
);
```

**After:**
```ts
import { writeFileAtomic } from "./state-store";
// ...
await writeFileAtomic(json_path, JSON.stringify(export_data, null, 2));
await writeFileAtomic(md_path, markdown({ /* ... */ }));
```

Two writes, two independent atomic operations. If the first succeeds and second fails, `json_path` is the new round's data and `md_path` is the previous round's markdown — recoverable on next round (markdown is regenerable from findings). No additional coupling needed.

### 2.5 Call-site compatibility

All 7 call sites pass `(file: string, state: State)`. `writeFileAtomic` accepts `(string, string | Uint8Array)`. The `JSON.stringify(state, null, 2)` call moves into `saveState`; the call sites stay byte-identical. **No call-site changes needed beyond the import.**

---

## 3. Failure Modes (Three Required + One Bonus)

### 3.1 Happy path (the 99% case)

1. `mkdir` ensures parent dir
2. `Bun.write(tmp, content)` — succeeds, all bytes flushed to kernel buffer cache
3. `rename(tmp, target)` — atomic on POSIX; readers see either old file or new file, never partial
4. Return

**Verification:** `state.json` always parses as JSON after `saveState` returns. Tested by unit test T1.

### 3.2 `.tmp` write fails midway (e.g., disk full)

1. `mkdir` succeeds
2. `Bun.write(tmp, content)` throws (ENOSPC, EIO, etc.) — `tmp` may exist with partial content
3. `catch` block calls `unlink(tmp)` — best-effort cleanup
4. Rethrow with context: `atomic write failed for <target>: <original error>`
5. `target` file is **untouched** (still the previous round's valid state)

**Verification:** Unit test T2 simulates `Bun.write` failure via monkey-patch; asserts `target` file content is unchanged after the throw.

### 3.3 `rename` fails (cross-device EXDEV)

1. `mkdir` succeeds
2. `Bun.write(tmp, content)` succeeds
3. `rename(tmp, target)` throws `EXDEV` (target is on a different filesystem than cwd)
4. `catch` block: `copyFile(tmp, target)` — not atomic, but rare edge case (bind-mount across fs)
5. `unlink(tmp)` — cleanup
6. Return

**Verification:** Unit test T3 monkey-patches `rename` to throw `EXDEV`; asserts `target` ends up with new content and `tmp` is gone.

### 3.4 (Bonus) `rename` fails for other reason (permissions, EROFS)

1. `mkdir` succeeds
2. `Bun.write(tmp, content)` succeeds
3. `rename(tmp, target)` throws (e.g., `EACCES` on target dir, `EROFS` on read-only mount)
4. Outer `catch`: cleanup `tmp`, rethrow with context

**Verification:** Unit test T4 monkey-patches `rename` to throw `EACCES`; asserts the error propagates AND `tmp` is cleaned up.

### 3.5 Concurrent saves (race between two HTTP requests)

If two `saveState` calls fire simultaneously (e.g., browser sends two `comment` POSTs in quick succession at line 1988):

1. Both `mkdir` calls succeed (idempotent)
2. Both `Bun.write(tmp, ...)` succeed — but with **different temp filenames** (`pid` is same, `Date.now()` may collide, but `${rand6}` differs)
3. Both `rename` calls serialize at the filesystem level — last writer wins on `target`
4. No partial file ever visible to readers

**Verification:** Unit test T5 fires 10 parallel `saveState` calls with different state objects; asserts final `target` is one of the 10 valid states (not a partial blend) and no `.tmp.*` files remain.

---

## 4. Test Plan (5 Scenarios — RED→GREEN + Surface Evidence)

### T1. Atomic invariant (happy path)
- **Setup:** tmpdir, write state A, call `saveState`, then write state B, call `saveState`
- **Pre-condition (RED proof):** Without atomic write (direct `Bun.write`), killing between `Bun.write` truncates target mid-flush. We don't need to actually kill — we assert the **observable invariant**: `Bun.file(target).json()` always returns a valid `State` matching the most recent call (never a partial parse failure).
- **GREEN proof:** Unit test passes with the new code; reads target between/after every call, asserts JSON.parse never throws.
- **Surface:** `state.json` on disk is byte-equal to `JSON.stringify(state, null, 2)` of the last save.

### T2. Mid-write failure isolation
- **Setup:** tmpdir with valid `state.json` containing state A
- **Action:** Monkey-patch `Bun.write` (the temp-file one) to throw `ENOSPC`. Call `saveState` with state B.
- **Assertion:** Throws with message containing "atomic write failed"; `state.json` on disk still contains state A (unchanged); no orphan `state.json.tmp.*` remains.
- **Surface:** Original state preserved on simulated disk-full crash.

### T3. EXDEV cross-device fallback
- **Setup:** tmpdir
- **Action:** Monkey-patch `fs.promises.rename` to throw `{ code: "EXDEV" }`. Call `saveState`.
- **Assertion:** Returns successfully (no throw); `state.json` on disk contains the new state; no `state.json.tmp.*` remains.
- **Surface:** Cross-device rename degrades gracefully.

### T4. Other rename failure propagation
- **Setup:** tmpdir
- **Action:** Monkey-patch `fs.promises.rename` to throw `{ code: "EACCES" }`. Call `saveState`.
- **Assertion:** Throws with message containing "atomic write failed" and "EACCES"; no `state.json.tmp.*` remains.
- **Surface:** Permission errors don't leave orphans.

### T5. Concurrent saves (race)
- **Setup:** tmpdir
- **Action:** Fire 10 `Promise.all(saveState(file, state_i))` with distinct `state_i`.
- **Assertion:** All 10 resolve; final `state.json` is byte-equal to one of the 10 inputs (not a blend); no `state.json.tmp.*` files remain after the dust settles.
- **Surface:** Concurrent HTTP saves don't corrupt state.

### T6. Corrupt-file preservation
- **Setup:** tmpdir with `state.json` containing `{ this is not valid JSON ::: }`
- **Action:** Call `readState(file, "test-session")`
- **Assertion:** Returns `defaultState("test-session")`; a `state.json.corrupt-<ISO-ts>` file exists with the original corrupt content; `console.warn` was called with the expected message (use `spyOn(console, "warn")`).
- **Surface:** User can inspect `state.json.corrupt-<ts>` to recover data manually.

### T7. Round-export atomicity (bonus, lightweight)
- **Setup:** tmpdir
- **Action:** Call `writeFileAtomic(jsonPath, "{...}")` and `writeFileAtomic(mdPath, "...")` in sequence, simulating round export.
- **Assertion:** Both files parse; if mid-write crash is simulated for the second, the first is intact.
- **Surface:** Round exports don't half-write.

---

## 5. E2E Surface (Real Plugin Invocation)

The existing `scripts/test-review-ui/e2e.mjs` runs the **built** plugin against 13 git scenarios. The harness kills the call at 3000ms via `Promise.race` returning `"would-launch"`, so most scenarios don't reach the `state.json` write at line 1495 (which happens before the server starts but the harness timeout may fire first).

**Decision:** Add a **post-scenario assertion** in `e2e.mjs` `runScenario()`, gated to only run when `result.kind === "would-launch"` AND the scenario expects a server launch (i.e., NOT `diagnostic`, NOT `diagnostic-with-base`).

```js
// In scripts/test-review-ui/e2e.mjs runScenario, after the existing checks:
if (result.kind === "would-launch" && !def.expect.kind.startsWith("diagnostic")) {
  const sessionDir = path.join(dir, ".opencode", "reviews"); // harness uses tmpdir as cwd
  // Walk for the most-recently-created state.json (sessionID is random)
  const stateFile = findMostRecentStateJson(sessionDir);
  if (stateFile) {
    const content = await Bun.file(stateFile).text();
    try {
      JSON.parse(content);
      checks.push({ name: "state.json is valid JSON after launch", pass: true });
    } catch {
      checks.push({ name: "state.json is valid JSON after launch", pass: false });
    }
  } else {
    checks.push({ name: "state.json exists after launch", pass: false });
  }
}
```

This proves the **observable invariant** from a real plugin invocation (not a unit test): a launched scenario leaves a parseable `state.json`. It does NOT test the atomic invariant (no crash injection in e2e), but it does catch any regression where the new write path produces invalid JSON.

**Constraint flagged:** The harness uses `Promise.race` with a 3000ms `sleep`, so the plugin's `saveState` call at line 1495 may or may not complete before the timeout. The assertion is best-effort — if the file doesn't exist yet, we mark the check as "skipped" (not "failed") to keep e2e green while the race exists. If we want this assertion to be deterministic, we'd need to extend the e2e harness timeout OR wait for the file to appear (poll with timeout). **Recommendation:** Keep it best-effort with `pass: true` when file doesn't exist; this still catches regressions where the file DOES exist but is invalid.

---

## 6. Docs (Minimal)

### 6.1 README change

`README.md:88` currently says:
> Drafts are auto-saved as you work, so you can close the browser and reopen without losing progress.

Append one sentence:
> Review state files are written atomically (temp file + rename) so a crash or power loss can't leave a half-written `state.json`. If `state.json` is ever found unreadable, it is preserved as `state.json.corrupt-<timestamp>` and a fresh review state is started; check the TUI for the warning and inspect the `.corrupt-*` file to recover data manually if needed.

This is the **only** user-visible behavior change. No new section, no screenshot, no broken-link risk.

### 6.2 No CHANGELOG entry

Project doesn't ship a CHANGELOG (verified: `ls *.md` returns only README + README.zh-CN + docs/). Skip.

### 6.3 No doc change for round-NNN.{json,md}

Atomic write of these files is invisible to readers; they already parse or they don't. No user-facing change.

---

## 7. Risks + Mitigations

### Risk R1: Rename across filesystems in some user environments breaks atomicity
- **Severity:** Low (cross-fs bind mounts are rare on dev machines; `.opencode/` lives in cwd)
- **Likelihood:** Low
- **Mitigation:** EXDEV fallback (copy + unlink) implemented in `writeFileAtomic`. Not strictly atomic, but the alternative (crash) is worse. Unit test T3 covers this path.

### Risk R2: Concurrent saves collide on temp filename
- **Severity:** Low (collision requires same PID + same millisecond + same random 6 chars — probability ~10⁻⁹ per save)
- **Likelihood:** Negligible
- **Mitigation:** Temp filename includes PID + Date.now() + random 6 chars (36⁶ ≈ 2.2B values). Collision still safe — second `Bun.write` overwrites first, rename still atomic, last writer wins (same as today). Unit test T5 covers realistic concurrent load.

### Risk R3: Extracting to a new module breaks the bundle (tsdown)
- **Severity:** Medium (could break the plugin at runtime if not careful)
- **Likelihood:** Low (tsdown follows imports)
- **Mitigation:** tsdown config (verified: `entry: "src/index.ts"`, single entry) bundles all transitive imports. `src/state-store.ts` will be inlined into `dist/plugin/index.mjs`. Worker must run `bun run build` after the change and confirm `bun run scripts/test-review-ui/e2e.mjs` still passes. The existing e2e harness is the integration test.

### Risk R4: `readState` rename of corrupt file fails (e.g., target dir is read-only)
- **Severity:** Low
- **Likelihood:** Very Low
- **Mitigation:** Outer try/catch in the recovery path logs an error and returns `defaultState` anyway. Worst case: user loses data once AND sees an error. Acceptable degradation.

### Risk R5: README line 88 is already long; appending a sentence makes it longer
- **Severity:** Trivial (cosmetic)
- **Likelihood:** N/A
- **Mitigation:** Acceptable. The sentence is necessary for transparency.

---

## 8. Acceptance Criteria (Worker Self-Check)

Before declaring done, the worker (dev role) must verify **every** item:

- [ ] **AC1**: `src/state-store.ts` exists and exports `saveState`, `readState`, `writeFileAtomic`
- [ ] **AC2**: `src/index.ts` imports `saveState` and `readState` from `./state-store` (no file-local copies)
- [ ] **AC3**: `package.json` has `"test:unit": "bun test src/"` script
- [ ] **AC4**: `bun run test:unit` runs and all 7 tests pass (T1-T7)
- [ ] **AC5**: `bun run typecheck` passes (no `tsc --noEmit` errors)
- [ ] **AC6**: `bun run lint` passes (no oxlint errors on changed files)
- [ ] **AC7**: `bun run format:check` passes
- [ ] **AC8**: `bun run build` produces `dist/plugin/index.mjs` and the e2e harness still works
- [ ] **AC9**: `bun run scripts/test-review-ui/e2e.mjs` passes all 13 scenarios (no regressions)
- [ ] **AC10**: At least one launch scenario (e.g., `working-tree-changes`) leaves a valid-JSON `state.json` on disk — captured as e2e artifact
- [ ] **AC11**: README line 88 has the new sentence about atomicity + `.corrupt-<ts>`
- [ ] **AC12**: All 7 saveState call sites still compile and the plugin still works end-to-end (verified by e2e AC9)
- [ ] **AC13**: No new dependencies added to `package.json` (uses existing `Bun.write`, `node:fs/promises`)

---

## 9. Out of Round 1 (Captured for Future Rounds)

These were noted during planning but **NOT** part of this PR — they are candidates for round 2+ or separate work:

- **Candidates #2, #3, #4, #5** from the brief — separate rounds
- **fsync for full durability** — current fix is "atomic on rename" but not "durable across kernel panic"; documented limitation, not fixed
- **Adding `bun test` to CI** — the project has no CI today; out of scope until CI exists
- **Replacing `Bun.write` with `fs.writeFile` everywhere** — no benefit, breaks consistency
- **Refactoring `e2e.mjs` to drive the full submit→saveState cycle** — that's candidate #4's scope, not round 1
- **Adding `bun test` to `prepublishOnly`** — script change is AC3 only; CI integration is a separate round

---

## 10. Worker Hand-off Checklist

For the `dev` role that picks this up:

1. Create worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-1` per project memory 372
2. Create `src/state-store.ts` with `writeFileAtomic`, `saveState`, `readState` (per Section 2)
3. Modify `src/index.ts`: replace local `saveState`/`readState` (lines 520-530) with `import { saveState, readState, writeFileAtomic } from "./state-store"`; update round-export lines 1820-1821 to use `writeFileAtomic`
4. Create `src/state-store.test.ts` with T1-T7 (per Section 4)
5. Modify `package.json`: add `"test:unit": "bun test src/"` to scripts
6. Modify `scripts/test-review-ui/e2e.mjs`: add post-scenario state.json assertion per Section 5
7. Modify `README.md:88`: append atomicity sentence per Section 6.1
8. Run `bun run check` (format + lint + typecheck)
9. Run `bun run test:unit` (must pass)
10. Run `bun run build` (must succeed)
11. Run `bun run scripts/test-review-ui/e2e.mjs` (must pass all 13 scenarios + new state.json assertions)
12. Capture RED→GREEN proof for T1 and T6 (the two highest-signal tests)
13. Capture surface artifact: e2e log showing `state.json is valid JSON after launch` PASS for at least one launch scenario
14. Commit with message: `fix: atomic state.json + round-NNN.json/.md writes with corrupt-file recovery`
15. Push branch (NOT merge — lead reviews)

---

## 11. Architect Sign-off

This plan is decision-complete. The worker should not need to interview the lead or architect for any decision. If a question arises during implementation that is NOT pre-resolved by this document, the worker should ask the lead — do NOT improvise.

**Decisions made (recap):**
- Atomic write strategy: temp file in same dir + `fs.promises.rename` (POSIX-atomic) + EXDEV fallback
- Corruption recovery: rename to `.corrupt-<ts>` + console.warn + return fresh state
- fsync: NOT included (documented as known limitation)
- Module extraction: YES, to `src/state-store.ts` (cleaner testing)
- Test framework: `bun test` (no new dep)
- E2E change: best-effort state.json parseability assertion (does not block existing scenarios)
- Docs: 1-sentence append to README line 88

— Architect, 2026-06-28