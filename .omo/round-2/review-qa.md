# QA / Hands-on Verification — Round 2

## Test gate results

| Gate | Command | Result |
|---|---|---|
| format:check | `bun run format:check` | pass |
| lint | `bun run lint` | pass (0 warnings, 0 errors) |
| typecheck | `bun run typecheck` | pass |
| build | `bun run build` | pass (304 files, 10866 kB) |
| unit | `bun run test:unit` | **10 pass, 0 fail** (37 expect() calls) |
| e2e | `bun run scripts/test-review-ui/e2e.mjs` | **13 pass, 0 fail** |

## Ad-hoc smoke test

**Round 2 specific check: filter behavior**

| Scenario | Setup | Before fix (`wt.path !== root`) | After fix (`wt.path !== wtRoot`) |
|---|---|---|---|
| User in main + `--worktree wtEmpty` (empty) + wtPopulated has 5 commits ahead | Manual trace via debug log | `isWorktree(root=wtEmpty) = true` → early return (line 1228). Auto-pickaround NOT reached. | Same: `isWorktree(root=wtEmpty) = true` → early return. Filter NOT reached. |
| User in main + no `--worktree` + wtPopulated has 5 commits | Existing scenario `has-worktree-unpushed` | PASS | PASS (unchanged) |
| User in main + no `--worktree` + wtA 5 ahead + wtB 2 ahead | Existing scenario `multiple-worktrees-pick-most` | PASS, picks wtA | PASS, picks wtA (unchanged) |
| User in main + `--worktree wt` (has files) | Existing scenario `worktree-flag-override` | PASS | PASS (unchanged) |
| All worktrees clean + main checkout | Existing scenario `no-worktree-clean` | PASS (diagnostic) | PASS (unchanged) |

## Verdict

**PASS** — no regressions across all gates and 13 e2e scenarios.

## Notes on attempted new scenario

I wrote `worktree-flag-wins-over-auto-pick` scenario with `setupInfo.worktree = wtEmpty` (empty worktree) and a populated `wtPopulated` (5 commits ahead), expecting the fix to prevent auto-pickaround. But the harness's setup makes `parsed.worktree = wtEmpty` resolve first, which makes `root = wtEmpty`, and the existing `isWorktree(root) = true` early-return at line 1226 prevents the buggy code path from ever running. **The bug as described doesn't manifest in the harness.** I reverted the new scenario + expect kind to avoid adding a test that always passes (vacuous coverage). The defensive fix at line 1230 is still kept — it's correct, safer, and the line 1226 check + this filter form a defense-in-depth pair.

## Atomic write helper validation

The Round 1 atomic write helper (`writeFileAtomic`) is exercised by the existing e2e scenarios that launch the review server (they create state.json). All 7 validated state.json files in the run output are byte-valid JSON, confirming Round 1's atomic write fix remains intact through Round 2's edits to `src/index.ts`.