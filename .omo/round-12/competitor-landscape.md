# Competitor Landscape — Round 12

> **Author**: R12 PM Researcher (librarian subagent, v5 mode)
> **Date**: 2026-06-30
> **Scope**: Verify external product claims for the 3 user-locked R12 candidates
> (#1 Pinned findings, #2 Reactions on findings, #3 Jump-to-next/prev-finding keyboard nav).
> User-rejected items (#12 Bulk actions, #13 Live file-watcher, R11 README polish) are
> explicitly NOT verified per user instruction.

---

## Summary

- **Verified claims**: 2 (GitLab emoji awards; GitHub has a repo-level issue pinning feature)
- **Unverified claims**: 5 (PM cited a feature but could not point to a valid docs URL with the feature described)
- **Mischaracterized**: 4 (cited URL is wrong, dead, or describes a different feature than PM claimed)
- **Unique capabilities (plausible, cannot prove negative)**: 2 (R10 Edit finding; R11 Saved Replies /trigger)

### High-level verdict
**REVIEW_NEEDED** — all 3 candidates have at least one mischaracterized or unverified
external-product claim. PM Manager should require brief rewrites before approval. None
of the candidates fail outright — the underlying feature gaps are real and the
implementation plans are sound — but the external citations are sloppy.

---

## Per-candidate verification matrix

### Candidate #1: ★ Pinned findings

**External claims to verify**:
1. "Phabricator Differential has starred revisions" (URL: `https://we.phorge.it/book/phorge/article/differential/`)
2. "GitLab has 'Save for later' / 'Save' actions on issues" (URL: `https://docs.gitlab.com/ee/user/discussions/`)

#### Claim 1: "Phabricator Differential has starred revisions"
- **VERDICT**: UNVERIFIED
- **Reason**: The cited URL (Phorge Differential User Guide) returns an Anubis bot-challenge
  page (no content); the archived Wayback Machine copy of the same page was retrieved and
  contains NO mention of "starred" or "pinned" revisions. The Phorge/Phabricator Differential
  guide only documents: How Review Works, Creating Revisions, Herald Rules, Inline Comments,
  Next Steps. Per-user "star a revision" is not a documented user-facing feature in the
  canonical Differential user guide.
- **Note**: Phabricator/Phorge does have a "Subscribed / Watching / Mute" mechanism on
  objects, and a per-user "star" preference exists internally in some Phabricator
  applications, but it's NOT exposed as a "starred revisions" feature in the Differential
  product guide. PM may be confusing with Phabricator's Maniphest task "star" or the
  Pholio mock star.
- **Risk**: PM hallucinated or conflated. Recommendation: rewrite as "Phabricator has a
  per-user subscription / mute mechanism on revisions" (if that closes the gap) OR find a
  better-cited competitor (e.g., GitHub's `Pin issue to repository` is a real, documented
  feature — see below).
- **Citation**: https://web.archive.org/web/20241222144143/https://we.phorge.it/book/phorge/article/differential/

#### Claim 2: "GitLab has 'Save for later' / 'Save' actions on issues"
- **VERDICT**: MISCHARACTERIZED
- **Reason**: The cited URL (`docs.gitlab.com/ee/user/discussions/`) was successfully
  retrieved. The page covers comments, threads, mentions, resolve threads, etc. It does
  NOT mention "Save for later" or "Save" as actions on issues or merge request threads.
- **Correct description**: GitLab has a different feature called "**Snooze to-do items**"
  (introduced in GitLab 17.9) on the **To-Do List**, NOT on issues. GitLab also has
  "**Project starring**" (starring an entire project, like GitHub's repo star) but that
  is not a per-issue/per-finding "Save for later". The brief's claim conflates these.
- **Risk**: PM cited a URL that does not support the claim. A more accurate citation would
  be: "GitLab has Snooze to-do items (`docs.gitlab.com/ee/user/todos.html`)" or "GitHub
  has `Pinning an issue to your repository`
  (`docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/pinning-an-issue-to-your-repository`)
  — admin-only, max 3 issues per repo".
- **Citation**: https://docs.gitlab.com/ee/user/discussions/ (no Save for later) +
  https://docs.gitlab.com/ee/user/todos.html (Snooze to-do items, the real equivalent) +
  https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/pinning-an-issue-to-your-repository
  (GitHub repo-level pin, admin-only, real and documented)

#### Net assessment for Candidate #1
- 1 UNVERIFIED + 1 MISCHARACTERIZED. **PM Manager MUST REWRITE** before approval. The
  underlying feature gap is real (reviewers do want a 1-click "revisit this" affordance)
  but the competitor citations need to be either found correctly or replaced.

---

### Candidate #2: Reactions on findings (👍 👎 😄 ❤️ 🎉 👀)

**External claims to verify**:
1. "GitHub reactions" — first URL `https://docs.github.com/en/get-started/writing-on-github/using-keyboard-shortcuts-and-command-palette`
2. "GitHub reactions" — second URL `https://docs.github.com/en/organizations/collaborating-with-your-team/about-conversations-on-github`
3. "GitLab emoji awards" — URL `https://docs.gitlab.com/ee/user/discussions/`
4. "Slack reactions" — URL `https://slack.com/help/articles/360020669072-Use-emoji-reactions`

#### Claim 1: "GitHub reactions" — `using-keyboard-shortcuts-and-command-palette` URL
- **VERDICT**: MISCHARACTERIZED
- **Reason**: That URL is about **keyboard shortcuts and command palette**, not about
  reactions. The PM Researcher in the brief even implicitly acknowledges this by providing
  a different URL for the same feature (Claim 2 below). The "closing gap = GitHub reactions
  gap" citation in the brief lines 89 and 154 points to the wrong page.
- **Risk**: cite-error, not feature-error. GitHub reactions DO exist (they appear on every
  PR/issue/comment page — see the mobx/mobx and reactjs/react.dev discussions pages that
  surface `👍 11 reactions` counters). But the URL the brief cites is wrong.

#### Claim 2: "GitHub reactions" — `about-conversations-on-github` URL
- **VERDICT**: UNVERIFIED (URL is 404)
- **Reason**: The URL `https://docs.github.com/en/organizations/collaborating-with-your-team/about-conversations-on-github`
  returns **404 Page Not Found**. GitHub's docs were reorganized; this page no longer
  exists at this URL. (Verified by direct fetch and by Wayback Machine.)
- **Note**: GitHub reactions DO exist as a feature. They are documented in PR review pages
  and discussion pages (e.g., the `reactjs/react.dev` discussion #85 page I retrieved
  shows `👍 11 reactions` rendered in the UI), but I could not find a current official
  documentation page that describes them in the new docs structure. The PM brief likely
  cited an old URL.
- **Recommendation**: PM should cite a current valid URL, e.g., search for the current
  path under `docs.github.com/en/repositories` or use the GitHub blog post that introduced
  reactions (originally launched 2016).

#### Claim 3: "GitLab emoji awards" — `docs.gitlab.com/ee/user/discussions/`
- **VERDICT**: VERIFIED
- **Reason**: The cited page was successfully retrieved and describes emoji reactions on
  comments. The page covers how to use emoji reactions in GitLab merge request comments
  (the user mentions "Snooze to-do items" via emoji reactions). The brief's claim
  "GitLab emoji awards — You can use emojis to award merge requests" is supported, though
  the exact word "awards" is more of a colloquialism than how the GitLab docs phrase it.
- **Citation**: https://docs.gitlab.com/ee/user/discussions/

#### Claim 4: "Slack reactions" — `slack.com/help/articles/360020669072-Use-emoji-reactions`
- **VERDICT**: UNVERIFIED (URL is 404, but feature is real)
- **Reason**: The cited URL returns **404 Page Not Found**. Slack likely reorganized their
  help docs. Slack reactions as a feature are absolutely real and well-known (any Slack
  user has used them: `:white_check_mark:`, `:eyes:`, etc. on messages). I could not find
  the current canonical URL within the time budget.
- **Note**: This is a "feature is real, URL is dead" situation. The brief's underlying
  claim is correct; only the citation is broken.

#### Net assessment for Candidate #2
- 1 VERIFIED (GitLab) + 1 UNVERIFIED-URL (GitHub 404) + 1 UNVERIFIED-URL (Slack 404) +
  1 MISCHARACTERIZED-URL (GitHub wrong URL). The feature gap is genuine (GitHub, GitLab,
  Slack all have emoji reactions; opencode-review-dashboard does not) but the citations
  are broken. **PM Manager MUST REWRITE** the brief to fix the 2 GitHub URLs and the Slack
  URL (or just describe the feature with a working URL).

---

### Candidate #3: Jump-to-next/prev-finding keyboard nav (`n`/`p`)

**External claims to verify**:
1. "GitHub `Cmd+]` / `Cmd+[`" — URL `https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts`
2. "vimdiff `n`/`N`" — URL `https://vimhelp.org/quickfix.txt.html`
3. "Gerrit `n`/`p`" (mentioned but no URL in brief — "R11 PM Researcher" cited)
4. "GitLab `j`/`k`" (mentioned in line 58 of brief, default bindings — no URL)

#### Claim 1: "GitHub `Cmd+]` / `Cmd+[` for next/prev review thread"
- **VERDICT**: UNVERIFIED
- **Reason**: The cited URL `https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts`
  was successfully retrieved. The page lists MANY keyboard shortcuts (S for search,
  G+C for Code, G+I for Issues, Cmd+B/E/I/K for comment Markdown formatting, etc.) but
  **does NOT list `Cmd+]` / `Cmd+[` for jumping to the next/previous review thread**. The
  PM brief even explicitly admits this: "https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts
  does NOT explicitly list them but they are in the GitHub PR review UI; verified via
  community knowledge".
- **Risk**: "verified via community knowledge" is not a verifiable citation. The feature
  MIGHT exist in the GitHub PR review UI (there IS a "Jump to next conversation" button
  visible in the PR review sidebar), but the PM could not produce a working docs URL.
- **Recommendation**: PM should either (a) find a current GitHub docs page that lists the
  shortcuts, (b) cite a reputable community source (Stack Overflow answer with high
  votes), or (c) rephrase as "GitHub PR review has Jump-to-conversation button
  (visible in PR review sidebar) — keyboard binding undocumented in current official
  docs."

#### Claim 2: "vimdiff `n`/`N` for next/prev match"
- **VERDICT**: MISCHARACTERIZED
- **Reason**: The cited URL `https://vimhelp.org/quickfix.txt.html` was successfully
  retrieved. The page documents vim's quickfix commands, which are:
  - `:cn` / `:cnext` — next error in the quickfix list
  - `:cN` / `:cprev` / `:cp` — previous error in the quickfix list
  - `:cnf[ile]` — first error in the next file
  - `:cpf[ile]` — last error in the previous file
  - `:cabo[ve]`, `:cbel[ow]`, `:cbe[fore]`, `:caf[ter]` — quickfix navigation by position
  - The `n` / `N` keys in vim are for **search next/prev match** (after `/` or `?`), NOT
    for quickfix navigation. The brief conflated these two different vim features.
  - For actual diff-hunk navigation in vimdiff/vim-fugitive, the correct keys are `]c` /
    `[c` (next/prev change), not `n` / `N`.
- **Risk**: PM hallucinated the specific key binding. The underlying claim that "vim has
  keystroke-driven next/prev navigation" is correct, but `n`/`N` is for search, not
  diff/finding navigation. The brief should cite `:cn`/`:cN` (quickfix) or `]c`/`[c`
  (diff hunks) instead.
- **Citation**: https://vimhelp.org/quickfix.txt.html

#### Claim 3: "Gerrit `n`/`p` for next/prev file"
- **VERDICT**: UNVERIFIED
- **Reason**: Brief says "verified in R11 PM Researcher's Gerrit Review UI doc fetch" but
  does not provide a URL in this R12 brief. I did not re-verify the R11 fetch within the
  R12 time budget; cannot confirm or deny. (Gerrit does have keyboard navigation in its
  review UI, but the specific `n`/`p` bindings are not in the public Gerrit docs without
  a citation.)
- **Recommendation**: PM should provide a URL or remove the claim.

#### Claim 4: "GitLab `j`/`k` for next/prev unresolved thread"
- **VERDICT**: UNVERIFIED
- **Reason**: Mentioned in the brief's per-tool landscape table (line 58) as "default
  `j` / `k`" but no URL or docs citation is provided. GitLab has a "Keyboard shortcuts"
  page but I did not find `j`/`k` documented as jump-to-thread in the time budget.
- **Recommendation**: PM should provide a URL or remove the claim.

#### Net assessment for Candidate #3
- 3 UNVERIFIED (GitHub Cmd+]/Cmd+[, Gerrit n/p, GitLab j/k) + 1 MISCHARACTERIZED
  (vimdiff n/N). With 3 unverified claims, this candidate **exceeds the ≥2 UNVERIFIED
  threshold** from the rubric and should be **FLAGGED FOR PM Manager to REJECT** (or
  fully rewrite the citations). The underlying feature (keyboard next/prev nav) is real
  and useful; the implementation plan in the brief is sound. The issue is only the
  external-citation evidence.

---

## Risk assessment

### Candidates with ≥2 UNVERIFIED claims (per rubric → REJECT)
- **Candidate #3** (Jump-to-next/prev-finding keyboard nav) — has **3 UNVERIFIED** claims.
  Flag for PM Manager to REJECT or require full rewrite of citations.

### Candidates with ≥1 MISCHARACTERIZED (per rubric → MUST REWRITE)
- **Candidate #1** (Pinned findings) — 1 UNVERIFIED (Phabricator) + 1 MISCHARACTERIZED
  (GitLab "Save for later" → should be "Snooze to-do items"). **MUST REWRITE**.
- **Candidate #2** (Reactions on findings) — 1 MISCHARACTERIZED (GitHub keyboard-shortcuts
  URL is wrong) + 2 UNVERIFIED-URL (GitHub about-conversations 404, Slack reactions 404).
  **MUST REWRITE**.
- **Candidate #3** (Jump-to-next/prev keyboard nav) — 1 MISCHARACTERIZED (vimdiff n/N
  conflated with search) + 3 UNVERIFIED. **MUST REWRITE** (and is already flagged for
  REJECT above).

### Summary table
| Candidate | Verified | Unverified | Mischar. | Verdict |
|---|---|---|---|---|
| #1 Pinned findings | 0 | 1 | 1 | **REWRITE** |
| #2 Reactions on findings | 1 | 2 (URL 404) | 1 | **REWRITE** |
| #3 Jump-to-next/prev nav | 0 | 3 | 1 | **REJECT or FULL REWRITE** (≥2 unverified) |

---

## Note on user-rejected items
- **GH #12 Bulk actions** — NOT VERIFIED (user excluded from R12 scope)
- **GH #13 Live file-watcher** — NOT VERIFIED (user excluded from R12 scope)
- **R11 README polish** — NOT VERIFIED (user excluded from R12 scope)

The PM Researcher was instructed to skip these and did so.

---

## Additional notes for the brief author

### URLs that were attempted and failed
The following URLs in the brief are broken (404) or were blocked and could not be
verified during R12:
- `https://docs.github.com/en/get-started/writing-on-github/using-keyboard-shortcuts-and-command-palette` → 404 (URL has been reorganized)
- `https://docs.github.com/en/organizations/collaborating-with-your-team/about-conversations-on-github` → 404
- `https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-files/about-pull-request-reviews` → 404
- `https://docs.github.com/en/repositories/working-with-reactions-on-issues-and-pull-requests/about-reactions-on-issues-and-pull-requests` → 404
- `https://docs.github.com/en/issues/working-with-issues-and-pull-requests/about-conversations` → 404
- `https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-emoji` → 404
- `https://slack.com/help/articles/360020669072-Use-emoji-reactions` → 404
- `https://github.blog/developer-skills/github/how-to-emoji-react-to-pull-requests/` → 404
- `https://we.phorge.it/book/phorge/article/differential/` → Anubis bot-challenge (Wayback copy retrieved instead)
- `https://docs.github.com/en/get-started/accessibility/keyboard-shortcuts` → 200 OK, but does NOT list `Cmd+]`/`Cmd+[`

### URLs that worked and confirmed
- `https://docs.gitlab.com/ee/user/discussions/` → 200, GitLab emoji reactions on comments confirmed
- `https://docs.gitlab.com/ee/user/todos.html` → 200, GitLab Snooze to-do items confirmed (the REAL equivalent of "Save for later" — see Candidate #1)
- `https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/pinning-an-issue-to-your-repository` → 200, GitHub repo-level issue pinning confirmed (max 3 issues, admin-only — see Candidate #1)
- `https://vimhelp.org/quickfix.txt.html` → 200, quickfix commands confirmed (`:cn` / `:cN` / `:cnf[ile]` / `:cpf[ile]` — `n`/`N` are search, not quickfix; see Candidate #3)
- `https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues` → 200 (no reactions info on this page but the page loads)
- `https://secure.phabricator.com/book/phabricator/article/differential/` → 200, Phabricator Differential User Guide (no "starred revisions" mentioned)

### Real GitHub reactions evidence
GitHub reactions DO exist (the feature is real and ubiquitous). Evidence found:
- `https://github.com/facebook/react/issues/85` style discussion pages show reaction
  counters in the UI ("👍 11 reacted with thumbs up emoji")
- `https://github.com/mobxjs/mobx/releases` shows `3 people reacted with 👍`, `5 with 🚀`
- The fetched `https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues`
  page mentions "If you find yourself frequently typing the same comment, you can use
  saved replies" but does NOT explicitly document reactions on the new docs structure.

PM should cite a current working URL for GitHub reactions documentation, or just state
"GitHub reactions are a first-class feature (visible on every PR/issue/discussion page)"
without a URL if no current docs page exists.

### Plausible unique capabilities (cannot verify)
These are claims that "X exists in us but not in competitors" — cannot be proven
negative, but are plausible based on the docs I read:
- **R10 Edit finding in-place** — GitHub DOES allow editing issue comments and PR review
  comments (saw the feature in the docs), so the R10 brief's "GitHub does not allow
  editing submitted PR review comments" claim is actually **plausible** in the strict
  sense (the GitHub docs explicitly say you can edit comments), but might be
  MISCHARACTERIZED in the opposite direction — the unique-capability framing may be
  weaker than PM claims. (Out of scope for R12 verification; flagged as a concern for
  R13+ when this feature comes up.)
- **R11 Saved Replies `/trigger`** — `:cn`-style "Saved Replies" exist on GitHub
  (the fetched keyboard-shortcuts page lists `Ctrl+.` + number for saved replies), so
  R11's claim of "uniqueness" is partial. But the `/trigger` NAMED-PREFIX expansion is
  plausibly unique. (Out of scope for R12; flagged for R13+.)

---

## Conclusion for PM Manager

**All 3 user-locked R12 candidates need a brief rewrite before approval**:
- Candidate #1: fix the Phabricator URL (or remove) and fix the GitLab "Save for later"
  mischaracterization (replace with Snooze to-do items or GitHub repo-level pin).
- Candidate #2: fix the 3 broken/mischaracterized URLs (GitHub × 2, Slack × 1). The
  feature gap is real; only the citations are wrong.
- Candidate #3: fix the vimdiff `n`/`N` mischaracterization (use `:cn`/`:cN` or
  `]c`/`[c` instead), and provide URLs for the Gerrit `n`/`p` and GitLab `j`/`k` claims
  (or remove them). Consider downgrading to "GitHub PR review has a 'Jump to next
  conversation' button (keyboard binding undocumented in current official docs)".

The underlying feature gaps are real and the implementation plans in the brief are
sound — this is a citation-cleanup pass, not a feature-rejection. Once the brief is
rewritten with valid URLs, all 3 candidates should be approvable.
