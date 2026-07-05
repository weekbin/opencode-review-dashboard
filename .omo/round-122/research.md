# R122 Research — updateSubmitButtons reactive bugfix (R116.1)

## Files involved

- `src/ui/app.ts` — add `updateSubmitButtons()` calls in 5 places (resolve, reopen, addFinding, notes, plus existing L6496/6504)
- `src/r122-reactive-submit-buttons.test.ts` — NEW file, 10 structural regex tests

## Existing patterns to reuse

**`updateSubmitButtons` (L1518-1529)**:
```typescript
function updateSubmitButtons(): void {
  const findings = all();
  const openCount = findings.filter(
    (f) => f.status === "open" || f.status === "closed_auto",
  ).length;
  const notesNonEmpty = typeof state.notes === "string" && state.notes.trim().length > 0;
  const enabled = openCount === 0 && notesNonEmpty;
  submitApproveButton.disabled = !enabled;
  submitApproveButton.title = enabled
    ? t("toolbar.approveChanges")
    : t("toolbar.approveChanges.disabledTooltip");
}
```

Defined, idempotent, all side-effect free. Safe to call from many places.

**Existing call sites**:
- L6213: `renderFindings()` initial
- L6496, L6504: submit request-changes / approve-changes handlers (R116.1 hotfix from #83 Oracle flag)

**Symmetry pattern: `updateConversationTabBadge()`** is called in similar positions (L2718, L5992, L6019, L6046). Closely follows same pattern.

## Simplest change

Add `updateSubmitButtons()` calls at exactly 5 strategic positions:

1. After `await resolveFinding(...)` completes (L5792 — `renderFindings()` is already called here; add `updateSubmitButtons()` right after)
2. After `await reopenFinding(...)` completes (L5824 — same pattern)
3. After state.notes mutations (L5992 / L6019 / L6046 — paired with `updateConversationTabBadge()`)
4. In `addFinding` handler after the success branch (L6496 was a similar pattern from R116 hotfix)
5. At end of `renderFindings()` (already L6213) — keep existing

No new functions needed. Pure small additions.

## Test convention

Structural regex per project standard. Test counts: 10 tests, 10 ACs.

## Risk assessment

- **Low**: updateSubmitButtons is idempotent — calling it N times has same effect as once
- **Low**: callers all already exist; just add a line
- **Low**: no i18n changes (existing tooltips reused)
- **Medium**: AC1 (≥5 call sites) requires careful counting — easy to miss one

## v6 compliance

- 0 features ≤3 ✓
- 1 bugfix ≤5 ✓
- 0 polish ≤1 ✓
- 1 total ≤8 ✓