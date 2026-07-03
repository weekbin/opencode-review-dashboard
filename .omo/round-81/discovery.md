# R81 Discovery

R80 carry-over: empty (R80 was the final validation round of the R63-R80 arc).

Fresh scan for the R81-R100 arc found 4 navbar tab `<button>` elements in src/ui/review.html (L3298, L3302, L3306-3311, L3315-3320) that still carry hardcoded English `title="..."` attributes. The R57-R72 modal sweep covered modal innerHTML but missed the static HTML in review.html (the tab buttons use HTML attributes, not t() calls).

Discovered tab tooltips:
- L3298: `title="Files changed"`
- L3302: `title="Commits in this review"`
- L3306-3311: `title="Conversation (all findings)"`
- L3315-3320: `title="Previously discussed (prior round notes + comment threads)"`

The inner `<span>` text was already i18n'd (R57 + earlier) via `data-i18n="sidebar.X"`. Only the parent `<button title="...">` was missed.

Pattern reuse: existing `data-i18n-title="..."` attribute pattern (R57+ infrastructure; wired via `registerUITranslator` → `applyUI()`). Same fix shape as R66 (drawer-toggle aria-label).

Selected scope: 1 round, 4 sites, 4 new i18n keys.
