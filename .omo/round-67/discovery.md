# R67 Discovery

R66 carry-over: empty (R63-R66 sweep closed). Fresh scan needed.

Fresh scan findings (src/ui/app.ts):
- L3658: range-banner close button `aria-label="Dismiss"` (hardcoded English)
- L4343: edited badge `title="Edited by user at ${ISO timestamp}"` (template literal with hardcoded English)
- L4352: resolution-kind badge `title="Resolution: ${kind}${reason}"` (template literal with hardcoded English)

All 3 are dynamic innerHTML construction (template literals), so need `t()` calls (not `data-i18n-*` attributes).

Selected scope: 1 round, 3 sites, 3 i18n keys. t() supports `params` for {timestamp}/{kind}/{reason} interpolation per i18n.ts:261.
