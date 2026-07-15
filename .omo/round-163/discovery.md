# R163 Discovery

## Backlog
- **Carry-over from R162**:
  1. **#85 / #87 visual verify** — open dashboard, click Force Reopen on stale finding → modal must open; click Resolve in drawer finding list → modal must open. **Deferred to Playwright e2e round** (current session's e2e harness has a stuck mock-server process that auto-respawns; treating as separate environment issue).
  2. **#88 AI language e2e** — real submit with `locale: "zh-CN"`, verify agent response in 简体中文. **Deferred** (requires real OpenCode agent; cannot run in this loop).

## Housekeeping (picked this round)
- **#1** Add regression test for #89: `.range-banner[hidden] { display: none }` rule
- **#2** Add regression test for #90: `.sidebar-mode button` padding ≤ 4px + line-height ≈ file-row
- **#3** Add regression test for #88: `draftPayload()` includes `locale: peekLanguage()` field
- **#4** Add regression test for #92: round = 1 when diff_base fingerprint differs, +1 when same
- **#5** Add regression test for #91: settings-ok button label is "Save" + showToast fires on click
- **#6** Remove unused `join` import in `src/ui/r80-arc-validation.test.ts:5` (R80 path fix introduced it)

## Hard cap check
- Features: 0
- Bugfixes: 0 (no behavior changes, only test coverage + lint)
- Polish: 1 (test-only + lint cleanup, ≤2 src/ files)
- Housekeeping: 5
- Total: 6 (≤8 ✓)

## Why housekeeping
R162 shipped 8 ACs without regression tests for most of them — only the i18n orphan audit / registerUITranslator / macOS-path test got caught by accident. Lock in the 8 ACs now while the code is fresh. Without these tests, future refactors could regress #89/#90/#91/#92 silently.

## Anti-cap check
- ≤3 feature / ≤5 bugfix / ≤8 total / ≤1 polish: 0+0+1+5 = 6 ✓
- ≤1 polish: 1 (test+lint) ✓
- 1 AC max per subagent: 0 subagents ✓
- Lightweight round: NO (6 ACs across 4-5 files; not lightweight enough to skip capabilities)