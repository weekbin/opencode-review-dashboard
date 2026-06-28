# Round 2 Brief

## Title
Fix `--worktree` auto-pickaround — explicit flag silently overridden when target worktree is empty

## Source
- Round 1 `follow_up_candidates` in `.omo/proposals.jsonl` (candidate #2)
- PM Round 1 surfaced this as `bug (wrong review) / trivial effort / low risk`

## Goal

When user passes `--worktree /path/to/wt-A`, the plugin should always use wt-A as the diff source — even if wt-A is empty. Currently, if wt-A has 0 files (because no commits ahead of `origin/main`), the plugin's auto-pickaround logic silently picks another worktree (the one with most commits ahead), overriding the user's explicit flag.

## Acceptance criteria

- AC1: When user passes `--worktree /path/to/wt-A` and wt-A is empty (no diff), the plugin MUST return wt-A's empty diff state, NOT auto-pick another worktree.
- AC2: When user passes `--worktree /path/to/wt-A` and wt-A has files, behavior is unchanged (existing correct behavior).
- AC3: When user does NOT pass `--worktree` AND is in the main checkout, existing auto-pickaround logic is unchanged (still picks worktree with most commits ahead).
- AC4: When user does NOT pass `--worktree` AND is inside any worktree (existing behavior), no auto-pickaround — current dir wins (already implemented at `src/index.ts:1226-1231`).
- AC5: Auto-detection behavior unchanged when `--worktree` not passed.
- AC6: Error message preserved when explicit worktree path doesn't exist.

## File changes

| File | Change |
|---|---|
| `src/index.ts:1233` | Change `wt.path !== root` to `wt.path !== wtRoot` so the auto-pickaround filters out the EXPLICIT worktree (not just current dir) |
| `src/state-store.test.ts` (or new file) | Add unit test verifying `--worktree` flag wins over auto-pickaround when target is empty |
| `scripts/test-review-ui/e2e.mjs` | Add e2e scenario: pass `--worktree` to empty worktree, verify result has 0 files (not auto-picked) |
| `README.md` | Add 1 sentence: "When `--worktree` is passed to an empty worktree, the plugin does not auto-pick around it." |

## Implementation steps

1. Create worktree per project memory 372
2. Edit `src/index.ts:1233` — replace `root` with `wtRoot` in the filter
3. Write inline test (verify the existing `if (worktree)` early-return path still fires)
4. Add 1 e2e scenario (empty worktree via `--worktree`)
5. Add 1-paragraph README note

## Test plan

- Unit test: with mock worktrees list where `--worktree` target is empty + another worktree has commits ahead, verify the explicit one wins (0 files returned, `autoWorktree` field unset)
- E2E test: run `/diff-review-dashboard --worktree <empty-wt>` against the existing test harness, verify state.json has `files: []` and `autoWorktree` is undefined
- Regression: existing 13 e2e scenarios still pass

## Risk register

| Risk | Mitigation |
|---|---|
| Test fixtures may need a real worktree setup (vs mocks) | Use the existing test harness which already creates git repos per scenario |
| Existing tests may have implicitly relied on the buggy behavior | grep for any test that passes `--worktree` to an empty target and asserts non-empty result |
| Line 1233 change is small but high-blast-radius (worktree resolution affects all rounds) | Run full e2e suite (13 scenarios) before declaring PASS |

## Worker hand-off checklist

- [ ] Create worktree at `/Users/yangweibin/.worktrees/team-dev-loop-round-2`
- [ ] Branch: `team-dev-loop-round-2-worktree-auto-pickaround`
- [ ] Edit `src/index.ts:1233`: `wt.path !== root` → `wt.path !== wtRoot`
- [ ] Add unit test in `src/index.ts` or new `src/worktree.test.ts` (if not present)
- [ ] Add e2e scenario to `scripts/test-review-ui/e2e.mjs`
- [ ] Run `bun run check` (format + lint + typecheck)
- [ ] Run `bun run build`
- [ ] Run unit tests (target ≥ 11/11 — Round 1 had 10, this adds 1)
- [ ] Run e2e tests (target ≥ 14/14 — Round 1 had 13, this adds 1)
- [ ] Update README with 1-paragraph note (in the "How worktree resolution works" section)
- [ ] Commit + push (1 commit, direct to main)

## Self-Critique

**Clarity**: HIGH. The bug is precisely located (`src/index.ts:1233` filter mismatch), the fix is 1 line, and the test is straightforward. No architectural decision needed.

**Hidden ambiguities**: 
- The exact condition for "wt is empty" — is it `files.length === 0` after `collectMerged`, or `summary.ahead === 0`? Currently the code uses `summary.ahead > 0` to filter candidates (line 1237) but `merged.files.length === 0` to gate the entire auto-pickaround (line 1224). The fix preserves both — wt-A is filtered out of `others` because `wt.path === wtRoot`, so even if it has commits ahead, it cannot be picked.
- Whether the fix needs to apply also when `--worktree` is passed but the path doesn't resolve. AC6 covers this — the existing path-resolution error path stays.

**Risks**: LOW. 1-line change in a localized filter. Full e2e suite re-runs as safety net.

## Profile signals

```yaml
profile_signals:
  pm_source: agent-suggested (Round 1 follow_up_candidates)
  S_size: 50-199      # 1-line fix + 1 test + 1 README paragraph ≈ 60-80 lines
  S_files: 2-3       # src/index.ts + tests + README
  S_new_module: no   # no new files (extend existing test files)
  S_architecture: no
  S_user_visible: no # internal flag handling, no UI change
  S_persistence_breaking: no
  S_persistence_cosmetic: no
  S_dependencies: no
  # total ≈ 1 (S_size=1 + S_files=1)
```

## Recommended profile

Apply the auto-classification rules:
1. `S_architecture==yes`? NO. `S_persistence_breaking==yes`? NO. `S_dependencies==yes`? NO. `total >= 8`? NO. → skip Rule 1.
2. `S_user_visible==yes`? NO. → skip Rule 2.
3. Else → **bugfix**.

Lead (sisyphus) will run only the bugfix-profile phases: Dev, 3a (3 lens: Goal+QA+Security), 3b (Tester Diff), 3.5 (PM Doc Writer 1-paragraph), 4 (Decision). Skipped: 0 PM Triage (this brief IS the PM output), 0.5 PM Manager, user pick (already picked), full Architect plan (1-paragraph above), 3a-3 Code lens, 3a-5 Context lens, 3c Playwright (no UI change).