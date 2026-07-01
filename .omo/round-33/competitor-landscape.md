# Phase 0.25 PM Researcher (lead-direct, R33 polish scope)

## Verdict

**No external research required for R33 polish round.**

All 4 candidates (#66, #68, #70, #71) are in-plugin targeted fixes — no third-party API, no external library, no competitive product to verify against. The "competitor landscape" for these fixes is **"the plugin itself"** — i.e., do the existing ARIA/i18n/z-index patterns in the codebase conflict with the proposed changes?

## self-check matrix (inline rather than separate files — keeps the loop lightweight for polish rounds)

| Candidate | Existing in-plugin pattern | Conflict with proposed fix? |
|---|---|---|
| #66 (port: 0 → 8890) | `bun.serve({ port: 0, fetch: ... })` pattern at `src/index.ts:1765` | No conflict — port value swap |
| #68 (status: "open") | `state.fresh: Finding[]` at `src/ui/app.ts:1453` — Finding type already has `status` field per `review-context.md` Lens #3 analysis | No conflict — just populate the existing field |
| #70 (overlay backdrop) | `.post-submit` CSS class exists at `src/ui/review.html:2083` | No conflict — additive CSS |
| #71 (ignore-ws i18n) | 3 keys added to `STRINGS` table at `src/ui/i18n.ts:~30` — mirrors existing `toolbar.*` + `settings.*` pattern | No conflict — additive |

## Decision

Skip external research (no github/google/librarian needed). Lead-direct Mode for all phases per v5.3.3.
