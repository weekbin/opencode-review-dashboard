#!/usr/bin/env bash
# pre-commit-audit.sh — Phase 2.5 Pre-Commit Audit automation
# APPLIED in v5.3.3 (R+ retro root-cause fix)
# Usage: scripts/pre-commit-audit.sh <baseline-sha> [worktree-path]
#   <baseline-sha>: previous round's main HEAD (R-N-1 final commit)
#   [worktree-path]: Dev's worktree path (default: $HOME/.worktrees/team-dev-loop-round-N)
# Exit codes:
#   0 = all checks PASS
#   1 = at least 1 check FAIL (drift detected, SHAs missing, count mismatch, etc.)

set -euo pipefail

BASELINE_SHA="${1:-}"
WORKTREE_PATH="${2:-$HOME/.worktrees/team-dev-loop-round-$(git rev-parse --abbrev-ref HEAD 2>/dev/null | grep -oE 'team-dev-loop-round-[0-9]+' | grep -oE '[0-9]+' || echo 12)}"

# 1. Validate baseline + worktree exist
if [ -z "$BASELINE_SHA" ]; then
  echo "ERROR: baseline SHA required as 1st argument" >&2
  echo "Usage: scripts/pre-commit-audit.sh <baseline-sha> [worktree-path]" >&2
  exit 2
fi

if [ ! -d "$WORKTREE_PATH" ]; then
  echo "ERROR: worktree not found at $WORKTREE_PATH" >&2
  exit 2
fi

cd "$WORKTREE_PATH"

echo "[audit] baseline: $BASELINE_SHA"
echo "[audit] worktree: $WORKTREE_PATH"
echo ""

# 2. Compute R-N commits (Dev's work)
NEW_COMMITS=$(git log --format=%H "$BASELINE_SHA"..HEAD 2>/dev/null) || NEW_COMMITS=""
COMMIT_COUNT=0
if [ -n "$NEW_COMMITS" ]; then
  COMMIT_COUNT=$(printf '%s\n' "$NEW_COMMITS" | wc -l)
fi
echo "[audit] new commits in this round: $COMMIT_COUNT"

if [ "$COMMIT_COUNT" -lt 1 ]; then
  echo "[audit] FAIL: no new commits since baseline $BASELINE_SHA" >&2
  exit 1
fi

# 3. SHA verification (R4 retro fabrication defense)
echo "[audit] verifying SHAs..."
for sha in $NEW_COMMITS; do
  if ! git cat-file -e "$sha" 2>/dev/null; then
    echo "[audit] FAIL: SHA $sha missing" >&2
    exit 1
  fi
done
echo "[audit] SHA verification: $COMMIT_COUNT SHAs OK"
echo ""

# 4. Doc side-file drift detection (R5 retro Gap 3 / R12 retro SG.1 reverse-validate)
echo "[audit] doc side-file drift check (scenario count claim vs actual)..."
ACTUAL_SCENARIOS=$(grep -c '^  "[a-zA-Z0-9-]\+": { setup' scripts/test-review-ui/scenarios.mjs 2>/dev/null || echo "0")
CLAIMED_SCENARIOS=$(grep -oE '[0-9]+ git scenarios' README.md 2>/dev/null | head -1 | grep -oE '[0-9]+' || echo "0")
echo "[audit] actual scenario count (audit-correct grep): $ACTUAL_SCENARIOS"
echo "[audit] claimed scenario count (README.md): $CLAIMED_SCENARIOS"
if [ "$ACTUAL_SCENARIOS" != "$CLAIMED_SCENARIOS" ] && [ "$CLAIMED_SCENARIOS" -ne 0 ]; then
  echo "[audit] FAIL: scenario count drift — actual=$ACTUAL_SCENARIOS, claimed=$CLAIMED_SCENARIOS" >&2
  exit 1
fi
echo "[audit] scenario count: PASS"
echo ""

# 5. File count deltas (sanity check vs plan)
echo "[audit] file count deltas (vs baseline)..."
FILE_STATS=$(git diff --stat "$BASELINE_SHA"..HEAD 2>/dev/null | tail -1)
echo "[audit] $FILE_STATS"
echo ""

# 6. 4 test gates (mandatory)
echo "[audit] running 4 test gates..."
echo "[audit]   - bun run check (format + lint + typecheck)..."
if ! bun run check > /tmp/audit-check.log 2>&1; then
  echo "[audit] FAIL: bun run check" >&2
  cat /tmp/audit-check.log | tail -20 >&2
  exit 1
fi
echo "[audit]   - bun run check: PASS"

echo "[audit]   - bun run build..."
if ! bun run build > /tmp/audit-build.log 2>&1; then
  echo "[audit] FAIL: bun run build" >&2
  cat /tmp/audit-build.log | tail -20 >&2
  exit 1
fi
echo "[audit]   - bun run build: PASS"

echo "[audit]   - bun test (unit tests)..."
if ! bun test > /tmp/audit-unit.log 2>&1; then
  echo "[audit] FAIL: bun test" >&2
  cat /tmp/audit-unit.log | tail -20 >&2
  exit 1
fi
UNIT_PASS=$(bun test 2>&1 | grep -oE '[0-9]+ pass' | head -1)
echo "[audit]   - bun test: PASS ($UNIT_PASS)"

echo "[audit]   - bun run scripts/test-review-ui/e2e.mjs (e2e scenarios)..."
if ! bun run scripts/test-review-ui/e2e.mjs > /tmp/audit-e2e.log 2>&1; then
  echo "[audit] FAIL: e2e scenarios" >&2
  cat /tmp/audit-e2e.log | tail -20 >&2
  exit 1
fi
E2E_PASS=$(bun run scripts/test-review-ui/e2e.mjs 2>&1 | grep -oE '[0-9]+/[0-9]+ scenarios' | head -1)
echo "[audit]   - e2e: PASS ($E2E_PASS)"
echo ""

# 7. All checks PASS
echo "[audit] === ALL CHECKS PASS ==="
echo "[audit] Dev worktree ready for Phase 2.6 (Lead Merge + Push)"
exit 0
