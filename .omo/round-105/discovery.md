R105 — loop gap #10 fix: .omo/round-* v6 conformance.

r102-r104 (3 gap-fix rounds) shipped the structural pre-commit and i18n
coverage tests but did NOT verify that prior rounds (r82-r101, 20 rounds)
followed the v6 spec structurally — 6 artifacts (discovery, research, brief,
verify, retro, decision.md) plus a closed loop-internal.

spot-audit:
- 12+ prior retro.md files used ad-hoc formats ("loop-internal open: NONE." /
  "loop-internal open: none."). structural text was inconsistent.
- 0 of r82-r101 decision.md files used the full v6 "SHIP" sentinel — many had
  prose-form decisions instead of the one-token marker.
- one test at r105-round-conformance.test.ts catches all 3 invariants.

scope: rounds >= R82 only. older rounds (r1-r81) predate the v6 spec.
