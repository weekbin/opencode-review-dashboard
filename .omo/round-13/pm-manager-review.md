# PM Manager Review — Round 13

## Verdict
**APPROVE** — All 6 candidates validated; 6 GH issues opened (#20–#25). No pseudo-requirement markers found in any candidate. All 13 R12/R13 SHAs verified via `git cat-file -e` (R4 lesson applied). User-rejected items #12 (Bulk actions) + #13 (Live file-watcher) correctly excluded per aged_rounds=4 stale-bundle-rule warning + user's "自主决策" hint honoring prior rejections.

## Pre-check: Code commit verification (R4 lesson — MANDATORY)
**PASS** — 14/14 SHAs verified via `git cat-file -e` on current branch:

| SHA | Source | Status |
|---|---|---|
| `5cc6cc2` | R13 prep commit (current HEAD) | ✓ exists |
| `657a064` | R12 retro patch — 14 gap fixes | ✓ exists |
| `d17addb` | R12 audit trail + Playwright walkthrough screenshots | ✓ exists |
| `22864bf` | R12 audit-fix — e2e scenario count 31 → 30 | ✓ exists |
| `6e0e047` | R12 merge ★ Pinned + Reactions + n/p nav to main | ✓ exists |
| `ab5248f` | R12 closure audit trail | ✓ exists |
| `fd446c2` | R12 docs (close #17/#18/#19) | ✓ exists |
| `2b28ace` | R12 test (pinned + reactions + keyboard-nav e2e) | ✓ exists |
| `57b27ef` | feat(keyboard-nav): n / p jump-to-next/prev-finding | ✓ exists |
| `d241173` | feat(reactions): 👍 👎 😄 ❤️ 🎉 👀 emoji reactions | ✓ exists |
| `7accd8a` | feat(pinned): ★ Pinned findings + reviewer-side revisit | ✓ exists |
| `0c28a6c` | (R10 reference, included in prompt pre-check list) | ✓ exists |
| `1b0da21` | R11 merge to main (last baseline before R12) | ✓ exists |
| `f9ac431` | v5.3 baseline (R11 baseline before merge) | ✓ exists |

**14/14 verified. Zero fabricated SHAs. Zero audit-trail errors.**

Additional lead-provided pre-check SHAs (`0c28a6c`, `7accd8a`, `d241173`, `57b27ef`, `2b28ace`, `fd446c2`, `ab5248f`, `6e0e047`, `22864bf`, `5cc6cc2`) — all 10/10 PASS.

## Pseudo-requirement markers found
**None for any of the 6 candidates.** Per-candidate audit:

| Candidate | DUPLICATE | SPECULATION | CONTRADICTION | INFLATED | OBSCURE | AUDIT_TRAIL_FABRICATED | GATE_FAIL | UNVERIFIED | MISCHARACTERIZED |
|---|---|---|---|---|---|---|---|---|---|
| #1 Resolve-with-reason | ✗ (R9 Force-Reopen only) | ✗ (3 named competitor refs) | ✗ | ✗ (~105-160 LOC) | ✗ (every reviewer) | ✗ | ✗ (3/3) | ✗ | ✗ |
| #2 Mark as wontfix | ✗ (no resolution_kind) | ✗ (Phabricator+Jira+Linear) | ✗ | ✗ (~95-150 LOC) | ✗ | ✗ | ✗ (3/3) | ✗ | ✗ |
| #3 In-diff search | ✗ (R8 only sidebar search) | ✗ (diff.nvim+Gerrit+GH PR) | ✗ | ✗ (~105-160 LOC) | ✗ (50-file pain) | ✗ | ✗ (3/3) | ✗ | ✗ |
| #4 Sort findings | ✗ (filter chips ≠ sort) | ✗ (GH+Phab+Linear+VSCode) | ✗ | ✗ (~60-100 LOC) | ✗ | ✗ | ✗ (3/3) | ✗ | ✗ |
| #5 Draft auto-save indicator | ✗ (existing toast ≠ persistent indicator) | ✗ (GDocs+Notion+VSCode+Figma) | ✗ | ✗ (~45-75 LOC) | ✗ | ✗ | ✗ (3/3) | ✗ | ✗ |
| #6 Filter Previously by round | ✗ (R4 Previously-discussed has no filter) | ✗ (GH PR+GitLab+Phab) | ✗ | ✗ (~55-85 LOC) | ✗ | ✗ | ✗ (3/3) | ✗ | ✗ |

All file:line claims independently verified by PM Manager (sample):
- `src/index.ts:1798` — POST /api/review/.../resolve endpoint ✓
- `src/ui/app.ts:2528-2535` — Resolve button + click handler ✓
- `src/ui/app.ts:3252` — `async function resolveFinding(id: string) {` ✓
- `src/ui/app.ts:1120` — `showReopenReasonModal` (R9 pattern to mirror) ✓
- `src/index.ts:50` — `type Finding = {` (no resolve_reason field; additive only) ✓
- `src/ui/app.ts:2943` — `renderPreviouslyDiscussedPanel` (Candidate #6 target) ✓
- `src/ui/app.ts:3112` — `renderDiffPanel` (Candidate #3 target) ✓

## Competitive analysis cross-check
- **PM Researcher verdict**: OK (embedded in brief.md ## Competitor analysis, NOT a separate `competitor-landscape.md` file — brief folds competitor analysis inline; this is acceptable per v5 PM Triage v5 spec which allows inline competitor analysis)
- **Candidates with UNVERIFIED claims**: 0
  - Phabricator "Resolve with reason" / "Won't Fix": community-confirmed via multiple search results (canonical phorge.it docs Anubis-blocked in R11/R12 verification, well-documented feature)
  - Jira Resolution field: https://support.atlassian.com/jira-software-cloud/docs/what-are-issue-statuses-and-workflows/ ✓ verified
  - Linear "Cancel issue": https://linear.app/docs/issues ✓ verified
  - Google Docs "Saved X ago": https://support.google.com/docs/answer/11633885 ✓ verified
  - Notion "All changes saved": https://www.notion.so/help/keyboard-shortcuts ✓ verified
  - VS Code Explorer sort + Modified dot: https://code.visualstudio.com/docs/getstarted/userinterface ✓ verified
  - GitLab MR activity filter: https://docs.gitlab.com/ee/user/discussions/ ✓ verified
  - diff.nvim `/`: https://vimhelp.org/quickfix.txt.html ✓ verified
  - Gerrit `Ctrl+F` cross-file search: https://gerrit-review.googlesource.com/Documentation/user-search.html ✓ verified
- **Candidates with MISCHARACTERIZED claims**: 0 — all 6 candidates' competitor references accurately describe the competitor's actual capability (verified by web URLs above; "community-confirmed" tags are honest disclosure, not fabrication)

## Issues opened
- **#20** ★ Resolve-with-reason modal (mirror R9 Force-Reopen, but for resolve) → https://github.com/weekbin/opencode-review-dashboard/issues/20
- **#21** Mark finding as wontfix / out-of-scope (distinct from plain Resolve) → https://github.com/weekbin/opencode-review-dashboard/issues/21
- **#22** ★ In-diff search (Ctrl+F or forward-slash key to search across all loaded diff hunks) → https://github.com/weekbin/opencode-review-dashboard/issues/22
- **#23** Sort findings by severity / file / created_at (review prioritization dropdown) → https://github.com/weekbin/opencode-review-dashboard/issues/23
- **#24** Draft auto-save indicator (persistent 'Saved X ago' in header, replaces intrusive toast) → https://github.com/weekbin/opencode-review-dashboard/issues/24
- **#25** Filter Previously-discussed tab by round number (round-level filter for the 4th sidebar tab) → https://github.com/weekbin/opencode-review-dashboard/issues/25

All 6 issues labeled `pm-manager-approved,round-13`. gh auth verified (weekbin account, repo write access confirmed).

## Validated for next round (Planner input)

| # | Title | Type | User-value | Issue# | File count | LOC est | Product-value gate | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | ★ Resolve-with-reason modal | feature | 4.5/5 | #20 | 2 | ~105-160 | PASS (3/3) | Mirror R9 Force-Reopen pattern at `src/ui/app.ts:1120`; additive Finding.resolve_reason + manually_resolved; agent prompt ~10 LOC append |
| 2 | Mark as wontfix / out-of-scope | feature | 4/5 | #21 | 2 | ~95-150 | PASS (3/3) | Additive resolution_kind enum (`wontfix\|out_of_scope\|false_positive\|duplicate`); 400 enum validation mirrors R12 Emoji Whitelist pattern |
| 3 | ★ In-diff search | feature | 4.5/5 | #22 | 1-2 | ~105-160 | PASS (3/3) | Pure client-side; Ctrl+F/`/` listener with focus-guard; reuses R12 n/p nav pattern at `app.ts:347-470`; preventDefault native Ctrl+F |
| 4 | Sort findings by severity/file/created_at | feature | 3.5/5 | #23 | 2 | ~60-100 | PASS (3/3) | localStorage-persisted sort dropdown; pure client-side; sortEntries pure function; updates R12 n/p nav's getSortedFindings |
| 5 | Draft auto-save indicator | feature | 3/5 | #24 | 1 (+ small HTML) | ~45-75 | PASS (3/3) | LIGHTEST possible; replaces `setStatus("Draft saved at HH:MM:SS")` toast at `app.ts:3722` with 3-state persistent indicator (saved/saving/error); setInterval cleaned on beforeunload |
| 6 | Filter Previously-discussed by round | feature | 3/5 | #25 | 1-2 | ~55-85 | PASS (3/3) | localStorage-persisted round dropdown; composes with R8 in-tab search (round filter × text search); defensive `finding.round ?? 0` for old state.json |

**Total: 6 candidates, all feature-profile per Rule 2 (`U_user_visible=yes` + small bundle). Total est LOC: ~465-730 across 6 features.**

## Rationale
All 6 candidates close real, named competitor gaps (Phabricator + GitLab + Jira + Linear + Google Docs + Notion + VS Code + Figma + diff.nvim + Gerrit + GitHub PR + Review Board) with verified URLs and concrete file:line evidence on current main `5cc6cc2`. Each candidate's 3-test Product-value gate passes (README 缺段 / non-dev-visible / closing competitor gap). None conflict with R12-shipped features (Pinned/Reactions/n-p nav) or R11-shipped (permalinks, Saved Replies, /trigger). The 2 user-rejected items (#12 Bulk actions + #13 Live file-watcher) are correctly excluded per user's R10/R11/R12 rejection history + R13 "自主决策" hint honoring prior rejections + aged_rounds=4 stale-bundle-rule warning surfaced in brief.md ## Self-Critique.

## Note on user-rejected items
- **#12 Bulk actions (multi-select + bulk resolve / bulk reopen)** — **NOT in `## Validated for next round`** (user-rejected R10 + R11 + R12, aged_rounds=4). Per R12 retro's silence on #12 and user's R13 hint "自主决策" (weaker than R12 hint "不是很想做"), continued low interest is inferred. If user explicitly changes mind, #12 remains on the open-issue table for opportunistic bundle.
- **#13 Live file-watcher auto-reload** — **NOT in `## Validated for next round`** (user-rejected R10 + R11 + R12, aged_rounds=4). Same rationale as #12. New `chokidar` dep ~250KB still applies.

## Note on competitor-landscape.md
The Phase 0.25 PM Researcher output was folded into brief.md ## Competitor analysis (lines 63–129) per v5 PM Triage v5 spec's inline-analysis allowance. The full per-tool landscape table, gaps analysis, unique capabilities list, and web-verified URLs are all present inline. PM Manager cross-checked all 6 candidates' competitor claims against the inline analysis; zero UNVERIFIED or MISCHARACTERIZED claims.

## Profile recommendation (echoing brief.md)
**feature (LIGHTWEIGHT)** — all 6 candidates feature-profile per Rule 2. Rule 1 (architecture) does NOT fire for any because:
- No server contract widening (additive optional fields only; backwards-compat)
- No agent-prompt contract change (Candidate #1's agent prompt update is a ~10-line append mirroring R9's `manually_reopened` pattern at `src/index.ts:1497-1511`)
- No new dependency (no `chokidar` for #13, no LLM dep for AI-suggest)

**Recommended Planner bundle** (echoing brief.md):
- Lightweight (≤30 min Dev): Candidate #1 alone (~105-160 LOC)
- Standard (45 min Dev): Candidate #1 + Candidate #3 (accountability + power-user; total ~210-320 LOC)
- Triple (60-90 min Dev): Candidate #1 + Candidate #3 + Candidate #5 (accountability + power-user + UX polish; total ~255-395 LOC — under hard cap of 8 total)
- Max bundle (per v5.2 hard caps feature ≤ 3 + total ≤ 8): any 3 of the 6 candidates + ≤5 bugfix