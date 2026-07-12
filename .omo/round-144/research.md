# R144 Research — localize `uncommittedBadge.title`

Lightweight-round compression (≤50 LOC + ≤2 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

The only external dependency is the established `t()` direct-lookup pattern. No new infrastructure needed.

**Key naming**: `file.uncommitted.title` follows the established `file.<status>.<element>` namespace (R25 dark-mode reconcile work, R89 file-action labels precedent). Placing it near existing `file.*` keys keeps the i18n.ts file readable.

**Why localize the badge text (`"uncommitted"`) too is NOT in scope**: the badge text is a status word that renders correctly across locales (no CJK-language verbosity); an English status word is conventional badge typography. Adding a t() wrap here would force code to be ambiguous about scope (`uncommittedBadge.textContent` may be set elsewhere first; verifying the locale via `t()` adds complexity for zero UX gain in zh-CN). The tooltip is the high-value target.

**Why the R142 audit found 0 truly-brittle byte-equivalence tests for this surface**: the source-side audit revealed the only remaining string. There were no existing tests asserting the English title text inside the file card rendering (file card has separate test coverage at r68-card-header-bench but it doesn't assert the uncommitted tooltip text). Atomic-update SOP not needed.