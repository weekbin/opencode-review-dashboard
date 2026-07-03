# R74 Discovery

R73 carry-over: "finding-permalink-flash (L490, 1600ms) and diff-search-flash (L741, DIFF_SEARCH_FLASH_MS) — same race?"

Both functions use the **force-reflow trick** (`void el.offsetWidth` + remove + add class) to restart the CSS animation on rapid re-triggers. But the `setTimeout(() => el.classList.remove(...), 1600)` has no clearTimeout on rapid calls — stale timer fires and removes the class while a fresh flash is still in progress.

Selected scope: extend R73's timer-cancel pattern to these 2 functions. 1 round, 2 sites.
