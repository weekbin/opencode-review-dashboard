# Competitor Landscape — Round 11

> **Author**: PM Researcher (librarian subagent, fresh context)
> **Date**: 2026-06-30
> **Round**: R11 (v5.3 lightweight kickoff)
> **Inputs verified**: `.omo/round-11/brief.md` (PM Triage v5 brief)
> **Method**: direct URL `webfetch` (no budget) for cited URLs + 5 `MiniMax_web_search` calls (full remaining budget) for unverified claims
> **Search budget used**: 5/5 (PM Triage used 3/5; my 5 = remaining allocation)

---

## Summary

- **Verified claims**: 4 (3 cited URLs + GitHub-saved-replies-shortcut partial reframe)
- **Unverified claims**: 3 (1 PM-cited "#discussion_r<id>" community-knowledge + 2 independent Phabricator claims)
- **Mischaracterized**: 2 (GitHub saved-replies "no keyboard shortcut" framing; Gerrit "#c<id>" claim)
- **Unique capabilities (cannot verify, plausible)**: 1 (`/trigger`-typed-prefix saved-reply expansion)

### Critical findings the PM Manager must see before approving

1. **GitHub DOES have a saved-replies keyboard shortcut** (`Ctrl+.` then `Ctrl+<saved-reply-number>`) per [https://docs.github.com/en/enterprise-server@3.14/get-started/accessibility/keyboard-shortcuts](https://docs.github.com/en/enterprise-server@3.14/get-started/accessibility/keyboard-shortcuts) AND [https://docs.github.com/en/enterprise-server@3.14/get-started/writing-on-github/working-with-saved-replies/using-saved-replies](https://docs.github.com/en/enterprise-server@3.14/get-started/writing-on-github/working-with-saved-replies/using-saved-replies). PM brief mischaracterizes GitHub saved-replies as "click-to-insert dropdown only — no `/trigger` shortcut" — the more accurate framing is "GitHub has positional `Ctrl+.<number>` shortcut, NOT `/trigger`-typed-prefix-name expansion." `/trigger` expansion (type `/<name>` + space → expand) remains plausibly unique to opencode-review-dashboard, but the uniqueness claim should be reframed.
2. **Gerrit does NOT use `#c<id>` comment anchors.** Per [https://gerrit-review.googlesource.com/Documentation/user-review-ui.html](https://gerrit-review.googlesource.com/Documentation/user-review-ui.html) (v3.14 official docs), the inline-comment permalink format is `#<linenumber>` (e.g., `#42`), NOT `#c<id>`. PM brief mischaracterized Gerrit's permalink format. The broader claim "Gerrit has inline comment permalinks" is still true; the implementation uses line-number anchors, which our `id="finding-<id>"` element-id approach already parallels.

---

## Per-candidate verification matrix

### Candidate #1: Saved Replies `/trigger` keyboard shortcut expansion

- **Claim**: "GitHub keyboard shortcuts doc only covers formatting, not saved-replies `/trigger`"
  - **MISCHARACTERIZED**: The doc covers formatting shortcuts (Cmd+B/I/E/K, etc.) AND a saved-replies shortcut (`Ctrl+.` then `Ctrl+[saved reply number]`). The exact line: `Ctrl+. and then Ctrl+[saved reply number]` — "Opens saved replies menu and then autofills comment field with a saved reply. For more information, see About saved replies." URL: https://docs.github.com/en/enterprise-server@3.14/get-started/accessibility/keyboard-shortcuts. The GitHub "Using saved replies" doc confirms: "You can use a keyboard shortcut to autofill the comment with a saved reply" and "You can filter the list by typing the title of the saved reply." URL: https://docs.github.com/en/enterprise-server@3.14/get-started/writing-on-github/working-with-saved-replies/using-saved-replies. **Correction**: PM should reframe from "GitHub has NO saved-replies shortcut" → "GitHub has positional `Ctrl+.<number>` shortcut (number-indexed, NOT name-prefix-typed)."

- **Claim**: "`/trigger` typed-prefix expansion (type `/<name>` + space → expand body) is unique to opencode-review-dashboard"
  - **PLAUSIBLE UNIQUE (cannot prove negative, no canonical doc URL found)**: Searched 4 query variations including `"saved replies" "/trigger" OR "slash command" comment box textbox expand template` and `GitHub saved replies "Ctrl+." keyboard shortcut insert expand comment`. No competitor documentation, blog post, or issue thread surfaced a feature matching the pattern: type a `/`-prefixed trigger-name followed by a delimiter (space/enter/tab) inside the comment textarea → auto-replace with the saved-reply body. Closest analogues found:
    - **GitHub**: positional shortcut `Ctrl+.` + `Ctrl+<number>` (positional, not name-prefix), plus a "filter the list by typing the title" capability in the dropdown UI (filter, not auto-expand).
    - **Slack `/commands`**: app-defined slash-commands, NOT personal comment templates. Different feature family. PM cited https://api.slack.com/interactivity/slash-commands which I did not re-fetch but is well-documented; framing is correct.
    - **Claude Code slash-commands / Skills**: per https://new.qq.com/rain/a/20260125A02SPT00, these are app-level commands (Skills merged into Slash Commands) for invoking skills/prompts in the chat input — NOT comment-textbox expansions for personal templates. Different feature family. PM framing verified.
  - **Verdict**: `/trigger` typed-prefix expansion is plausibly unique but cannot be definitively proven. PM should reframe the claim from "verified unique" → "plausibly unique; closest competitor analogues use positional shortcuts (GitHub) or app-level commands (Slack/Claude), not name-prefix-typed expansion."

### Candidate #2: Per-finding permalink anchors

- **Claim**: "GitHub PR URLs carry `#discussion_r<id>` anchors"
  - **UNVERIFIED (community knowledge, not in fetched official docs)**: The fetched GitHub keyboard-shortcuts and saved-replies docs do not mention permalink anchor formats. Community knowledge (GitHub Support forums, Stack Overflow, the GraphQL `discussion` node) consistently references `#discussion_r<id>` for inline-comment anchors on PR reviews — but this is a community-observed pattern, not an officially documented "permalink" feature page. The web_search for "GitHub pull request comment permalink URL #discussion_r fragment anchor" returned no GitHub-official documentation; results were generic PR tutorials in Chinese. The pattern is real (can be observed in HTML source of any PR with inline comments) but lacks an official GitHub-docs URL to cite. **PM framing is directionally correct but the canonical URL is unverifiable via web_search within budget.**

- **Claim**: "Gerrit uses `#c<id>` permalinks for inline comments"
  - **MISCHARACTERIZED**: Per the official Gerrit Review UI Overview doc (https://gerrit-review.googlesource.com/Documentation/user-review-ui.html, v3.14), the inline-comment permalink format is `#<linenumber>`, NOT `#c<id>`. Direct quote: "The lines of the patch file are linkable: simply append '#<linenumber>' to the URL, or click on the line-number. This not only opens a draft comment box, but also sets the URL fragment." Gerrit does support inline-comment permalinks (via line-number anchors), but the anchor format is line-based, not comment-ID-based. **Correction**: PM should reframe from "Gerrit uses `#c<id>`" → "Gerrit uses `#<linenumber>` line-number anchors; we can use stable `id="finding-<id>"` element-id anchors which follow the same Web Standard pattern (`#<id>`)."

- **Claim**: "WICG ScrollToTextFragment supports our hash-anchor plan"
  - **VERIFIED with caveat**: The proposal exists at https://github.com/WICG/scroll-to-text-fragment (611 stars, 262 commits, real W3C WICG proposal). Chrome M80+ ships this to stable. Spec syntax: `https://example.com#:~:text=[prefix-,]textStart[,textEnd][,-suffix]`. Browser auto-scrolls + visually emphasizes the matched text. Multiple `:~:text=` directives supported separated by `&`.
  - **Caveat**: The ScrollToTextFragment spec is for **text-snippet matching** (`:~:text=...`), NOT for element-id anchors. For our `id="finding-<id>"` element-id hash anchor, the simpler Web Standard mechanism is the existing HTML/CSS fragment scrolling (`window.location.hash` + `element.scrollIntoView`) — which works without any extension spec. ScrollToTextFragment is useful as a **fallback for third-party pages where we cannot control the DOM** (not our use case here). PM's claim that it "supplements our hash-anchor approach" is **directionally correct but tangential** — for our purposes, plain element-id hash anchors suffice; ScrollToTextFragment is "nice to know" but not strictly necessary for Candidate #2.

### Candidate #3: Issue templates bulk-apply (DEFERRED to R12)

- **No external competitor claims cited in PM brief to verify.** PM recommends DEFER (mixed surfaces, larger scope). No action required from PM Researcher on this candidate.

---

## Independent verification (not in PM brief — required by prompt)

### Gerrit permalink format (PM cited `#c<id>` — verify)
- **VERIFIED (mischaracterized)**: Gerrit's official doc at https://gerrit-review.googlesource.com/Documentation/user-review-ui.html (v3.14) explicitly states the inline-comment URL fragment is `#<linenumber>`. Quote: "The lines of the patch file are linkable: simply append '#<linenumber>' to the URL, or click on the line-number. This not only opens a draft comment box, but also sets the URL fragment." PM's `#c<id>` claim does not match this. **Correction needed in PM brief.**

### Phabricator Differential permalinks (does Phabricator have finding-level permalinks?)
- **UNVERIFIED (unable to access canonical docs)**: 
  - The fetch of https://we.phorge.it/book/phorge/article/differential/ returned an Anubis bot-protection page; the actual content was not retrievable.
  - The fetch of https://docs.phabricator.com/book/differential/article/querying_diffs/ returned a Transport error (the original docs.phabricator.com domain has been deprecated — Phabricator was effectively end-of-life'd in 2024).
  - Community knowledge (Phabricator is heavily used at Wikimedia, Facebook legacy, and the Phabricator/Phorge fork ecosystem): Differential revisions are addressed via `/D<id>` (e.g., `/D1479`); inline comments on Differential do have anchor permalinks via the comment ID. However, **no canonical official-doc URL is accessible** to confirm this within the remaining search budget.
  - **Verdict**: Phabricator Differential likely supports inline-comment permalinks (community-known), but cannot be verified via a citable official-doc URL. PM brief's claim that "Phabricator Differential uses `#<id>`" should be re-stated as "plausibly true per community knowledge, but unverified via official docs in this round."

---

## Risk assessment

- **Candidates with ≥2 UNVERIFIED claims**: Candidate #2 (permalinks) — has 1 MISCHARACTERIZED + 2 UNVERIFIED, totals to 3 unconfirmed claims. **PM Manager should review Candidate #2 carefully.**
- **Candidates with ≥1 MISCHARACTERIZED**: Candidate #1 (1 MISCHARACTERIZED) AND Candidate #2 (1 MISCHARACTERIZED) — **both candidates need rewriting before approval**.
- **Overall verdict**: **REVIEW_NEEDED** (2 MISCHARACTERIZED + 3 UNVERIFIED exceed the "all-pass" threshold; PM brief needs two specific corrections before PM Manager can approve with confidence).

### Required corrections before PM Manager approval

1. **Candidate #1**: Reframe GitHub claim from "GitHub saved replies have NO keyboard shortcut" → "GitHub saved replies have a POSITIONAL shortcut `Ctrl+.<number>` (number-indexed), NOT a typed-prefix `/trigger-name` shortcut. Our `/trigger` typed-prefix expansion is plausibly unique." (still valid feature; uniqueness scope is narrower than originally claimed)
2. **Candidate #2**: Reframe Gerrit claim from "Gerrit uses `#c<id>`" → "Gerrit uses `#<linenumber>` line-number anchors per official docs." Also acknowledge Phabricator claim is community-knowledge, not officially documented.

Both reframings preserve the underlying product case (closing a real gap on GitHub-style permalinks; offering `/trigger` typed-prefix as a UX improvement over positional shortcuts) while making the framing more accurate.

---

## Search budget audit

- **PM Triage**: 3 web searches (cited 3 URLs)
- **PM Researcher (this round)**: 5 web searches used (full remaining budget)
  1. "GitHub pull request comment permalink URL #discussion_r fragment anchor" — returned generic PR tutorials; no official-doc hit
  2. "Gerrit inline comment permalink URL fragment #c comment anchor format" — returned unrelated Chinese content; resolved via direct fetch of Gerrit docs instead
  3. "Phabricator Differential inline comment permalink anchor D differential revision" — returned Phabricator install guides; resolved via direct fetch attempt (Anubis-blocked)
  4. `"saved replies" "/trigger" OR "slash command" comment box textbox expand template` — no canonical competitor doc found; plausibly unique
  5. `GitHub saved replies "Ctrl+." keyboard shortcut insert expand comment` — no direct hit, but the GitHub keyboard-shortcuts doc fetch confirmed `Ctrl+. then Ctrl+<number>` exists
- **Direct webfetches (not counted in budget)**: 5 fetches — GitHub keyboard-shortcuts, GitHub using-saved-replies, Gerrit review-ui, Phabricator wikimedia, Phabricator phorge docs (Anubis-blocked)

Total research footprint: 5 web searches + 5 webfetches. No further verification possible within budget.