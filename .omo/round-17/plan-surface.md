# R17 plan-surface (awaiting user "go" — already authorized)

## Decision: PROCEED — 3 features, ≤ 3 cap exact, 0 headroom

**PM Triage + Researcher combined** (per SG.18): lead-synthesized 5 min (saved 5 min vs separate subagents).
**PM Manager**: APPROVE — Cmd+/ #36 created; #32 + #34 already filed by user-feedback round.
**Planner (lead-synthesized)**: PROCEED.
**Architect (lead-synthesized)**: PROCEED — 18 ACs + 7 file deltas + 5 risks + 12 hand-off items.

## 18 ACs (6 per feature)

### #32 Move round notes into Submit Review modal (4/5, LOW, 30-50 LOC)
- AC1: Sidebar round notes `<group>` REMOVED
- AC2: Submit Review modal CONTAINS notes textarea
- AC3: Notes persist in `state.notes` across renders
- AC4: Auto-save on input (existing R14 pattern)
- AC5: "Saved Xs ago" indicator updates correctly
- AC6: Modal layout: header + textarea + Cancel/Submit

### #34 Search IME composition fix (5/5, LOW-MEDIUM, 50-100 LOC)
- AC1: Files tab search — IME composition works (Chinese + English)
- AC2: Conversation tab search — IME works
- AC3: Previously discussed tab search — IME works
- AC4: In-diff search (`#diff-search-input`) — IME works
- AC5: Cmd+P palette — IME works
- AC6: Playwright scenario simulates IME composition + verifies character committed

### #36 Cmd+/ help overlay (3/5, LOW, 55-85 LOC)
- AC1: Global keydown listener for `Cmd+/` (Mac) or `Ctrl+/` (other)
- AC2: Modal shows 10 keyboard shortcuts in clean grid
- AC3: Modal closes on `Escape` + backdrop click
- AC4: `state.showHelp: boolean` field
- AC5: Modal reuses `showSubmitConfirmModal` pattern
- AC6: Plain-language help text (SG.11 style)

## 7 file deltas

| File | LOC | Purpose |
|---|---|---|
| `src/ui/app.ts` | +135-235 | All 3 features integrate here |
| `src/ui/review.html` | +30-50 | Sidebar notes removal + modal textarea + Cmd+/ button + help modal |
| `src/r17-features.test.ts` | +200-300 NEW | 18 ACs as vitest unit tests |
| `README.md` | +9 | SG.11 user-manual · 3 feature bullets + Cmd+/ mention |
| `README.zh-CN.md` | +9 | Mirror per SG.6 lockstep |
| `docs/screenshots/r17-*.png` | new × 3 | SG.16 screenshots in Phase 2 Dev |
| `scripts/test-review-ui/scenarios.mjs` | +1 | SG.20 Playwright scenario for #34 IME |

## Pipeline expectation (v5.3.5+1 applied)

| Phase | Mode | Time |
|---|---|---|
| 2 Dev | subagent | 18-22 min (target hit via SG.13/SG.15) |
| 2.5 Pre-Commit Audit | lead-direct | 2 min |
| 2.6 Lead Merge+Push | lead-direct | 2 min |
| 3a-3b Tester | lead-synthesized | 8 min |
| 3c Playwright (REQUIRED) | subagent | 5-8 min (≥ 1 scenario for #34 IME) |
| 3.5 Doc Writer | lead-synthesized (SG.6) | 5 min |
| 4 + 4.5-4.9 | lead-owned | 5 min |
| Screenshots in Phase 2 | subagent (SG.16) | 5 min |
| **Total** | | **~58-68 min** (target 60 min) |

vs R16 (86 min): -18-28 min from SG.13/SG.15/SG.18/SG.19 optimizations.

## Hand-off items to Dev (12)

1. Lead-direct pre-validated regex patterns (SG.13/SG.15)
2. No modifications to existing utility functions (SG.14)
3. Capture 3 screenshots in Phase 2 Dev (SG.16)
4. Bilingual docs commit together (SG.19)
5. ≥1 Playwright scenario for #34 IME (SG.20)
6-12. Per-feature implementation patterns + reuse existing utilities

## Risk register

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | IME composition test coverage | MEDIUM | Playwright `page.keyboard.insertText()` + manual composition events |
| R2 | Round notes removal breaks workflow | LOW | state.notes preserved, only UI moves |
| R3 | Cmd+/ browser shortcut conflict | LOW | preventDefault + capture-phase listener |
| R4 | 5 IME input fixes break existing tests | LOW | Additive, regex tests still match |
| R5 | Modal overflow on small viewports | LOW | min/max-height CSS |

## Already authorized by user "go" — firing Phase 2 Dev now.

Subagent target: 18-22 min · expected total R17 time: ~58-68 min (vs R16 86 min).