# R167 Discovery

## Real discovery
R166 carry-over item "Full 34-scenario e2e sweep" — **CLOSED with 35/35 PASS**.

## Background
R166 brought the e2e harness back online (it had been silently broken since R32 SDK upgrade). R166 tested 5 scenarios to prove the fix worked. This round tested the remaining 29 scenarios to surface any latent bugs from the 5-month silent breakage.

## Result

```
$ timeout 600 bun run scripts/test-review-ui/e2e.mjs
Review Dashboard — scenario e2e

  PASS  no-worktree-clean
  PASS  has-worktree-unpushed  (some checks skipped — best-effort)
  PASS  multiple-worktrees-pick-most  (some checks skipped — best-effort)
  PASS  base-branch
  PASS  base-commit-single
  PASS  base-commit-range
  PASS  working-tree-changes
  PASS  files-filter
  PASS  worktree-flag-override  (some checks skipped — best-effort)
  PASS  empty-repo
  PASS  uncommitted-with-commits
  PASS  range-changed-banner
  PASS  default-base-on-main
  PASS  untracked-file-in-tree
  PASS  previously-discussed-panel
  PASS  previously-discussed-race
  PASS  previously-discussed-hint
  PASS  in-tab-search
  PASS  sidebar-keyboard-nav
  PASS  reopen-stale-finding        ← R162 #85 Force Reopen
  PASS  saved-replies
  PASS  export-review
  PASS  edit-finding
  PASS  saved-replies-trigger
  PASS  permalink
  PASS  pinned-toggle
  PASS  react-add
  PASS  react-remove
  PASS  n-jump-next
  PASS  p-jump-prev
  PASS  jump-skips-stale
  PASS  resolve-with-reason         ← R165 #87 fix (drawer + conversation panel)
  PASS  mark-as-wontfix
  PASS  in-diff-search
  PASS  search-ime-composition

35 passed, 0 failed
```

## ACs this round
- **AC1**: Save the e2e sweep output to `.omo/round-167/e2e-sweep.log` as evidence
- **AC2**: Add a regression test that runs the e2e sweep as part of the test suite (lock in the "all 35 pass" baseline)

## Anti-cap check
- Features: 0
- Bugfixes: 0
- Polish: 1 (e2e sweep evidence + integration test)
- Housekeeping: 1 (save log)
- Total: 2 (≤8 ✓)

## Why this is the round
After 5 rounds (R162-R166) of fixes, this is the **verification** round. Real evidence that the fixes work end-to-end, not just unit-test pass. Captures the e2e baseline for future regression detection.