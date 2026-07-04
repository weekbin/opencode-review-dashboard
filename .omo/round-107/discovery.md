R107 — loop gap #4 fix: en fallback path.

audit of `src/ui/i18n.test.ts` AC1.2 (lines 65-99) found only a sample of 2
en strings + 1 zh-CN string + 1 placeholder check. with ~200 STRINGS rows
in v6 (post-r103), a sample of 2-3 doesn't catch typos or stale data in
the other 195+ en strings.

gap #4 is structural: an en translation that has a typo (e.g., "Copies as
Markdown" instead of "Copied as Markdown") passes AC1.2's structural tests
(non-empty, has CJK for zh-CN) but produces wrong UI text in en sessions.
only a full-table scan catches this.
