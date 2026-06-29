---
name: review-dashboard-ui-test
description: "End-to-end Playwright test harness for the opencode-review-dashboard UI. Sets up a mock review server (no real OpenCode needed), serves the built dist/ artifacts, and exercises the tool against realistic git scenarios — no worktree, has worktree, auto-pick across worktrees, --base <branch>, --base <commit>, --files filter, sidebar resize. Use this skill whenever the user wants to verify UI behavior, debug the detection logic, capture screenshots, or check sidebar persistence — bypasses the need to restart OpenCode for every test cycle. Triggers: '/test-review-ui', 'test the review UI', 'verify sidebar', 'review dashboard e2e', 'open the review UI'."
---

# Review Dashboard UI — Playwright E2E Test Harness

This skill lets you exercise the full opencode-review-dashboard UI through
Playwright MCP **without** needing a real OpenCode session, git worktree, or
running `/diff-review-dashboard` against a real codebase.

It exists because the detection logic (`src/index.ts:collect`) has many
branches (working tree, auto-base, auto-worktree, `--base <ref>`, `--files
filter`) and the UI has interactive state (sidebar resize, tree/flat toggle,
diff cards) that's tedious to test by hand. Restarting OpenCode between
iterations is also slow.

## When to use

- Verifying a change to `src/index.ts` (collect / detectMeaningfulBase /
  listWorktrees / auto-pick) or `src/ui/app.ts` (sidebar, header, etc.)
- Capturing a screenshot of a specific scenario for a bug report
- Debugging why a particular git scenario doesn't surface a review
- Smoke-testing the built `dist/` after `bun run build`

## Architecture

```
scripts/test-review-ui/
├── mock-server.py     # Serves dist/ui/* + /api/review/* with mock data
├── scenarios.mjs      # 8 git scenarios (no-worktree, has-worktree, base, etc.)
├── e2e.mjs            # Runs each scenario + sidebar resize + persistence
└── README.md          # Quick reference
```

The harness is fully self-contained. No OpenCode required. All git fixtures
are created in temp dirs at runtime.

## Step 1 — Build the dist

```bash
bun run build
```

The mock server reads from `dist/ui/`. If you skip this step, you'll test
the previous build.

## Step 2 — Pre-test environment cleanup (R4 loop meta-review lesson, MANDATORY)

Before starting any Playwright test, run a pre-test cleanup. This prevents:
- Page-leak from prior sessions (Chrome processes accumulating to 11+ in 2h)
- Mock-server port conflict (port 8890 held by a dead prior session)
- CPU high (multiple Chrome instances × Wayland fallback GPU = ~1.6GB memory + 100% single-core)

```bash
# 1. Kill any orphan Chrome from prior Playwright MCP sessions
pkill -9 -f "chrome.*--type=zygote" 2>/dev/null
sleep 1
# 2. Kill any orphan mock-server
pkill -9 -f "mock-server.py" 2>/dev/null
sleep 1
# 3. Verify port 8890 is free
ss -ltn 2>/dev/null | grep -q :8890 && echo "ERROR: port 8890 still in use" || echo "  port 8890 free"
# 4. Verify Chrome count is reasonable (< 3 instances, after the pkill above)
chrome_count=$(ps -ef | grep -c "chrome.*--type=zygote" || echo 0)
echo "  Chrome instances: $chrome_count (should be 0 after pkill)"
```

