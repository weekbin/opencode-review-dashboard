# R66 Discovery

R65 carry-over: drawer-toggle (review.html:3267) missing aria-label.

Last item of R63 carry-over list (copy-branch ✓ R63, settings-btn ✓ R64, export ✓ R65, drawer-toggle ← R66).

Selected scope: 1-attribute addition. Drawer-toggle has visible "Review" text + count badge, but screen readers may announce just the count (e.g., "0") without button purpose. Adding data-i18n-aria-label makes screen readers say "Open review drawer" or zh-CN equivalent.
