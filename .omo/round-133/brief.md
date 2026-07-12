# R133 Brief — wire bilingual tooltips + aria-labels

## Scope

1. Widen `applyUITranslator(key, fn)` in `src/ui/i18n.ts` so each registered key also sets `title` on every node carrying `[data-i18n-title="<key>"]` and `aria-label` on every node carrying `[data-i18n-aria-label="<key>"]`. Existing `[data-i18n="<key>"]` textContent write remains.
2. Register the 29 `data-i18n-title` keys and 7 `data-i18n-aria-label` keys actually present in `src/ui/review.html` plus the runtime-spawned key at `app.ts:1025`. Each registration is one line: `registerUITranslator("toolbar.copyBranch.title", () => t("toolbar.copyBranch.title"));`.
3. Add a `MutationObserver` that catches `data-i18n-title` / `data-i18n-aria-label` attributes added to the DOM after boot (covers `app.ts:1025`'s `deleteBtn.setAttribute("data-i18n-title", "search.recent.delete")`) and calls `applyUI()` so any new tooltips translate on the next language change.

## Why

R81 retro carry-over ("Other hardcoded English `title=` attributes in review.html") has been open for 51 rounds. `gh search code` confirms zero code path reads `data-i18n-title` / `data-i18n-aria-label`, so 36 strings silently stay English on every non-English locale. Closing this also retires the "extra bookkeeping rule — discover attribute keys at runtime so the next round doesn't need yet another registration block" lesson.

## Risk

- Risk: double-rendering a key that already has a `[data-i18n]` element with the same name. Mitigation: the existing keys (`copyBranch.label` vs `copyBranch.title`) are distinct because the title was created with a different suffix; if any collisions exist, the broadened translator will set textContent AND title on the same element which is harmless (they are different attributes).
- Risk: MutationObserver cost on a frequent DOM. Mitigation: filter to `attributes` change with `attributeName` ∈ `{"data-i18n-title", "data-i18n-aria-label"}`; the dashboard has very few post-boot attribute sets.
- Risk: regression on existing i18n tests. Mitigation: the broadened `applyUITranslator` is backward-compatible (existing `[data-i18n="..."]` selector still works).

## Acceptance

- New `src/r133-i18n-attribute-translator.test.ts` covers all 3 selectors (`[data-i18n]`, `[data-i18n-title]`, `[data-i18n-aria-label]`) and the MutationObserver reapply on dynamic `setAttribute`.
- `bun test src/r133-...` passes; `bun test` full suite (1048 prior + new) passes.
- `bun run check` passes (format + lint + typecheck).
- One DOM probe via `take-screenshots.sh` against a temporary bilingual mock confirms ZH locale renders Chinese on `toolbar.copyBranch.title` tooltip.

## Pattern re-use

- `registerUITranslator` already exists and is the documented entry point (i18n.ts:923).
- Existing precedent at app.ts:1700 (`registerUITranslator("toolbar.copyBranch.label", () => t("toolbar.copyBranch.label"));`) — repeat per key.

## Why "polish"

Round profile: existing strings, existing data-i18n-* attributes, only the runtime wiring is missing → no new schema, no new behavior outside i18n locale switching. v6 polish = docs/UX/test-only or wiring-fixes; this is a wiring fix.