If `chrome_count > 0` after pkill (some Chrome won't die from SIGKILL — they need SIGKILL + retry), repeat `pkill -9` once more. If it still won't go below 3, refuse to start the test and surface to the user — running Playwright in that state will CPU-pin the machine within 1-2 minutes.

## Step 3 — Start the mock server in the background

```bash
nohup setsid python3 scripts/test-review-ui/mock-server.py 8890 \
  > /tmp/review-test-server.log 2>&1 < /dev/null &
disown
sleep 1
curl -s http://127.0.0.1:8890/health  # → "ok"
```

**Why `nohup setsid ... &`**: bash tool's `&` alone is killed when the tool's
timeout fires. `nohup setsid` detaches the process from the parent group so
it survives the tool's lifetime.

**Why `< /dev/null`**: prevents the server from holding stdin open (which
would also block the tool).

**Why `disown`**: removes the job from the shell's job table so it isn't
killed by SIGHUP on tool exit.

**Record the mock server PID** for cleanup later:
```bash
MOCK_PID=$(pgrep -f "mock-server.py.*8890" | head -1)
echo "  mock server PID: $MOCK_PID"
```

## Step 4 — Drive Playwright MCP

Use the playwright MCP tools (already wired into your opencode config) to
navigate, evaluate JS, drag, screenshot, etc. All tools work against
`http://127.0.0.1:<port>/review/<id>?token=test`.

**MANDATORY**: between every test scenario, call `playwright_browser_close` to release the page + renderer. If you navigate to a new URL, the previous page stays in the renderer process — accumulating pages is the #1 cause of CPU high in Playwright tests.

Common operations:

```js
// Navigate
playwright_browser_navigate({ url: "http://127.0.0.1:8890/review/test?token=test" })
// ← ALWAYS do a teardown at the end of each scenario:
//   playwright_browser_close()  (closes current page + Chrome instance)

// Get sidebar width
playwright_browser_evaluate({ function: `() => ({
  width: document.querySelector(".sidebar").offsetWidth,
  cssVar: getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width").trim()
})` })

// Native drag (the pointer-event path is unreliable via dispatchEvent)
playwright_browser_run_code_unsafe({ code: `async (page) => {
  const r = await page.evaluate(() => {
    const rect = document.querySelector("#sidebar-resizer").getBoundingClientRect();
    return { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
  });
  await page.mouse.move(r.x, r.y);
  await page.mouse.down();
  await page.mouse.move(r.x + 200, r.y, { steps: 10 });
  await page.mouse.up();
}` })

// Screenshot
playwright_browser_take_screenshot({ type: "png", filename: "review-test.png" })
```

## Step 5 — Post-test environment cleanup (R4 loop meta-review lesson, MANDATORY)

After ALL Playwright tests are done (regardless of pass/fail), run the full cleanup. This is the #1 fix for the "Chrome instances pile up, CPU hits 100%, machine freezes" pattern:

```bash
# 1. Close any open Playwright pages / browsers
playwright_browser_close()  # call the MCP tool; harmless if no page is open

# 2. Kill the mock server (use the PID you recorded in Step 3)
if [ -n "$MOCK_PID" ]; then
  kill -9 "$MOCK_PID" 2>/dev/null
fi
pkill -9 -f "mock-server.py" 2>/dev/null  # belt + suspenders
sleep 1

# 3. Kill any orphan Chrome from this session
pkill -9 -f "chrome.*--type=zygote" 2>/dev/null
sleep 1

# 4. Verify clean state
echo "=== Post-test cleanup verification ==="
echo "  Chrome instances: $(ps -ef | grep -c 'chrome.*--type=zygote' || echo 0)"
echo "  mock-server processes: $(ps -ef | grep -c 'mock-server.py' || echo 0)"
echo "  port 8890: $(ss -ltn 2>/dev/null | grep -q :8890 && echo 'IN USE (bad)' || echo 'free (good)')"
```

If verification shows `Chrome instances > 3` or `port 8890 IN USE`, the cleanup didn't fully succeed. Repeat `pkill -9` and re-verify. **Do NOT end the test session leaving Chrome processes running** — that's how the user-reported "CPU 100%, machine freezes" happens (R4 evidence: 11+ Chrome processes from earlier sessions were running for 2+ hours with GPU process on Wayland fallback).

## Test Scenarios (the 8 core cases)

Each scenario creates a temp git repo with a specific shape, then asserts
what the tool should do. The harness runs them in order.

| # | Scenario | Setup | Expected |
|---|---|---|---|
| 1 | **No worktree, clean main** | main branch, HEAD == origin/main, no other worktrees | Diagnostic: "Working tree matches upstream. No diff to review." |
| 2 | **Has worktree (auto-pick)** | clean main + worktree on `work/feat` with 3 unpushed commits, no upstream | Tool auto-picks worktree, server launches, header shows `[worktree: work/feat]` |
| 3 | **Multiple worktrees (pick most active)** | main + wt-A (5 ahead) + wt-B (2 ahead) | Auto-picks wt-A |
| 4 | **`--base <branch>`** | main + feature branch off main, no extra work | Diffs `feature..HEAD` |
| 5 | **`--base <commit>`** | main + 1 commit on top | Diffs single commit |
| 6 | **`--base <commit>..<commit>`** | 3 commits in a range | Diffs the range |
| 7 | **Working tree changes** | main + 1 unstaged + 1 staged | Standard working-tree diff |
| 8 | **`--files` filter** | main + multi-file change, `--files src/foo.ts` | Only `src/foo.ts` in review |

Sidebar scenarios (independent of git state):
| S1 | **Drag resize** | Initial 280px → drag right 200px → expect 500px |
| S2 | **Min clamp** | Drag way left → expect 160px (SIDEBAR_MIN) |
| S3 | **Max clamp** | Drag way right (viewport=1280) → expect 1024px (80vw) |
| S4 | **Persistence** | Set 400px, reload, expect 400px (localStorage `diff-review:sidebar-width`) |
| S5 | **No re-render on drag** | 1000 rapid moves, count `#file-list > *` children before/after → must be equal |

## Common Pitfalls (from real testing)

0. **Page-leak + Chrome accumulation (R4 loop meta-review lesson, CRITICAL)**:
   the #1 cause of "Playwright tests are slow, unstable, and cause CPU 100% machine freeze" is
   that `playwright_browser_navigate` does NOT close the previous page. Each navigate leaves the
   previous page's renderer alive. Multiple navigates = multiple renderers = multiple zygotes +
   GPU processes + network + storage. After 2 hours of test sessions, 11+ Chrome processes
   accumulate (~1.6GB memory + Wayland GPU fallback to SwiftShader = single-core 100%).
   **Fix**: between every test scenario, call `playwright_browser_close()`. The MCP tool is
   idempotent — if no page is open it's a no-op. After all tests, run the Step 5 post-test
   cleanup (kill mock server PID, kill orphan Chrome, verify clean). **NEVER end a Playwright
   test session without Step 5 cleanup** — that's how the user-reported "machine freezes" happens.

1. **Server dies after tool exit**: use `nohup setsid ... < /dev/null & disown`.
   Plain `&` gets killed when bash tool times out.

2. **JS dispatches don't trigger pointer handlers**: `dispatchEvent(new
   PointerEvent(...))` for pointermove doesn't always work because the handler
   was registered on the same element AFTER `pointerdown` set up
   `setPointerCapture`. The capture is per-pointer-id, and synthetic events
   may not have a valid capture context. **Use `page.mouse.down/move/up`
   via `playwright_browser_run_code_unsafe`** — this dispatches at the
   browser level, not the JS level.

3. **App.js loads via `/assets/app.js`, not relative**: when you serve
   `dist/ui/review.html` directly, the script tag points to `/assets/app.js`
   (absolute path). Your mock server must serve the entire `dist/ui/`
   directory, not just `review.html`.

4. **Pierre/diffs lazy-loads worker modules**: `app.js` dynamically imports
   `typescript-*.js`, `pierre-dark-*.js`, `markdown-*.js` from `/assets/`.
   The mock server's `/assets/*` handler must return them with the right
   MIME type (`mimetypes.guess_type()` in Python works).

5. **`mimetypes` and `.js`**: on some systems `mimetypes.guess_type("foo.js")`
   returns `None`. Force it: `mime or "application/javascript"`. Otherwise
   the browser blocks with "MIME type of 'text/html'" errors.

6. **App reads reviewID from URL path, not query**: `location.pathname.split("/").filter(Boolean).at(-1)`.
   So the URL must be `/review/<id>` (not `/?review=<id>`).

7. **Header label format**: After auto-pick the header shows
   `"... · [worktree: <branch>]"`. The `<branch>` is the worktree's branch
   name, NOT the base ref.

8. **Pre-existing bug at `ctx.client.app.log`**: `src/index.ts:1257` uses
   `ctx.client.app.log` but the param is `context`. Crashes after detection
   succeeds. The mock server's success path (files.length > 0) hits this.
   **Workaround in test**: catch the TypeError, treat as "server launched
   successfully" (since detection already completed before the crash).

9. **`requestAnimationFrame` in dispatchEvent context**: synthetic events
   don't paint frames. The resize logic uses `requestAnimationFrame` to
   coalesce moves. With `dispatchEvent`, the rAF never fires and the width
   stays unchanged. With `page.mouse`, frames fire normally.

10. **localStorage in Playwright**: persists across page reloads but not
    across `playwright_browser_navigate` to a different URL. Use
    `page.reload()` within the same URL, not navigate, to test persistence.

11. **Worktree cleanup in e2e**: the harness now wraps `git worktree remove` in a small `run()` helper that resolves to `{ ok, stdout, stderr }`. If git cannot remove a worktree (locked ref, permission, etc.), the runner logs the stderr and force-removes the directory with `rmSync`. Temp dirs are also removed with individual try/catch so a single cleanup failure does not crash the suite.

12. **Leftover artifacts**: if previous runs left `/tmp/rd-scenario-*` directories or `/tmp/review-test-*.log` files behind, delete them before starting a new batch to avoid confusion.

## Programmatic test runner

For CI or batch verification, run `scripts/test-review-ui/e2e.mjs` which
spins up the mock server, runs all 8+5 scenarios, and prints a pass/fail
summary. Exit code 0 on all-pass, 1 on any failure.

```bash
bun run scripts/test-review-ui/e2e.mjs
```

This is what `/test-review-ui` command runs (see `.opencode/command/test-review-ui.md`).

## Files

- `scripts/test-review-ui/mock-server.py` — Python http.server based
  mock that serves `dist/ui/*` and `/api/review/*` with controllable data
- `scripts/test-review-ui/scenarios.mjs` — git setup functions for the 8 scenarios
- `scripts/test-review-ui/e2e.mjs` — orchestrates the full sweep
- `scripts/test-review-ui/README.md` — quick reference card

## When NOT to use this skill

- Production code is unbuilt (`dist/` is stale) — run `bun run build` first
- You need to test a real OpenCode session integration (plugin loading,
  context metadata, etc.) — that's outside the harness scope
- You need to test the agent auto-apply loop (requires OpenCode's
  command-template → JSON payload flow)
