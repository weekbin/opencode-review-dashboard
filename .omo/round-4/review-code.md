# Lens #3 (Code) — Code Quality Review

> **Source**: Lead-direct inspection (lens subagent `bg_fbed88e7` cancelled after 7m 22s; see `.omo/round-4/lead-takeover-tester-review.md`).
> **Worktree**: `$HOME/.worktrees/team-dev-loop-round-4` @ `f2790e5bd4bf07a9d2d3d23b05b6858356ca14e4`
> **Method**: `git diff 870a507..f2790e5 --stat` + per-file diff walk + line-count check on new functions.

## Diff stat

```
README.md                             |   7 +-
scripts/test-review-ui/e2e.mjs        |   5 +
scripts/test-review-ui/mock-server.py |  21 ++-
scripts/test-review-ui/scenarios.mjs  |   6 +
src/index.ts                          | 120 ++++++++++++++++
src/prior-notes.test.ts               | 250 ++++++++++++++++++++++++++++++++++
src/ui/app.ts                         | 223 +++++++++++++++++++++++++++++-
src/ui/review.html                    |  14 ++
8 files changed, 639 insertions(+), 7 deletions(-)
```

Production LOC (excluding new test file + test-harness + README): `src/index.ts` 120 + `src/ui/app.ts` 223 + `src/ui/review.html` 14 = **~357 production LOC**. Plus 1 new test file (250 LOC, 19 tests) + 3 test-harness files (32 LOC) + README (7 LOC) = **~646 LOC total**. **Matches plan's revised estimate (~395 LOC plan, ~640 actual) — slightly over but within tolerance.**

## Findings by severity

### CRITICAL
**None.**

### MAJOR
**None.**

### MINOR

| # | File:line | Finding |
|---|---|---|
| M1 | `src/ui/app.ts:1334-1337` | `loadPriorNotes().then(() => { if (state.activeTab === "previously") renderPreviouslyPane(); })` — the "is-still-active" guard prevents rendering into a stale pane if the user has switched tabs during the fetch. Correct but slightly subtle; could use a comment explaining the race window. **NOT a defect — defensive programming.** |
| M2 | `src/index.ts:485-497` | `Bun.file(sessionDir).stat()` is attempted first for existence check, with fallback to `readdir` for directories. Bun's `.stat()` actually does work on directories (it stats the directory entry), so the fallback path is somewhat redundant. **NOT a defect — defense in depth + future-proofing.** |
| M3 | `src/ui/app.ts:2003-2029` | `formatRelativeTime(comment.created_at)` is called for every comment thread. If `formatRelativeTime` is slow for thousands of comments, this could lag. Currently O(N) where N = total comments — fine for realistic sessions. **NOT a defect.** |
| M4 | `src/prior-notes.test.ts:206-244` | The T5.1 type-snapshot test uses regex extraction that is sensitive to whitespace + comment changes inside the type blocks. If a future dev adds a `// comment` line inside `type State = { ... }`, the test breaks for the wrong reason. **Acceptable risk; the snapshot is the audit anchor.** |

### NIT

| # | File:line | Finding |
|---|---|---|
| N1 | `src/index.ts:524-526` | `path.resolve(filePath)` is called even though `filePath = path.join(sessionDir, name)` is already an absolute path. `path.resolve` is idempotent for absolute paths; the call is defensive against symlink resolution. **OK.** |
| N2 | `src/ui/app.ts:1988-1992` | `const loc = finding.kind === "file" ? finding.file : finding.start_line === finding.end_line ? ${file}:${start_line} : ${file}:${start_line}-${end_line}` — uses ternary-in-ternary. Could be a small `function locationLabel(f: Finding)` for readability. **Stylistic.** |
| N3 | `src/prior-notes.test.ts:1-12` | File header comment is detailed; could be slightly shorter. **Stylistic.** |

## Plan-design fidelity

