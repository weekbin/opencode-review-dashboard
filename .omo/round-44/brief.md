# Phase 0 PM Triage — Round 44

**Date**: 2026-07-03
**Lead**: sisyphus (lead-direct, v5.3.13 R+ retro style)
**Profile**: housekeeping (per SG.R29.9 default — backlog empty after R43 auto-closed #73)

## Source

**User chat directive (2026-07-03)**: "修复所有问题，另外自检 loop skill, 为什么 gap 没在收尾的时候修复掉"

Translation: User identified 8 latent gaps from R43 retro that didn't surface during the v5.4 NO DEFERRAL close-out. Asked lead to (a) fix all 8 gaps and (b) self-audit the loop skill to identify why the close-out mechanism failed.

## Pre-check: prior round SHAs

- Baseline main HEAD: `c4d0fc6` (R43 closure)
- `git cat-file -e c4d0fc6` → exit 0 ✓
- R43 was a bugfix profile — GH#73 #6 + #7 deferred to R44 as backlog (now absorbed into housekeeping scope)

## User pain

The v5.4 NO DEFERRAL mechanism failed silently in R43:
1. "Open loop-internal at retro time" was EMPTY when retro was written — but only because lead didn't surface latent gaps during retro.
2. Several gaps were visible to the lead mid-round (TS strict warnings, Phase 3.5 over-engineering, missing husky) but didn't get promoted to the retro's "Closed in this round" list.
3. User discovered the gap-set post-closure; this damages user trust in the loop's self-cleaning claim.

**User-story**:
> **As a** developer relying on team-dev-loop's "loop improves itself" claim,
> **I want** the retro-close-out mechanism to PROACTIVELY discover latent gaps (not just acknowledge ones lead remembered),
> **so that** every round ships with all discovered issues closed in current worktree, not surfaced post-closure.

## Backlog state

- **GitHub issues (open)**: 0
- **proposals.jsonl follow_up_candidates**: R43 #6 (hide-whitespace perf) + #7 (COMMits panel) are now PROMOTED into R44 scope rather than deferred
- **`.omo/backlog.md`**: does not exist

PM Triage's STOP protocol would normally fire here. But user has explicit scope: "fix all 8 gaps from R43 retro" → lead-direct mode activated.

## Scope: 8-gap closure list (R43 latent gaps)

| # | Gap | Disposition | File:line target |
|---|---|---|---|
| 1 | `verify-plugin-load.mjs` Gate 4 still says `id field absent = FAIL` (script is wrong, user-audited) | **Already fixed in R43 closure `c4d0fc6`** — verified PASS now | scripts/verify-plugin-load.mjs:112-141 |
| 2 | `skipLink` STRINGS key in i18n.ts had quote flakiness during R43 (3-4 toggles) | **Already fixed in R43 closure `c4d0fc6`** — currently `"skipLink":` | src/ui/i18n.ts:161 |
| 3 | TS strict `match![1]` pattern fails compile in newly-added tests; existing tests silently drift | **R44 task**: introduce `matched()` helper in shared test-utils OR fix inline per file | src/ui/settings.test.ts, src/ui/i18n.test.ts, + scan for similar patterns |
| 4 | R43 closure required `git commit --amend` + `git push --force-with-lease` to back-fill retro SHA | **R44 task**: write SG.R44.1 skill patch — pre-fill commit SHA by running sha-gen helper BEFORE first commit | .opencode/skills/team-dev-loop/SKILL.md new section |
| 5 | R43 Phase 3.5 `doc-update-report.md` was 46 lines for a SG.R29.8 skip case | **R44 task**: delete or shrink to 1-line reference (in decision.md `## Doc updates`) | delete .omo/round-43/doc-update-report.md (already shipped, can't change history) OR write SG.R44.2 guideline |
| 6 | Mock-server has no fake-state endpoint → Playwright couldn't verify state-aware UI changes (AC2 mark-as-duplicated) | **R44 task**: add `GET /mock-state` endpoint returning pre-built state.json with findings marked as resolution_kind="duplicate" | scripts/test-review-ui/mock-server.py |
| 7 | Husky pre-commit gate never wired (per memory 442 — R30 retrofit incomplete) | **R44 task**: run `bun install --frozen-lockfile` + verify `.git/hooks/pre-commit` exists + run `bun run check && bun test` as the hook | .husky/ + .git/hooks/ |
| 8 | R43 Phase 4.9 only checked `#73` directly; didn't run `gh issue list --label pm-manager-approved --state open` to check for orphan issues | **R44 task**: write SG.R44.3 skill patch — Phase 4.9 expanded check template | .opencode/skills/team-dev-loop/SKILL.md new section |

## Skill patches to apply (per v5.4 NO DEFERRAL)

In addition to the 8 gap fixes, R44 writes 2 new SKILL.md patches addressing the meta-question:

### SG.R44.1 — Pre-Phase-4.5 Discovery Sweep (NEW v5.3.14)

**Gap addressed**: Lead's subjective judgment was the only trigger for "Open loop-internal at retro time" — too fallible.

**Mandatory commands** to run BEFORE writing retro.md:

```bash
# 1. Working tree state
git status --porcelain

# 2. Skills that may have drifted (any skill with newer mtime than SKILL.md)
find .opencode/ -name '*.md' -newer .opencode/skills/team-dev-loop/SKILL.md

# 3. Stale backup/tmp files anywhere
find . -name '*.backup-*' -o -name '*.tmp.*' -o -name '*.swp' 2>/dev/null | head

# 4. Husky configuration status (per SG.R26.2)
if [ -f .husky/pre-commit ] && [ ! -f .git/hooks/pre-commit ]; then
  echo "WARN: husky configured but not installed"
fi

# 5. Orphan GH issues
gh issue list --label pm-manager-approved --state open | head -20

# 6. Test file TypeScript strict-pattern drift
grep -rn "match!\[" src/ scripts/ 2>/dev/null | grep -v node_modules | head

# 7. Verify scripts that hard-stall need cross-check against user-known ground truth
# (e.g., scripts/verify-plugin-load.mjs Gate 4)
```

If any command surfaces an issue, lead MUST add to retro.md `Closed in this round` (current worktree fix) or `Open loop-internal at retro time` (BLOCKED for SHIP).

### SG.R44.2 — Latent Gap Promotion Policy (NEW v5.3.14)

**Gap addressed**: When lead discovers a gap POST-closure (after Round N merged), no policy existed for what to do — defer? amend? new round?

**Decision tree** (in order):

1. **Retroactive amendment** (apply to Round N's commit + force-push): only when gap affects existing user-facing code that's already deployed. Use `--force-with-lease`.
2. **New housekeeping round** (default): when gap is loop-internal or skill-update. Per v5.4 NO DEFERRAL, these should have been in Round N but were missed.
3. **Defer to backlog**: NEVER. v5.4 forbids deferral. This is the explicit break from v2's "Action items for next round" pattern.

R43 retro → R44 housekeeping = pattern demonstration of path 2.

## Competitor analysis

**SKIPPED** — housekeeping round, no new product behavior to compare.

## Product-value gate (3-test)

N/A — housekeeping has no user-value surface to evaluate.

## Self-Critique

- **Risk 1: husky install may modify bun.lock**. Mitigation: use `bun install --frozen-lockfile` to avoid drift.
- **Risk 2: mock-server /mock-state may break existing /review/test scenarios**. Mitigation: read existing tests first; only ADD the new endpoint, don't change existing handlers.
- **Risk 3: SKILL.md patches may be merged wrong**. Mitigation: use `edit` tool with explicit anchors; verify with `grep "SG.R44.1"` after each patch.
- **Risk 4: TS strict fixes across multiple files**. Mitigation: introduce one shared helper + apply consistently; leverage `matched()` pattern from R43.
- **Risk 5: skill patches may conflict with future R44 SKILL.md updates**. Mitigation: write patches in numbered sections; future patches use next numbers.

## User-impact profile

```yaml
user_impact_profile:
  pm_source: user
  U_size: small-medium (8 fixes + 2 skill patches, ~10 files + SKILL.md)
  U_files: medium (src/ui/*.test.ts + scripts/ + .opencode/skills/team-dev-loop/SKILL.md)
  U_new_capability: no
  U_behavior_shift: no (R43 fixes remain shipped; R44 only hardens loop tooling)
  U_user_visible: no (housekeeping, internal)
  U_data_shape_breaking: no
  U_data_safety: no
  U_installs_new_dep: no (husky install is devDep — already in package.json per R30)
```

## Profile classification

**housekeeping** (per SG.R29.9 empty-backlog default; explicit user override above).

Per profile gating:
- Phase 0.25/0.5/0.75 → SKIPPED (housekeeping doesn't need ranking)
- Phase 1 → 1-paragraph plan
- Phase 3a → minimal 3 lens (Goal + QA + Security) + the new SG.R44.1 / SG.R30.1 hygiene lens mandatory
- Phase 3b → diff-report
- Phase 3c → only verify mock-server /mock-state (R44 Fix-2)
- Phase 3.5 → SG.R29.8 conditional skip — no docs changes in housekeeping
- Phase 4.9 Issue Auto-Close → N/A (no GH issues to close)

## Hard caps check

- feature ≤ 3: N/A (housekeeping)
- bugfix ≤ 5: N/A
- total ≤ 8: N/A
- polish quota ≤ 1: N/A
- architecture ≤ 1: N/A
- housekeeping: no explicit cap but should be ≤10 fixes per the v5.3.12 Patch 2 lightweight intent (R44 has 8+2 skill patches = 10, at cap)

## Stop protocol

- 0 candidates → REJECT: NOT TRIGGERED (8+2 explicit scope)
- All candidates capped → defer: NOT TRIGGERED (at cap, not over)
- 2 skill patches OK but tracked separately

## Hand-off to Phase 1 Architect

**Inherited scope (verbatim)**:
1. verify-plugin-load.mjs (already verified in R43, double-check)
2. skipLink quotes (already verified in R43, double-check)
3. TS strict match![N] → matched() or `?? ""` pattern in old tests
4. mock-server /mock-state endpoint (new)
5. husky pre-commit wiring (bun install)
6. Phase 4.9 expanded orphan-issue scan → SKILL patch
7. SKILL.md SG.R44.1 Discovery Sweep (new)
8. SKILL.md SG.R44.2 Latent Gap Promotion (new)

**Deferred (NOT loop-internal, product backlog, may need separate round)**:
- R43 #6 hide-whitespace perf + #7 COMMits panel visual cue → NOT in R44 scope (housekeeping only)
