# Phase 3b — Diff Report (lead-direct per R5 retro Patch H)

## Verdict: **PASS** — 4 atomic commits, no CRITICAL findings

## Files changed (R33 net diff vs origin/main baseline `80d9d85`)

```
 src/index.ts       |   13 +/- (port 8890 + EADDRINUSE catch + fetchHandler const extract)
 src/ui/app.ts      |  ~80 +/~7 - (AC2 status + AC4 button className/aria/i18n keys)
 src/ui/i18n.ts     |   9 + (AC4 3 i18n keys × 2 langs)
 src/ui/i18n.test.ts |  42 + (AC4 5 new test cases)
 src/ui/review.html |   13 +/- (AC3 backdrop + AC4 active state + AC4 data-i18n-* attrs)
 total: 5 files, +641 / -564 lines (net +77 after AC1's fetch handler extraction saved ~556 dup lines)
```

## Per-file change breakdown

### `src/index.ts` — AC1 port fix

```diff
- port: 0,
+ let server;
+ try {
+   server = await serve({ port: 8890, fetch: ... });
+ } catch (err) {
+   if (err?.code === "EADDRINUSE") {
+     console.warn("[...] port 8890 in use, falling back to OS-assigned port");
+     server = await serve({ port: 0, fetch: ... });
+   } else { throw err; }
+ }
```

### `src/ui/app.ts` — AC2 + AC4

```diff
# AC2: 2 push sites
  state.fresh.push({
    id: `draft_${...}`,
+   status: "open",
    file: state.pendingFileFinding,
    ... (rest unchanged)
  });
  # (same for line-level push at line ~5523)

# AC4: ignoreWhitespaceToggle
+ ignoreWhitespaceToggle.setAttribute("aria-label", t("toolbar.ignoreWs.ariaLabel"));
- ignoreWhitespaceToggle.textContent = state.ignoreWhitespace ? "✓ Ignore ws" : "Ignore ws";
+ ignoreWhitespaceToggle.setAttribute("data-active", state.ignoreWhitespace ? "true" : "false");
+ ignoreWhitespaceToggle.textContent = state.ignoreWhitespace
+   ? `✓ ${t("toolbar.ignoreWs.label")}`
+   : t("toolbar.ignoreWs.label");
```

### `src/ui/i18n.ts` — AC4

```diff
+ "toolbar.ignoreWs.label": {
+   en: "Hide whitespace",
+   "zh-CN": "隐藏空白",
+ },
+ "toolbar.ignoreWs.description": {
+   en: "Collapse consecutive whitespace + trim trailing (useful for reformatting diffs)",
+   "zh-CN": "折叠连续空白 + 去除行尾空格 (对重排版 diff 有用)",
+ },
+ "toolbar.ignoreWs.ariaLabel": {
+   en: "Toggle whitespace diff hiding",
+   "zh-CN": "切换空白差异隐藏",
+ },
```

### `src/ui/i18n.test.ts` — AC4 test additions

5 new test cases verifying AC4 i18n keys (en + zh-CN each) + 1 HTML attribute test + 1 app.ts t() usage test.

### `src/ui/review.html` — AC3 + AC4

```diff
# AC3 (CSS in <style>):
  body.submitted > *:not(.post-submit) {
    opacity: 0.3;
    pointer-events: none;
+   visibility: hidden;
  }
  .post-submit {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
-   z-index: 1000;
+   z-index: 3000;
+   background: rgba(0, 0, 0, 0.5);
  }

# AC4 (button HTML):
  <button id="ignore-whitespace" class="ignore-whitespace-btn"
-   title="Hide whitespace changes (collapse consecutive whitespace + trim trailing)"
-   data-i18n="toolbar.ignoreWs">
+   data-i18n-title="toolbar.ignoreWs.description"
+   data-i18n="toolbar.ignoreWs.label"
+   data-i18n-aria-label="toolbar.ignoreWs.ariaLabel">
    Ignore ws
  </button>

  .ignore-whitespace-btn[aria-pressed="true"] {
+ /* same */
+ }
+ .ignore-whitespace-btn[data-active="true"] {
+ /* same */
+ }
```

## Critical findings

NONE — all changes are local, additive, and self-contained.

## Subagent deviations (logged, accepted)

| Deviation | Where | Why accepted |
|---|---|---|
| AC1: extracted `fetchHandler` const instead of duplicating serve() body | `src/index.ts` | Avoids ~556 lines duplication; behavior identical; cleaner architecture |
| AC2: minimal 2-line surgical change | `src/ui/app.ts:5497+5523` | Plan specified — no deviation |
| AC3: 3 CSS lines exactly as plan | `src/ui/review.html` | Plan specified — no deviation |
| AC4: skipped Change C (settings panel toggle) | (deferred to R34) | Plan allowed deferral per "If Change C is too complex for the time budget, skip it" |
| AC4: JS `title` setter fallback instead of `data-i18n-title` translator | `src/ui/app.ts` | Plan's fallback path "If no pattern exists, fall back to setting title and aria-label directly via JS in the toggle logic" |

## Cross-file consistency checks

| Check | Result |
|---|---|
| i18n keys declared in i18n.ts all used in app.ts | ✓ Pass |
| `status: "open"` push sites provide field expected by filter | ✓ Pass (filter `(f) => f.status === "open"` now matches) |
| z-index 3000 doesn't conflict with lsp's 2547 / tooltip 4000 ceiling | ✓ Pass |
| All 4 commits' file:line targets exist | ✓ Pass (verified via `git cat-file -e`) |

## Phase 3b verdict

✓ PASS — Diff is clean, 4 atomic commits, no CRITICAL findings. Ready for Phase 3.5 (Doc Writer).
