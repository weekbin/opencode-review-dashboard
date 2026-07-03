# R66 Research

i18n key `drawer.toggle.ariaLabel` already exists in STRINGS table (en: "Open review drawer", zh-CN: "打开审查抽屉"). Static HTML button — use `data-i18n-aria-label` attribute pattern, like R64 settings-btn.

Multi-line button tag (button opens on one line, attributes spread across 4 lines) — R64's regex `<button[^>]*id="..."[^>]*>` doesn't capture all attributes because `>` at end of `type="button"` line closes the regex match early. Use substring extraction (lastIndexOf("<button") + indexOf(">")) to capture the full opening tag.
