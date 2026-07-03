# R64 Decision

## Decision
SHIP

## Lightweight round (if applicable)
YES — settings-btn i18n is a 1-attribute change + 2 test precision fixes. Zero `src/` behavior change beyond localization.

## Doc updates (SG.R29.8 carry-over)
SKIPPED — internal i18n key, no user-facing README change.

## Loop summary (1 paragraph)
R64 ships settings-btn i18n (data-i18n-aria-label="settings.btn.ariaLabel") + tightening of 2 R43 regression tests from `includes("data-i18n")` to `includes('data-i18n="')` so they don't false-fire on the new aria-label attribute. 3 new regression tests, 667/667 total. Pre-commit 8/8 PASS. R63-R67 carry-over: 2/4 done (export + drawer-toggle queued). R65 continues with export button title.
