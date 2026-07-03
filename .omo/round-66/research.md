# R66 Research

Static HTML button — use `data-i18n-aria-label` attribute (same pattern as R64 settings-btn).

No regression-test risk: existing R43 tests now use precise `'data-i18n="'` pattern (per R64 tightening).

drawer-toggle button has multi-line opening tag (4 attributes on 4 lines), so test regex must use substring approach (not `<button[^>]*...>` which fails on first `>` at end of line).
