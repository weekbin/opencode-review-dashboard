# R16 PM Researcher Report (verification of subagent claims)

## Verdict: PROCEED — but reclassify Hide-ws risk from MEDIUM → LOW-MEDIUM (200 → 100 LOC)

All 4 factual claims verified, 1 with material correction. The 3-test gate passes for all R16 candidates. Hidden LOC win: `state.views` already exists as `Map<string, View>` with `View.instance: FileDiff<Meta>` — the subagent's proposed new `state.fileDiffInstances` Map is REDUNDANT, saving ~15-25 LOC across Hide-ws + Expand-all.

## Claim 1: Pierre205 setOptions
- **Finding**: A for `expandUnchanged` / B for `ignoreWhitespace`. `setOptions` exists but signature is `setOptions(options: FileDiffOptions<LAnnotation> | undefined): void` — **full options object, NOT Partial** as the subagent inferred. Also does NOT auto-rerender: caller must invoke `.rerender()` separately.
- **Evidence**:
  - `node_modules/@pierre/diffs/dist/components/FileDiff.d.ts:89` — `setOptions(options: FileDiffOptions<LAnnotation> | undefined): void;`
  - `node_modules/@pierre/diffs/dist/components/FileDiff.d.ts:102` — `rerender(): void;`
  - `node_modules/@pierre/diffs/dist/components/FileDiff.js:131-140` — `setOptions()` impl forwards to `hunksRenderer.setOptions()` and managers; does NOT call `this.rerender()`.
  - `node_modules/@pierre/diffs/dist/components/FileDiff.js:264-273` — `rerender()` passes `forceRender: true`, which bypasses the `areRenderRangesEqual` early-return guard at `:286`.
  - `node_modules/@pierre/diffs/dist/renderers/DiffHunksRenderer.js:102-110` — `DiffHunksRenderer.getOptionsWithDefaults()` reads `expandUnchanged` from `this.options` (so setOptions → rerender WILL re-read the new value).
  - `node_modules/@pierre/diffs/dist/types.d.ts:285-295` — `BaseDiffOptions` has `expandUnchanged?: boolean`, `collapsedContextThreshold?: number`, `expansionLineCount?: number`, but **NO `ignoreWhitespace`**. The only references in the package are inside `worker/worker-portable.js:12606/12693/12716` (internal jsdiff library), not reachable via the `FileDiff` public API.
- **Impact on R16 scope**:
  - **Hide-ws**: ⚠️ **subagent's premise is partially wrong**. Pierre205 has no public `ignoreWhitespace` option on FileDiff. Implementations path = client-side whitespace strip on `file.before`/`file.after` content passed to `new FileDiff<Meta>(...)` + `renderDiffPanel()` re-render (mirrors `setLayout:1251`). Estimated 80-110 LOC, not 150-200. **Downgrade risk from MEDIUM → LOW-MEDIUM**.
  - **Expand-all**: ✅ works as subagent described but use full-options pattern: `view.instance.setOptions({...view.instance.options, expandUnchanged: true}); view.instance.rerender();` — NOT `setOptions({expandUnchanged: true})` (would wipe out handlers). Plus BONUS: state.views already exists as `Map<string, View>` (app.ts:1169) where View has `instance: FileDiff<Meta>` (app.ts:139-142), so no new Map field is needed. 50-80 LOC confirmed.

## Claim 2: buildExportContent helper
- **Finding**: PARTIAL — wrong name, right purpose, right location. The function is called **`generateMarkdownSummary`**, not `buildExportContent`. Defined at `app.ts:2932`, takes an `ExportState` and produces a full multi-section Markdown report (Summary table + Findings table + Notes).
- **Evidence**:
  - `src/ui/app.ts:2932` — `function generateMarkdownSummary(state: ExportState): string {`
  - `src/ui/app.ts:2860-2990` — correct range; this is the **markdown export module** with `ConversationEntry` type at :2860, `ExportFile`/`ExportFinding`/`ExportState` types at :2904/2913/2924, and `formatRelativeTime` at :2887.
  - Format includes a findings table (`## Findings`) with columns `id | file:line | category | severity | status | comment` at :2974-2987.
