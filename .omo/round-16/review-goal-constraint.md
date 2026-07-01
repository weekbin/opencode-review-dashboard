# R16 3a Test Review — Goal + Constraint Verification (Lens 1 of 5)

## Verdict: PASS

3 features shipped. All 18 ACs implemented. All 5 lead-direct gates green (342 tests, 0 lint, typecheck clean, format clean, build exit 0).

## Feature-by-feature AC verification

### #29 Hide-whitespace toggle (AC1-AC6) — PASS

| AC | Status | Evidence |
|---|---|---|
| AC1: toolbar button + localStorage | ✓ | `src/ui/review.html:2511-2520` (button HTML) + `src/ui/app.ts:151` (IGNORE_WHITESPACE_KEY) + `app.ts:1249` (state field) |
| AC2: stripWhitespace before Pierre205 | ✓ | Helper `src/ui/app.ts:177-179` + applied at 3 sites `app.ts:2329-2346, 2365, 2404` |
| AC3: localStorage persistence | ✓ | `app.ts:151` constant + `app.ts:1249` state field loaded via existing `readStored` |
| AC4: renderDiffPanel re-call | ✓ | `setIgnoreWhitespace` at `app.ts:1357` calls `renderDiffPanel()` (mirrors setLayout pattern at `app.ts:1251-1257`) |
| AC5: pure client-side | ✓ | `src/index.ts` untouched (verified by subagent) |
| AC6: word boundaries preserved | ✓ | Regex `\s+/g → " "` collapses runs only; tests verify expected outputs (T16.6) |

### #30 Copy as Markdown (AC7-AC12) — PASS

| AC | Status | Evidence |
|---|---|---|
| AC7: button in actions row | ✓ | `src/ui/app.ts:3493-3502` (next to copyLinkBtn at `app.ts:3371-3380`) |
| AC8: copyFindingAsMarkdownToClipboard | ✓ | `src/ui/app.ts:386-457` (full async function) |
| AC9: snippet format spec | ✓ | `app.ts:359-384` (`buildFindingMarkdownSnippet`) + format spec test T30.MDFormatTest in `src/r16-features.test.ts` |
| AC10: clipboard + fallback pattern | ✓ | `app.ts:412-419` (navigator.clipboard?.writeText + fallbackCopy) |
| AC11: setStatus feedback | ✓ | `app.ts:436` `setStatus("Copied as Markdown")` |
| AC12: separate from generateMarkdownSummary | ✓ | New helper at `app.ts:359-384`, `generateMarkdownSummary` untouched at `app.ts:2965` |

### #31 Diff expand-all / collapse-all (AC13-AC18) — PASS

| AC | Status | Evidence |
|---|---|---|
| AC13: 2 buttons in diff panel header | ✓ | `src/ui/app.ts:4123-4145` + CSS at `src/ui/review.html:1282-1306` |
| AC14: iterate state.views.values() | ✓ | `app.ts:4097-4099` (no new state field) |
| AC15: FULL setOptions spread | ✓ | `app.ts:4098-4101` `{...view.instance.options, expandUnchanged: expand}` |
| AC16: rerender() per instance | ✓ | `app.ts:4102` rerender() called in loop |
| AC17: setStatus feedback | ✓ | `app.ts:4104` "Expanded all files" / "Collapsed all files" |
| AC18: dispose pattern preserved | ✓ | `app.ts:4112-4115` cleanUp loop preserved |

## Constraint verification

| Constraint | Status |
|---|---|
| ≤ 3 features | ✓ 3 features exactly |
| 0 cap headroom | ✓ |
| All additive (no schema) | ✓ only additive: `ConversationEntry.audit_log` optional field |
| No new npm deps | ✓ package.json unchanged |
| localStorage only (no DB migration) | ✓ new key `diff-review:ignore-whitespace` |
| No server changes | ✓ src/index.ts untouched |
| README + zh-CN lockstep | ✓ both files updated in same commit |
| Scenario count no drift | ✓ 33 (audit-correct grep confirmed) |
| Defense-in-depth 30+ unit tests | ✓ 65 R16 tests + 277 baseline = 342 pass |

## Goal alignment

| User goal | Met? |
|---|---|
| Close 2 plausible-unique gaps (Copy MD + Expand-all) | ✓ |
| Close 1 every-competitor gap (Hide-ws) | ✓ (4/4 competitors ship; now we do too) |
| All client-side, no schema | ✓ |
| Hits feature ≤ 3 cap exactly | ✓ |
| Closes 3 fresh GH issues | ✓ #29/#30/#31 auto-closed by GitHub |

## Verdict: PASS — R16 ships clean