# R73 Discovery

R72 carry-over: empty (edit-finding modal closed all 7 hardcoded English strings).

Fresh scan: looked for non-i18n bug class (R63-R72 was heavy i18n/a11y).

Found real prod bug class: **stale timer race** in 3 copy-button handlers (app.ts:388-405, 463-480, 1705-1716).

Pattern (all 3 sites):
1. Set button textContent to "✓ Copied"
2. SetTimeout(1200ms) to revert textContent + re-enable button
3. **No clearTimeout** — if user clicks again within 1200ms, old timer fires and reverts the NEW text

User-visible bug: rapid double-click on Copy shows "✓ Copied" then "Copy" then "✓ Copied" then "Copy" — flickering text.

Selected scope: 1 round, 3 sites, fix pattern: capture timer ID per-button + clearTimeout before starting new.
