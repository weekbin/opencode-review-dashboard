# R16 Architect Plan (lead-synthesized)

## Scope
3 features, all additive, all client-side, ≤ 3 cap exact, 0 headroom:
1. **#29 Hide-whitespace toggle** (5/5, 80-110 LOC, LOW-MEDIUM)
2. **#30 Copy finding as Markdown** (4/5, 50-70 LOC, LOW)
3. **#31 Diff expand-all / collapse-all** (4/5, 50-80 LOC, LOW)

**Total**: 180-260 LOC across `src/ui/app.ts` (+180-220) + `src/ui/review.html` (+10-20) + `src/ui/r16-features.test.ts` (new, +300-400) + `README.md` (+9) + `README.zh-CN.md` (+9) + `docs/screenshots/r16-*.png` (new × 3).

## File deltas (6 files)

| File | LOC | What changes |
|---|---|---|
| `src/ui/app.ts` | +180-220 | See feature breakdown below |
| `src/ui/review.html` | +10-20 | 3 new toolbar buttons |
| `src/ui/r16-features.test.ts` | +300-400 | NEW · 18 ACs as vitest unit tests |
| `README.md` | +9 | SG.11 user-manual style · 3 feature bullets |
| `README.zh-CN.md` | +9 | Mirror per SG.6 lockstep |
| `docs/screenshots/r16-*.png` | new × 3 | SG.10/SG.12 visual evidence |

## Acceptance criteria (18 ACs · 6 per feature)

### Feature #29 — Hide-whitespace toggle

- **AC1**: New "Ignore whitespace changes" toggle button in the toolbar, next to `layoutToggle` at `src/ui/app.ts:1244`. Persists to `localStorage` key `diff-review:ignore-whitespace` (boolean).
- **AC2**: When ON, all rendered diff lines (additions, deletions, context) have leading/trailing whitespace collapsed (every `\s+` → single space, trim trailing). Implementation: `stripWhitespace(content)` helper applied to `file.before` and `file.after` strings BEFORE passing to `new FileDiff<Meta>(...)` constructor.
- **AC3**: Toggle persists across page reloads via `writeStored(WHITESPACE_KEY, ...)`.
- **AC4**: Toggle triggers `renderDiffPanel()` re-render (mirrors `setLayout:1251-1257` pattern).
- **AC5**: Pure-client-side — no server changes, no schema, no new deps.
- **AC6**: Strip-whitespace function handles tab-vs-space: collapses consecutive whitespace to single space, trims leading/trailing. Does NOT alter intra-line word boundaries.

### Feature #30 — Copy finding as Markdown snippet

- **AC7**: New "Copy as MD" button in finding actions row, next to `copyLinkBtn` at `src/ui/app.ts:3371-3380`.
- **AC8**: `copyFindingAsMarkdownToClipboard(findingId, button)` function (mirrors `copyFindingPermalinkToClipboard:309-352` pattern with clipboard + fallback + setStatus).
- **AC9**: Clipboard receives per-finding Markdown snippet:
  ```
  [Round N] **[file:line](permalink)** — <comment>
  
  > audit: <N> edits
  reactions: <emoji>×<count> ...
  ```
  Format spec lives in test (`T30.MDFormatTest`) as single source of truth.
- **AC10**: Uses existing `navigator.clipboard?.writeText` pattern (line 330-338) with `fallbackCopy()` fallback.
- **AC11**: `setStatus("Copied as Markdown")` on success / fallback success.
- **AC12**: New helper `buildFindingMarkdownSnippet(entry: ConversationEntry, round: number): string` (separate from `generateMarkdownSummary` which is the export-format helper).

### Feature #31 — Diff expand-all / collapse-all buttons

