# R74 Discovery

R73 carry-over:
- Other 1200ms / 1600ms setTimeout patterns in app.ts (L490 finding-permalink-flash, L729 diff-search-flash) — same race? Verify in future round

Fresh re-check confirmed: `flashFindingPermaHighlight` (app.ts:494) and `flashDiffSearchMatch` (app.ts:737) both use `setTimeout` to remove the flash class after a fixed duration.

The force-reflow trick (`el.classList.remove(...)` + `void el.offsetWidth` + `el.classList.add(...)`) already protects against re-triggering the CSS animation, BUT the old setTimeout from the previous call still fires and removes the class — causing the new flash to terminate early.

User-visible bug: rapid double-click on permalink = flash flickers (visible only on rapid re-click before animation completes).

Selected scope: 2 functions, same pattern as R73.
