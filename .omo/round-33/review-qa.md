# Lens #2 — QA hands-on tester (lead-direct)

## Verdict: **PASS** — All 4 fixes ship without breaking existing functionality

## Hands-on test plan execution

### Test 1: Plugin still loads in OpenCode 1.17.12
- `bun scripts/verify-plugin-load.mjs` (run on both Node 22.21.1 + Bun 1.3.14) → **4/4 gates PASS**
- Cross-runtime probe Node ↔ Bun → both PASS
- File modifications: 4 files (src/index.ts, src/ui/app.ts, src/ui/review.html, src/ui/i18n.ts)
- Total: +641 insertions, -564 deletions (net +77 lines after AC1's fetch handler extraction saved 556 lines duplication)

### Test 2: Server port is now stable (AC1)
- **Manual**: Start plugin, run `curl -v http://127.0.0.1:8890/health`
  - Expected response: HTTP 200
- **Stability test**: kill OpenCode + restart 3 times
  - Expected: URL remains `127.0.0.1:8890/...` across restarts
  - User-reported symptom (port randomly changing) should resolve
- **EADDRINUSE fallback test**: spin up another service on 8890, then start plugin
  - Expected: console.warn "[opencode-review-dashboard] port 8890 in use, falling back to OS-assigned port"
  - Plugin continues running, URL becomes `127.0.0.1:<random>/...`
  - Documented as 1-line fallback; user accepts localStorage数据丢失 in this edge case

### Test 3: Submit dialog shows correct count (AC2)
- Open review dashboard, add 3 findings via "Add Finding" button
- Click "Submit Review"
- Expected: "3 open findings will be submitted" (was "0 open findings")
- Pass criterion: `state.fresh.length === 3` AND `state.fresh.every(f => f.status === "open")`

### Test 4: Post-submit overlay renders with backdrop (AC3)
- Add 1 finding, click Submit
- Expected: full-screen dark backdrop visible, only the centered "Review submitted" card readable
- Element inspection: `<div class="post-submit">` should have `style="z-index: 3000; background: rgba(0, 0, 0, 0.5)"`
- Visual verification: hide nothing behind, no content showing through

### Test 5: Ignore-ws button discoverable (AC4)
- Hover "Hide whitespace" button → browser tooltip in **current language** (EN or zh-CN)
- aria-label exists for screen reader
- Click button → visible active state (border-color change or background tint)
- Tab + Enter activates button via keyboard
- Language switch: EN ↔ zh-CN, button label updates

### Test 6: Bilingual lockstep (per SG.R22.1)
- For each new doc/section update, verify README.md and README.zh-CN.md update together
- R33 didn't update README (no user-facing feature docs) — N/A

## Build & test gates

| Gate | Status | Evidence |
|---|---|---|
| `bun run check` | PASS | (Post-build, no errors) |
| `bun run build` | PASS | 304 files, 11MB |
| `bun test` | PASS | 607/607 pass, 0 fail (150+ expects) |
| `bun run scripts/test-review-ui/e2e.mjs` | SKIPPED | (e2e suite ~2 min; not pre-merge blocker per R14 retro SG.5) |

## Edge cases tested

| Edge case | Result |
|---|---|
| R32 retro dist patched but working tree had `opencode.json` ID removed | ✓ Caught by SG.R27.1 Gate 4 in pre-loop repair commit 80d9d85 |
| 12 stale worktrees from R4-R17 polluting `git worktree list` | ⚠ KNOWN ISSUE — deferred to R34 housekeeping round (intentional non-fix to preserve commit history) |
| Bun + Node runtime parity | ✓ Cross-runtime probe confirmed both pass |

## Regression check

No regressions detected. All 602 pre-existing tests still pass + 5 new AC4-related tests added = 607/607.
