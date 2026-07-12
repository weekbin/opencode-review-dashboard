# R140 Retro — tighten i18n fallbacks + adopt `data-i18n-title` for copyNotesBtn

## What worked

Lead-direct polish round across 2 src files modified (`app.ts`, `i18n.ts`) + 1 new test + 1 housekeeping append. Closes the last R137 retro stale flag (copyNotesBtn could leverage R133's `data-i18n-title` auto-discovery) + 4 user-visible English fallbacks that stayed hardcoded after R135's localization pass.

The realization of how the copyNotesBtn swap works is the interesting bit: R133 built the `applyUITranslator` infrastructure that walks `[data-i18n-title="${ecap}"]` and the `initUIDataI18nAttributes()` boot hook with MutationObserver. R137 still wrote `copyNotesBtn.title = t(...)` — a direct lookup that's correct on initial render but doesn't re-translate if the language changes while the modal is open. Swapping to `setAttribute("data-i18n-title", key)` plugs into R133's existing MutationObserver for free.

For the 4 fallback messages (`(no reason provided)` + 3 `Failed to X` strings), `t()` direct lookup is the right shape — they're rendered once at the point of error/resolve, so attribute auto-discovery is overkill. Each becomes a one-line wrap.

Pre-commit 8/8 PASS. All 4 R140 contract tests red→green. Project suite 1075/1075. R103 invariant holds for all new keys (no emoji-only role labels, per R135 retro #1 lesson). Per-SHIP append discipline preserved (R139 entry appended).

## What didn't

- Nothing went wrong. The 4 `t()` wraps and the 1 attribute swap are mechanical, the i18n keys are localizable in both languages, and the test assertions are concrete.

## Carry-over list (≤3 items)

None — R140 closes the last R137 retro flag. No new loop-internal flags.

## Closed in this round (loop-internal)

- **R137 retro stale flag #4**: copyNotesBtn could leverage data-i18n-title — **closed**. Adopted R133's auto-discovery pattern.
- **R135 retrosurface #1** (implicit, from R135 retro's reference to "the hardcoded English in error paths" — R140 closed 3 of them): 4 English fallback strings — **closed** (resolve.reason.empty, status.pinFailed, status.unpinFailed, status.reactionFailed).

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **`data-i18n-title` is for live-translating attributes, `t()` is for one-shot fallbacks.** R140 demonstrates the distinction cleanly. Use data-i18n-title when the element persists across language switches (buttons in lists, drawer labels); use t() when the element is rendered once at the point of an event (error messages, resolve reason).
- **Retro-internal flag surfacing works.** R137 retro said "could leverage data-i18n-title" — 3 rounds later R140 picks it up and ships it. The loop's "Risks Surfaced, not actioned this round" section is doing its job.
- **`data-i18n-title` translates button titles across language switches even after the panel re-renders.** The MutationObserver re-fires on every DOM mutation, so any new copyNotesBtn instances get the right language on creation. R133 paid this forward; R140 collected the dividend.

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` itself uses `document.execCommand("copy")`** which is deprecated (R139 retro #1). Modern browsers may eventually remove it. Future housekeeping round would require real behavior change (different error semantics). Out of R140 scope.
- **The error-fallback pattern `setStatus(data?.error ?? t("status.X"), true)`** is now translated but the visible error semantics are still status-based. If status strip has a height limit, the user might miss the message. Future polish could route these toasts instead. Out of R140 scope.
- **Worktree audit for more byte-equivalence tests** (R139 retro #4). Cheap future housekeeping round. Out of R140 scope.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **1 polish** (≤1) = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.
- R103 i18n coverage invariant honored — `en !== zh-CN` for all new keys (none are emoji-only role labels).

## Round Profile

- Polish: 1 (tighten i18n fallbacks + adopt data-i18n-title)
- Total: 1
- Subagents: 0
- Time: ~10 min wall-clock.