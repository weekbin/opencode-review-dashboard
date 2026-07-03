# R57 Discovery

R56 carry-over: v6 cleanup complete. references/ now empty. Pivot to product work.

Discovery: 6 hardcoded English strings found in app.ts diff search overlay (app.ts:853-857):
- placeholder="Find in diffs (case-insensitive substring)"
- aria-label="Search diffs"
- 3× title attributes (Previous/Next/Close with keyboard shortcuts)

Bug: zh-CN users see English in their native UI. R19 introduced i18n but missed the dynamically-created diff search overlay.

Selected: add 5 i18n keys + replace hardcoded strings with t() calls + escapeHtml() for safety.
