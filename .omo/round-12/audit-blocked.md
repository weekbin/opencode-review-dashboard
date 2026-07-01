# Round 12 BLOCKED — Phase 2.5 Pre-Commit Audit FAIL

> **Decision**: Round 12 cannot end cleanly while this audit is open. Closure commit `6e0e047` is already on `origin/main`; "BLOCKED" here means: **don't start Round 13** + fix MUST land in R12 closure-patch.
> **Failure**: e2e scenario count drift — Dev claim vs actual count mismatch.

## Reason

Phase 2.5 Pre-Commit Audit reverse-verified Dev's claims against source of truth:

| Claim (verbatim from Dev's return value) | Source of truth | Verdict |
|---|---|---|
| `e2e: "31/31 scenarios"` | `grep -oE '^  "[a-z][a-z-]+": \{ setup:' scripts/test-review-ui/scenarios.mjs \| wc -l` = **30** | **FAIL** |
| `unit: "185/185 pass"` | `bun test` = `185 pass / 0 fail` | PASS |
| `lint: "0 warnings, 0 errors"` | `bun run lint` = `Found 0 warnings and 0 errors` | PASS |
| `typecheck: "clean"` | `bun run typecheck` = `tsc --noEmit` exits clean | PASS |
| `format: "clean"` | `bun run format:check` exits clean | PASS |
| 7 R12 commit SHAs (R5 retro Gap 3 evidence) | `git cat-file -e` × 7 = all OK | PASS |

**Root cause**: Plan.md hand-off item 7 specified "scenarios 25 + 6 = 31", but pre-R12 actual was 24 (R10 closure retro's "23 → 25" claim was already off by 1 — likely because the per-round scenario deltas in prior closure retros counted *additions* but not all scenarios that survived; the cumulative drift accumulated across R7-R10). Dev followed plan.md mechanically, updating `README.md` + `scripts/test-review-ui/README.md` from `25` → `31` without reverse-verifying `SCENARIOS` count first.

This is **R5 retro Gap 3 (doc side-file drift) ACTIVE regression** — the side-file grep ran but on the wrong source number.

## State at block

- Local SHA: `6e0e047a57493edbda473acc86de208b6198982b`
- Remote SHA: `6e0e047a57493edbda473acc86de208b6198982` (same — already pushed)
- Closure commit: ALREADY LANDED on `origin/main` (audit caught the drift POST-commit; retroactive flag)
- Conflicted files: NONE (no rebase in progress)
- Worktree status: clean

## Drift location (file:line)

- `README.md:270` — claims `31 git scenarios`
- `scripts/test-review-ui/README.md:20` — claims `31 git scenarios:`
- Actual count: 30
- Diff: trivial — `31` → `30` in 2 lines

## Proposed fix (1-line trivial patch)

```bash
# 2 files / 2 lines / 1-line patch total
sed -i 's|31 git scenarios|30 git scenarios|' README.md scripts/test-review-ui/README.md
git add README.md scripts/test-review-ui/README.md
git commit -m "fix(round-12): e2e scenario count 31 → 30 (audit drift, see .omo/round-12/audit-blocked.md)

Co-Authored-By: ..."

# Then push (this commit is the audit-fix; does NOT touch feature code)
git push origin main
```

After the fix:
- README.md:270 → "30 git scenarios"
- scripts/test-review-ui/README.md:20 → "30 git scenarios:"
- Audit-blocked.md stays in `.omo/round-12/` for R12 audit trail transparency (R8 retro: don't hide bugs)

## Next round action

Lead waits for user OK on this 1-line fix. Once patched + pushed:

1. Re-run audit: `bun test`, `bun run lint`, `bun run typecheck`, `bun run format:check`, scenario count
2. Audit-blocked becomes historical record (do NOT delete)
3. Round 13 can start cleanly
