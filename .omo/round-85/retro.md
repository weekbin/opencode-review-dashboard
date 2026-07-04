# R85 — i18n: 3 hardcoded empty-state messages in app.ts

## What shipped
3 hardcoded empty-state messages replaced. 1 message ("No findings yet.") appears 2x and is consolidated to a single key. 3 new i18n keys. 2 existing tests updated.

## What went well
- All 3 unique strings had 1 key each (no double-apply bug)
- Python replacement script worked first try (4/4 OK)

## What was harder than expected
- 2 existing tests broke (saved-replies.test.ts, previously-hint.test.ts) — same pattern as R73/R84: tests using literal English as source markers break when the source is i18n-ified. Had to update both to use `t("...")` as the marker.
- This is a recurring pattern: each i18n round breaks N existing tests that used literal English as a source-marker. **The i18n work has a hidden cost: every round requires fixing N-1 other tests.** A better pattern: tests should use a stable structural marker (e.g., `i18n.TRANSLATED_FIELDS` registry) instead of literal English.

## Loop-internal open
NONE.
