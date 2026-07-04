# R95 — i18n: 4 hardcoded English aria-labels in review.html

4 static aria-label attributes (sidebar sections, resize sidebar, close review drawer, close settings) replaced with data-i18n-aria-label. Required 3 sibling test updates (a11y.test.ts, r58-a11y-svg-aria.test.ts, r81-navbar-tabs-i18n.test.ts) and oxfmt reformatting of review.html.
