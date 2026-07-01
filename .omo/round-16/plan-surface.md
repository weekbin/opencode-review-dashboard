# R16 plan-surface (awaiting user "go")

## Decision: PROCEED — 3 features, ≤ 3 cap exact, 0 headroom

**PM Triage**: Lead-synthesized (172 lines) + subagent FRESH surface (161 lines, 7 candidates, 3m 17s) + user-pick (1+2+3 multi-round) → 6 unique features split R16/R17.
**PM Manager**: APPROVE (3 GH issues opened #29/#30/#31 with `pm-manager-approved` labels).
**PM Researcher**: PROCEED with reclassification (Hide-ws MEDIUM→LOW-MEDIUM, 200→100 LOC, `state.fileDiffInstances` Map redundant, realistic total **180-260 LOC**).
**Planner (lead-synthesized)**: PROCEED — 3 features deterministic, all additive, ≤ 3 cap exact.
**Architect (lead-synthesized)**: PROCEED — 18 ACs + 6 file deltas + 5 risks + 12 hand-off items defined.

## 18 ACs · 6 per feature

### #29 Hide-whitespace toggle (5/5, 80-110 LOC, LOW-MEDIUM)
- AC1: New "Ignore whitespace changes" toolbar button next to layoutToggle (app.ts:1244) · localStorage key `diff-review:ignore-whitespace`
- AC2: When ON, diff lines have whitespace collapsed (`/\s+/g → " "` + trim) before Pierre205 rendering
- AC3: localStorage persistence · survives reload
- AC4: Toggle triggers `renderDiffPanel()` re-render (mirrors `setLayout:1251-1257`)
- AC5: Pure client-side · no server changes
- AC6: Intra-line word boundaries preserved

### #30 Copy finding as Markdown (4/5, 50-70 LOC, LOW)
- AC7: New "Copy as MD" button in finding actions row (next to copyLinkBtn at app.ts:3371-3380)
- AC8: `copyFindingAsMarkdownToClipboard(findingId, button)` function (mirrors `copyFindingPermalinkToClipboard:309-352`)
- AC9: Per-finding snippet format: `[Round N] **[file:line](permalink)** — comment\n\n> audit: N edits\nreactions: 👍×3 😄×1`
- AC10: Uses existing `navigator.clipboard?.writeText` + `fallbackCopy()` pattern (line 330-338)
- AC11: `setStatus("Copied as Markdown")` feedback
- AC12: New `buildFindingMarkdownSnippet(entry, round)` helper (separate from `generateMarkdownSummary`)

### #31 Diff expand-all / collapse-all (4/5, 50-80 LOC, LOW)
- AC13: Two new buttons "Expand all" + "Collapse all" in diff panel header (app.ts:3980)
- AC14: Iterate `state.views.values()` (existing Map at app.ts:1169, NO new field)
- AC15: `setOptions({...view.instance.options, expandUnchanged})` (FULL options spread, NOT partial)
- AC16: `.rerender()` called per instance (bypasses `areRenderRangesEqual` guard)
- AC17: `setStatus("Expanded all files" | "Collapsed all files")` feedback
- AC18: Dispose pattern unchanged (existing `view.instance.cleanUp()` at app.ts:3981-3983)

## 6 file deltas

| File | LOC | Purpose |
|---|---|---|
| `src/ui/app.ts` | +180-220 | All 3 features integrate here |
| `src/ui/review.html` | +10-20 | 3 new toolbar buttons |
| `src/ui/r16-features.test.ts` | +300-400 | NEW · 18 ACs as vitest unit tests |
| `README.md` | +9 | SG.11 user-manual · 3 bullets + 1 keyboard tip |
| `README.zh-CN.md` | +9 | Mirror per SG.6 lockstep |
| `docs/screenshots/r16-*.png` | new × 3 | SG.10/SG.12 visual evidence |

## Risk register (5 risks)

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | setOptions resets managers if their options drift | LOW | Spread pattern preserves all options |
| R2 | stripWhitespace intra-line semantics | LOW-MEDIUM | Standard collapse behavior (matches Phabricator) |
| R3 | renderDiffPanel rebuild tears down instances | MEDIUM | Hide-ws only triggers on toggle; Expand-all uses setOptions+rerender |
| R4 | Copy MD format opinionated | LOW | Format spec in test as source of truth |
| R5 | state.views Map may be undefined | LOW | Guard with `if (state.views)` |

## Pipeline expectation

| Phase | Mode | Time |
|---|---|---|
| 2 Dev | subagent 18-22 min | 20 min |
| 2.5 Pre-Commit Audit | lead-direct | 2 min |
| 2.6 Lead Merge+Push | lead-direct (NEW v5.3.3) | 2 min |
| 3a-3b Tester | lead-synthesized | 8 min |
| 3c Playwright | SKIPPED (SG.5) | 0 |
| 3.5 Doc Writer | lead-synthesized (SG.6 zh-CN) | 5 min |
| 4 + 4.5-4.9 | lead-owned | 5 min |
| SG.10/SG.12 screenshots | lead-direct | 5-10 min |
| **Total** | | **~50-60 min** |

## Hand-off items to Dev (12 items)

1. Pierre205 version check (already verified `@pierre/diffs v1.1.0-beta.13`)
2. No new state field for Expand-all (reuse `state.views`)
3. No new schema field for any of the 3 features
4. localStorage key `diff-review:ignore-whitespace` (new, no migration)
5. README updates SG.11 user-manual style
6. README.zh-CN.md updates SG.6 lockstep
7. Test file `src/ui/r16-features.test.ts` (NEW)
8. Screenshots r16-{hide-whitespace,copy-as-md,expand-all}.png (SG.10/SG.12)
9. Commit message format (Dev choice — 3 feature commits + 1 docs + 1 screenshot)
10. Target 30+ unit tests (R12 retro defense-in-depth: 50% over plan minimum)
11. Format spec test for Copy MD (T30.MDFormatTest validates exact output)
12. Build verification (304 files / < 12 MB)

## Default action: GO

Subagent fires in ~5-10 seconds. 18-22 min Dev budget. Estimated round total: ~50-60 min.

Reply `go` to proceed · `go + adjust` to tweak scope · `hold` to pause · `cancel` to abort.