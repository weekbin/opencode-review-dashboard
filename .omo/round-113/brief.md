# R113 Brief

## Scope (3 features + 1 polish)

1. **#77** content-hash auto-resolve — Extend `close_reason` union with `"content_match"`. Add `fnv1a`/`contentMatches` helpers. When agent commits and the finding's anchor context (before + selected + after) still matches previous round content exactly, mark finding `closed_auto` with `close_reason: "content_match"` instead of leaking it to next round. ~80 LOC + 1 server-side union extension.
2. **#78** submit footprint preview — Opt-in (settings flag default off per issue risk): submit modal shows estimated counts (open findings, affected files, primary categories) computed from current pending findings. Uses local heuristic, no external call. ~100 LOC + 2 i18n keys + 1 settings toggle.
3. **#84 Layer 1** fresh-draft delete polish — Confirm modal before splice (R112 left unguarded), rename label `action.remove` → `action.deleteDraft`. Layer 2 server-side delete of persisted findings is out-of-scope (R114). ~30 LOC + 4 i18n keys + 1 helper function.

Total ≤ 250 LOC, ≤ 6 files (cap ≤10 for feature). Hard cap: 3 features + 1 polish = 4 ≤ 8. Lead-direct 100%.

## Why

3 R113-tagged GH issues (#77 #78 #84) carry directly into the round-113 label bucket. All carry substantive value:
- #77 closes the "did agent fix my finding" loop without user intervention (plausible-unique — only AI-CR with content-match does this)
- #78 builds trust in the agent submit flow before promise (no token waste on user startle-then-cancel)
- #84 closes a clear R112 carry-over gap (delete confirm + clearer label)

## Risk

- **#77** hash collision: FNV-1a with `\u0000`-delimited concatenation may yield identical hashes for topically similar code; exit condition: false-positive resolve <2% (graceful → revert to manual)
- **#78** incorrect estimate readability: mitigated by default OFF + warning copy in settings ("estimates may mislead if read as exact predictions")
- **#84** confirm modal disrupts auto-save: confirm modal does not mutate state until user clicks Confirm; scheduleSave fires only after confirm

## Acceptance

- S1 (#77): When prior round finding's anchor.selected + before + after all exactly match the new finding's, mark status=closed_auto, close_reason="content_match"; bun test src/r113-content-hash.test.ts GREEN
- S2 (#78): When settings.submitFootprint=true and pending findings exist, submit modal renders `<div class="submit-footprint">` BEFORE finding-count; bun test src/ui/r113-submit-footprint.test.ts GREEN
- S3 (#84 Layer 1): When user clicks "Delete draft" button, confirm modal opens with title "Delete this draft finding?" + Cancel/Delete buttons; on Delete OK, state.fresh.filter splices the entry as before; bun test src/ui/r113-draft-delete-polish.test.ts GREEN

Verify: pre-commit 8/8 PASS, commit + push, decision.md "SHIP".
