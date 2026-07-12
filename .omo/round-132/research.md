# R132 Research — Persistent locked-review status

## Candidate: locked-state visibility after reload

- **Files involved**: `src/index.ts` owns both persisted `State.locked` and the server `Launch` payload; `src/ui/app.ts` mirrors `Launch` and renders the Stats pane; `src/ui/i18n.ts` owns bilingual copy; `src/ui/review.html` owns vanilla CSS; `src/r131-round-lock-on-approve.test.ts` provides the lock regression baseline.
- **Existing patterns**: launch data is assembled once in `src/index.ts` and copied into the browser-side `Launch` type; `renderStatsPane()` builds semantic sections with DOM APIs; status styling already uses the dashboard's green light/dark palette in `.save-indicator`; source-contract regression tests are the established round-test pattern.
- **Simplest change**: add optional `locked` to both `Launch` types and the payload, render a `role="status"` banner with inline SVG + bilingual round text before the Stats empty-state branch, and style it with extracted semantic tokens.
- **Design-system prerequisite**: the project is vanilla TypeScript/CSS (no React) and has no `DESIGN.md`; extract the existing compact developer-tool visual language into the mandated seven-section document before changing UI.
- **Risk**: if the badge is appended after the current `findings.length === 0` return, locked reviews with no renderable findings remain invisible; the banner must be appended before that branch and must not use an emoji icon.
- **Test strategy**: add focused R132 tests proving server transport, client typing, render order, semantic accessibility, SVG icon use, i18n coverage, CSS token use, and design-system completeness; run the R132 test red before implementation, then the full pre-commit gate and browser screenshot harness.
