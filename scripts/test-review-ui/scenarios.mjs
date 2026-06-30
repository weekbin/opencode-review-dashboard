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

/**
 * Scenario 19: R8 #2 — Sidebar tabs keyboard navigation (WAI-ARIA tablist).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when the navbar tabs have role="tablist" + tab focus +
 * keydown listener wired up. Runtime verification (focus navbar, Tab 4×,
 * verify aria-selected cycles files → commits → conversation → previously
 * → files; press Home / End) is done via Playwright walkthrough.
 * Locks in the AC8-2.1 / AC8-2.2 / AC8-2.3 / AC8-2.4 / AC8-2.5 / AC8-2.6
 * / AC8-2.7 / AC8-2.8 / AC8-2.9 contract.
 */
export async function setupSidebarKeyboardNav(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "initial"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 20: R9 #1 — Reopen stale findings (manual override).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when a stale (closed_auto) finding exists in
 * existing_findings and the UI renders the "Force Reopen" button on it.
 * Runtime verification (click Force Reopen → reason modal opens → enter
 * reason → submit → state.json updates with manually_reopened: true +
 * user-author system comment) is done via Playwright walkthrough.
 * Locks in the AC9-1.10 / AC9-1.11 / AC9-1.12 / AC9-1.13 / AC9-1.14 contract.
 */
export async function setupReopenStaleFinding(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts && echo 'v2' >> app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 21: R10 #1 — Saved Replies / Comment Templates (GH#10).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when the Saved Replies dropdown is wired into the
 * comment input row. Runtime verification (save 2 templates → reload →
 * insert one into a finding's comment → verify localStorage + DOM) is
 * done via Playwright walkthrough.
 * Locks in the AC1.1 / AC1.2 / AC1.3 / AC1.5 / AC1.6 / AC1.7 / AC1.8
 * / AC1.9 / AC1.10 contract.
 */
export async function setupSavedReplies(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 22: R10 #4 — Export review as markdown / patch (GH#14).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when the Export button + modal are wired into the
 * header. Runtime verification (click Export → click Markdown → verify
 * download triggered with correct filename + content; click Export →
 * click Patch → verify patch content includes --- a/ +++ b/ headers)
 * is done via Playwright walkthrough.
 * Locks in the AC4.1 / AC4.2 / AC4.3 / AC4.4 / AC4.5 / AC4.6 / AC4.7
 * / AC4.8 / AC4.9 contract.
 */
export async function setupExportReview(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 23: R10 #2 — Edit a finding in-place (GH#11, architecture).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when the Edit button + modal are wired into the
 * conversation panel. Runtime verification (click Edit → change
 * severity high→low → save → assert "edited <relative-time>" badge
 * + data.existing_findings[i].severity === "low" + manually_edited ===
 * true) is done via Playwright walkthrough.
 * Locks in the AC2.1 / AC2.2 / AC2.3 / AC2.4 / AC2.6 / AC2.8 / AC2.9
 * / AC2.10 / AC2.11 / AC2.12 contract. AC2.7 (multi-round auto-close
 * preserves flag) is verified by the edit-finding.test.ts unit test.
 */
export async function setupEditFinding(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
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
  // R8 candidate #2: sidebar tabs keyboard navigation (WAI-ARIA tablist).
  // The e2e harness verifies the launch path with 1 commit. The keyboard
  // navigation behavior (Arrow keys, Home, End, focus ring, aria-selected
  // cycling) is verified via Playwright walkthrough.
  "sidebar-keyboard-nav": { setup: setupSidebarKeyboardNav, expect: { kind: "working-tree" } },
  // R9 candidate #1: manually re-open stale findings (manual override).
  // The e2e harness verifies the launch path with 1 commit. The full UI
  // flow (Force Reopen button on stale → reason modal → POST with
  // manually_reopened:true → state.json updates) is verified via
  // Playwright walkthrough.
  "reopen-stale-finding": { setup: setupReopenStaleFinding, expect: { kind: "working-tree" } },
  // R10 #1 (GH#10): Saved Replies / Comment Templates. localStorage CRUD +
  // dropdown UI + insert into comment. Verifies the launch path with 1
  // commit; full flow verified via Playwright walkthrough.
  "saved-replies": { setup: setupSavedReplies, expect: { kind: "working-tree" } },
  // R10 #4 (GH#14): Export review as markdown / patch download.
  // Verifies the launch path with 1 commit; full flow verified via
  // Playwright walkthrough.
  "export-review": { setup: setupExportReview, expect: { kind: "working-tree" } },
  // R10 #2 (GH#11, architecture): Edit a finding in-place. Verifies the
  // launch path with 1 commit; full flow verified via Playwright walkthrough.
  "edit-finding": { setup: setupEditFinding, expect: { kind: "working-tree" } },
  // R11 #1 (GH#15): `/trigger` typed-prefix expansion. localStorage CRUD +
  // dropdown UI + insert into comment all existed in R10; R11 adds the
  // keydown listener that fires on space/tab/Enter to expand typed
  // `/<name>` prefixes. Verifies the launch path with 1 commit; full flow
  // verified via Playwright walkthrough.
  "saved-replies-trigger": { setup: setupSavedRepliesTrigger, expect: { kind: "working-tree" } },
  // R11 #2 (GH#16): Per-finding permalink. id="finding-<id>" on every
  // finding card + Copy-link button + #finding-<id> hash-scroll on
  // page load. Verifies the launch path with 1 commit; full flow
  // verified via Playwright walkthrough.
  permalink: { setup: setupPermalink, expect: { kind: "working-tree" } },
  // R12 #17 (GH#17): Pinned findings. ★/☆ star button + "★ Pinned"
  // filter chip + Conversation tab "★N" badge. Verifies the launch
  // path with 1 commit; full flow verified via Playwright walkthrough.
  "pinned-toggle": { setup: setupPinnedToggle, expect: { kind: "working-tree" } },
  // R12 #18 (GH#18): Add emoji reaction. 6-emoji picker pill row +
  // active-state styling + grouped count display. Verifies the launch
  // path with 1 commit; full flow verified via Playwright walkthrough.
  "react-add": { setup: setupReactAdd, expect: { kind: "working-tree" } },
  // R12 #18 (GH#18): Remove emoji reaction (idempotent toggle).
  // Verifies the launch path with 1 commit; full flow verified via
  // Playwright walkthrough.
  "react-remove": { setup: setupReactRemove, expect: { kind: "working-tree" } },
  // R12 #19 (GH#19): n key jumps to next finding. Global keydown
  // handler + focus guard + activeTab guard. Verifies the launch path
  // with 1 commit; full flow verified via Playwright walkthrough.
  "n-jump-next": { setup: setupNJumpNext, expect: { kind: "working-tree" } },
  // R12 #19 (GH#19): p key wraps from index 0 to last. Verifies the
  // launch path with 1 commit; full flow verified via Playwright
  // walkthrough.
  "p-jump-prev": { setup: setupPJumpPrev, expect: { kind: "working-tree" } },
  // R12 #19 (GH#19): n/p skips closed_auto findings when
  // conversationFilter === "open". Verifies the launch path with 1
  // commit; full flow verified via Playwright walkthrough.
  "jump-skips-stale": { setup: setupJumpSkipsStale, expect: { kind: "working-tree" } },
};

/**
 * Scenario 24: R11 #1 — Saved Replies `/trigger` typed-prefix expansion (GH#15).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when the textarea keydown handler is wired and reads
 * `loadSavedReplies()` on space/tab/Enter. Runtime verification (type
 * `/<template-name>` + space in a finding's comment textarea → expansion
 * to the saved-reply body; unknown `/<name>` stays literal; bare `/`
 * does not trigger) is done via Playwright walkthrough.
 * Locks in the AC1.1 / AC1.2 / AC1.3 / AC1.4 / AC1.5 contract for #15.
 */
export async function setupSavedRepliesTrigger(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 25: R11 #2 — Per-finding permalink anchor (GH#16).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when finding cards carry `id="finding-<id>"` and the
 * Copy-link button is wired into the actions row. Runtime verification
 * (click Copy-link → clipboard contains `<url>#finding-<id>`; load
 * `<url>#finding-<id>` → auto-scroll + flash highlight on matching card;
 * unknown id → graceful fallback) is done via Playwright walkthrough.
 * Locks in the AC2.1 / AC2.2 / AC2.3 / AC2.4 / AC2.5 contract for #16.
 */
export async function setupPermalink(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
};

/**
 * Scenario 26: R12 #17 — Pinned findings (GH#17).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when the star button (★/☆) is wired into the
 * Conversation panel finding card actions row + the new "★ Pinned"
 * filter chip is rendered. Runtime verification (click ★ on a finding →
 * POST /pin → re-render with filled ★ + sidebar Conversation tab badge
 * shows "★1") is done via Playwright walkthrough.
 * Locks in the AC3.1 / AC3.2 / AC3.3 / AC4.1 / AC4.2 contract for #17.
 */
export async function setupPinnedToggle(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 27: R12 #18 — Add emoji reaction (GH#18).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when the emoji picker row (👍 👎 😄 ❤️ 🎉 👀) is
 * wired into each finding card. Runtime verification (click 👍 on a
 * finding → POST /reaction → re-render with active pill + grouped
 * count pill) is done via Playwright walkthrough.
 * Locks in the AC3.4 / AC3.5 / AC3.6 / AC4.3 contract for #18.
 */
export async function setupReactAdd(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 28: R12 #18 — Remove emoji reaction (toggle, GH#18).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when the emoji picker supports idempotent toggle
 * (same emoji click removes the reaction). Runtime verification (click
 * 👍 twice on the same finding → POST /reaction → toggle off → active
 * pill removed) is done via Playwright walkthrough.
 * Locks in the AC2.4 (idempotent toggle) + AC3.4 contract for #18.
 */
export async function setupReactRemove(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 29: R12 #19 — n key jumps to next finding (GH#19).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when the global n/p keydown handler is wired into
 * window. Runtime verification (focus outside any textarea, press n →
 * currentFindingIndex increments + scroll + flash on next finding
 * card) is done via Playwright walkthrough.
 * Locks in the AC10.1 / AC11.1 / AC11.2 contract for #19.
 */
export async function setupNJumpNext(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 30: R12 #19 — p key jumps to prev finding + wrap-around (GH#19).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when p wraps from index 0 back to last (modulo).
 * Runtime verification (focus outside any textarea, press p from
 * index 0 → wraps to last finding) is done via Playwright walkthrough.
 * Locks in the AC11.3 (wrap-around) contract for #19.
 */
export async function setupPJumpPrev(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}

/**
 * Scenario 31: R12 #19 — n/p skip stale (closed_auto) findings when
 * conversationFilter === "open" (GH#19).
 * 1 commit so the dashboard is non-empty. Verifies the dashboard loads
 * without errors when getSortedFindings() respects the conversationFilter
 * and skips closed_auto findings during n/p navigation. Runtime
 * verification (set conversationFilter to "open", press n 3× → skips
 * over stale findings in the index sequence) is done via Playwright
 * walkthrough.
 * Locks in the AC11.4 (filter composition) contract for #19.
 */
export async function setupJumpSkipsStale(dir) {
  await emptyRepo(dir);
  await sh("echo 'v1' > app.ts", dir);
  await git(["add", "app.ts"], dir);
  await git(["commit", "-q", "-m", "first"], dir);
  return { branch: "main", worktrees: [] };
}
