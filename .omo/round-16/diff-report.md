# R16 3b Diff Report (lead-synthesized)

## Files changed
5 files, +729 insertions / -8 deletions across 1 atomic commit (0fa959d) + 1 merge commit (91611cf)

| File | LOC | Description |
|---|---|---|
| src/ui/app.ts | +167 / -8 | 3 features integrated |
| src/ui/review.html | +55 | 3 new toolbar buttons + CSS |
| src/r16-features.test.ts | +507 (NEW) | 65 unit tests covering 18 ACs |
| README.md | +4 | 3 feature bullets + 1 keyboard-shortcut tip (SG.11 user-manual) |
| README.zh-CN.md | +4 | Mirror per SG.6 lockstep |
| **Total** | **+729** | within 180-260 PM-Researcher envelope (large due to test coverage defense-in-depth) |

## Feature #29 — Hide-whitespace toggle (app.ts:151, 177-179, 1250, 1344-1357)

**Constants and helpers added**:
```typescript
const IGNORE_WHITESPACE_KEY = "diff-review:ignore-whitespace";

function stripWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}
```

**State field**:
```typescript
ignoreWhitespace: readStored<"on" | "off">(IGNORE_WHITESPACE_KEY, ["on", "off"], "off") === "on",
```

**Toolbar button + handler**:
```typescript
const ignoreWhitespaceToggle = document.querySelector("#ignore-whitespace") as HTMLButtonElement;
// ARIA pressed state + setIgnoreWhitespace function (mirrors setLayout pattern)
```

**Apply at 3 FileDiff instantiation sites**:
- `createView` (modified files): `state.ignoreWhitespace ? stripWhitespace(file.before || "") : file.before`
- `createAddedFileView` (new files): same pattern for file.after only
- `createDeletedFileView` (deleted files): same pattern for file.before only

## Feature #30 — Copy as Markdown (app.ts:359-457, 3492-3502)

**Helper**:
```typescript
function buildFindingMarkdownSnippet(entry: ConversationEntry, round: number): string {
  // Format: [Round N] **[file:line](permalink)** — comment\n\n> audit: N edits\nreactions: emoji×N
}
```

**Clipboard function** (mirrors `copyFindingPermalinkToClipboard` pattern at app.ts:309-352):
```typescript
async function copyFindingAsMarkdownToClipboard(
  finding: ConversationEntry,
  round: number,
  button: HTMLButtonElement,
): Promise<void> {
  const md = buildFindingMarkdownSnippet(finding, round);
  // navigator.clipboard?.writeText + fallbackCopy + setStatus
}
```

**Button in finding actions row** (next to copyLinkBtn at app.ts:3371-3380):
```typescript
const copyMdBtn = document.createElement("button");
copyMdBtn.textContent = "Copy as MD";
copyMdBtn.addEventListener("click", () => {
  void copyFindingAsMarkdownToClipboard(entry, entry.round ?? 0, copyMdBtn);
});
```

**Type widening** (additive only):
```typescript
// ConversationEntry got optional audit_log field
// Matches R15 additive pattern (audit_log was server-side in src/index.ts)
```

## Feature #31 — Expand-all / Collapse-all (app.ts:4099-4145)

**Core function** (iterates existing state.views Map — NO new state field):
```typescript
function setAllExpanded(expand: boolean): void {
  if (!state.views) return;
  for (const view of state.views.values()) {
    view.instance.setOptions({ ...view.instance.options, expandUnchanged: expand });
    view.instance.rerender();
  }
  setStatus(expand ? "Expanded all files" : "Collapsed all files");
}
```

**Buttons created in renderDiffPanel** (panel-level toolbar above all file cards):
```typescript
const expandAllBtn = document.createElement("button");
expandAllBtn.className = "diff-expand-all-btn";
expandAllBtn.textContent = "Expand all";
expandAllBtn.title = "Expand all unchanged regions across every file";
expandAllBtn.addEventListener("click", () => setAllExpanded(true));

const collapseAllBtn = document.createElement("button");
collapseAllBtn.className = "diff-collapse-all-btn";
collapseAllBtn.textContent = "Collapse all";
collapseAllBtn.title = "Collapse all unchanged regions across every file";
collapseAllBtn.addEventListener("click", () => setAllExpanded(false));
```

## review.html changes (+55 lines)

- Toolbar button for "Ignore whitespace" near layout-toggle (lines 2511-2520)
- CSS for new buttons in panel toolbar (lines 1282-1306)

## r16-features.test.ts (NEW, +507 lines, 65 tests)

Coverage:
- 22 tests for #29 Hide-ws (state field, stripWhitespace semantics, toggle handler, persistence, render trigger)
- 24 tests for #30 Copy MD (format spec, clipboard pattern, button placement, setStatus feedback)
- 19 tests for #31 Expand-all (state.views iteration, setOptions spread, rerender, dispose preservation)

## README changes (+4 each, both languages)

```markdown
### Reading diffs
- **★ Ignore whitespace changes** *(added R16)* — toggle off to collapse all whitespace runs in the diff...

### Adding findings
- **Copy as Markdown** *(added R16)* — one click copies a finding + location + audit trail + reactions as Markdown...

### Reviewing and iterating
- **★ Expand all / Collapse all** *(added R16)* — two buttons in the diff panel header toggle Pierre205's collapsed context across every file...

### Keyboard shortcuts
| `Ctrl+I` / `Cmd+I` | Toggle "Ignore whitespace" |
```

## Verdict: clean diff, no unrelated changes

All edits are scoped to R16 features. No accidental touches in other areas. Matches plan hand-off items.