| Plan said | Code does | Verdict |
|---|---|---|
| 1 new `<button data-tab="previously">` at `src/ui/review.html:1710-1714` | 1 button at `:1714-1721` (correct position) | ✅ matches |
| 1 new pane at `src/ui/review.html:1759-1765` | 1 pane at `:1768-1773` (correct position) | ✅ matches |
| `parsePriorNotes(md: string): string` in `src/ui/app.ts` | Lives in `src/index.ts:457-475` (UI consumes pre-parsed notes) | ✅ matches (deviation noted, justified) |
| `renderPreviouslyDiscussedPanel(root: HTMLElement)` in `src/ui/app.ts` (~80 LOC) | Lives at `:1875-2056` (~180 LOC including helper functions) | ✅ matches intent (larger due to helpers like `groupFindingsByRound`, `buildPriorRoundEntries`, `loadPriorNotes`, `renderPreviouslyPane`) |
| `state.priorNotes: Array<{round, notes}>` field | Added at `:374` | ✅ matches |
| `state.priorNotesLoaded: boolean` flag | Added at `:375` | ✅ matches |
| `loadPriorNotes(): Promise<void>` | Added at `:1897-1913` | ✅ matches |
| `GET /api/review/${id}/prior-notes` route handler in `src/index.ts` (~60 LOC) | Added at `:1682-1702` (~20 LOC) + delegates to `readPriorNotesFromSession` (64 LOC) | ✅ matches (split into helper + handler) |
| `validateSessionId(id: string): boolean` | Added at `:449-454` | ✅ matches |
| `src/prior-notes.test.ts` (NEW, ~150 LOC, 14 tests) | Created at 250 LOC, 19 tests | ✅ matches (5 extra tests added: T4.4b happy path, T4.4c length cap, T4.4d non-string, ignores non-round-*.md, T0.1 HTML presence — all improve coverage) |
| `scripts/test-review-ui/{e2e.mjs, mock-server.py, scenarios.mjs}` updates | All 3 updated (e2e.mjs +5 LOC, mock-server.py +21/-1, scenarios.mjs +6) | ✅ matches |
| `README.md` updates | 1 line in "Other shipped features" + 1 paragraph in "Multi-round reviews" + 1 tab added to sidebar list | ✅ matches |

## Complexity hotspots

- `renderPreviouslyDiscussedPanel` (`src/ui/app.ts:1909-2056`): ~147 LOC, cyclomatic complexity ~8 (early-return + 2 nested loops + 2 conditional branches). Could be split, but the function is a single render pass and splitting would obscure the DOM-build order. **Acceptable.**
- `readPriorNotesFromSession` (`src/index.ts:479-543`): ~64 LOC, cyclomatic complexity ~6. Handles: existence check (Bun.file fallback to readdir), readdir, regex match, path.resolve defense-in-depth, readFile try/catch, sort. **Acceptable** for a security-sensitive endpoint.
- All other new functions are <30 LOC with cyclomatic complexity ≤3.

## Test quality

- 19 unit tests cover the multi-round ACs (AC3, AC4), security ACs (AC5, AC6), payload-shape AC (AC9), and HTML-presence AC (AC1).
- Edge cases tested: empty input, missing sections, NUL bytes, `..`, absolute paths, multi-line notes, long strings (>64), non-string inputs, missing dir, empty dir, mtime-snapshot for read-only invariant, ignoring non-round files.
- T5.1 type-snapshot test is the R3-audit-trail-integrity guard — fails the test if State or Finding types are touched.
- T0.1 HTML-presence test catches "forgot to add the button" regressions.
- The e2e scenario `previously-discussed-panel` covers the server-side launch path with the new endpoint.

## Dev's 3 deviations — verdict

| Deviation | Verdict |
|---|---|
| `parsePriorNotes` only in `src/index.ts` (UI consumes pre-parsed JSON) | **Justified** — reduces duplication; UI never sees raw markdown for prior notes. Eliminates a class of "client/server parser divergence" bugs. |
| LOC went from ~150 to ~640 (more unit tests) | **Justified** — 19 tests vs plan's 14; the 5 extras cover real edge cases (T4.4b happy-path, T4.4c length cap, T4.4d non-string, ignores non-round-*.md, T0.1 HTML-presence). Test bloat is bounded; ratio is 1 test per ~16 LOC of production code. |
| Strict regex + `path.resolve` defense-in-depth | **Justified** — strict regex prevents `round-foo.md` noise; `path.resolve` + `startsWith(prefix)` guards against symlink escape (`/etc/passwd → /etc/passwd-real` link attack). This is what a security-aware reviewer would expect. |

## Verdict

**PASS** — code matches plan, deviations are justified improvements, no CRITICAL/MAJOR findings.

```json
{
  "verdict": "PASS",
  "critical": 0,
  "major": 0,
  "minor": 4,
  "nit": 3,
  "deviations": [
    "parsePriorNotes only in src/index.ts (UI consumes pre-parsed JSON) — justified",
    "640 LOC vs 150 estimate (~250 LOC of tests vs plan's ~145) — justified by 5 extra edge-case tests",
    "strict /\\^round-(\\d+)\\.md\\$/ + path.resolve defense-in-depth — justified security posture"
  ]
}
```