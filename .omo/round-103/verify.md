3 R103 tests PASS (gap #3 zombie use + gap #5 completeness + gap #5 translation).

discovered 7 real bugs (zombie t() calls without matching i18n.ts keys).
all fixed during R103 by adding 7 new STRINGS rows.

789/789 full test suite pass. v6 pre-commit 8/8 PASS including R102's
format-write anchor-drift check (which now gates i18n changes too).
