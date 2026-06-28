# Security Review — Round 1, Candidate #1: Atomic State Writes

> **Reviewer:** `security` (team member, lens #4 of 5)
> **Date:** 2026-06-28
> **Commit:** `708a6fc` on branch `team-dev-loop-round-1-atomic-state-writes`
> **Scope:** `src/state-store.ts` (new), `src/index.ts` (modified — 3 sites),
> `src/state-store.test.ts` (new), `package.json` (new test script),
> `scripts/test-review-ui/e2e.mjs` (new post-scenario assertion),
> `README.md` (1-sentence append).
> **Lenses NOT covered here:** code quality, perf, UX. Owned by other
> reviewers. This review is security / privacy / integrity ONLY.

---

## Verdict: **PASS (with 1 MEDIUM and several LOW findings to acknowledge)**

The change is a clear net security improvement: it converts a "silently destroy
user data on a bad write" failure mode (the prior `readState` returned
`defaultState()` on any JSON parse error, eating review history) into a
"preserve evidence + log + recover" flow. Atomic-rename is the textbook
mitigation for the underlying crash-mid-write bug.

No CRITICAL or HIGH findings. The MEDIUM findings are (a) a real TOCTOU
window that can cause silent data loss under a tight race, and (b) a
test-injection seam that ships in the production bundle. Both are
defensible as-is for the stated threat model but should be tracked for
follow-up rounds.

---

## Threat model assumed

`@weekbin/opencode-review-dashboard` is a **local-user OpenCode plugin** that
writes its own review-state JSON files to `.opencode/reviews/<sessionID>/`
inside a project the user already trusts (they invoked the plugin in it).
No untrusted code is executed server-side; the only network surface is
localhost HTTP from the user's own browser. Adversaries in scope are
(a) a malicious git commit that plants a symlink inside the project tree,
(b) another local user on a shared workstation, and (c) supply-chain risk
through npm dependencies. Out of scope: a hostile OS, a malicious
OpenCode runtime, or a user actively trying to lose their own data.

---

## Findings by severity

### CRITICAL
*None.*

### HIGH
*None.*

### MEDIUM

#### M1. TOCTOU race in `readState` corrupt-recovery path — silent destruction of a concurrent valid save
- **File:line:** `src/state-store.ts:133-155`
- **Threat:** Time-of-check / time-of-use between `Bun.file(file).json()` and
  the subsequent `_rename(file, corruptPath)`. If a sibling process (or
  another concurrent HTTP request on the same session — the plugin's
  7 `saveState` call sites include the agent-comment tool that can race
  with the resolve/reopen endpoints per plan §3.5) writes a new valid
  `state.json` between the parse failure and the rename, the rename will
  move that **fresh, valid file** aside as `.corrupt-<ts>`, destroying a
  legitimate save.
- **Impact:** Silent loss of an arbitrary user's recent review state on a
  rare-but-real race. The user sees a `[diff-review-dashboard] preserved`
  warning and assumes the recovery was legitimate, so the loss is not
  obvious.
- **Why the plan doesn't fully address it:** Plan §3.5 models the *concurrent
  writes to a valid file* case but only for `writeFileAtomic` (which is
  safe — POSIX rename picks a winner). It does not model the
  parse-failure-during-concurrent-valid-write case.
- **Suggested fix:** Re-read `state.json` immediately before the rename and
  bail out of the corrupt-preserve path if the content has changed; or,
  pin the inode (`statSync(file).ino`) at parse-time and only rename if
  the ino still matches. Minimum acceptable: log the warning ONLY if the
  file STILL fails to parse after a fresh re-read. *(Defer to a future
  round is acceptable — the prior code was strictly worse.)*

#### M2. Test injection seam `__setFsPromisesForTest` is exported in the production module
- **File:line:** `src/state-store.ts:53-65`
- **Threat:** A malicious dependency that lands an
  `import { __setFsPromisesForTest } from "./state-store"` call (or, more
  realistically, a supply-chain attack that replaces the plugin's bundled
  `dist/plugin/index.mjs` via a post-install hook) could shim `_rename`,
  `_copyFile`, `_unlink`, `_mkdir`, or `_bunWrite` to arbitrary functions.
  This would let a malicious dep silently redirect writes of review
  state to a remote server (via a wrapped `Bun.write`), replace them with
  zero-byte writes, or exfiltrate via a shimmed `rename` that copies
  first.
