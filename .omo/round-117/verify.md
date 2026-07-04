# R117 Verify — Reconcile mode overlay (#74)

## Gate Results

- **Pre-commit**: 8/8 PASS (mechanical hygiene + lint + format-write→re-stage→test + typecheck)
- **Tests**: 874/874 PASS (after writing all 6 artifacts + R105 conformance + R117 RED test green)
- **R117 test file**: `src/r117-reconcile-overlay.test.ts` — 10/10 PASS

## R117 Tests (own)

```
$ bun test src/r117-reconcile-overlay.test.ts
10 pass
0 fail
15 expect() calls
Ran 10 tests across 1 file. [132.00ms]
```

All 10 acceptance criteria PASS:
- AC1: Toolbar has #toggle-reconcile button
- AC2: state.reconcileMode wraps rendering in if-block (additive)
- AC3: reconcile.banner.hint key present in both locales
- AC4: renderReconcileOverlay function renders green badge class
- AC5: reconcile.badge.open key present
- AC6: reconcile.badge.new key present
- AC7: data-finding-id click handler delegates to jumpToFindingById
- AC8: localStorage persists via RECONCILE_MODE_KEY
- AC9: All 5 i18n keys present (toolbar.reconcile + 4 reconcile.*)
- AC10: Backwards compat — additive only, no breaking changes

## Files Changed

- `src/ui/app.ts`:
  - `RECONCILE_MODE_KEY` constant (line 214)
  - `state.reconcileMode` field (line 1553)
  - Toolbar `#toggle-reconcile` HTML injection (line 1494)
  - `reconcileToggleBtn` query + 5 registerUITranslator calls (lines 1497-1507)
  - Toggle click handler (flips state, persists localStorage, calls renderDiffPanel)
  - `renderReconcileOverlay` function definition (line 5176)
  - `renderReconcileOverlay()` hook in renderDiffPanel (line 5436)
  - data-finding-id click delegation + `jumpToFindingById` helper (lines 6468-6483)
- `src/ui/i18n.ts`: 7 new STRINGS keys × 2 locales
  - `toolbar.reconcile` / `toolbar.reconcile.active` / `toolbar.reconcile.tooltip`
  - `reconcile.banner.hint`
  - `reconcile.badge.resolved` / `reconcile.badge.open` / `reconcile.badge.new`
- `src/r117-reconcile-overlay.test.ts`: NEW (10 tests covering all 5 ACs)
- `.omo/round-117/{discovery,research,brief,verify,retro,decision}.md`: 6/6 SHIPped

## Acceptance Criteria

All 10 ACs GREEN. See test file for exact assertions.

## Compliance With v6 Hard Gates

1. Pre-commit PASS: 8/8 ✓
2. Discovery sweep: ran (issue #74 body read, scope decided) ✓
3. 0 open-loop-internal at retro: TRUE ✓
4. Hard caps: 1 feature (≤3) + 0 bugfix (≤5) + 0 polish (≤1) = 1 total (≤8) ✓
5. 1 AC max per subagent: 0 subagents used (lead-direct) ✓

## Decision

**SHIP**.

## Issues Encountered

- **Test regex syntax error**: Initial AC3 test used `/zh-CN:/` regex which doesn't match `"zh-CN":` syntax. Fixed to `/zh-CN"/` to match the actual closing quote + colon pattern.
- **Per-hunk vs per-file granularity**: Decided per-file for R117 to keep scope focused (250-400 LOC in one round would exceed v6 cap). Per-hunk granularity deferred to R117.2 if user feedback shows file-level is too coarse.
- **Yellow + Red badge types**: Deferred to R117.1. R117 ships green (resolved) only, which is the most actionable for the trust gap ("did the agent fix what I asked?").