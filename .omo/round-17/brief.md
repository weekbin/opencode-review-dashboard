# R17 Brief — Lead-synthesized (per v5.3.5+1 SG.18 combined PM Triage + Researcher)

## Title
R17 dev loop · scope = user-pick multi-round deferred features (1 bugfix + 2 features)

## Sync state
- main = `74ee9a0` = origin/main · 0 ahead / 0 behind · clean
- v5.3.5+1 SKILL.md · 39 retroactive patches cumulative
- R16 closure: 3 features shipped (#29/#30/#31 closed) · 342 tests pass · 5 commits pushed

## Scope (user-picked from R16 multi-round split)

| # | Issue | Title | Type | User-value | LOC | Risk |
|---|---|---|---|---|---|---|
| **#32** | (filed R+ retro) | Move round notes into Submit Review modal | feature | 4/5 | 30-50 | LOW |
| **#34** | (filed R+ retro) | BUG: Search IME composition | bug | 5/5 | 50-100 | LOW-MEDIUM |
| **#36** | (filed R17) | Cmd+/ help overlay (R12 brief #5 closure) | feature | 3/5 | 55-85 | LOW |
| | | **Total** | | | **135-235** | **≤ 3 cap exact** |

## Per-feature analysis

### #32 Move round notes into Submit Review modal (LOW, 30-50 LOC)
- **What**: Remove round notes textbox from sidebar `<group>` (app.ts renderRoundNotes / e34 element); add it INSIDE the Submit Review modal (R15 #27 modal at app.ts:4569-4652)
- **Pattern**: Add textarea to modal HTML, bind to existing `state.notes` field, auto-save on input (existing pattern)
- **User-value**: 4/5 — frees ~80-100px vertical space currently wasted on a persistent textarea
- **Files**: app.ts (move HTML + bind) · review.html (remove from sidebar, add to modal)
- **Risk**: LOW — additive UI move, state.notes already exists

### #34 BUG: Search IME composition (LOW-MEDIUM, 50-100 LOC)
- **Root cause** (verified via grep 2026-06-30): ZERO `compositionstart/update/end` handlers in src/. Inputs likely use `value=${state.filter}` pattern → state binding overwrites user input mid-composition
- **Fix approach**: Use uncontrolled inputs OR add explicit composition event handlers. Recommended: uncontrolled inputs (don't set `value=` from state) + sync state on `compositionend` + sync on plain `input` event when no composition in progress
- **Affected inputs** (5):
  - Files tab search (app.ts sidebar `Search current panel`)
  - Conversation tab search
  - Previously discussed tab search
  - In-diff search (app.ts:792 `diff-search-input`, R13 #22)
  - Cmd+P palette (R15 #26)
- **User-value**: 5/5 — Chinese users (primary audience) cannot use search reliably without this fix
- **Risk**: LOW-MEDIUM — IME composition is well-documented but easy to miss; need test coverage using Playwright keyboard.type with composition simulation
- **Files**: app.ts (5 inputs) + review.html (5 inputs) + new test scenarios

### #36 Cmd+/ help overlay (LOW, 55-85 LOC)
- **What**: New global keydown listener for `Cmd+/` (Mac) or `Ctrl+/` (other) that opens a modal showing ~10 keyboard shortcuts
- **Pattern**: Reuses `showSubmitConfirmModal` HTML structure (R15 #27 modal at app.ts:4569-4652) + global keydown pattern from existing Cmd+P at app.ts:464-498
- **Shortcuts to display** (~10): n, p, Ctrl+F/Cmd+F, /, Cmd+P, Escape, Enter, Cmd+/, Cmd+I (Hide-ws), Cmd+E (Expand-all)
- **User-value**: 3/5 — discoverability for first-time users (R10 retro: "first-time users don't know n-p exists")
- **Risk**: LOW — pure additive; reuses existing modal + keydown patterns

## Composite ranking

| Rank | Feature | Rationale |
|---|---|---|
| **★1** | **#34 Search IME bug** | 5/5 user-value · affects ALL searches for Chinese users · bug not feature |
| **★2** | **#32 Move notes into Submit modal** | 4/5 · real UX friction user explicitly reported · clean UX refactor |
| **★3** | **#36 Cmd+/ help overlay** | 3/5 · closes R12 brief 7/7 · discoverability for new users |

## Pre-flight check (R+ retro SG.6)

Phase -0 sync: PASS · 0 ahead / 0 behind · SHA `74ee9a0` = origin/main
R16 closure SHAs: `74ee9a0` ✓ (v5.3.5+1) + `4538fd0` ✓ (audit-trail restore) + `fe1830c` ✓ (R16 archive) + `1d53bf1` + `284dd21` ✓ (screenshots + zh-CN) + `98b36b1` ✓ (R16 retro SG.13-SG.16) + `91611cf` ✓ (R16 merge) + `0fa959d` ✓ (R16 feat)
R+ retro prep SHAs: `350efba` ✓ (SG.12) + `620c990` ✓ (screenshots) + `32f6233` ✓ (user-manual) + `43a44ba` ✓ (SG.11) + `ca01e97` ✓ (R15 retro)
R16 audit-trail prep: `121c4dd` ✓ (R13-R15 archive)

## Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | IME composition test coverage (Playwright needs composition simulation) | MEDIUM | Use `page.keyboard.insertText()` OR `page.keyboard.type()` with delay + check no re-render between keystrokes |
| R2 | Round notes removed from sidebar breaks existing reviewer workflow | LOW | Existing `state.notes` field preserved; users can still set notes via Submit modal |
| R3 | Cmd+/ keydown conflicts with browser shortcut | LOW | `preventDefault()` after match + capture-phase listener (existing pattern at app.ts:464) |
| R4 | Bilingual docs commit split (R16 SG.19 retro) | LOW | ALWAYS update README.md + README.zh-CN.md in same `git add` |

## Pipeline expectation (per v5.3.5+1 with SG.13-20 applied)

| Phase | Mode | Time |
|---|---|---|
| 0.75 Planner (this doc) | lead-synthesized | 5 min |
| 1 Architect | lead-synthesized plan.md | 8 min |
| 2 Dev | subagent | 18-22 min (target hit via SG.13/SG.15 regex pre-validation) |
| 2.5 Pre-Commit Audit | lead-direct | 2 min |
| 2.6 Lead Merge+Push | lead-direct (NEW v5.3.3) | 2 min |
| 3a Tester Review | lead-synthesized | 5 min |
| 3b Tester Diff | lead-synthesized | 3 min |
| **3c Playwright (REQUIRED per SG.20)** | subagent | 5-8 min (≥ 1 scenario for #34 IME bug) |
| 3.5 Doc Writer | lead-synthesized (SG.6 zh-CN lockstep) | 5 min |
| 4 + 4.5-4.9 closure | lead-owned | 5 min |
| **Screenshots in Phase 2 Dev** (per SG.16) | subagent | 5 min (embedded in feature commits) |
| **Total** | | **~58-68 min** (target 60 min) |

vs R16 (86 min): -18-28 min from SG.13/SG.15/SG.18/SG.19 optimizations.

## File deltas (predicted)

| File | LOC | Reason |
|---|---|---|
| `src/ui/app.ts` | +135-235 | All 3 features integrate here (modal move + IME fix + help overlay) |
| `src/ui/review.html` | +30-50 | Remove sidebar notes group + add notes textarea to modal + add Cmd+/ help button |
| `src/r17-features.test.ts` | new +200-300 | 18 ACs × ~15 LOC avg test coverage (defense-in-depth) |
| `README.md` + `README.zh-CN.md` | +9 each | SG.11 user-manual style + SG.6 lockstep |
| `docs/screenshots/r17-*.png` | new × 3 | SG.16 screenshots in Phase 2 Dev (per v5.3.5+1) |
| `src/ui/test-review-ui/scenarios.mjs` | +1 | SG.20 Playwright scenario for IME composition |

## Decision

PROCEED. R17 scope locked, ACs defined, hand-off items enumerated. Ready for Phase 2 Dev.