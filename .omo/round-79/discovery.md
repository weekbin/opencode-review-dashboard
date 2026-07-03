# R79 Discovery

R78 carry-over: (none — all known hardcoded English empty-state messages localized).

Fresh scan: `setStatus()` calls in src/ui/app.ts. 8 hardcoded English strings in success/error status-bar messages missed by R63-R72 modal sweep:
- L409: `"Could not copy permalink — clipboard blocked"`
- L487: `"Copied as Markdown"`
- L490: `"Could not copy markdown — clipboard blocked"`
- L3941: `"No review data to export"`
- L4277: `"No changes to save"`
- L5276: `"Comment exceeds 500 characters"`
- L5286: `"Failed to add comment"`
- L5307: `"Comment added"`

All in non-modal code paths. zh-CN users see English status-bar messages.

Selected scope: 1 round, 8 sites, 8 new i18n keys. TDD-strict.

Side fix: src/r16-features.test.ts T16.11a asserts `setStatus("Copied as Markdown")` literal. Needs i18n-key anchor.
