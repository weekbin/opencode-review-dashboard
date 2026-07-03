# R52 Brief

**Scope**: Add loading indicator (spinner + status text + opacity) to the "Ignore ws" toggle so users see visible feedback during the diff re-render. Changes:
1. `src/ui/review.html` — add `.ignore-whitespace-btn[data-loading="true"]` CSS with opacity 0.65, cursor: progress, `::after` spinner animation
2. `src/ui/app.ts` — modify `setIgnoreWhitespace` to set `data-loading=true`, call `setStatus(...)`, defer `renderDiffPanel` via `requestAnimationFrame`, clear loading state in nested rAF
3. `src/ui/i18n.ts` — add `toolbar.ignoreWs.loading` (en: "Applying whitespace changes…", zh-CN: "正在应用空白变更…")
4. `src/ui/r52-ignore-ws-loading.test.ts` — 3 new regression tests

**Why**: GH#73 #6 reported "Hide whitespace is slow + no loading indicator on toggle". Currently `setIgnoreWhitespace` calls `renderDiffPanel` synchronously — for large diffs (5000+ lines), the work happens without visual feedback. Wrapping in rAF + adding `data-loading` state gives the browser a chance to paint the loading state, then clears it after the re-render settles.

**Risk**:
- Adding 1 frame of latency (~16ms) — minimal
- Sync `renderDiffPanel` behavior preserved (just deferred)
- No new dependencies
- 3 src/ files touched (above v6 lightweight threshold of ≤2 — regular round)

**Acceptance**:
- `.ignore-whitespace-btn[data-loading="true"]` CSS rule + spinner animation present in review.html
- `setIgnoreWhitespace` in app.ts sets `data-loading=true`, calls `setStatus`, uses 2 nested `requestAnimationFrame` calls
- `toolbar.ignoreWs.loading` i18n string has both `en` + `zh-CN`
- 3 new regression tests pass
- `bash .husky/pre-commit` → 8/8 PASS
- 635/635 tests (632 baseline + 3 R52 new)