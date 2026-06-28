# Review-Work Lens #5: Context Miner

> **Reviewer:** Context Miner (`review-work` lens #5 of 5)
> **Target:** PR on `team-dev-loop-round-1-atomic-state-writes` @ commit `708a6fc`
> **Scope:** repo fit, dev-self-check honesty, brief coverage, out-of-scope creep, README coherence, plan adherence, future-round impact
> **Date:** 2026-06-28

---

## Verdict: **PASS**

The change is a clean, scoped implementation of brief candidate #1 (atomic `state.json` writes with corrupt-file recovery). Dev's self-check claims are honest and verifiable: tests count, README wording, e2e "best-effort" framing, and out-of-scope discipline all check out against the actual diff. No fabrication, no spin, no scope creep. The two named deviations (loose `unknown` typing, `__setFsPromisesForTest` seam) are well-justified and match the test-injection reality of Bun. Ready for Decision role.

---

## Dev-self-check honesty audit

Every numeric and behavioral claim was verified against the worktree. **No spin, no inflation.**

| Claim in `dev-self-check.md` | Verified against worktree | Verdict |
|---|---|---|
| "10/10 unit tests pass" (`bun run test:unit`) | `bun test src/` output (QA re-run): **"10 pass, 0 fail, 37 expect() calls"** with 7 describe blocks (T1, T2, T3, T4, T5, T6, T7) and 10 `it()` subtests (T1×2, T2, T3, T4, T5, T6×2, T7×2) | **HONEST** — counts `it()` subtests, not `describe` blocks; dev explicitly flagged the discrepancy as "T1-T7 expanded with subtests" in AC4 row, so no inflation |
| `AC10` "PARTIAL — best-effort assertion" | `e2e.mjs:checkStateJson` returns `{ pass: true, skipped: true }` when no file, `{ pass: true, path: ... }` on parse success, `{ pass: false, error: ... }` on parse failure; QA lens confirmed all 7 launch scenarios produced parseable state.json | **HONEST** — assertion is NOT a no-op; it can fail meaningfully (catches invalid JSON), but skips on the 3000ms race as plan §5 acknowledged |
| `AC11` README line 88 has the atomicity sentence | `README.md:88` has the appended sentence with `.corrupt-<timestamp>` | **HONEST** |
| `AC12` "all 7 saveState call sites work" | `grep saveState src/index.ts` → 7 call sites at lines 1483, 1603, 1634, 1712, 1764, 1794, 1976 | **HONEST** — exact count matches brief's `src/index.ts:527-530` evidence (now importing from `./state-store`) |
| `AC13` No new dependencies | `package.json` diff = 1 line (`test:unit` script); `dependencies` / `devDependencies` untouched | **HONEST** |
| Test evidence log claims (`13 passed, 0 failed` e2e; `0 warnings, 0 errors` lint; `dist/plugin/index.mjs` built) | QA lens re-ran all of these: `13 passed, 0 failed`; `0 warnings, 0 errors`; bundle 56959 bytes with 11 inlined call sites | **HONEST** (re-verified) |

**The "10 vs 7 tests" framing is the only place a careless reader could misread** — the plan (AC4) said "7 tests (T1-T7)" at the describe level; the dev's "10/10" is at the `it()` level. The dev's spec traceability matrix (AC4 row) addresses this explicitly with the parenthetical "T1-T7 expanded with subtests." Not spin, not inflation — two different valid counting conventions, both made visible.

---

## Repo fit

This change fits the project cleanly on three axes:

**Naming and module structure.** `src/state-store.ts` follows the existing single-purpose module convention (peer files like `src/index.ts`, `src/ui/*`, `src/opencode-integration/*`). The module exports `saveState`, `readState`, `writeFileAtomic` — same names the plan §1.1 reserved, no surprises. The `@internal __setFsPromisesForTest` seam is properly annotated as test-only.

**Type and coding style.** The codebase uses Bun's runtime + `node:fs/promises` for fs + `node:path` for paths — the new module matches. `import { copyFile, mkdir, rename, unlink } from "node:fs/promises";` follows the same import grouping style as `src/index.ts:2`. `Bun.write` is used (consistent with `src/index.ts:529,1820,1821`). TSDoc comments are detailed but proportional to the security-critical nature of the change.

**Test runner and project conventions.** The project had no `bun test` runner before this round (no `test:unit` script). Adding `bun test src/` as the script is the natural choice — same runtime as the plugin, no new dep. The `bun run test:unit` row in the README `Scripts` table mirrors the existing `bun run test:ui` row. Two deviations are well-justified: (a) typing `saveState(file, state: unknown)` to avoid `State`-type duplication across modules — `index.ts:71` still owns `State` and call sites pass the typed object, so end-to-end type safety is preserved; (b) the `__setFsPromisesForTest` seam because `Bun.write` is per-module frozen — this is a real constraint of Bun, not a workaround for laziness.

**Prior art and conventional drift.** `git log src/index.ts -5` shows recent commits on `diff_base` reporting and effective-scope state preservation — all pre-existing review-state code. None of those commits added any kind of safe-write. The new `state-store.ts` is the first atomically-written state file in the project, but it doesn't conflict with any prior-art saveState/readState paths because they're being replaced wholesale by this module.

---

## Out-of-scope creep

**None.** Verified line-by-line against the diff (6 files, +585/-29):

| File | Diff | In-scope? | Notes |
|---|---|---|---|
| `src/state-store.ts` | +156 (new) | YES | Per plan §1.1 row 1 |
| `src/state-store.test.ts` | +338 (new) | YES | Per plan §1.1 row 7 |
| `src/index.ts` | +22/-14 (net +8) | YES | Per plan §1.1 rows 4,5,6; lines shifted -12 because file-local readState/saveState were removed |
| `package.json` | +1 | YES | Per plan §1.1 row 8 (test:unit script only; deps untouched) |
| `scripts/test-review-ui/e2e.mjs` | +80/-0 | YES | Per plan §1.1 row 9 (best-effort state.json assertion, additive only) |
| `README.md` | +2/-1 (net +1 sentence + script table row) | YES | Per plan §1.1 row 10 (line 88 atomicity sentence + `test:unit` row in Scripts table) |

**Specific non-creep verifications:**

- The `function split(text: string)` in `src/index.ts:511` is **moved** (not new) — its body is identical to the original location at ~line 543, just hoisted up because the file-local readState/saveState bodies were deleted. Confirmed by `grep -c "split(" = 19` (all call sites preserved).
- No edits to: `.gitignore`, `tsdown.config.ts`, `.oxlintrc`, `.oxfmtrc`, any UI file, any other `src/*.ts` file, `docs/`, `README.zh-CN.md` (English README updated; Chinese counterpart not — see Recommended Actions).
- No dependency additions: `package.json` scripts only.
- No CI changes: no `.github/`, no `prepublishOnly` modification (deferred per plan §9).
- No opportunistic refactors of unrelated code.

**Note on `split` function re-ordering:** The Code-Quality lens flagged the gratuitous move of `split` from `~line 543` to `line 511` as a MINOR-1 issue ("adds 6 noise diff lines"). The Context lens agrees this is noise but disagrees it is creep — it is a logical reorganization that follows from removing the file-local readState/saveState bodies. Not blocking, but a fair pre-merge clean-up candidate.

---

## Brief coverage

Brief acceptance criteria (`.omo/team/round-1/brief.md` lines 14-18):

| Brief AC | Met? | Evidence |
|---|---|---|
| "Fix must be backed by concrete file:line evidence (not speculation)" | YES | Plan §1.1 references `src/index.ts:527-530`, `:1820-1831`, `:524` with line numbers; brief PM evidence is line-accurate |
| "Fix must NOT require a major rewrite" | YES | Net diff is +585/-29 lines; src/index.ts is only +22/-14 (mechanical import swap + 2-line round-export change); no architectural rewrite |
| "If fix touches user-facing behavior, must add a test scenario (per candidate #4 finding)" | YES | (a) 7 unit tests cover the atomic-write + corruption paths; (b) e2e.mjs gets a post-scenario state.json assertion (best-effort by design); both are new test scenarios added in this round, not just internal-coverage unit tests |
| "All 7 roles (PM / PM Manager / Architect / Dev / Tester / PM Doc Writer / Decision) participate" | IN PROGRESS | Process AC, not artifact-verifiable from worktree. The artifacts on disk (brief.md, atomic-state-writes.md, dev-self-check.md, this review) are present; the `Decision` role is the gate this review feeds into. |

Brief candidate #1 (atomic state.json writes, severity bug/data-loss, effort Short, risk Low) is fully addressed. Plan §1.1 enumerates 10 numbered changes; all 10 are present in the diff. Candidates #2–#5 are explicitly out of scope per plan §1.2 and §9 (deferred to future rounds); brief itself flags them as separate rounds.

---

## README coherence

**The appended sentence at line 88 is accurate, readable, and well-placed.**

Current `README.md:88` (worktree):
> Drafts are auto-saved as you work, so you can close the browser and reopen without losing progress. Review state files are written atomically (temp file + rename) so a crash or power loss can't leave a half-written `state.json`. If `state.json` is ever found unreadable, it is preserved as `state.json.corrupt-<timestamp>` and a fresh review state is started; check the TUI for the warning and inspect the `.corrupt-*` file to recover data manually if needed.

**Code matches every claim:**

- "temp file + rename" — `state-store.ts:80-82` does `await _bunWrite(tmp, content); await _rename(tmp, target);` — verbatim match.
- "crash or power loss can't leave a half-written `state.json`" — `rename(2)` is POSIX-atomic; unit test T1 asserts the observable invariant ("on-disk file is byte-equal to input, parses as JSON between every save"). Caveat: README doesn't mention the fsync-not-called limitation (plan §2.1 decision table explicitly excluded fsync). This is acceptable for a single-sentence user-facing note.
- "`state.json.corrupt-<timestamp>`" — `state-store.ts:140-141` produces `${file}.corrupt-${new Date().toISOString().replace(/[:.]/g, "-")}`. README's `<timestamp>` is a human-readable placeholder for the sanitized ISO timestamp; the actual filename format is `state.json.corrupt-2026-06-28T22-30-00-000Z`-style. Test T6 confirms via `entries.filter((e) => e.startsWith("state.json.corrupt-"))`.
- "check the TUI for the warning" — `state-store.ts:144` does `console.warn(...)`; Bun plugin captures stderr into the TUI. Plausible and matches the existing log pattern (`[diff-review-dashboard] review URL: ...` is the same kind of message).
- "inspect the `.corrupt-*` file to recover data manually if needed" — preserved file is the verbatim original corrupt content; user can `cat`, `jq`, or delete it.

**Placement.** Appended to the existing "Drafts are auto-saved..." sentence in "State and exports" (lines 80-88). This is the right section — it's the place a user reading about state persistence would naturally look. No new section, no broken anchor links, no screenshot needed (it's an internal recovery mechanic, not a visible UI feature). Risk R5 (sentence makes line 88 long) is trivial — sentence is dense but grammatical.

