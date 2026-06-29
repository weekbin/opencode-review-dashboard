# PM Manager Review — Round 11

## Verdict
**APPROVE** — both lightweight feature-profile candidates pass Product-value gate, file:line evidence verified, no pseudo-requirement markers. `#3 Issue templates bulk-apply` DEFERRED to R12 per PM Triage + mixed-surface scope risk.

## Pre-check: Code commit verification
**PASS** — all cited SHAs verified via `git cat-file -e` (reused from PM Triage `brief.md` ## PM Triage pre-check L246-260; spot-verified again this turn):
- `f9ac431` ✓ (R11 v5.3 baseline)
- `55737e5` ✓, `c5fed23` ✓, `3dfcfb4` ✓, `643c5b8` ✓, `4ef61de` ✓, `8bc25b2` ✓ (R10 audit-trail)

## Pseudo-requirement markers found
**None.** None of the 5 standard + 3 v5 markers triggered:
- DUPLICATE — cleared (R10 Saved Replies is click-to-insert only; `/trigger` is a new keyboard path; per-finding permalinks surface a brand-new URL affordance)
- SPECULATION — cleared (Candidate #1 lifts verbatim from `round-10/brief.md` L94 documented "what's missing" backlog; Candidate #2 is grounded in concrete `grep -nE 'window.location.hash'` 0-match verification)
- CONTRADICTION — cleared (no in-flight or recent commit overrides; R10 SHAs show no parallel Saved-Replies work post-55737e5)
- INFLATED — cleared (both candidates ≤150 LOC, single-PR-sized; Product-value gate rejects >2-test failures)
- OBSCURE — cleared (both personas are clear: reviewer + reviewer-collaborator)
- AUDIT_TRAIL_FABRICATED — cleared (SHA list above)
- **PRODUCT_VALUE_GATE_FAIL** — cleared (Candidate #1: 2 PASS + 1 PLAUSIBLE-UNIQUE; Candidate #2: 3 PASS; both above the 2-failure rejection threshold)
- **COMPETITOR_CLAIM_UNVERIFIED ≥2** — cleared (Candidate #1: 1 UNVERIFIED \`/trigger\` claim only, marked PLAUSIBLE based on GitHub Keyboard shortcuts doc URL + R10 brief.md L94 documented source; Candidate #2: 0 UNVERIFIED claims)
- **COMPETITOR_CLAIM_MISCHARACTERIZED** — cleared (none found by PM Triage; PM Researcher's verdict is parallel and not blocking)

## Competitive analysis cross-check
- PM Researcher verdict: **pending — parallel spawn** (Phase 0.25 running concurrently; PM Manager gates on `brief.md` alone per v5 spec note "You don't wait for PM Researcher's verdict")
- Candidates with UNVERIFIED claims: **Candidate #1 only** — \`/trigger\` keyboard-shortcut expansion marked PLAUSIBLE-UNIQUE (no canonical docs URL; supported by GitHub Keyboard shortcuts doc showing only formatting shortcuts + R10 brief.md L94 documented backlog). Plausibility is high (lifts from documented R10 source, not PM speculation), so this single UNVERIFIED claim does NOT meet the ≥2 threshold for REJECT.
- Candidates with MISCHARACTERIZED claims: **none**

## Issues opened
- **#15** Saved Replies: \`-prefix keyboard shortcut to insert a template by name (Candidate #1) — https://github.com/weekbin/opencode-review-dashboard/issues/15
- **#16** Per-finding permalink anchor — Copy-link button + #finding-<id> deep-link (Candidate #2) — https://github.com/weekbin/opencode-review-dashboard/issues/16

Both opened successfully with `pm-manager-approved` + `round-11` labels (v5.3 Gap-O pre-creation confirmed in `sync-report.md` L31-32 + verified via `gh label list` showing both labels in green). Note: gh CLI output included a stray zsh shell-warning ("permission denied: /") unrelated to issue creation — both issues returned clean URLs.

#13 (Live file-watcher) and #12 (Bulk actions) remain OPEN on GitHub as architecture candidates for R12+ — explicitly **not** opened in R11 (lightweight strategy).

## Validated for next round (Planner input)

| # | Title | Type | User-value | Issue# | File count | LOC est | Product-value gate | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | Saved Replies \`/trigger\` keyboard shortcut | feature | 4/5 | #15 | 1-2 | ~80–150 | PASS (2/3 + 1 PLAUSIBLE-UNIQUE) | **RECOMMENDED** — smallest-scope lightweight candidate; lifts from `round-10/brief.md` L94 documented backlog; pure UI extension to R10 Saved Replies (localStorage CRUD + cursor insert already wired) |
| 2 | Per-finding permalink anchor | feature | 3.5/5 | #16 | 2-3 | ~130–200 | PASS (3/3) | OPTIONAL BUNDLE — closes GitHub/Gerrit/Phabricator permalink gap; pure client-side JS (location.hash + clipboard + scrollIntoView); bundles naturally with #1 for upper end of v5.2 lightweight budget |
| 3 | Issue templates bulk-apply (DEFERRED to R12) | feature (mixed surfaces) | 3/5 | (deferred) | 2-3 | ~150 | PASS (3/3) | **DEFERRED** — PM Triage explicitly recommends R12 because of mixed UI surfaces (Saved Replies modal + per-finding checkbox) — would inflate test budget beyond v5.2 lightweight; keep on roadmap via R10 PM doc writer's `follow_up_candidates` carry-over |

## Rationale
Both Candidate #1 and #2 are clean, scope-bounded feature-profile work that should complete inside the v5.2 30-min Dev budget and validate lightweight mode end-to-end (R11's stated strategic goal after R10's 30-min architecture timeout). They share the "external-share / extend affordance" theme — #1 speeds up typing into your own review, #2 speeds up sharing your review with teammates — and compose naturally into a single thematic PR bundle (or ship #1 alone for the lowest-risk first delivery). Candidate #3 is the right scope for R12 once lightweight-mode validation completes; deferring keeps R11 tight.
