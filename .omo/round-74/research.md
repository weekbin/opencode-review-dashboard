# R74 Research

Pattern reuse from R73:
```ts
const wEl = el as HTMLElement & { _findingPermaFlashTimer?: number };
clearTimeout(wEl._findingPermaFlashTimer);
wEl._findingPermaFlashTimer = setTimeout(() => {
  el.classList.remove("finding-permalink-flash");
}, 1600) as unknown as number;
```

Per-element timer ID stored on the DOM element. Same approach as R73 for copy buttons (per-button property).

Existing code:
- `flashFindingPermaHighlight` (L494): 1600ms, removes `finding-permalink-flash` class
- `flashDiffSearchMatch` (L737): DIFF_SEARCH_FLASH_MS, removes `diff-search-match-flash` class

Force-reflow (`void el.offsetWidth`) is needed for CSS animation to restart, but does NOT cancel the previous setTimeout — that fires and yanks the new class off. Per-element timer ID fixes this.

## Simplest change (per site)
Add 3 lines (cast + clearTimeout + assign) before the new setTimeout.

## Risk
- 1 src/ file, 2 functions, ~6 LOC × 2 = 12 LOC
- Zero behavior change for single-call users
- Rapid call users: no more premature class removal (animation lasts full duration even on rapid re-trigger)
