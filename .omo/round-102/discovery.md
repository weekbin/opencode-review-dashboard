R102 — loop gap #1 fix: pre-commit anchor drift detection.

audit of r82-r101 (20 rounds of i18n cleanup) found that 12+ rounds each triggered
the same sequence: write change → `bash .husky/pre-commit` fails format-check →
`bunx oxfmt <file>` (silent reformat) → re-run pre-commit → pass. the silent reformat
step could break test anchors (oxfmt reflows html, splits button attrs across lines,
removes comments) but pre-commit's "test PASS" was captured BEFORE the reformat, so
drift went undetected.

verified failure case: r83's r83-conversation-filter-titles.test.ts used
`<button data-filter="X"` to find buttons, but oxfmt reflowed multi-line button
attrs away from that exact pattern. test broke silently the round after a format
write.
