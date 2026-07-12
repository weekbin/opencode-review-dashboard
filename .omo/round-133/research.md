# R133 Research — wire data-i18n-title + data-i18n-aria-label

## Files involved

- `src/ui/i18n.ts` (953 lines): owns `applyUITranslator`, `applyUI`, `t(key, params)`. Missing the two attribute translators.
- `src/ui/review.html` (~3700 lines): 22 `data-i18n-title` and 29 `data-i18n-aria-label` references — all dead today.
- `src/ui/app.ts:1024-1025`: dynamic `deleteBtn.setAttribute("data-i18n-title", "search.recent.delete")`. The newly appended node won't be retroactively translated unless `applyUI()` runs after append.
- New test file: `src/r133-i18n-attribute-translation.test.ts` (file is too small to even need a separate one — but a direct unit test on a new exported helper is the v6 AC-verification shape).

## Existing patterns to reuse

- `applyUITranslator(key, fn)` already swallows `try/catch` so missing DOM nodes don't crash (`i18n.ts:932-938`). Same shape works for attribute selectors.
- `t(key)` returns the localized string (`i18n.ts:861`); pass `() => t(key)` straight to the new helpers.
- `CSS.escape(key)` already used to build safe selectors (`i18n.ts:934`).
- `applyUI()` (`i18n.ts:942`) already iterates every registered translator on language switch — extending its sweep picks up language-change reactivity for free.

## Simplest change (v6 bugfix profile)

Add two narrow helper functions exported alongside `applyUITranslator`:
1. `applyUIAttributeTranslator(attr: "title" | "aria-label", key: string, fn: () => string): void` — walks `[data-i18n-${attr}="<key>"]` and writes `el[attr]` / `el.setAttribute(...)`. `title` for `data-i18n-title` (set via `el.title = ...` to avoid clobbering pre-existing tooltip with a different mechanism), `aria-label` via `setAttribute` (preferred for screen readers and matches how `app.ts:1024` already writes aria-label manually).
2. `registerUIAttributeTranslator(...)` — same UX as `registerUITranslator`, registers the per-attribute translator and immediately applies.
3. Extend `applyUI()` to also re-run every registered attribute translator.

Then change `src/ui/app.ts:1025` to call `registerUIAttributeTranslator("title", "search.recent.delete", () => t("search.recent.delete"))` so the dynamic node participates in the same language-change flow.

Test surface (`src/r133-i18n-attribute-translation.test.ts`):
1. `applyUIAttributeTranslator("title", "x", () => "EN")` sets `el.title = "EN"` on `[data-i18n-title="x"]` nodes.
2. `applyUIAttributeTranslator("aria-label", "y", () => "JP")` sets `aria-label` on `[data-i18n-aria-label="y"]` nodes.
3. `registerUIAttributeTranslator` immediately applies on registration, and `applyUI()` re-applies to all registered attribute translators.
4. Translator called with a non-existent key leaves DOM untouched (no throw, no flicker).
5. `applyUI()` re-applies even when DOM has nodes added later — use `MutationObserver`? No: simpler path is to ensure `registerUIAttributeTranslator` is called after node insertion (mirroring how `registerUITranslator` is used today). This keeps v6's "no new infrastructure" rule.

## Risk

- Existing translator swallows errors via `try/catch`, so a node added after registration never gets a translation until `applyUI()` runs. This matches today's `data-i18n` behavior exactly — no regression.
- Conflict risk: if any node has both `data-i18n-title="x"` and `data-i18n="x"` (rare), both translators write different properties (text vs title) — no conflict.
- i18n key collision: 22+29 keys already exist in the localization table (referenced in `review.html`); no schema change.
- New file `src/r133-i18n-attribute-translation.test.ts` is a brand-new test file, but the project has many of these (`r124-histogram-baseline.test.ts`, `r131-stats-lock-overlay.test.ts`, etc.) — fits the convention.

## Out of scope

- Mutating attribute selectors at runtime (`app.ts:1025` becomes a single one-line `registerUIAttributeTranslator` call) — already covered above.
- Translating `placeholder`, `data-i18n-placeholder`, etc. — none surfaced in `grep` and out of v6 hard caps.

## LOC estimate

- i18n.ts: ~25 LOC net (3 new exported functions + extension to `applyUI`).
- review.html: 0 LOC change.
- app.ts: 1 LOC change.
- New test file: ~60 LOC.

Total ~85 LOC, ≤3 src files changed, ≤1 new test file. v6 LIGHTWEIGHT-eligible (≤50 LOC net only if we count `src/` files; with test file we're ~25 LOC net in `src/`).