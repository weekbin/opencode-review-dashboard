# R74 Research

Same pattern as R73:
```ts
clearTimeout(wEl._findingPermaFlashTimer);
wEl._findingPermaFlashTimer = setTimeout(...);
```

Both functions:
- `flashFindingPermaHighlight` (L494): takes a findingId, looks up DOM element
- `flashDiffSearchMatch` (L737): takes an HTMLElement directly

Different signature, same fix shape. Per-element timer ID stored on the DOM element.

## Risk
- 1 src/ file, ~5 LOC × 2 sites = 10 LOC
- Zero behavior change for slow-click users
- Rapid-click users: no premature class removal (the fix)