**Scripts table.** A new row was added for `bun run test:unit` (line 207), consistent with the existing `bun run test:ui` row directly below. Format matches the other rows. Good.

**Minor nit (non-blocking):** `<timestamp>` is shown as literal angle-bracket placeholder text rather than backticked code (e.g., `<timestamp>` not `` `<timestamp>` ``). This reads naturally as English ("preserved as state.json.corrupt-<some timestamp here>"), but a code-styled version would be unambiguous. Cosmetic only.

---

## Future-round impact

This change makes candidates #2–#5 from the brief **easier** (not harder) and does not conflict with any of them.

| Brief candidate | Status | Impact from this PR |
|---|---|---|
| #2 `--worktree` silent auto-pick (`src/index.ts:1233-1243`) | Not in this PR | Neutral. No overlap with `state-store.ts`. |
| #3 Reopen anchor checks `start_line` only (`src/index.ts:1703-1710`) | Not in this PR | Neutral. The 7 saveState call sites all still call `saveState(file, next)` — round #3 will continue to write state through the new atomic path. |
| #4 E2E harness zero regression coverage (range-changed banner, stale-finding reconcile) | Not in this PR | **Made easier.** The e2e.mjs now has a `checkStateJson(dir, name, def, result)` post-scenario assertion pattern + a `findMostRecentStateJson(reviewsDir)` helper. Future round #4 can add similar `checkXxx` functions for range-banner and reconcile without redesigning the harness. The new AC10 surface-artifact log (`state.json validated by atomic-write helper:`) also gives round #4 a template for surfacing evidence. |
| #5 `take-screenshots.mjs` dead code | Not in this PR | Neutral. Out of test-harness scope. |

