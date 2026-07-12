# R153 Research — remove deprecated `legacyExecCommandCopy` fallback

Lightweight-round compression (≤50 LOC deletion + ≤3 files + 2 file deletions + no behavior change for modern browsers): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

## The 4 clipboard call sites at app.ts use this pattern

```ts
let ok = false;
if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    ok = legacyExecCommandCopy(text);
  }
} else {
  ok = legacyExecCommandCopy(text);
}
```

After R153:

```ts
let ok = false;
if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    ok = false;
  }
}
```

The `else` branch (when `navigator.clipboard` is undefined) is removed because:
- Pre-2018 browsers (when this was a real concern) are <0.1% of users in 2026
- If `navigator.clipboard` is undefined, the conditional check fails, `ok` stays `false`, the existing `if (ok)` false branch shows the error toast
- The error path is more honest than a silent fallback to deprecated execCommand

## Browser support (per MDN, 2026)

`navigator.clipboard.writeText` is supported in:
- Chrome 66+ (April 2018)
- Firefox 63+ (October 2018)
- Safari 13.1+ (March 2020)
- Edge 79+ (January 2020)
- All other modern browsers

`document.execCommand("copy")`:
- Deprecated since 2019
- Still works in current browsers (no removal announced)
- Generates console warnings

## R137→R142 SOP application (this is the 14th-17th documented occurrence)

| Test | File | Old | New |
|---|---|---|---|
| T11.2d | `src/permalink.test.ts` | asserts `legacyExecCommandCopy(` + helper function contains `document.execCommand("copy")` | asserts `navigator.clipboard?.writeText` + `legacyExecCommandCopy` does NOT exist |
| T16.8d | `src/r16-features.test.ts` | asserts function delegates to `legacyExecCommandCopy(md)` + helper has `execCommand("copy")` | asserts function uses `writeText` directly + helper does NOT exist |
| T16.10a | `src/r16-features.test.ts` | same as T16.8d (AC10) | upgraded |
| T16.10b | `src/r16-features.test.ts` | asserts catch branch falls back to `legacyExecCommandCopy(md)` | asserts catch sets `ok = false` (no fallback) |

## R139 + R147 test files: delete entirely

R139 tests file-scope hoisting of `legacyExecCommandCopy` (the function no longer exists).
R147 tests T1/T2/T3 of `legacyExecCommandCopy` behavior (function gone).

Both are entirely about the removed function. No meaningful upgrade to behavior-contract — they should be deleted.

Per-SHIP append discipline preserved.