- **Impact:** Privilege escalation through a dependency → full read/write
  hijack of the user's review-state writes. Real, but requires a
  supply-chain compromise to reach (the user already trusts every npm
  dep they install).
- **Why the plan didn't gate it:** The plan calls it `@internal` and
  comments "Do not call from production code" — convention-only.
  TypeScript does not enforce "internal export." `tsdown` bundles all
  module exports by default; `index.ts` only imports the three production
  exports, but a single grep shows the seam is still emitted in `dist/`.
- **Suggested fix:** Wrap the setter in a runtime guard:
  ```ts
  if (process.env.NODE_ENV === "production" && !process.env.BUN_TEST) {
    throw new Error("__setFsPromisesForTest must not be called from production");
  }
  ```
  OR move the seam into a separate file (`src/state-store.test-shim.ts`)
  imported only by `state-store.test.ts` via a dynamic import gated on
  `bun:test`. OR have `state-store.ts` check `import.meta.path` ends
  with `.test.ts` before honoring the setter.

### LOW

#### L1. Orphan temp file leakage on process crash
- **File:line:** `src/state-store.ts:78-98`
- **Threat:** If the process crashes between `Bun.write(tmp, …)` returning
  and the `rename(tmp, target)` call (or between `rename` and `unlink` in
  the EXDEV fallback), `${state.json}.tmp.<pid>.<ts>.<rand6>` is left on
  disk **indefinitely**. The temp file inherits `0o644` from
  `Bun.write` (default umask) so it is world-readable on a multi-user
  system. The content is the user's review state.
- **Impact:** Privacy leak to other local users on a shared workstation
  (CI runner, university lab, shared dev box); clutter in the user's
  reviews directory over time. Single-user systems: zero impact.
- **Mitigation status:** Plan §3.2 covers the *throw* case (best-effort
  `unlink` in the catch) but not the *crash* case. Plan §9 explicitly
  defers durability work to a future round.
- **Suggested fix (follow-up round):** Sweep orphan `*.tmp.*` files at
  plugin startup (regex match `${dir}/*.tmp.*`, stat each, unlink if
  mtime > 24h old). One-line loop, ~5 LOC. Combined with L2 below,
  this becomes a `state-store.ts` `init()` helper.

#### L2. `state.json.corrupt-<ts>` artifact accumulates; not cleaned up
- **File:line:** `src/state-store.ts:140-153`
- **Threat:** Every corrupt-read creates a new `state.json.corrupt-<ISO-ts>`
  file (each timestamp is unique to the millisecond). After N corruption
  events the user's reviews directory contains N copies of their (corrupt
  but possibly recoverable) review history at `0o644`. No upper bound.
- **Impact:** Same privacy surface as L1 (world-readable review state
  artifacts that linger). Clutter. Possible workspace-size bloat over
  months of use.
- **Suggested fix:** Same startup sweep as L1, with a higher age cutoff
  (e.g., 30d) and a max-N cap (e.g., keep latest 5, prune older). Or
  honor a single user-controllable env var
  `REVIEW_DASHBOARD_KEEP_CORRUPT` defaulting to `5`.

#### L3. `console.warn` in corrupt-recovery path leaks the absolute filesystem path
- **File:line:** `src/state-store.ts:144-147`
- **Threat:** The warning message includes the full absolute path of
  `state.json` (which leaks the user's project path, worktree path, and
  sessionID directory layout to anything tailing stdout — TUI logs, CI
  logs, screen-share recordings, log-aggregation).
- **Impact:** Low. The sessionID is already passed to OpenCode and shown
  in the TUI per the README's existing behavior; the project path is
  already shown in many other plugin logs. The sessionID itself is
  **not** leaked in this message (good — the plan did the right thing
  there).
