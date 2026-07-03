# R78 Discovery

R77 carry-over: empty (R77 retro said all known hardcoded English modals in app.ts are localized).

Fresh scan: 4 small hardcoded English messages in non-modal code paths:
- L1168 Cmd+P palette empty state: `query ? 'No files match "${query}"' : 'No files available'`
- L2308/2314 save indicator (× 2 sites): `'All changes saved'`
- L3507 commits pane empty: `'No commits match "${currentSearchQuery.trim()}".' / 'No commits in range.'`
- L4027 conversation pane empty: `'No findings match "${currentSearchQuery.trim()}".'`

All 4 use dynamic content (template literals with parameters). zh-CN users see English.

Selected scope: 1 round, 4 sites, 6 new i18n keys (one per branch). TDD-strict.
