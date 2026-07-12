# R146 Retro — localize `<option value="all">` (filter-previously-by-round dropdown default)

## What worked

Lead-direct polish round across 2 src files modified (`app.ts`, `review.html`) + 1 new test + 1 behavior-contract test upgrade + 1 housekeeping append. Closes the last remaining review.html hardcoded English string that R145 missed (R145's audit grep returned a false positive on the L3665 option because the grep pattern `>[A-Z][a-z]+( [a-z]+){1,}` doesn't easily distinguish "raw user-visible text" from "text inside an attribute-annotated element").

Audit caught what R145 missed:

- L3385 `>All changes saved</span` — false positive (`data-i18n="save.idle"` already on L3384)
- L3665 `<option value="all">All rounds</option>` — **real** (no data-i18n attr)
- L3719 `placeholder="What should change and why?"` — false positive (R145's textarea, raw placeholder kept as fallback)
- L3782 `>Diff virtualization</label` — false positive (`data-i18n="settings.virtualization.label"` already on L3781)

After filtering: **only 1 real hardcoded English** remained. The existing `previously.allRounds` i18n key at L503 was already defined (en="All rounds" / zh-CN="所有轮次") — no new key needed. R146 is the smallest legitimate polish round of the entire R140-R146 streak: 1 attr swap + 1 translator call + 1 test file.

Pre-commit ran clean after applying the same T14.25.1 byte-equivalence → behavior-contract upgrade pattern as R145 did for T14.23.7. The R137→R142 SOP now has 6 documented upgrades (T11.2d, T16.8d, T16.10a, T10.1c, T14.23.7, T14.25.1) — could be future-mechanized into a pre-commit helper.

Per-SHIP append discipline preserved (R145 entry appended retroactively from R145's commit, R146 entry appended in this commit). All 5 v6 hard gates PASS.

## What didn't

- **R146's initial audit was 4 matches (3 false positives + 1 real)**. The audit grep `>[A-Z][a-z]+( [a-z]+){1,}` matched the raw user-visible text inside elements that were already annotated with `data-i18n` attrs on prior lines (multi-line element shape). Required manual inspection of each match to filter false positives. Lesson: grep audit needs a follow-up "is the data-i18n attr already present on the same element?" check.
- **Initial R146 brief assumed 1 new i18n key** (`previously.filter.allRounds`). Discovery mid-round caught the existing key (`previously.allRounds`) was already defined. Brief updated mid-implementation. Lesson: do a key-existence check before declaring "new key needed".

## Carry-over list (≤3 items)

None — R146 closes the last review.html i18n gap. No new loop-internal flags.

## Closed in this round (loop-internal)

- **Last review.html hardcoded English string**: `<option value="all">All rounds</option>` — **closed**.
- **T14.25.1 byte-equivalence test**: upgraded to behavior-contract per R137→R142 SOP. **Closed**.

## Open loop-internal at retro time

loop-internal open: none

## Self-Improvement Observations

- **Grep audit returns 4 matches; 3 are false positives**. The audit pattern `>[A-Z][a-z]+( [a-z]+){1,}` is a "find raw user-visible text" grep. It cannot tell whether the text is inside a `data-i18n`-annotated element or a bare element. Manual inspection required. Future audits: combine the grep with a `grep -B5` to show the prior 5 lines, then visually verify the `data-i18n="..."` attribute is NOT present in the same element.
- **Key-existence check before declaring "new key needed"**. The existing `previously.allRounds` key at L503 was already in i18n.ts. R146 only added the `data-i18n` attr + translator registration. Saved 1 new key + 2 locale strings.
- **R137→R142 byte-equivalence SOP is now 6 occurrences**: T11.2d (R139), T16.8d (R139), T16.10a (R139), T10.1c (R141), T14.23.7 (R145), T14.25.1 (R146). The pattern is consistent: replace byte-equivalence with behavior-contract (assert i18n attr + structural marker, not exact markup). Future polish rounds adding `data-i18n` attrs should preemptively check for byte-equivalence assertions on the same element shape.
- **Polish round mini-streak**: R140-R146 = 7 consecutive polish rounds. The i18n sweep is now exhaustive across both `app.ts` and `review.html`. No remaining hardcoded English in the static-HTML surface. Hard to find another tight polish candidate without expanding scope (refactor or housekeeping).
- **Per-SHIP proposals.jsonl append discipline held for 11 rounds** (R134 retro caught the gap; R135–R146 all restored).

## Risks Surfaced (not actioned this round)

- **`fallbackCopy` deprecated `document.execCommand("copy")`** (R142-R145 retro #1, real behavior change). 7 rounds shelved. Future housekeeping.
- **`formatRelativeTime > 1 year`** (R142-R145 retro, preventive only).
- **3 server-side i18n-coupling system markers** (R142-R145 retro #3): invasive, changes agent→state.json→agent contract.

## v6 Compliance

- Hard caps: **0 features** (≤3) + **0 bugfixes** (≤5) + **1 polish** (≤1) = **1 total** (≤8). PASS.
- 0 open-loop-internal at retro. PASS.
- Pre-commit 8/8 PASS.
- Discovery sweep ran and passed.
- 0 subagents used (lead-direct).
- R132.1 visual-QA gap rule honored — no background visual-QA subagents fired.
- AC1.2 registerUITranslator invariant honored — 1 paired translator call.

## Round Profile

- Polish: 1 (localize 1 review.html option + 1 translator registration + 1 test upgrade)
- Total: 1
- Subagents: 0
- Time: ~8 min wall-clock.