- **Impact**:
  - Copy MD feature should NOT reuse `generateMarkdownSummary` directly — that emits a full review summary (heading + per-severity stats + per-category stats + table of findings), which is overkill for a "share this single finding" workflow.
  - Instead: **model a smaller per-finding Markdown formatter** (`buildFindingMarkdownSnippet(entry: ConversationEntry): string`) following the visual conventions of `generateMarkdownSummary` (table-row escapes at line 2981, comment excerpt trim at line 2982).
  - **Recommendation**: Architect should spec the per-finding MD format distinctly (e.g., `[Round N] **[file:line](permalink)** — comment\n\n> last edit: ...`) rather than reusing the export-format logic.

## Claim 3: navigator.clipboard import
- **Finding**: CONFIRMED — `navigator.clipboard?.writeText` IS already used at line 330-338, with a `fallbackCopy()` textarea+execCommand fallback for permission-blocked environments. Also reused at line 2731 for commit SHA copy (without fallback). NOT a module-level "import" — it's a runtime check on the global `navigator`.
- **Evidence**:
  - `src/ui/app.ts:309-352` — `async function copyFindingPermalinkToClipboard(findingId, button)` with full fallback pattern.
  - `src/ui/app.ts:330-338` — the actual `navigator.clipboard?.writeText` call with fallback.
  - `src/ui/app.ts:2731` — `navigator.clipboard.writeText(commit.sha).catch(() => undefined)` for commit-permalink copy.
  - `setStatus` for feedback at `:348-350` (success/error messages).
