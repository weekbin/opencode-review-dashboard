# Phase 2.5 Lead Pre-Commit Audit spec — NEW v5

> **Last Updated**: 2026-06-29 (v5)

## When

After Phase 2 Dev returns, **before** Phase 3a Tester Review. Always run (bugfix/feature/architecture).

## Who

Lead (`sisyphus` primary chat) — does NOT spawn a subagent. Inline shell + read.

## Inputs

- Dev's return value (commit SHAs, file changes, AC trace)
- `.omo/round-N/decision.md`, `.omo/round-N/diff-report.md`, `.omo/round-N/plan.md` (after Phase 3b)
- `.omo/round-N/competitor-landscape.md` (PM Researcher output)

## Output

Inline verdict (PASS / FAIL). If FAIL → `.omo/round-N/audit-blocked.md` written + round ends.

## Protocol

### 1. Extract all SHAs cited in this round's artifacts

```bash
grep -oE '[0-9a-f]{7,40}' \
  .omo/round-N/decision.md \
  .omo/round-N/diff-report.md \
  .omo/round-N/plan.md \
  .omo/round-N/test-report.md \
  2>/dev/null | sort -u > /tmp/round-n-shas.txt
```

### 2. Verify each SHA exists

```bash
for sha in $(cat /tmp/round-n-shas.txt); do
  git cat-file -e "$sha" 2>/dev/null || echo "MISSING: $sha"
done
```

If any SHA is MISSING → FAIL.

### 3. Reverse-verify PM Researcher competitor claims

For each "what's missing" claim in `.omo/round-N/competitor-landscape.md`:

```bash
# Extract claim keywords (heuristic: take 2-3 distinctive words from each claim)
CLAIM_KEYWORDS=$(grep "Claim:" .omo/round-N/competitor-landscape.md | \
  awk '{print $3, $4}' | head -20)

for kw in $CLAIM_KEYWORDS; do
  # Search src/ + README.md + docs/ for the keyword
  grep -r "$kw" src/ README.md docs/ 2>/dev/null | head -3 || echo "NOT_FOUND: $kw"
done
```

If critical claims (those that justify scope inclusion) are NOT reverse-verifiable → FAIL.

### 4. If FAIL — write audit-blocked.md

```markdown
# Round N BLOCKED — Phase 2.5 Pre-Commit Audit FAILED

## Reason
- Missing SHAs: <list>
- Unverifiable claims: <list>

## State at block
- Dev commits: <list>
- Audit ran at: <ISO 8601>

## Next round action
Lead will not proceed to Phase 3a. Round N ends.
```

Lead does NOT proceed to Phase 3a. Round ends with verdict BLOCKED in decision.md.

Lead emits chat:

```
[team-dev-loop] Round N pre-commit audit FAILED. See .omo/round-N/audit-blocked.md
```

### 5. If PASS — proceed to Phase 3a

Lead writes brief note in `.omo/round-N/decision.md` ## Phase 2.5 Audit section:

```markdown
## Phase 2.5 Pre-Commit Audit

- SHAs verified: <count> / <count> PASS
- Claims reverse-verified: <count> / <count> PASS
- Verdict: PASS
- Audit timestamp: <ISO 8601>
```

## Why this exists

- **R3 fabrication defense**: Caught before push (instead of after next round's PM Triage pre-check)
- **R5 plan-data mismatch defense**: If brief says "CJK regex widen to cover Hangul" but code doesn't actually widen, this catches it
- **R8 TDZ defense**: Lead runs the check before declaring round PASS (closes the gap where Dev self-check is unreliable)

This is the v5 response to Metis audit M-070 (cross-cutting: emergency-abort for closure).

## 6. Post-merge rebuild (NEW R18 retro SG.R19.1 — macOS-safe build location)

**Why** (R18 retro): Phase 2.5 audit builds dist/ for verification. The build target matters: if Dev subagent built in the worktree, the worktree's `dist/` is fresh, but `main` worktree's `dist/` (where the mock-server serves from in Phase 3c Playwright) is stale until re-built. R19 walked into this exact trap — Phase 3c mock-server served a 7-day-old `dist/ui/app.js` (Jun 25 timestamp), causing all R19 features to appear "missing" in the walkthrough until lead rebuilt in main.

**Rule** (mandatory, SG.R19.1):

```bash
# After `git merge --no-ff` (Phase 2.6) AND BEFORE Phase 3c Playwright walkthrough:
cd <main worktree>          # NOT the dev worktree
bun run build                # rebuild dist in main so mock-server serves fresh artifacts
```

If audit built in worktree AND Phase 3c Playwright is enabled: rebuild in main between merge and walkthrough. Lead-direct inline step, no subagent.

## 7. Phase 2.6 explicit rebuild checklist (NEW R20 retro SG.R20.1 — applies SG.R19.1 in Phase 2.6 flow)

**Why** (R20 retro F.1): SG.R19.1 was correct, but the rebuild step wasn't part of Phase 2.6's explicit checklist. R20's lead-direct inline fix caught the stale dist in Phase 3c walkthrough (10965 kB main vs 10974 kB worktree, R20 features missing from main dist). Caught in 2 min — much cheaper than rediscovery, but should be prevented not discovered.

**Rule** (mandatory, SG.R20.1): Phase 2.6 (Lead Merge + Push) MUST execute the following 3-step checklist before proceeding to Phase 3a:

```bash
# Step 1: Merge dev worktree branch into main (no-ff)
git merge --no-ff team-dev-loop-round-N-<branch> \
  -m "Round N: <one-line summary> (close #N1, #N2, ...)"

# Step 2: Rebuild in MAIN worktree (NOT dev worktree) — SG.R19.1 + SG.R20.1
cd <main worktree>          # CRITICAL: main, not the dev worktree
bun run build                # refresh dist/ui/* for mock-server

# Step 3: Verify new features are in dist (1-line sanity check)
grep "<feature-marker>" dist/ui/*.js  # should return matches

# Step 4: Push to origin
git push origin main

# Step 5: Verify GH auto-close
gh issue list --state closed --label pm-manager-approved
```

If Step 3 returns no matches, the rebuild in Step 2 didn't include the new commits (e.g., wrong worktree). Re-run Step 2 from main.

**F.1 evidence (R20)**: Initial Phase 2.5 audit built dist/ in worktree. Phase 2.6 merged but didn't rebuild. Phase 3c Playwright walkthrough showed 0 matches for R20 feature markers in dist. Lead-direct inline rebuild fixed in 2 min. With SG.R20.1, this gap is prevented — Phase 2.6 explicitly triggers rebuild + verification BEFORE Phase 3c.