- **Suggested fix:** Optional. If desired, log only the basename
  (`state.json`) and a short hash of the full path for correlation.
  Not blocking.

#### L4. Temp file permissions are `0o644` (world-readable)
- **File:line:** `src/state-store.ts:80` (via `Bun.write`)
- **Threat:** Both the temp file AND the post-rename target file inherit
  the user's umask default `0o644`. On a multi-user system, any other
  local user can read the user's review state.
- **Impact:** Pre-existing condition (the prior `Bun.write(state_file, …)`
  was also `0o644`). The change is **not a regression**. Still worth
  noting because the corrupt-recovery artifact (`state.json.corrupt-<ts>`)
  *is* new and inherits the same mode.
- **Suggested fix (optional, post-round-1):** `Bun.write(tmp, content, { mode: 0o600 })`
  (Bun supports a mode option on file writes) and `fs.chmod(target, 0o600)`
  after rename to tighten. Costs ~1 LOC each, zero performance impact.
  Tracked for future hardening.

#### L5. Plan does not address Windows atomicity
- **File:line:** Plan §2.1; `src/state-store.ts:82`
- **Threat:** `node:fs.rename` on Windows uses `MoveFileEx` with
  `MOVEFILE_REPLACE_EXISTING`. This is NOT atomic on Windows (if the
  target is open by another process — e.g., the user's editor — the
  rename can fail with `EBUSY`/`EACCES`). On NTFS with the new
  `MoveFileEx` flags, it is also not crash-safe in the way POSIX rename
  is.
- **Impact:** Windows users get a worse guarantee than macOS/Linux
  users. The README does not advertise Windows support, but neither
  does it forbid it; Bun is cross-platform; `package.json` does not
  set `"os"`; `bun test src/` will run on Windows.
- **Suggested fix:** Add a Windows-specific path: open target with
  `fs.open(tmp, 'w')`, fsync, close, then `fs.rename(tmp, target)` —
  and on Windows additionally use Bun's `Bun.file().write()` API which
  internally handles Windows quirks. Document in README that Windows
  atomicity is best-effort. Defer if Windows is out of the project's
  stated support matrix — in which case add
  `"os": ["darwin", "linux"]` to `package.json` to make it explicit.

### INFO

#### I1. `Math.random()` for temp filename uniqueness — acceptable for this threat model
- **File:line:** `src/state-store.ts:78`
- **Threat:** Non-cryptographic randomness means a co-located malicious
  actor could in principle pre-create
  `${target}.tmp.<pid>.<ts>.<rand6>` to squat the name. With `pid` fixed
  (same process), `ts` milliseconds predictable, and `rand6` = 36^6 ≈
  2.2B keys, an attacker would need to win a 2.2B-key race against an
  `O(1)` `Bun.write` call. Not practical.
- **Verdict:** No action. Documented for completeness.

#### I2. EXDEV `copyFile` preserves source mode bits — no leak vector
- **File:line:** `src/state-store.ts:87`
- **Threat:** `copyFile(tmp, target)` copies mode bits. The temp file
  was `0o644`, so the target ends up `0o644`. If the prior `target` was
  `0o600` (user-tighted), the EXDEV path would downgrade it.
- **Impact:** Negligible. (a) `0o644` was already the default in the
  happy path; (b) we don't expect users to chmod their own state
  files; (c) the EXDEV path is rare.
- **Verdict:** No action needed. Mentioned so the next reader doesn't
  file it as a bug.

#### I3. fsync omission — documented, acceptable
- **File:line:** `src/state-store.ts:18-24` (module docstring), plan §2.1
- **Threat:** Without `fsync(fd)` before `rename`, a kernel panic
  between the rename and the page-cache flush can leave the
  post-rename file with stale/zeros on disk after recovery.
- **Impact:** Data loss (not data leak) on a rare crash. The plan
  explicitly acknowledges this and defers to a follow-up. The fix
  adds 1-10 ms per save, which would degrade the "auto-save as you
  type" UX.
- **Verdict:** Acceptable for round 1. File the follow-up issue.

