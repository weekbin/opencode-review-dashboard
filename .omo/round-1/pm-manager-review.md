# PM Manager Review — Round 1 Brief

Reviewer: `pm-manager` (fresh subagent, did NOT see PM's reasoning — only the brief)
Date: 2026-06-28
Project: `@weekbin/opencode-review-dashboard`
Brief: `.omo/team/round-1/brief.md`
Self-critique: `.omo/team/round-1/brief-quality-report.md`

---

## Per-Candidate Verdicts

| # | Title | Verdict | Evidence |
|---|---|---|---|
| 1 | Atomic `state.json` writes | **KEEP** | `src/index.ts:527-530` (`Bun.write(file, ...)` with no temp+rename); `src/index.ts:524` (silent fallback to fresh state on parse failure); 7 `saveState` call sites at `src/index.ts:1495, 1615, 1646, 1724, 1776, 1806, 1988` — every state mutation is non-atomic. Also `round-NNN.json/.md` at `src/index.ts:1820-1831`. README at line 82-87 explicitly tells users this directory is the sole persistence. |
| 2 | `--worktree` silently auto-picked around when target worktree is clean | **KEEP** | `src/index.ts:1233` (`const wtRoot = worktree ?? root;`) passes `worktree` correctly, but `src/index.ts:1236` short-circuits on `merged.files.length > 0`. When target is clean: returns empty `merged`, then falls into the auto-pick block at `src/index.ts:1244-1266`. The `isWorktree(root)` guard at 1241 only fires for the user's CURRENT dir, not for the explicitly-passed `--worktree`. Confirmed by reading 1233-1269. |
| 3 | Reopen anchor only checks `start_line`, ignoring `end_line` | **KEEP** | `src/index.ts:1703-1710` reads `lines[target.start_line - 1]` only; never uses `target.end_line`. Asymmetric vs `reconcile()` at `src/index.ts:326-342` which calls `remap()` (returns both `start_line` and `end_line`) and updates both. |
| 4 | E2E harness has zero regression coverage for range-changed banner and reconcile | **KEEP** | `scripts/test-review-ui/scenarios.mjs:200-214` — literal comment "The actual cross-round range-change behavior is verified manually". `scripts/test-review-ui/e2e.mjs:75-99` — 8 of 13 scenarios assert only `result.kind === "would-launch" || result.kind === "return"` (i.e. "did the plugin not crash"). `reconcile()` (src/index.ts:308-343) has zero e2e. README table claims 10 scenarios, file defines 13 — 3 undocumented (uncommitted-with-commits, range-changed-banner, default-base-on-main). |
| 5 | `take-screenshots.mjs` is dead code that future contributors will try and fail | **KEEP** | `scripts/test-review-ui/take-screenshots.mjs:1` imports `puppeteer` — not in `package.json` deps (lines 45-58 list only `@opencode-ai/plugin` + `@pierre/diffs`; devDeps list 7 packages, none is puppeteer). `take-screenshots.mjs:4` hardcodes `/usr/bin/google-chrome`. `take-screenshots.mjs:9` uses port 8897 — but `scripts/test-review-ui/mock-server.py:26` defaults to 8890 and `scripts/test-review-ui/README.md` says 8890. `take-screenshots.mjs:14,19,24,34` hardcode `/home/weekbin/.opencode/plugins/...` Linux path. File is not referenced by `package.json` scripts or any other script (grep confirms only itself + this brief mention it). |

---

## Overall Verdict: **APPROVE**

---

## Pseudo-requirement markers found

**Zero markers across all 5 candidates.** Detailed audit:

- **DUPLICATE** — None. `git log --oneline -20` (last 20 commits) shows no atomic-write, worktree-override, reopen-anchor, or take-screenshots fix. Recent commits are styling/UI/issue-#4-related only.
- **SPECULATION** — None. Each candidate cites concrete file:line evidence I independently re-verified against `src/index.ts`, `scripts/test-review-ui/scenarios.mjs`, `scripts/test-review-ui/e2e.mjs`, `scripts/test-review-ui/take-screenshots.mjs`, and `package.json`. The "no GitHub issues" framing in the brief is mitigated by code-level evidence (and the project uses issues #2/#4 — both CLOSED — confirming issues ARE the normal intake channel here; this round is an intentional gap-fill).
- **CONTRADICTION** — None. No in-flight item conflicts. README at line 82-87 itself declares `state.json`/`round-NNN.{json,md}` as the persistence contract — fixing #1 strengthens, not contradicts, the documented behavior.
- **INFLATED** — None. Each candidate's scope is bounded to the file:line evidence. #1 is ~10 lines of refactor (`saveState` body + use at 6 sites) plus a parse-recovery warning. #2/#3 are <10 line fixes each. #4 is medium (refactor `e2e.mjs` assertion logic + add scenarios for reconcile) but bounded. #5 is delete-or-fix-decision.
- **OBSCURE** — None. Users hit #1 every time they use `/diff-review-dashboard`. Users hit #2 when they explicitly pass `--worktree` from main to a clean target. Users hit #3 when re-opening a multi-line finding. Users hit #4 implicitly via missing CI coverage. Users hit #5 only if they discover the script exists and try to run it — but the file's presence in the repo IS the trap.

---

## Suggested rewrites

None required for any candidate. The brief is approval-ready.

One small **scope** clarification (not a rewrite of the brief itself):

- For **Candidate #1**: PM's quality report already raises the question of whether to also harden `round-NNN.json/.md` exports at `src/index.ts:1820-1831`. Recommended: yes, do both in one PR — the export writes share the same power-loss risk and the README line 84-86 explicitly bundles them. Splitting them would create two PRs for one logical fix.

- For **Candidate #4**: PM's quality report asks "refactor `e2e.mjs` to intercept `Launch` payload OR add Playwright as a new layer". Recommend deferring this design call to the **Architect** phase rather than locking it here — the brief correctly stays neutral.

---

## Rationale

All 5 candidates are well-evidenced concrete bugs/gaps with file:line citations I independently verified against the live code. None show pseudo-requirement markers. Brief is ready for the user to pick which one to ship in round 1.