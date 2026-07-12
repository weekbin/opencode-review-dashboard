# R142 Retro — close R141 retro #2 (byte-equivalence test audit + SOP)

## What worked

Lead-direct audit-only round across zero source files (modified), 6 round artifacts, and 1 `.omo/proposals.jsonl` append. Closes the R141 retro #2 stale flag ("audit for more byte-equivalence tests lurking") that had been re-surfaced in R140 + R141 retros.

The audit ran `grep -nE 'expect\(.*\)\.toMatch\(/"' src/*.test.ts` (the standard pattern for byte-equivalence assertions on hardcoded strings). After filtering benign shapes (i18n key regex shapes, server protocol strings, regex patterns on key names), 4 candidate sites remained. Each was inspected:

| Site | Asserted text | Verdict |
|---|---|---|
| `edit-finding.test.ts:92` | `Edited by user` | i18n-coupling (contract text) |
| `previously-hint.test.ts:57` | `Conversation tab` | i18n-coupling (contract reference) |
| `reopen-stale.test.ts:84` | `Manually reopened:` | i18n-coupling (contract prefix) |
| `saved-replies.test.ts:91` | `Save current as template` | i18n-coupling (real label, future i18n candidate) |

**Zero truly-brittle byte-equivalence assertions found.** All 4 sites are legitimate "current contract" tests that pin the exact user-facing English string. Their brittleness is i18n-coupling only — they break together if/when we localize the corresponding UI text, not in any other refactor.

Pre-commit 8/8 PASS. Project suite 1080/1080 unchanged. R105 conformance satisfied via the 6 artifacts. Per-SHIP append discipline preserved.

## What didn't

- First instinct was to mass-upgrade all 4 tests to behavior-contract. After inspection, realized 4/4 are i18n-coupling (legitimate per the R137→R141 atomic-update pattern), not pathological byte-equivalence. Mass-upgrade would have been over-engineering. So R142 became "audit + SOP" instead of "audit + fix".
- Initial audit grep returned ~30 matches; took a moment to filter benign vs. brittle. Filtering rubric: "would this assertion break for a refactor that doesn't touch user-facing English?" If no → not brittle.

## Carry-over list (≤3 items)

None — R142 closes the R141 retro #2 stale flag. No new loop-internal flags.

## Closed in this round (loop-internal)

- **R141 retro #2 (audit for byte-equivalence tests)**: closed. Audit found 4 i18n-coupling sites + 0 truly-brittle sites. SOP documented for future audits.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **"Audit" doesn't always mean "fix"**. The instinct to mass-upgrade all 4 tests would have produced a noisy diff without actually improving robustness. The R138→R141 retro pattern (R138 #4 → R139 #4 → R140 #3 → R141 #3, all saying "audit for brittle tests") was flagging something real, but the right resolution turned out to be: "audit found 0; here's the SOP for next time." Don't pre-commit to "must fix" before gathering evidence.
- **i18n-coupling vs. byte-equivalence is a meaningful distinction.** They look the same in source (`expect(...).toMatch(/<English text>/)`) but they have different blast radii. i18n-coupling breaks ONLY on i18n changes. Byte-equivalence breaks on any refactor. The SOP lives at `/Users/yangweibin/Projects/opencode-review-dashboard/.omo/round-142/verify.md` for future auditors.
- **Housekeeping-only rounds are real rounds.** R142 had zero source changes. That's fine. The v6 discipline serves loop-internal closure, not just code shipping.

## SOP Forwarded (for next reviewer / next round)

```bash
# Sweep for byte-equivalence test assertions on hardcoded strings
grep -rn 'expect(.*)\.toMatch(/[A-Z]' src/*.test.ts
# Filter: is this a current contract (user-visible English) or an implementation detail?
# - Current contract → i18n-coupling → leave alone (will update atomically with i18n change)
# - Implementation detail → genuinely brittle → upgrade to behavior-contract
```

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` deprecated `document.execCommand("copy")`** (R139 retro). Real behavior change risk. Future housekeeping.
- **`savedReplies.saveCurrent` is a future i18n candidate** (the "💾 Save current as template…" hardcoded label at L5069). Can ship as a sub-15 LOC polish round when there's a clearer reason.
- **`formatRelativeTime > 1 year` as calendar date** — preventive only.

## v6 Compliance

- Hard caps: **0 features + 0 bugfixes + 0 polish = 0 total** (housekeeping). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).

## Round Profile

- Housekeeping: 1 (audit + SOP)
- Total: 1
- Subagents: 0
- Time: ~5 min wall-clock.