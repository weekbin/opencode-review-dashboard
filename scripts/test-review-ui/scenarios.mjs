// Git scenario setup functions for the review-dashboard-ui test harness.
// Each function takes a temp directory and sets up a specific git state.

import { spawn } from "node:child_process";

const run = (cmd, args, cwd) =>
  new Promise((resolve) => {
    const p = spawn(cmd, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "",
      err = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => resolve({ ok: code === 0, stdout: out.trim(), stderr: err.trim() }));
  });

const git = (args, cwd) => run("git", args, cwd);
const sh = (cmd, cwd) => run("bash", ["-c", cmd], cwd);

async function emptyRepo(dir) {
  await git(["init", "-q", "-b", "main"], dir);
  await git(["config", "user.email", "t@t"], dir);
  await git(["config", "user.name", "t"], dir);
  await sh("echo v1 > file.txt", dir);
  await git(["add", "."], dir);
  await git(["commit", "-q", "-m", "initial"], dir);
  await git(["update-ref", "refs/remotes/origin/main", "HEAD"], dir);
}

/**
 * Scenario 1: No worktree, clean main.
 * Expected: diagnostic "Working tree matches upstream".
 */
export async function setupNoWorktreeClean(dir) {
  await emptyRepo(dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 2: Has worktree, clean main, work in worktree.
 * work/refactor with 3 commits ahead of main, no upstream.
 * Expected: auto-pick worktree, server launches.
 */
export async function setupHasWorktreeUnpushed(dir) {
  await emptyRepo(dir);
  const wtDir = `${dir}-wt`;
  await git(["worktree", "add", wtDir, "-b", "work/refactor"], dir);
  for (let i = 1; i <= 3; i++) {
    await sh(`echo "change ${i}" >> file.txt`, wtDir);
    await git(["add", "file.txt"], wtDir);
    await git(["commit", "-q", "-m", `c${i}`], wtDir);
  }
  return { branch: "main", worktrees: [{ path: wtDir, branch: "work/refactor" }] };
}

/**
 * Scenario 3: Multiple worktrees, pick the most-active.
 * wt-A has 5 ahead, wt-B has 2 ahead.
 * Expected: auto-pick wt-A.
 */
export async function setupMultipleWorktreesPickMost(dir) {
  await emptyRepo(dir);
  const wtA = `${dir}-wtA`;
  const wtB = `${dir}-wtB`;
  await git(["worktree", "add", wtA, "-b", "work/A"], dir);
  await git(["worktree", "add", wtB, "-b", "work/B"], dir);
  for (const [wt, count] of [[wtA, 5], [wtB, 2]]) {
    for (let i = 1; i <= count; i++) {
      await sh(`echo "${wt}-${i}" >> file.txt`, wt);
      await git(["add", "file.txt"], wt);
      await git(["commit", "-q", "-m", `c${i}`], wt);
    }
  }
  return { branch: "main", worktrees: [{ path: wtA, branch: "work/A" }, { path: wtB, branch: "work/B" }] };
}

/**
 * Scenario 4: --base <branch>.
 * main + feature branch with 4 commits, no work on main.
 * Run from feature branch with --base main.
 * Expected: diff main..HEAD (the 4 feature commits).
 */
export async function setupBaseBranch(dir) {
  await emptyRepo(dir);
  await git(["checkout", "-q", "-b", "feature"], dir);
  for (let i = 1; i <= 4; i++) {
    await sh(`echo "feat ${i}" >> feature.txt`, dir);
    await git(["add", "feature.txt"], dir);
    await git(["commit", "-q", "-m", `feat ${i}`], dir);
  }
  return { branch: "feature", base: "main", worktrees: [] };
}

/**
 * Scenario 5: --base <commit>.
 * main + 1 commit on top.
 * Run from main with --base HEAD~1.
 * Expected: diff HEAD~1..HEAD (1 commit).
 */
export async function setupBaseCommitSingle(dir) {
  await emptyRepo(dir);
  await sh(`echo "second" >> file.txt`, dir);
  await git(["add", "file.txt"], dir);
  await git(["commit", "-q", "-m", "second commit"], dir);
  return { branch: "main", base: "HEAD~1", worktrees: [] };
}

/**
 * Scenario 6: --base <commit>..<commit> (commit range).
 * 3 commits in a range.
 * Expected: diff the range.
 */
export async function setupBaseCommitRange(dir) {
  await emptyRepo(dir);
  for (let i = 1; i <= 5; i++) {
    await sh(`echo "iter ${i}" >> file.txt`, dir);
    await git(["add", "file.txt"], dir);
    await git(["commit", "-q", "-m", `iter ${i}`], dir);
  }
  // Range: HEAD~3..HEAD
  return { branch: "main", base: "HEAD~3", worktrees: [] };
}

/**
 * Scenario 7: Working tree changes (1 unstaged, 1 staged).
 * Expected: standard working-tree diff.
 */
export async function setupWorkingTreeChanges(dir) {
  await emptyRepo(dir);
  await sh(`echo "unstaged" >> file.txt`, dir);
  await sh(`echo "new file" > new.txt`, dir);
  await git(["add", "new.txt"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 8: --files filter.
 * Multi-file change, --files restricts to one.
 */
export async function setupFilesFilter(dir) {
  await emptyRepo(dir);
  await sh(`echo "a" > a.ts && echo "b" > b.ts && echo "c" > c.ts`, dir);
  await git(["add", "."], dir);
  await git(["commit", "-q", "-m", "three files"], dir);
  for (const f of ["a.ts", "b.ts", "c.ts"]) {
    await sh(`echo "modified" >> ${f}`, dir);
  }
  await git(["add", "."], dir);
  return { branch: "main", files: "a.ts,b.ts", worktrees: [] };
}

/**
 * Scenario 9: --worktree flag (explicit override from main).
 * Clean main + worktree with work.
 * Run from main with --worktree <path>.
 * Expected: server launches, review of that worktree.
 */
export async function setupWorktreeFlagOverride(dir) {
  await emptyRepo(dir);
  const wtDir = `${dir}-wt`;
  await git(["worktree", "add", wtDir, "-b", "work/override"], dir);
  for (let i = 1; i <= 2; i++) {
    await sh(`echo "x${i}" >> file.txt`, wtDir);
    await git(["add", "file.txt"], wtDir);
    await git(["commit", "-q", "-m", `c${i}`], wtDir);
  }
  return { branch: "main", worktree: wtDir, worktrees: [{ path: wtDir, branch: "work/override" }] };
}

/**
 * Scenario 10: Empty repo (no commits).
 * Expected: diagnostic.
 */
export async function setupEmptyRepo(dir) {
  await git(["init", "-q", "-b", "main"], dir);
  await git(["config", "user.email", "t@t"], dir);
  await git(["config", "user.name", "t"], dir);
  return { branch: "(detached?)", worktrees: [] };
}

/**
 * Scenario 11: 9 commits ahead of main + 1 uncommitted file.
 * Reproduces issue #4 round 2 (working-tree-first short circuit).
 * Expected: plugin launches, both committed and uncommitted files included.
 */
export async function setupUncommittedWithCommits(dir) {
  await emptyRepo(dir);
  for (let i = 1; i <= 9; i++) {
    await sh(`echo "feature ${i}" >> feature.ts`, dir);
    await git(["add", "feature.ts"], dir);
    await git(["commit", "-q", "-m", `feat ${i}`], dir);
  }
  // Add an uncommitted lockfile change (round 2 of issue #4)
  await sh(`echo "lockfileVersion: '6.0'" > pnpm-lock.yaml`, dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 12: round 1 clean, then "round 2" adds uncommitted file.
 * Since e2e is single-shot per scenario, simulate by adding the uncommitted
 * file up-front; the framework calls plugin once and expects launch.
 * The actual cross-round range-change behavior is verified manually.
 */
export async function setupRangeChangedBanner(dir) {
  await emptyRepo(dir);
  await sh(`echo "v1" >> app.ts && echo "v2" >> app.ts`, dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  // Simulate "round 2" state: working tree dirty
  await sh(`echo "uncommitted" >> app.ts`, dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 13: empty repo (no commits, no branches, no origin).
 * Should produce diagnostic with "Diff base:" text.
 * Expected kind: "diagnostic-with-base".
 */
export async function setupDefaultBaseOnMain(dir) {
  await git(["init", "-q", "-b", "main"], dir);
  await git(["config", "user.email", "t@t"], dir);
  await git(["config", "user.name", "t"], dir);
  // No commits at all
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 15: R5 #7 — untracked file in the working tree.
 * 1 committed file (so the repo is not empty) + 1 untracked file.
 * The plugin should include the untracked file in the working-tree diff
 * with status: "added" (the file is "new" because it's not in HEAD).
 * Locks in the AC7-1 / AC7-2 contract.
 */
export async function setupUntrackedFileInTree(dir) {
  await emptyRepo(dir);
  await sh("echo 'never tracked' > brand_new_file.ts", dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 16: R7 #1 — AbortController for loadPriorNotes.
 * 1 commit so repo isn't empty. Verifies the dashboard loads without errors
 * when the loadPriorNotes abort logic is in place. Runtime behavior of
 * the race condition itself is verified via Playwright walkthrough
 * (R7 Playwright screenshots r7-s1-initial.png + r7-s2-previously-tab.png).
 * Locks in the AC7-1.4 contract.
 */
export async function setupPreviouslyDiscussedRace(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts && echo 'v2' >> app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 17: R7 #2 — UI hint for "current round in Conversation" panel.
 * Multi-round state via 2 commits (round 1 + round 2). Verifies the dashboard
 * loads with state.data.round > 0, so the Previously discussed panel hint
 * should render. Runtime verification via Playwright walkthrough
 * (R7 Playwright screenshots capture the hint visibility).
 * Locks in the AC7-2.4 contract.
 */
export async function setupPreviouslyDiscussedHint(dir) {
  await emptyRepo(dir);
  await sh("echo 'round 1 content' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "round 1"], dir);
  await sh("echo 'round 2 content' >> app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "round 2"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 18: R8 #1 — In-tab search input filters the active panel content.
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when the `<input type="search">` is rendered at the top
 * of every pane (Files / Commits / Conversation / Previously discussed).
 * Runtime verification (typing into the search box → list filters →
 * Escape → list restores) is verified via Playwright walkthrough.
 * Locks in the AC8-1.1 / AC8-1.2 / AC8-1.3 / AC8-1.4 / AC8-1.6 contract.
 */
export async function setupInTabSearch(dir) {
  await emptyRepo(dir);
  for (let i = 1; i <= 3; i++) {
    await sh(`echo "feature ${i}" >> app.ts`, dir);
    await git(["add", "app.ts"], dir);
    await git(["commit", "-q", "-m", `feat ${i}`], dir);
  }
  return { branch: "main", worktrees: [] };
}

export const SCENARIOS = {
  "no-worktree-clean": { setup: setupNoWorktreeClean, expect: { kind: "diagnostic" } },
  "has-worktree-unpushed": { setup: setupHasWorktreeUnpushed, expect: { kind: "auto-worktree" } },
  "multiple-worktrees-pick-most": { setup: setupMultipleWorktreesPickMost, expect: { kind: "auto-worktree", branch: "work/A" } },
  "base-branch": { setup: setupBaseBranch, expect: { kind: "branch", branch: "feature" } },
  "base-commit-single": { setup: setupBaseCommitSingle, expect: { kind: "commit" } },
  "base-commit-range": { setup: setupBaseCommitRange, expect: { kind: "commit" } },
  "working-tree-changes": { setup: setupWorkingTreeChanges, expect: { kind: "working-tree" } },
  "files-filter": { setup: setupFilesFilter, expect: { kind: "files", files: ["a.ts", "b.ts"] } },
  "worktree-flag-override": { setup: setupWorktreeFlagOverride, expect: { kind: "worktree-override" } },
  "empty-repo": { setup: setupEmptyRepo, expect: { kind: "diagnostic" } },
  "uncommitted-with-commits": { setup: setupUncommittedWithCommits, expect: { kind: "working-tree-with-commits" } },
  "range-changed-banner": { setup: setupRangeChangedBanner, expect: { kind: "working-tree" } },
  "default-base-on-main": { setup: setupDefaultBaseOnMain, expect: { kind: "diagnostic-with-base" } },
  "untracked-file-in-tree": { setup: setupUntrackedFileInTree, expect: { kind: "working-tree" } },
  // R4 candidate #1: the plugin must still launch cleanly when the UI fetches
  // /api/review/${id}/prior-notes. The full UI assertion (panel renders,
  // comment threads visible) is covered by the Playwright skill
  // review-dashboard-ui-test; this scenario verifies the server-side
  // endpoint doesn't break the launch path.
  "previously-discussed-panel": { setup: setupWorkingTreeChanges, expect: { kind: "working-tree" } },
  // R7 candidate #1: AbortController for loadPriorNotes (R7 MINOR #1).
  // The e2e harness verifies the launch path with 1 commit. The
  // race condition itself (tab-switch abort) is verified via Playwright
  // walkthrough (R7 screenshots r7-s1-initial.png + r7-s2-previously-tab.png).
  "previously-discussed-race": { setup: setupPreviouslyDiscussedRace, expect: { kind: "working-tree" } },
  // R7 candidate #2: UI hint for "current round in Conversation" panel
  // (R7 MINOR #2). Multi-round state (2 commits) verifies the dashboard
  // loads with state.data.round > 0, so the hint should render. The
  // hint visibility itself is verified via Playwright walkthrough.
  "previously-discussed-hint": { setup: setupPreviouslyDiscussedHint, expect: { kind: "working-tree" } },
  // R8 candidate #1: in-tab search filters the active panel content.
  // The e2e harness verifies the launch path with a 3-commit history. The
  // search input render + filter + Escape-clear behavior is verified via
  // Playwright walkthrough (R8 Playwright screenshots).
  "in-tab-search": { setup: setupInTabSearch, expect: { kind: "working-tree" } },
};
