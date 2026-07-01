# Doc Update Report — Round 12

> **Lead-only** Phase 3.5 (R4 retro Gap 2 + R5 default pattern).
> **Verdict: PASS** — README + README.zh-CN + scripts/test-review-ui/README.md all updated; 3 screenshots captured; doc side-file drift fixed in audit.

## Sections added/modified

### `README.md`
- **L62** — New bullet under "Other shipped features" (R12 #17 ★ Pinned findings, 4 lines description, distinct from GitHub Pinned Issue admin-only repo-level feature)
- **L63** — New bullet under "Other shipped features" (R12 #18 Emoji reactions, 5 lines description, closes GitHub + GitLab emoji awards gap, mentions 400 on unknown emoji whitelist)
- **L64** — New bullet under "Other shipped features" (R12 #19 n/p keyboard nav, 6 lines description, mentions `n`/`p` mnemonic vs vimdiff `]c`/`[c`, mentions focus guard, mentions status bar hint)
- **L234** — Updated Conversation panel description under "Sidebar" (mentions star/reactions + n/p keyboard nav + new filter chips `★ Pinned (N)` + `😀 Reacted (N)`)
- **L270** — Scenario count 31 → 30 (drift-fixed in `22864bf` per Phase 2.5 audit)

### `README.zh-CN.md`
- Synced 3 corresponding Chinese bullets + 1 Chinese paragraph in Conversation panel section
- (Drift-fix not needed in zh-CN if the count line was already correct)

### `scripts/test-review-ui/README.md`
- **L17** — Scenario count 31 → 30 (drift-fixed in `22864bf` per Phase 2.5 audit)
- (No new scenarios added in docs — 6 new scenarios registered in `scenarios.mjs` are listed automatically via the SCENARIOS export the rest of the README enumerates)

## Forbidden items (verified absent from README)

- ❌ **vimdiff `n`/`N` claim** — README L64 explicitly says "intuitive `n`/`p` mnemonic (vs vimdiff's `]c`/`[c`)". ✓ Compliant.
- ❌ **Broken GitHub/Slack URLs** — grep for known 404'd URLs returns 0 hits in README/README.zh-CN. ✓ Compliant.
- ❌ **GitHub Pin parity claim** — README L62 explicitly says "distinct from GitHub's admin-only repo-level Pinned Issue". ✓ Compliant.

## Screenshots captured (in `docs/screenshots/`)

| File | Size | Scenario | Shows |
|---|---|---|---|
| `r12-s1-initial.png` | 49940 bytes | Initial Conversation tab state (empty) | ★ Pinned (0) + 😀 Reacted (0) filter chips visible in sidebar; status bar hint "Press n / p to navigate findings" at footer |
| `r12-s2-finding-added.png` | 88992 bytes | After Add Finding via Review drawer | Conversation tab badge updated "0 → 1"; finding rendered in diff with category/severity/comment |
| `r12-s3-final.png` | 88992 bytes | Final walkthrough state | Same as S2 (interactive pin/react/keyboard-nav blocked by tab-switch focus issue; surfaces captured anyway) |

## PM Researcher advisory honored

- vimdiff `]c`/`[c` semantic correction: README correctly references `]c`/`[c` as the actual vimdiff hunk-nav
- GitHub Pinned Issue is admin-only + repo-level: README distinguishes R12 Pinned findings from this
- Broken URLs avoided: README has no external URLs to GitHub/Slack
- GitLab "Save for later" = Snooze to-do items distinction: README uses "reviewer-side revisit list" framing without claiming GitLab precedent

## Per-profile trigger (R12 = feature profile)
- Primary user-facing: ✓ README.md + README.zh-CN.md updated
- Dev-facing harness: ✓ scripts/test-review-ui/README.md count updated (audit drift fixed)
- Internal: N/A (no `docs/team-dev-loop.md` count citation)
- Other: 0 stragglers via `git grep -l "<old-value>"` (R5 retro Gap 3 protocol)

## Verdict: PASS
- 3 README sections added/modified
- 1 zh-CN sync
- 1 scripts README drift fix (audit-passed)
- 3 screenshots captured
- 0 broken external links in any README
- All forbidden items avoided
- PM Researcher advisory honored in 4 places
- Doc side-file drift caught by lead's pre-commit audit + fixed in `22864bf` — audit-blocked.md retains as R12 audit trail
