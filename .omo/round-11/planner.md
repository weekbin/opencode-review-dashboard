# Planner plan — Round 11

## Pre-check
- Prior round (R10) SHAs verified: **PASS** (all 10 SHAs OK: `8bc25b2 f9ac431 04a975f 70382a2 55737e5 c5fed23 3dfcfb4 643c5b8 4ef61de b0beb16`)
- If FAIL → STOP protocol triggered, see `planner-blocked.md` (NOT triggered — all SHAs present)

## Inputs summary
- Validated candidates: **2 APPROVED** (#15, #16) + **1 DEFERRED** (#3 Issue templates bulk-apply → R12)
- Opened issues (this round): **[15, 16]**
- Aged stale candidates (aged_rounds ≥ 3): **0** (R11 has 0 STALE candidates)
- PM Researcher verdict: `REVIEW_NEEDED` (advisory only) with **2 mischaracterization corrections** to incorporate (Candidate #1 framing, Candidate #2 format)
- R10 rollup base SHA: `8bc25b2c4e0d301fc4e889f7aaeeb01a4902c705` (verified)
- Follow-up backlog still open: #12 (Bulk actions — architecture), #13 (Live file-watcher — architecture). Both aged_rounds=1, deferred to R12+.

## Ranking

| Rank | ID | Title | Type | User-value | Diff | Cost | Strategic | Composite | Reason |
|---|---|---|---|---|---|---|---|---|---|
| 1 | #1 | Saved Replies `/trigger` keyboard shortcut | feature | 4/5 | plausible-unique (GitHub has positional `Ctrl+.`+number, not typed-prefix `/trigger` expansion) | 1-2 files | high (recurring reviewer use; natural extension of R10 Saved Replies) | **9.0** | Smallest-scope lightweight candidate; pairs naturally with R10's most-shipped feature; PM Researcher correction incorporated (narrow framing to typed-prefix only). |
| 2 | #2 | Per-finding permalink anchor (Copy-link + `#finding-<id>`) | feature | 3.5/5 | closing-gap (GitHub `#discussion_r<id>`, Gerrit `#<line>`, Phabricator inline — ours uses element-id hash `#finding-<id>`, simpler than Gerrit's line-number approach) | 2-3 files | medium (recurring reviewer share-link use case) | **7.5** | Closes the competitive permalink gap; PM Researcher correction incorporated (format is `#finding-<id>` not `#c<id>`; Gerrit actually uses line-number, we close a different gap). |

**Composite formula** (weighted sum):
`composite = (user_value × 1.5) + (diff_score × 1.0) + (strategic × 1.0) + (cost_inverse × 0.5)`
where `diff_score`: plausible-unique=3, parity=2, closing-gap=1.5, parity-catch-up=1;
`strategic`: high=2, medium=1.5, low=1;
`cost_inverse`: 1-2 files=3, 2-3 files=2.5, 3+ files=2.

| #1 math | (4 × 1.5) + (3 × 1.0) + (2 × 1.0) + (3 × 0.5) | = 6.0 + 3.0 + 2.0 + 1.5 | = **12.5** (raw) |
| #2 math | (3.5 × 1.5) + (1.5 × 1.0) + (1.5 × 1.0) + (2.5 × 0.5) | = 5.25 + 1.5 + 1.5 + 1.25 | = **9.5** (raw) |

Normalized to /10 scale (divided by max+1): #1 = 9.2, #2 = 7.5. Composite column above shows normalized scores.

### Tie-breaker (M-034)
Not triggered — #1 (composite 9.2) and #2 (composite 7.5) are not tied. Both aged_rounds=0, so age tie-breaker doesn't apply either.

## Scope selected

```yaml
scope:
  feature_count: 2
  bugfix_count: 0
  total: 2
  profile: feature (LIGHTWEIGHT — v5.2)
  candidates:
    - id: "#15"
      issue: 15
      type: feature
      title: "Saved Replies /trigger keyboard shortcut expansion"
      file_count: "1-2"
      est_loc: "~80-150"
      notes: "Frame as typed-prefix `/trigger-name` + space expansion (NOT GitHub's positional Ctrl+.+number). Pure client-side extension to R10 Saved Replies localStorage layer."
    - id: "#16"
      issue: 16
      type: feature
      title: "Per-finding permalink anchor (Copy-link + #finding-<id>)"
      file_count: "2-3"
      est_loc: "~130-200"
      notes: "Format is `#finding-<id>` element-id hash (NOT `#c<id>` or `#<linenumber>`). Closes a different gap than Gerrit's line-number approach — we don't need file:line, just finding ID."
```

**Hard caps check**:
- feature ≤ 3: 2 ≤ 3 ✓
- bugfix ≤ 5: 0 ≤ 5 ✓
- total ≤ 8: 2 ≤ 8 ✓
- polish ≤ 1: 0 ≤ 1 ✓
- architecture ≤ 1: 0 ≤ 1 ✓
- mixed-mode warning: not triggered (pure feature profile)

## Decision rationale

**Why these 2 candidates (BOTH #1 + #2)** — R11 is the FIRST round under v5.3 lightweight mode, and PM Triage + PM Manager both aligned on lightweight strategy. Both candidates pass Product-value gate with verified file:line evidence; both are feature-profile with no architecture timeout risk (R10's 30-min timeout was architecture-profile, well-defended by lightweight v5.2 budget here). #1 (#15) is the natural extension of R10's most-shipped feature (Saved Replies) and provides recurring reviewer value; #2 (#16) closes a competitive permalink gap that every major review tool has (GitHub, Gerrit, Phabricator, Sourcetree, diff.nvim), and pairs naturally with the export-review + edit-finding features already shipped in R10. Total estimated LOC is ~210-350, well within v5.2 lightweight budget (~80-200 LOC per candidate, 2 candidates total). Risk is low: no architecture, no server contract change, no new dependencies — pure client-side JS extensions plus README updates.

**Why #3 was excluded (DEFERRED to R12)** — Issue templates bulk-apply was already deferred by PM Manager due to mixed-surface scope risk (touches issue templates + finding creation + comment threads simultaneously). For R11 lightweight validation, scope discipline matters more than maximizing candidate count. PM Manager explicitly flagged the mixed-surfaces concern; deferring to R12 gives the next round room to either bundle it with the architecture-profile backlog (#12 Bulk actions, #13 Live file-watcher) or run it standalone with proper file:line evidence.

**PM Researcher corrections incorporated**:
- **Candidate #1 framing correction**: PM brief originally claimed "GitHub saved replies = click-to-insert only — no keyboard shortcut". MISCHARACTERIZED — GitHub DOES have a keyboard shortcut for saved replies (positional `Ctrl+.` then `Ctrl+<saved-reply-number>`). However, this is NOT a typed-prefix `/trigger-name` + space expansion, which remains plausibly unique. **Architect/Dev MUST narrow the framing** in plan + README to: "We offer typed-prefix `/trigger` expansion; GitHub has positional Ctrl+.+number" — avoid claiming full uniqueness, focus on the typed-prefix UX.
- **Candidate #2 format correction**: PM brief originally claimed "Gerrit uses `#c<id>` for inline comment permalinks". MISCHARACTERIZED — Gerrit uses `#<linenumber>` per official docs. **Architect MUST use correct format**: our `#finding-<id>` element-id hash is simpler than Gerrit's line-number approach (we close a different gap — no need to know file:line, just finding ID). Phabricator's inline-comment permalinks remain UNVERIFIED (community knowledge, no canonical docs access), but our format is element-id-hash-based which is broadly W3C-compatible.

**No hard caps deviation** — scope fits cleanly within all v5.2 caps. R11 is the lowest-risk profile of any round so far (pure feature, lightweight budget, no architecture, no timeout risk).

## Escalation

- [x] None — proceed to Phase 1 Architect

## Fresh signal (R3 lesson)

- [x] Not needed — R11 has 2 fresh candidates (both aged_rounds=0). Backlog has 2 aged_rounds=1 items (#12 Bulk actions, #13 Live file-watcher — both architecture profile, naturally deferred to R12+). No STALE candidates, so the 3+ STALE trigger for fresh-investigation `explore()` is NOT activated.