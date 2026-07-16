# R168 Research

## Code locations

### #91 Settings modal — already fixed in R162. Need regression tests.
- `src/ui/review.html:3843-3851` — settings footer with Reset / Cancel / Save buttons
- `src/ui/app.ts:1899-1907` — Save click handler (showToast + closeSettingsModal)
- `src/ui/app.ts:1908` — Cancel click handler (just closeSettingsModal)
- `src/ui/i18n.ts:571-577` — settings.cancel / settings.save / settings.save.toast keys
- `src/ui/review.html:3398` — layout-toggle hidden (R162 consolidation)
- `src/ui/review.html:3444` — theme-toggle hidden
- `src/ui/review.html:3453` — language-toggle hidden

Existing test:
- `src/ui/r91-settings-save.test.ts` (R163) — 3 tests: Save button has data-i18n="settings.save", cancel button exists, Save click handler calls showToast

Gaps:
- No test for: Reset button works (state.restoreDefaults)
- No test for: Cancel button doesn't trigger toast
- No test for: Modal Save flow end-to-end (modal closes after save)
- No test for: Topbar toggles are hidden
- No test for: Settings button is gear SVG icon (not text)

### Performance — In-diff search debounce

Current flow at `src/ui/app.ts:890-906`:
```js
const runSearch = () => {
  const q = diffSearch.input?.value ?? "";
  diffSearch.query = q;
  // ... no debounce ...
  diffSearch.matchElements = findMatchesInDiff(q);  // O(N) per keystroke
  updateDiffSearchCounter();
  commitRecentSearch(q);  // already debounced (300ms per R21)
};
installImeSafeInputListener(diffSearch.input, () => runSearch());
```

For a 1000-line diff, typing 9 characters = 9 full DOM scans. Each scan is `getElementsByClassName` + DOM tree walk.

Fix pattern (mirror `commitRecentSearch` in `search-history.ts:79-100`):
```js
let _pendingSearch: ReturnType<typeof setTimeout> | null = null;
const SEARCH_DEBOUNCE_MS = 150;
// In runSearch:
if (_pendingSearch !== null) clearTimeout(_pendingSearch);
_pendingSearch = setTimeout(() => {
  diffSearch.matchElements = findMatchesInDiff(q);
  diffSearch.currentIndex = diffSearch.matchElements.length > 0 ? 0 : -1;
  updateDiffSearchCounter();
}, SEARCH_DEBOUNCE_MS);
```

Note: `commitRecentSearch(q)` already has its own debounce, so I don't need to change that. The diff match scan is independent.

Considerations:
- IME composition (Chinese pinyin): `installImeSafeInputListener` handles IME via compositionstart/compositionend events. Debounce should NOT run during composition. Mitigation: clear pending on compositionstart, run immediately on compositionend.
- Enter key path: Already handled separately (line 920+). Debounce doesn't affect it.
- Empty query path (line 893-898): clears highlights synchronously. Keep that as-is — no debounce for clearing.

## Files to modify

1. `src/ui/r91-settings-behavior.test.ts` (new) — 5 tests covering the #91 ACs
2. `src/ui/r168-diff-search-debounce.test.ts` (new) — 2 tests verifying the debounce exists
3. `src/ui/app.ts` (~10 lines) — add SEARCH_DEBOUNCE_MS debounce for findMatchesInDiff call

## Risk
- Settings tests: LOW (regex-extract-source, same pattern as other lock-ins)
- Search debounce: MEDIUM (could affect perceived responsiveness; must preserve IME safety)

IME safety check: The existing `installImeSafeInputListener` fires on input AFTER composition ends. Debounce on `runSearch` callback doesn't break this — the listener fires once per committed character, debounce waits 150ms.

## Trade-off
Adding 150ms latency to search matches is acceptable for large files (avoid 9 full scans) but might feel sluggish on small files (where the scan is already fast). Mitigation: 150ms is below the 100ms human perception threshold for "instant" — should feel instant either way.