#### I4. Path traversal — NOT exploitable in current call graph
- **File:line:** `src/state-store.ts:76` (`target` parameter)
- **Threat:** Could a crafted `target` write outside the intended
  directory?
- **Verdict:** No. All 9 call sites construct `target` as
  `path.join(effective_scope, ".opencode", "reviews", sessionID, "<basename>")`,
  where `effective_scope` comes from CLI flag / OpenCode context
  (server-trusted) and `sessionID` is OpenCode-generated. Round-export
  targets use `String(round).padStart(3, "0")` (number, padded) as
  the only variable component. No user-controlled or
  browser-supplied data reaches `target`. **No path traversal.**
  Listed as INFO only to document the verification.

#### I5. Symlink handling on `target` — POSIX rename replaces the symlink itself, does NOT follow it
- **File:line:** `src/state-store.ts:82`, `src/state-store.ts:143`
- **Threat:** If `state.json` is a symlink to (say) `~/.ssh/id_rsa`,
  does `rename(tmp, state.json)` overwrite the symlink target?
- **Verdict:** No. POSIX `rename(2)` (which `node:fs.rename` calls on
  POSIX systems) atomically replaces the symlink itself with the new
  inode — it does NOT traverse the symlink. So an attacker who can
  plant a `state.json` symlink cannot redirect writes. **Defensive
  property of the chosen mechanism, not a vulnerability.** (Windows
  is different — see L5.)

---

## Cross-platform note (Bun on Windows)

The plan claims POSIX-atomic rename; this is correct on macOS and Linux
(ext4, APFS, btrfs). On Windows, `node:fs.rename` uses `MoveFileEx`
which is **not atomic across crashes** and **not safe if the target is
open** (e.g., user has the file in their editor). Bun does not provide
a portable atomic-rename primitive that abstracts over this. If
Windows support is in scope (Bun is cross-platform; `bun test src/`
runs on Windows; `package.json` does not restrict `os`), the change
delivers a weaker guarantee to Windows users than the README's
"atomic write" wording implies. If Windows is out of scope, add
`"os": ["darwin", "linux"]` to `package.json` to make it explicit.

---

## Recommended actions

### Must-fix before merge
*None.* The change is a net improvement over the prior code. All findings
above are acceptable degradations documented for follow-up.

### Should-fix before next round (issue list)
1. **M1 — TOCTOU in corrupt-recovery.** Open a follow-up issue: re-stat
   `state.json` immediately before the corrupt-rename, or use inode
   pinning. Risk is low (single-process most of the time) but the
   silent-data-loss failure mode is exactly what the rest of this PR is
   trying to eliminate — leaving one race-shaped hole undermines the
   whole story.
2. **M2 — Test injection seam in production bundle.** Open a follow-up
   issue: guard `__setFsPromisesForTest` with a runtime check on
   `process.env.BUN_TEST` (or split into a test-only file). Cheap and
   prevents a class of supply-chain pivots.
3. **L5 — Windows atomicity.** Decide: support Windows (then implement
   Bun's atomic-write API + document the weaker guarantee), or
   formally exclude it (`"os"` in `package.json`).
4. **L1+L2 — Orphan file cleanup.** Open a follow-up issue: add a
   `cleanOrphans(dir)` helper called once at plugin startup, deleting
   `*.tmp.*` older than 24h and `state.json.corrupt-*` older than 30d
   (keep latest 5). One trivial loop, ~10 LOC.

### Nice-to-have (not blocking)
5. **L3 — Log path minimization.** Replace full path in `console.warn`
   with basename + path hash.
6. **L4 — Tighten file mode to `0o600`.** Single-line Bun option change.

---

## Summary for the orchestrator

**PASS.** No blockers. The change improves the security posture (eliminates
silent data loss on corrupt-state recovery; atomic writes prevent the
"truncated state.json destroys review history" class of bug). One MEDIUM
TOCTOU and one MEDIUM supply-chain test-seam concern are real but
defensible as-is for a single-user local plugin; both have cheap fixes
for follow-up rounds. File them as issues, don't block merge.

— Security reviewer, 2026-06-28
