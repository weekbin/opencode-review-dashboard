# R70 Discovery

R69 carry-over: empty. Post-R63-R67 i18n sweep (8 sites done), fresh scan found 4 more hardcoded English placeholders in app.ts:

- Cmd+P palette (app.ts:1125): input placeholder "Jump to file…"
- Reopen modal (app.ts:2325): textarea placeholder
- Resolve modal (app.ts:2390): textarea placeholder
- Wontfix modal (app.ts:2481): textarea placeholder

All 4 are dynamically-created via innerHTML, so they need t() calls (not data-i18n-* attributes).

Selected scope: 1 round, 4 sites, 4 i18n keys. TDD-strict.