- **AC13**: Two new buttons "Expand all" + "Collapse all" in the diff panel header near `renderDiffPanel:3980`.
- **AC14**: Iterate `state.views.values()` (existing Map at `app.ts:1169`, NOT new field) — for each `view.instance`, call `setOptions({...view.instance.options, expandUnchanged: true | false})` then `view.instance.rerender()`.
- **AC15**: Pierre205 `setOptions` takes FULL `FileDiffOptions` (not Partial). The spread pattern `{...view.instance.options, expandUnchanged}` is correct (preserves all other options).
- **AC16**: `rerender()` bypasses the `areRenderRangesEqual` early-return guard (passes `forceRender: true` per `FileDiff.js:264-273`).
- **AC17**: `setStatus("Expanded all files" | "Collapsed all files")` on each toggle.
- **AC18**: Dispose pattern unchanged — `renderDiffPanel:3981-3983` already calls `view.instance.cleanUp()` on every re-render.

## Per-feature implementation outline

### #29 Hide-whitespace

```typescript
// New state field at app.ts:144-149 area
ignoreWhitespace: boolean;

// New constant
const WHITESPACE_KEY = "diff-review:ignore-whitespace";

// Load on init
state.ignoreWhitespace = readStored(WHITESPACE_KEY, false);

// New helper
function stripWhitespace(content: string): string {
  return content.replace(/\s+/g, " ").trim();
}

// New toggle button in review.html near #diff-layout-toggle
<button id="whitespace-toggle" class="toolbar-btn">Ignore whitespace</button>

// In renderDiffPanel, BEFORE creating FileDiff
const before = state.ignoreWhitespace ? stripWhitespace(file.before ?? "") : file.before;
const after = state.ignoreWhitespace ? stripWhitespace(file.after ?? "") : file.after;

// New handler
function setIgnoreWhitespace(value: boolean) {
  writeStored(WHITESPACE_KEY, value);
  state.ignoreWhitespace = value;
  document.getElementById("whitespace-toggle")?.setAttribute("aria-pressed", String(value));
  renderDiffPanel();
}
```

### #30 Copy as MD

```typescript
// New helper at module-level
function buildFindingMarkdownSnippet(entry: ConversationEntry, round: number): string {
  const permalink = buildFindingPermalink(entry.id);  // R11 helper
  const auditCount = (entry.comments?.length ?? 1) - 1;
  const reactions = (entry.reactions ?? []).map(r => `${r.emoji}×${r.count}`).join(" ");
  const lastEdit = entry.audit?.[entry.audit.length - 1];
  return [
    `[Round ${round}] **[${entry.file}:${entry.line}](${permalink})** — ${entry.comment}`,
    "",
    auditCount > 0 ? `> audit: ${auditCount} edits${lastEdit ? ` (last: ${lastEdit.time})` : ""}` : "",
    reactions ? `reactions: ${reactions}` : "",
  ].filter(Boolean).join("\n");
}

// New function (mirrors copyFindingPermalinkToClipboard:309-352)
async function copyFindingAsMarkdownToClipboard(findingId: string, button: HTMLElement) {
  const entry = state.data.entries.find(e => e.id === findingId);
  if (!entry) return;
  const snippet = buildFindingMarkdownSnippet(entry, state.round);
  let ok = false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(snippet);
      ok = true;
    } catch { ok = fallbackCopy(snippet); }
  } else {
    ok = fallbackCopy(snippet);
  }
  setStatus(ok ? "Copied as Markdown" : "Copy failed");
}

// New button in finding actions row at line 3371-3380
<button class="copy-md-btn" data-finding-id="${entry.id}">Copy as MD</button>

// Wire up in finding render: onclick="copyFindingAsMarkdownToClipboard('${entry.id}', this)"
```

### #31 Expand-all / Collapse-all

```typescript
// No new state field — uses existing state.views Map (app.ts:1169)

// New functions at module-level
function expandAllFiles() {
  for (const view of state.views.values()) {
    view.instance.setOptions({ ...view.instance.options, expandUnchanged: true });
    view.instance.rerender();
  }
  setStatus("Expanded all files");
}

function collapseAllFiles() {
  for (const view of state.views.values()) {
    view.instance.setOptions({ ...view.instance.options, expandUnchanged: false });
    view.instance.rerender();
  }
  setStatus("Collapsed all files");
}

// New buttons in diff panel header at app.ts:3980
<button onclick="expandAllFiles()">Expand all</button>
<button onclick="collapseAllFiles()">Collapse all</button>
```

## Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | `setOptions` on FileDiff resets managers (LineSelection, MouseEvent) if their options drift between calls | LOW | Spread pattern `{...view.instance.options, expandUnchanged}` preserves all other options. Test: clicking line still works after Expand-all. |
| R2 | `stripWhitespace` intra-line semantics: collapsing all whitespace to single space may merge visually-distinct words | LOW-MEDIUM | Acceptable trade-off: every whitespace run collapsing is the standard behavior (matches Phabricator "ignore all whitespace"). Test verifies expected outputs. |
| R3 | `renderDiffPanel()` rebuild tears down existing FileDiff instances; finding annotations on collapsed regions get lost | MEDIUM | For Hide-ws specifically: only triggers on toggle. For Expand-all: setOptions + rerender preserves annotations (Pierre205 merges). |
| R4 | Copy MD format opinionated (snippet shape) | LOW | Format spec in test as single source of truth; user feedback can re-spec post-R16. |
| R5 | `state.views` Map may be undefined during first render or after navigation | LOW | Guard with `if (state.views) { for (const view of state.views.values()) ... }` |

## Hand-off items to Dev (12 items)

1. **Pierre205 version check**: `cat package.json | grep pierre` confirms `@pierre/diffs v1.1.0-beta.13` ✓ (already verified)
2. **No new state field** for Expand-all — reuse `state.views` Map
3. **No new schema field** for any of the 3 features
4. **localStorage key** for Hide-ws: `diff-review:ignore-whitespace` (new, no migration)
5. **README updates** (SG.11 user-manual style): add 3 bullets to "Features" section + 1 keyboard-shortcut tip to the table (Hide-ws only — Cmd+\ or Cmd+I)
6. **README.zh-CN.md updates** (SG.6 lockstep): mirror README changes in same commit
7. **Test file**: `src/ui/r16-features.test.ts` (new) with 18 ACs as vitest unit tests (defense-in-depth per R12 retro pattern: 3 features × 6 ACs × 1-3 tests each = ~30 unit tests)
8. **Screenshots** (SG.10/SG.12): 3 new PNGs in `docs/screenshots/`: `r16-hide-whitespace.png`, `r16-copy-as-md.png`, `r16-expand-all.png`
9. **Commit message format**: 3 commits (one per feature) + 1 test commit + 1 docs commit, OR single atomic commit per feature. Dev choice.
10. **Defense-in-depth test count**: target 30+ unit tests (R12 retro pattern: 50% over plan minimum)
11. **Format spec test for Copy MD**: `T30.MDFormatTest` validates exact Markdown output (catches drift)
12. **Build verification**: `bun run build` must produce 304 files / < 12 MB output

## Pre-commit audit gates (Phase 2.5, lead-direct per v5.3.3)

1. **Test gates**: `bun test` → 262 + N pass / 0 fail (N ≥ 25 expected)
2. **Lint/typecheck/format**: 0 warnings, 0 errors, clean
3. **Build**: `bun run build` exit code 0
4. **Scenario count audit-correct grep**: `grep -cE '^ "[a-z][a-z-]+": \{ setup:' scripts/test-review-ui/scenarios.mjs` should match README + scripts/README (no e2e drift)
5. **File count delta**: 6 files changed (app.ts + review.html + r16-features.test.ts + README.md + README.zh-CN.md + 3 screenshots) — verify before commit

## Decision: PROCEED to Phase 2 Dev

Scope locked, ACs defined, hand-off items enumerated. Ready for user "go".

## Pipeline expectation

| Phase | Mode | Time |
|---|---|---|
| 2 Dev (this round) | subagent, 18-22 min budget | 20 min |
| 2.5 Pre-Commit Audit | lead-direct | 2 min |
| 2.6 Lead Merge+Push | lead-direct (NEW v5.3.3) | 2 min |
| 3a-3b Tester | lead-synthesized | 8 min |
| 3c Playwright | SKIPPED (SG.5 quota-override) | 0 |
| 3.5 Doc Writer | lead-synthesized (SG.6 zh-CN lockstep) | 5 min |
| 4 + 4.5-4.9 closure | lead-owned | 5 min |
| SG.10/SG.12 screenshots | lead-direct | 5-10 min |
| **Total R16 time** | | **~50-60 min** |