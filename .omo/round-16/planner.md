# R16 Planner (lead-synthesized, 5 min)

## Scope confirmation (Phase 0.75 gate)
**Verdict**: PROCEED. R16 scope = 3 features, deterministic, all additive, ≤ 3 cap exact.

PM Researcher verdict: PROCEED with reclassification
- Hide-ws: MEDIUM (150-200) → LOW-MEDIUM (80-110). Pierre205 has no public `ignoreWhitespace` option; client-side `stripWhitespace()` helper + `renderDiffPanel()` re-call mirrors `setLayout:1251-1257` pattern.
- state.fileDiffInstances Map: REDUNDANT. `state.views: Map<string, View>` (app.ts:1169) already holds FileDiff instances per path. Saves 15-25 LOC.
- Copy MD: 50-70 LOC (vs 60-90) — clipboard + setStatus pattern at app.ts:309-352 is proven.
- Expand-all: 50-80 LOC — `setOptions({...view.instance.options, expandUnchanged})` + `.rerender()` works (Pierre205 FileDiff.d.ts:89 + :102).

## Composite ranking (final)

| Rank | Candidate | User-value | LOC | LOC-eff (val/LOC × 100) | Composite |
|---|---|---|---|---|---|
| ★1 | Hide-ws (#29) | 5/5 | 80-110 | 4.5-6.3 | closes strongest external gap |
| ★2 | Copy MD (#30) | 4/5 | 50-70 | 5.7-8.0 | plausible-unique win |
| ★3 | Expand-all (#31) | 4/5 | 50-80 | 5.0-8.0 | plausible-unique win |

## Pre-flight check (R+ retro SG.6)

Phase -0 sync: PASS · 0 ahead / 0 behind · SHA `121c4dd` = origin/main.
R15 closure SHAs: `0bed398` ✓
R+ retro SHAs: `350efba` ✓ (SG.12), `620c990` ✓ (screenshots), `43a44ba` ✓ (SG.11), `32f6233` ✓ (README manual), `ca01e97` ✓ (R15 retro patches).
R16 audit-trail prep: `121c4dd` ✓ (proposals.jsonl R13-R15 archive).

## Plan-mode dependency

PM Researcher advisories inlined into Risk Register (see Architect plan.md).
No subagent claim needs BLOCK-level override (PM Researcher verified all 5 claims; 1 reclassification, 1 redundancy, 0 reversals).

## Hand-off items to Architect (lead-synthesized will resolve)

1. **Hide-ws stripWhitespace semantics**: simple collapse (`/\s+/g → " "` + trim trailing). User-visible label: "Ignore whitespace changes".
2. **Expand-all setOptions pattern**: spread full options from existing instance + override `expandUnchanged` + call `rerender()`.
3. **Copy MD format spec**: `[Round N] **[file:line](permalink)** — comment\n\n> audit: N edits\nreactions: 👍×3 😄×1` (NOT full `generateMarkdownSummary` — that's the export format).
4. **localStorage key**: `diff-review:ignore-whitespace` (new; no migration needed).
5. **Pierre205 version check**: `cat package.json | grep pierre` before AC lock-in.

## File deltas (predicted)

| File | LOC change | Reason |
|---|---|---|
| `src/ui/app.ts` | +180-220 | All 3 features integrate here (toolbar button + state + handlers + render) |
| `src/ui/review.html` | +10-20 | New "Ignore whitespace" + "Expand all" + "Collapse all" buttons in toolbar |
| `src/ui/r16-features.test.ts` | +300-400 | 18 ACs × ~20 LOC avg test coverage (defense-in-depth) |
| `README.md` | +9 lines (3 features × 3 lines) | SG.11 user-manual style + zh-CN mirror per SG.6 |
| `README.zh-CN.md` | +9 lines | Same |
| `docs/screenshots/r16-*.png` | new × 3 | SG.10 visual evidence |
| **Total** | **+520-660 LOC across 6 files** | |

## Pipeline expectation

| Phase | Mode | Time |
|---|---|---|
| 0.75 Planner | lead-synthesized (this doc) | 5 min |
| 1 Architect | lead-synthesized plan.md | 8 min |
| 2 Dev | subagent, 18-22 min budget | 20 min |
| 2.5 Pre-Commit Audit | lead-direct | 2 min |
| 2.6 Lead Merge+Push | lead-direct (NEW v5.3.3) | 2 min |
| 3a Tester Review | lead-synthesized | 5 min |
| 3b Tester Diff | lead-synthesized | 3 min |
| 3c Playwright | SKIPPED (SG.5) | 0 |
| 3.5 Doc Writer | lead-synthesized (zh-CN lockstep) | 5 min |
| 4 + 4.5-4.9 closure | lead-owned | 5 min |
| SG.10/SG.12 screenshots | lead-direct | 5-10 min |
| **Total** | | **~55-65 min** |