**Wider future-round enablers this PR ships:**

1. **`__setFsPromisesForTest` injection seam** — general-purpose test seam for Bun's frozen `Bun.write` and `node:fs/promises` namespace. Any future module that needs to mock fs operations in unit tests can reuse the same pattern (`src/state-store.ts:53-65`).
2. **`bun test` runner wired in** — `package.json:test:unit` script opens the door to unit-testing future modules (e.g., a future `src/diff-base.ts` for candidate #2's worktree resolution could have unit tests).
3. **Atomic-write primitive in repo vocabulary** — future modules that write to disk (e.g., snapshot exports, comment caches) can `import { writeFileAtomic } from "./state-store"` and inherit the EXDEV fallback + temp-file cleanup behavior for free.
4. **New test seam = `mkdtemp` + `spyOn(console, ...)` pattern** — `src/state-store.test.ts:25-39,233` shows the per-test cleanup dance; future tests can copy this pattern verbatim.

**No conflict** with any of the deferred work. Round #2/3/4/5 can land on top of this without changes.

---

## Recommended actions

**Blocking (must fix before merge):**
- None. The PR is decision-ready.

**Non-blocking (worth addressing before or in a follow-up):**

1. **Revert gratuitous `split` function re-ordering** in `src/index.ts:511-516` (Code-Quality lens MINOR-1). Plan §1.1 row 4 only asked for "replace local `saveState`/`readState` (lines 520-530) with `import`"; the `split` move adds 6 noise diff lines. Clean revert reduces diff by 6 lines and improves review-ability of the actual change. Pre-merge 30-second fix.

2. **README.zh-CN.md parity.** The Chinese README was not updated alongside the English one. The English README gained a sentence at line 88 and a `test:unit` row in the Scripts table; `README.zh-CN.md` should mirror both for consistency. Likely a translator-handoff follow-up rather than a blocker on this PR.

3. **`README.md:88` `<timestamp>` rendering.** Consider backticking the placeholder (`` `state.json.corrupt-<timestamp>` ``) for unambiguous code styling. Cosmetic.

4. **TOCTOU fix in corrupt-recovery** (Security lens MEDIUM-1). Between `source.json()` failing and the rename, a sibling save could land; the rename would then clobber the now-valid state. Pin inode at parse-time or re-stat before rename. Defer to round 2 or accept the rare race.

5. **`__setFsPromisesForTest` runtime guard** (Security lens MEDIUM-2). Consider wrapping with `if (process.env.NODE_ENV !== "production")` so a malicious dep can't shim the production bundle's fs calls. Low priority — the seam is harmless if accidentally called, and tsdown may tree-shake it from the bundle if `index.ts` never imports it.

6. **Document the fsync limitation in user-facing notes** (already documented in `state-store.ts:18-23` for developers). Surfaces only on kernel panic, not on regular crashes. Acceptable as-is for a 1-sentence README add.

---

## Short summary

**Verdict: PASS.** This is a high-quality, in-scope, low-risk implementation of brief candidate #1. Every claim in `dev-self-check.md` was verified against the worktree and found honest — including the "10 tests" framing (which differs from the plan's "7" only because it counts `it()` subtests vs `describe` blocks; dev addressed this transparently in the AC4 row). Out-of-scope creep = zero (verified file-by-file against plan §1.1). README change is accurate and well-placed; code matches every word of the appended sentence including the `.corrupt-<timestamp>` format. Future rounds #2–#5 are unaffected or made easier — this PR ships reusable enablers (`__setFsPromisesForTest` seam, `bun test` runner, `writeFileAtomic` primitive, e2e check pattern). The PARTIAL on AC10 is honest: the e2e assertion can fail meaningfully (catches invalid JSON) and skips on the 3000ms race, exactly as plan §5 designed. **Decision role can approve.** No blocking actions; non-blocking follow-ups are: (a) revert `split` move for cleaner diff (pre-merge, 30s), (b) `README.zh-CN.md` parity, (c) cosmetic `<timestamp>` backticking, (d) TOCTOU fix in corrupt-recovery (defer).
