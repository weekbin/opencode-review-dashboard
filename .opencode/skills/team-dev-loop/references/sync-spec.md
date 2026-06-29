# Phase -0 Sync spec — automation entry-point hardening

> **Last Updated**: 2026-06-29 (v5)

## When

Every round begins here. **Always run** (bugfix/feature/architecture profiles).

## Who

Lead (`sisyphus` primary chat) — does NOT spawn a subagent.

## Inputs

- cwd in main worktree (or current dev branch)
- existing `.omo/round-N/` (current round dir)

## Output

`.omo/round-N/sync-report.md`

## Execution (lead runs inline)

```bash
cd <main worktree>

# 1. Fetch latest from origin
git fetch origin

# 1.5 Tool pre-flight (NEW v5.1 — added after R10 retro discovered missing playwright-cli)
# Reference: references/environment-setup.md
echo "[sync] Tool pre-flight check..."

MISSING_TOOLS=()
for tool in git node bun playwright-cli gh python3; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    MISSING_TOOLS+=("$tool")
    echo "[sync] MISSING: $tool"
  else
    echo "[sync] OK: $tool ($(command -v $tool))"
  fi
done

# Chrome check (not in PATH on most systems)
if [ ! -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ] && \
   [ ! -f "/usr/bin/google-chrome" ] && \
   [ ! -f "/usr/bin/chromium-browser" ] && \
   [ -z "$(ls ~/.cache/ms-playwright/chromium-* 2>/dev/null)" ]; then
  MISSING_TOOLS+=("chrome")
  echo "[sync] MISSING: chrome (no system browser AND no playwright-bundled chromium)"
fi

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
  echo "[sync] WARNING: Missing tools: ${MISSING_TOOLS[*]}"
  echo "[sync] See references/environment-setup.md for install instructions"
  echo "[sync] Phase 3c Playwright will be N/A if playwright-cli missing"
  # Do NOT HARD STOP — missing tools degrade gracefully per phase dependency map
fi

# 2. Check local working tree state
git status --porcelain
# If non-empty: working tree dirty → skip step 4 (mark as conflict)

# 3. Check local ahead (commits not yet pushed)
git log origin/main..HEAD --oneline
# Local ahead commits → list them (this round's closure push will include them)

# 4. Check remote ahead (commits on origin not yet local)
git log HEAD..origin/main --oneline
# Remote ahead commits → list them (need to pull)

# 5. Decide action
# Case A: remote ahead AND local clean → git pull --rebase origin main
# Case B: remote ahead AND local dirty → HARD STOP
# Case C: local ahead AND remote clean → normal, continue (closure commit will push)
# Case D: both have commits (diverged) → HARD STOP
# Case E: both clean → normal

# If rebase conflict → git rebase --abort → HARD STOP
```

## Output template

```markdown
# Phase -0 Sync Report — Round N

## Tool pre-flight (NEW v5.1)
- git: OK at <path>
- node: OK at <path> v<X>
- bun: OK at <path> v<X>
- playwright-cli: OK/MISSING
- gh: OK/MISSING
- python3: OK/MISSING
- chrome: OK (at <path>) / MISSING
- Overall: PASS / WARNING (missing tools: <list>)

## Network
- git fetch origin: PASS / FAIL: <error>

## Local state
- working tree: clean / dirty: <files>
- local ahead: N commits: [<sha>, ...]

## Remote state
- remote ahead: N commits: [<sha>, ...]

## Action taken
- none / rebase / pull / HARD STOP

## Baseline
- main HEAD SHA: <sha>
- main HEAD date: <ISO 8601>

## Conflicts resolved (if any)
- <list of files with conflict, how resolved>
```

## HARD STOP protocol

If sync fails (network error / conflict / divergence):

Lead writes `.omo/round-N/sync-blocked.md`:

```markdown
# Round N BLOCKED — sync failure

## Reason
<network error / conflict / divergence>

## State at block
- Local SHA: <sha>
- Remote SHA: <sha>
- Conflicted files: <list>

## Next round action
Lead will retry sync at start of Round N+1. Round N ends here.
```

Lead does NOT proceed to Phase 0 PM Triage. Lead emits chat:

```
[team-dev-loop] Round N sync blocked. See .omo/round-N/sync-blocked.md
```

Round ends. Next cron tick (or next loop iteration) retries.

## Why this exists

- Without sync, the loop's closure commit may fail to push (if remote has unrelated changes)
- Without sync, the loop may build on stale main (loses R-(N-1) commits that landed via other PRs)
- Without sync, R3-style fabrication is harder to catch (lead compares against wrong baseline)

This is cron-style loop's entry-point hardening.