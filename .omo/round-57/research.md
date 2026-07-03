# R57 Research

openDiffSearch function (app.ts:836-870) creates overlay via innerHTML with hardcoded English. Need to:
1. Add 5 keys to STRINGS table: search.diff.placeholder, search.diff.ariaLabel, search.diff.previous, search.diff.next, search.diff.close
2. Replace hardcoded strings with `${escapeHtml(t(...))}` template interpolation
3. escapeHtml is hoisted (function declaration at app.ts:3603), so accessible from openDiffSearch scope

No existing pattern for translating dynamically-created innerHTML — first such case. data-i18n-* attribute pattern requires element to exist in static HTML, doesn't apply to dynamic innerHTML.