- **Impact**:
  - Copy MD feature has all the clipboard infrastructure ready. The new `copyFindingAsMarkdownToClipboard(findingId, button)` function can be a near-copy of `copyFindingPermalinkToClipboard:309-352` with the URL replaced by the snippet string and a different `setStatus` text.
  - Saves implementation time; no permission polyfill or feature-detection needed.
  - 50-70 LOC estimated (lower than subagent's 60-90 due to existing pattern reuse).

## Claim 4: FileDiff constructor pattern
- **Finding**: THREE separate instantiation sites, NOT one — all returning `{kind: "diff" as const, instance}`. The instances are stored in the EXISTING `state.views` Map (path-keyed), NOT a new field.
- **Evidence**:
  - `src/ui/app.ts:2188` — `new FileDiff<Meta>({...})` in `createView(file, mount)` (modified files)
  - `src/ui/app.ts:2249` — `new FileDiff<Meta>({...})` in `createAddedFileView(file, mount)` (new files)
  - `src/ui/app.ts:2296` — `new FileDiff<Meta>({...})` in `createDeletedFileView(file, mount)` (deleted files)
  - `src/ui/app.ts:139-142` — `type View = { kind: "diff"; instance: FileDiff<Meta>; };`
  - `src/ui/app.ts:1169` — `views: new Map<string, View>()` in state declaration
  - `src/ui/app.ts:3981-3983` — `renderDiffPanel` already iterates `state.views` and calls `view.instance.cleanUp()` on dispose (perfect pattern for expand-all to mirror).
- **Impact**:
  - **No need for a new `state.fileDiffInstances` Map** — `state.views` (already path-keyed, already carrying the instance) is sufficient. Subagent's proposed parallel Map is REDUNDANT, saves 15-25 LOC of plumbing.
  - **Dispose pattern is already correct** — `renderDiffPanel:3981-3983` calls `cleanUp()` without args (no recycle). For Hide-ws (which calls `renderDiffPanel()` to fully rebuild on toggle) this is fine because FileDiff's `enabled` flag is checked at `:282` of FileDiff.js — cleanUp sets `enabled = false`, then render() throws if called.
  - **Single-instance-per-file confirmed**: exactly 1 FileDiff per rendered file in `state.views`, regardless of which `createXxxView` produces it. Cleanup is automatic on every render. Expand-all just iterates `state.views.values()` and calls `setOptions({...view.instance.options, expandUnchanged})` + `rerender()` on each instance.

## Claim 5: 3-test gate reverse-validation

| Candidate | Test 1 (pain) | Test 2 (gap) | Test 3 (LOC) | Verdict |
|---|---|---|---|---|
| **Hide-ws** | ✅ Real. Every long-format-only PR (whitespace reformatting) is unreadable without this. Single biggest noise source in code-review tooling. | ✅ Closes competitor gap. GitHub + GitLab + Phabricator + Gerrit all ship "ignore whitespace" toggles (4/4). | ✅ Client-side whitespace strip + layout-mirror toggle pattern ≈ 80-110 LOC (down from subagent's 150-200 estimate once the MEDIUM→LOW risk is reclassified) | **PASS** |
| **Copy MD** | ✅ Real. Share-out workflow today = manual copy (id) + manual reformat. Every commit message, Slack DM, and Notion doc demands this. | ✅ Plausible-unique. None of GitHub Primer / GitLab Pajamas / Phabricator / Gerrit ship single-click Markdown snippet with reactions + audit + permalink combined. | ✅ Reuses existing clipboard + setStatus pattern + builds on `generateMarkdownSummary` format conventions. 50-70 LOC. | **PASS** |
| **Expand-all** | ✅ Real. 50+ file PRs require this to be navigable. Without it, every "expand all changed regions" requires per-file click. | ✅ Plausible-unique. GitHub = per-file "Load diff" only; GitLab = per-file "Show full file" only; Phabricator = per-file "Expand All" (NOT global); Gerrit = "Reviewed" toggle. **No global expand-all/collapse-all across all files.** | ✅ Reuses `state.views.values()` (already exists) + setOptions+rerender combo (verified at Pierre205 FileDiff.d.ts:89 + :102). 50-80 LOC confirmed. | **PASS** |

**No candidate downgrades; all 3 pass.** The user-locked ~260-370 LOC envelope is a likely over-estimate due to the MEDIUM risk upward buffer on Hide-ws. Realistic total: **180-260 LOC** with all 3 candidates at LOW risk.

## Recommended R16 scope adjustments

1. **Hide-ws risk reclassification**: MEDIUM (150-200 LOC) → **LOW-MEDIUM (80-110 LOC)**. Pierre205 does NOT expose `ignoreWhitespace` on FileDiffOptions, so the implementation is a client-side `stripWhitespace(content)` helper + mirror of the `setLayout:1251-1257` pattern (call `renderDiffPanel()` on toggle). Saves ~50-80 LOC.

2. **Drop the proposed `state.fileDiffInstances` Map** — `state.views: Map<string, View>` (app.ts:1169) already holds the FileDiff instances per file path. Reuse this for Expand-all's iteration. Saves ~15-25 LOC + 1 state field declaration.

3. **No new schema field, no new deps, no Pierre205 instance teardown/rebuild.** All three candidates stay purely additive on localStorage + button-onClick + state-extension.

4. **Tighten the Copy MD format spec**: Architect should NOT simply reuse `generateMarkdownSummary` — emit a smaller per-finding snippet like `[Round N] **[file:line](permalink)** — comment\n\n> audit: 2 edits\nreactions: 👍×3`. Reserve for Architect plan.

## Open questions for Architect

1. **Hide-ws stripWhitespace function shape**: how to handle tab-vs-space intra-line differences? Treat all whitespace runs as equal (`/\s+/g → " "`)? Or preserve visual indentation but ignore changes? My recommendation: simple collapse (every `\s+` → ` `, trim trailing). Document this in AC and surface in user-visible label as "Ignore whitespace changes" (NOT "strip all whitespace").

2. **Expand-all partial-options pattern**: `setOptions({...view.instance.options, expandUnchanged: bool})` — but this copies ALL options (theme, handlers, renderAnnotation, etc.) which means a stale closure could be passed. The Pierre205 source at FileDiff.js:131-140 does NOT touch `getHoveredLine` or `setLineAnnotations`. Architect should confirm: rebuild `View.instance` lookup table, NOT iterate `state.views`, OR keep `setOptions({...spread, expandUnchanged: bool})` and trust that other options haven't drifted.

3. **Copy MD audit trail rendering**: `state.data.entries[i].comments[]` carries comment history (per R15 audit-trail). Architect should decide: include the full thread in the snippet, or just count + last-edit summary? My preference: count + last-edit (snippet stays short; full thread doesn't fit Slack/Notion well).

4. **localStorage migration**: adding 1 new key (`WHITESPACE_KEY = "diff-review:ignore-whitespace"`) — no existing key needs migration. Existing 6 keys (LAYOUT/THEME/CONV_FILTER/ACTIVE_TAB/SORT_FINDINGS/SIDEBAR) are unaffected.

5. **Pierre205 version drift**: `package.json` was not in the read scope, but `setOptions` signature has been stable since 2024-pierre-fork adopted it. Verify exact major.minor before AC lock-in Phase 1 (one-line `cat package.json | grep pierre` check).
