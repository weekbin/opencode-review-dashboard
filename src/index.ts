import { type Plugin, tool } from "@opencode-ai/plugin";
import path from "node:path";
import { readState, saveState, writeFileAtomic } from "./state-store";

const command = "diff-review-dashboard";
const name = "diff_review_dashboard";
const categories = ["recommend", "bug", "style", "perf", "question"] as const;
const severities = ["medium", "high", "low"] as const;
const sides = ["additions", "deletions"] as const;

type Category = (typeof categories)[number];
type Severity = (typeof severities)[number];
type Side = (typeof sides)[number];

type Anchor = {
  before: string;
  selected: string;
  after: string;
};

type FindingComment = {
  id: string;
  author: "user" | "agent";
  text: string;
  created_at: number;
};

type Finding = {
  id: string;
  round: number;
  file: string;
  side: Side;
  start_line: number;
  end_line: number;
  category: Category;
  severity: Severity;
  comment: string;
  status: "open" | "closed_auto" | "resolved";
  anchor: Anchor;
  kind: "line" | "file";
  created_at: number;
  updated_at: number;
  closed_at?: number;
  close_reason?: "file_removed" | "anchor_missing";
  comments?: FindingComment[];
};

type DraftFinding = {
  id?: string;
  file: string;
  side: Side;
  start_line: number;
  end_line: number;
  category: Category;
  severity: Severity;
  comment: string;
  kind?: "line" | "file";
};

type Draft = {
  notes: string;
  new_findings: DraftFinding[];
};

type CommentInput = {
  finding_id?: string;
  text?: string;
  author?: "user" | "agent";
};

type State = {
  session_id: string;
  round: number;
  findings: Finding[];
  draft?: Draft;
  diff_base?: DiffBase;
  previous_diff_base?: DiffBase;
  updated_at: number;
};

type ReviewFile = {
  path: string;
  status: "added" | "deleted" | "modified";
  additions: number;
  deletions: number;
  before: string;
  after: string;
};

type CommitInfo = {
  sha: string;
  short_sha: string;
  message: string;
  author: string;
  date: string;
  round?: number;
  files: string[];
};

type SourceFile = {
  file: string;
  status: "added" | "deleted" | "modified";
  before: string;
  after: string;
  additions: number;
  deletions: number;
};

type DiffSource = "working" | "base";

type DiffBase = {
  type: "explicit" | "auto" | "working_only" | "empty";
  from: string;
  to: "HEAD" | "working";
  resolved: string;
  sources: DiffSource[];
};

type CollectedFile = SourceFile & { source: DiffSource };

type Launch = {
  id: string;
  session_id: string;
  repo_root: string;
  scope_root: string;
  round: number;
  files: ReviewFile[];
  commits?: CommitInfo[];
  existing_findings: Finding[];
  draft: Draft;
  taxonomy: {
    categories: Category[];
    severities: Severity[];
  };
  filter?: string[];
  base?: string;
  auto_base?: string;
  auto_worktree?: string;
  auto_worktree_branch?: string;
  current_branch?: string;
  is_worktree?: boolean;
  diff_base?: DiffBase;
  previous_diff_base?: DiffBase;
  range_changed_from_last_round?: boolean;
};

type Submit = {
  notes?: string;
  new_findings?: DraftFinding[];
};

type Done = {
  cancelled: boolean;
  round: number;
  notes: string;
  findings: Finding[];
  json_path: string;
  md_path: string;
  url: string;
  opened: boolean;
  state_file: string;
};

function usage() {
  return `Usage: /${command} [--base origin/dev] [--files path/to/a.ts,path/to/b.ts] [--worktree /path/to/worktree]`;
}

function isCategory(input: string): input is Category {
  return categories.includes(input as Category);
}

function isSeverity(input: string): input is Severity {
  return severities.includes(input as Severity);
}

function isSide(input: string): input is Side {
  return sides.includes(input as Side);
}

function parse(raw: string | undefined) {
  if (!raw?.trim()) {
    return {
      files: undefined as string[] | undefined,
      base: undefined as string | undefined,
      worktree: undefined as string | undefined,
      error: undefined as string | undefined,
    };
  }

  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  let files: string[] | undefined;
  let base: string | undefined;
  let worktree: string | undefined;

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (!token) continue;
    const next = tokens[index + 1];

    if (token === "--files" || token.startsWith("--files=")) {
      const value = token.startsWith("--files=") ? token.slice("--files=".length) : next;
      if (!value || value.startsWith("--")) {
        return {
          files: undefined,
          base: undefined,
          worktree: undefined,
          error: `--files expects a comma-separated list.\n${usage()}`,
        };
      }

      const parsed = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (parsed.length === 0) {
        return {
          files: undefined,
          base: undefined,
          worktree: undefined,
          error: `--files expects a comma-separated list.\n${usage()}`,
        };
      }

      files = parsed;
      if (token === "--files") index++;
      continue;
    }

    if (token === "--base" || token.startsWith("--base=")) {
      const value = token.startsWith("--base=") ? token.slice("--base=".length) : next;
      if (!value || value.startsWith("--")) {
        return {
          files: undefined,
          base: undefined,
          worktree: undefined,
          error: `--base expects a branch, tag, or ref name.\n${usage()}`,
        };
      }

      base = value;
      if (token === "--base") index++;
      continue;
    }

    if (token === "--worktree" || token.startsWith("--worktree=")) {
      const value = token.startsWith("--worktree=") ? token.slice("--worktree=".length) : next;
      if (!value || value.startsWith("--")) {
        return {
          files: undefined,
          base: undefined,
          worktree: undefined,
          error: `--worktree expects a path.\n${usage()}`,
        };
      }

      worktree = value;
      if (token === "--worktree") index++;
      continue;
    }

    return {
      files: undefined,
      base: undefined,
      worktree: undefined,
      error: `Unsupported argument: ${token}\n${usage()}`,
    };
  }

  return {
    files,
    base,
    worktree,
    error: undefined,
  };
}

function normalize(start: number, end: number) {
  if (start <= end) return { start, end };
  return { start: end, end: start };
}

function anchor(content: string, start: number, end: number): Anchor {
  const range = normalize(start, end);
  const lines = content.split("\n");
  const begin = Math.max(1, Math.min(range.start, lines.length || 1));
  const finish = Math.max(begin, Math.min(range.end, lines.length || begin));
  return {
    before: lines[begin - 2] ?? "",
    selected: lines.slice(begin - 1, finish).join("\n"),
    after: lines[finish] ?? "",
  };
}

function remap(item: Finding, file: ReviewFile) {
  const text = item.side === "deletions" ? file.before : file.after;
  if (!item.anchor.selected) return undefined;
  const index = text.indexOf(item.anchor.selected);
  if (index < 0) return undefined;
  const prefix = text.slice(0, index);
  const start = prefix.split("\n").length;
  const size = Math.max(1, item.anchor.selected.split("\n").length);
  return {
    start_line: start,
    end_line: start + size - 1,
  };
}

function reconcile(files: ReviewFile[], findings: Finding[]) {
  const now = Date.now();
  const map = new Map(files.map((file) => [file.path, file]));
  return findings.map((item) => {
    if (item.status !== "open") return item;
    const file = map.get(item.file);
    if (!file) {
      return {
        ...item,
        status: "closed_auto" as const,
        close_reason: "file_removed" as const,
        closed_at: now,
        updated_at: now,
      };
    }
    if (item.kind === "file") {
      return { ...item, updated_at: now };
    }
    const next = remap(item, file);
    if (!next) {
      return {
        ...item,
        status: "closed_auto" as const,
        close_reason: "anchor_missing" as const,
        closed_at: now,
        updated_at: now,
      };
    }
    return {
      ...item,
      start_line: next.start_line,
      end_line: next.end_line,
      updated_at: now,
    };
  });
}

function sanitize(items: DraftFinding[], round: number, files: Map<string, ReviewFile>) {
  const now = Date.now();
  return items.flatMap((item, index) => {
    if (typeof item.file !== "string" || !item.file) return [];
    if (typeof item.comment !== "string" || !item.comment.trim()) return [];
    if (!isSide(item.side)) return [];
    if (!isCategory(item.category)) return [];
    if (!isSeverity(item.severity)) return [];
    if (!Number.isFinite(item.start_line) || !Number.isFinite(item.end_line)) return [];

    const file = files.get(item.file);
    if (!file) return [];

    const kind: "line" | "file" = item.kind === "file" ? "file" : "line";

    const start_line =
      kind === "file" ? 0 : Math.max(1, Math.floor(Math.min(item.start_line, item.end_line)));
    const end_line =
      kind === "file"
        ? 0
        : Math.max(start_line, Math.floor(Math.max(item.start_line, item.end_line)));

    let next: Anchor;
    if (kind === "file") {
      const fullSource = file.after || file.before;
      next = {
        before: "",
        selected: fullSource.slice(0, Math.min(200, fullSource.length)),
        after: "",
      };
    } else {
      const source = item.side === "deletions" ? file.before : file.after;
      next = anchor(source, start_line, end_line);
      if (!next.selected.trim()) return [];
    }

    const id =
      item.id?.trim() || `finding_${round}_${index + 1}_${crypto.randomUUID().slice(0, 6)}`;

    return [
      {
        id,
        round,
        file: item.file,
        side: item.side,
        start_line,
        end_line,
        category: item.category,
        severity: item.severity,
        comment: item.comment.trim(),
        status: "open" as const,
        anchor: next,
        kind,
        created_at: now,
        updated_at: now,
      },
    ];
  });
}

function format(result: Done) {
  if (result.cancelled) {
    return JSON.stringify({
      round: result.round,
      cancelled: true,
      url: result.url,
      relaunch: `/${command}`,
    });
  }

  const open = result.findings.filter((item) => item.status === "open");
  const by_severity: Record<string, number> = { high: 0, medium: 0, low: 0 };
  const by_category: Record<string, number> = {};
  for (const f of open) {
    by_severity[f.severity] = (by_severity[f.severity] ?? 0) + 1;
    by_category[f.category] = (by_category[f.category] ?? 0) + 1;
  }
  const findings = open.map((f) => ({
    id: f.id,
    severity: f.severity,
    category: f.category,
    file: f.file,
    start_line: f.start_line,
    end_line: f.end_line,
    side: f.side,
    comment: f.comment,
  }));

  return JSON.stringify({
    round: result.round,
    cancelled: false,
    open_count: open.length,
    by_severity,
    by_category,
    notes: result.notes ?? "",
    findings,
    artifacts: {
      json: result.json_path,
      markdown: result.md_path,
      state: result.state_file,
    },
  });
}

function markdown(input: {
  session_id: string;
  round: number;
  notes: string;
  findings: Finding[];
  filter?: string[];
  base?: string;
}) {
  const list = input.findings
    .map((item) => {
      let line = `- [${item.status}] [${item.severity}] [${item.category}] ${item.file}:${item.start_line}-${item.end_line} (${item.side}) - ${item.comment}`;
      if (item.comments?.length) {
        const replies = item.comments.map((c) => `    - [${c.author}] ${c.text}`).join("\n");
        line += "\n" + replies;
      }
      return line;
    })
    .join("\n");
  const notes = input.notes || "(none)";
  const files = input.filter?.length ? input.filter.join(", ") : "all changed files";
  const source = input.base ? `${input.base}...HEAD` : "working tree";
  return [
    `# Diff Review Round ${input.round}`,
    "",
    `- Session: ${input.session_id}`,
    `- Diff source: ${source}`,
    `- Scope: ${files}`,
    `- Timestamp: ${new Date().toISOString()}`,
    "",
    "## Notes",
    notes,
    "",
    "## Findings",
    list || "- none",
  ].join("\n");
}

function open(url: string, options?: { cwd?: string }) {
  if (process.platform === "darwin") {
    const bin = Bun.which("open");
    if (!bin) return false;
    Bun.spawn([bin, url], { stdout: "ignore", stderr: "ignore", cwd: options?.cwd });
    return true;
  }

  if (process.platform === "win32") {
    const bin = Bun.which("cmd");
    if (!bin) return false;
    Bun.spawn([bin, "/c", "start", "", url], {
      stdout: "ignore",
      stderr: "ignore",
      cwd: options?.cwd,
    });
    return true;
  }

  const bin = Bun.which("xdg-open");
  if (!bin) return false;
  Bun.spawn([bin, url], { stdout: "ignore", stderr: "ignore", cwd: options?.cwd });
  return true;
}

function split(text: string) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function defaultState(session_id: string): State {
  return {
    session_id,
    round: 0,
    findings: [],
    updated_at: Date.now(),
  };
}

function count(text: string) {
  if (!text) return 0;
  const lines = text.split("\n");
  if (text.endsWith("\n")) return Math.max(0, lines.length - 1);
  return lines.length;
}

function text(content: string) {
  if (content.includes("\u0000")) return "";
  return content;
}

async function run(cwd: string, args: string[]) {
  const proc = Bun.spawn(args, {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, code] = await Promise.all([
    Bun.readableStreamToText(proc.stdout).catch(() => ""),
    Bun.readableStreamToText(proc.stderr).catch(() => ""),
    proc.exited,
  ]);

  return {
    ok: code === 0,
    stdout,
    stderr,
  };
}

async function repo(cwd: string) {
  const result = await run(cwd, ["git", "rev-parse", "--show-toplevel"]);
  if (!result.ok) {
    return {
      path: "",
      error: result.stderr.trim() || result.stdout.trim() || "failed to resolve git root",
    };
  }

  const path = result.stdout.trim();
  if (!path) {
    return {
      path: "",
      error: "failed to resolve git root",
    };
  }

  return {
    path,
    error: undefined as string | undefined,
  };
}

async function inside(cwd: string) {
  const result = await run(cwd, ["git", "rev-parse", "--is-inside-work-tree"]);
  if (!result.ok) return false;
  return result.stdout.trim() === "true";
}

async function head(cwd: string) {
  const result = await run(cwd, ["git", "rev-parse", "--verify", "HEAD"]);
  return result.ok;
}

type ScopeInfo = {
  current_branch: string;
  is_worktree: boolean;
};

async function scopeInfo(cwd: string): Promise<ScopeInfo> {
  const branch_result = await run(cwd, ["git", "rev-parse", "--abbrev-ref", "HEAD"]);
  const current_branch = branch_result.ok ? branch_result.stdout.trim() : "";
  const git_dir = await run(cwd, ["git", "rev-parse", "--git-dir"]);
  const is_worktree = git_dir.ok ? path.isAbsolute(git_dir.stdout.trim()) : false;
  return { current_branch, is_worktree };
}

type BranchInfo = {
  detached: boolean;
  branch: string;
  upstream: string;
  ahead: number;
  behind: number;
};

async function branchInfo(root: string): Promise<BranchInfo> {
  const branch_result = await run(root, ["git", "rev-parse", "--abbrev-ref", "HEAD"]);
  if (!branch_result.ok) {
    return { detached: true, branch: "", upstream: "", ahead: 0, behind: 0 };
  }
  const branch = branch_result.stdout.trim();
  const detached = branch === "HEAD";

  const upstream_result = await run(root, ["git", "rev-parse", "--abbrev-ref", "@{u}"]);
  const upstream = upstream_result.ok ? upstream_result.stdout.trim() : "";

  let ahead = 0;
  let behind = 0;
  if (upstream) {
    const ahead_result = await run(root, ["git", "rev-list", "--count", "@{u}..HEAD"]);
    if (ahead_result.ok) {
      const parsed = parseInt(ahead_result.stdout.trim(), 10);
      ahead = Number.isFinite(parsed) ? parsed : 0;
    }
    const behind_result = await run(root, ["git", "rev-list", "--count", "HEAD..@{u}"]);
    if (behind_result.ok) {
      const parsed = parseInt(behind_result.stdout.trim(), 10);
      behind = Number.isFinite(parsed) ? parsed : 0;
    }
  }

  return { detached, branch, upstream, ahead, behind };
}

const BASE_CANDIDATES = ["@{u}", "origin/main", "origin/master", "main", "master"] as const;

async function detectMeaningfulBase(root: string): Promise<string | undefined> {
  const head_result = await run(root, ["git", "rev-parse", "--verify", "HEAD"]);
  if (!head_result.ok) return undefined;
  const head_rev = head_result.stdout.trim();
  if (!head_rev) return undefined;

  for (const candidate of BASE_CANDIDATES) {
    const result = await run(root, ["git", "rev-parse", "--verify", candidate]);
    if (!result.ok) continue;
    const candidate_rev = result.stdout.trim();
    if (!candidate_rev || candidate_rev === head_rev) continue;
    return candidate;
  }
  return undefined;
}

type WorktreeListEntry = {
  path: string;
  branch: string;
  detached: boolean;
};

async function isWorktree(root: string): Promise<boolean> {
  const [common, gdir] = await Promise.all([
    run(root, ["git", "rev-parse", "--git-common-dir"]),
    run(root, ["git", "rev-parse", "--git-dir"]),
  ]);
  if (!common.ok || !gdir.ok) return false;
  return text(common.stdout).trim() !== text(gdir.stdout).trim();
}

async function listWorktrees(root: string): Promise<WorktreeListEntry[]> {
  const result = await run(root, ["git", "worktree", "list", "--porcelain"]);
  if (!result.ok) return [];

  const entries: WorktreeListEntry[] = [];
  let current: { path?: string; branch?: string; detached?: boolean } = {};
  const flush = () => {
    if (current.path) {
      entries.push({
        path: current.path,
        branch: current.branch || "",
        detached: !!current.detached,
      });
    }
    current = {};
  };
  for (const line of result.stdout.split("\n")) {
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("worktree ")) {
      current.path = line.slice("worktree ".length).trim();
    } else if (line.startsWith("branch ")) {
      const ref = line.slice("branch ".length).trim();
      current.branch = ref.replace(/^refs\/heads\//, "");
    } else if (line === "detached") {
      current.detached = true;
    }
  }
  flush();
  return entries;
}

type WorktreeAhead = {
  path: string;
  branch: string;
  ahead: number;
  base: string;
};

async function worktreeAheadSummary(
  wtPath: string,
  wtBranch: string,
): Promise<WorktreeAhead | undefined> {
  const upstream = await run(wtPath, ["git", "rev-parse", "--abbrev-ref", "@{u}"]);
  if (upstream.ok) {
    const base = upstream.stdout.trim();
    if (base) {
      const count = await run(wtPath, ["git", "rev-list", "--count", "@{u}..HEAD"]);
      if (count.ok) {
        const ahead = parseInt(count.stdout, 10) || 0;
        const head_rev = (await run(wtPath, ["git", "rev-parse", "HEAD"])).stdout.trim();
        return {
          path: wtPath,
          branch: wtBranch,
          ahead,
          base: `${base} (${head_rev.slice(0, 7)})`,
        };
      }
    }
  }

  for (const candidate of ["main", "master"]) {
    const verify = await run(wtPath, ["git", "rev-parse", "--verify", candidate]);
    if (!verify.ok) continue;
    const count = await run(wtPath, ["git", "rev-list", "--count", `${candidate}..HEAD`]);
    if (!count.ok) continue;
    const ahead = parseInt(count.stdout, 10) || 0;
    if (ahead === 0) continue;
    return {
      path: wtPath,
      branch: wtBranch,
      ahead,
      base: candidate,
    };
  }

  return undefined;
}

async function buildNoChangesDiagnostic(
  repoRoot: string,
  info: BranchInfo,
  diffBase?: DiffBase,
): Promise<string> {
  const lines = ["No git working-tree changes found."];
  lines.push("");
  lines.push(`Repository: ${repoRoot}`);
  lines.push(`Branch: ${info.detached ? "(detached HEAD)" : info.branch || "(unknown)"}`);
  if (info.upstream) {
    lines.push(`Upstream: ${info.upstream} (${info.ahead} ahead, ${info.behind} behind)`);
  } else {
    lines.push("Upstream: (not configured)");
  }
  if (diffBase) {
    const sources = diffBase.sources.length > 0 ? diffBase.sources.join("+") : "(none)";
    const resolved = diffBase.resolved ? diffBase.resolved.slice(0, 12) : "(unresolved)";
    lines.push(
      `Diff base: ${diffBase.type} ${diffBase.from} -> ${diffBase.to} [${sources}] (${resolved})`,
    );
  } else {
    lines.push("Diff base: (unavailable)");
  }
  lines.push("");

  const worktrees = await listWorktrees(repoRoot);
  const otherWorktrees = worktrees.filter((item) => item.path !== repoRoot);
  const worktreeHints: WorktreeAhead[] = [];
  for (const wt of otherWorktrees) {
    const summary = await worktreeAheadSummary(wt.path, wt.branch);
    if (summary && summary.ahead > 0) worktreeHints.push(summary);
  }

  if (worktreeHints.length > 0) {
    lines.push("Other worktrees with unmerged work:");
    for (const wt of worktreeHints) {
      const branch = wt.branch || "(detached)";
      lines.push(`  ${wt.path}  [${branch}]  ${wt.ahead} ahead of ${wt.base}`);
    }
    lines.push("");
    lines.push("Run from one of these worktrees, or pass --worktree <path>.");
  }

  if (info.upstream && info.ahead > 0) {
    lines.push(`You have ${info.ahead} unpushed commit(s) on this branch.`);
    lines.push(`Tip: re-run with --base ${info.upstream} to review them.`);
  } else if (!worktreeHints.length) {
    if (info.upstream) {
      lines.push("Working tree matches upstream. No diff to review.");
    } else {
      lines.push("No upstream tracking branch found.");
      lines.push("Tip: pass --base <ref> to review against a specific base, e.g.");
      lines.push(`  /${command} --base origin/main`);
      lines.push(`  /${command} --base main`);
    }
  }

  return lines.join("\n");
}

function scope(root: string, dir: string) {
  const rel = path.relative(root, dir);
  if (rel.startsWith("..")) return ".";
  if (!rel || rel === ".") return ".";
  return rel;
}

function internal(file: string) {
  return file.startsWith(".opencode/reviews/") || file.includes("/.opencode/reviews/");
}

async function names(root: string, area: string, withHead: boolean) {
  const spec = ["--", area];
  const tracked = withHead
    ? await run(root, ["git", "diff", "--name-only", "--no-renames", "HEAD", ...spec])
    : await run(root, ["git", "ls-files", "--cached", ...spec]);
  if (!tracked.ok) {
    return {
      files: [] as string[],
      error: tracked.stderr.trim() || tracked.stdout.trim() || "failed to list tracked changes",
    };
  }

  const untracked = await run(root, ["git", "ls-files", "--others", "--exclude-standard", ...spec]);
  if (!untracked.ok) {
    return {
      files: [] as string[],
      error: untracked.stderr.trim() || untracked.stdout.trim() || "failed to list untracked files",
    };
  }

  const files = Array.from(new Set([...split(tracked.stdout), ...split(untracked.stdout)])).filter(
    (item) => !internal(item),
  );

  return {
    files,
    error: undefined as string | undefined,
  };
}

async function stats(root: string, area: string, withHead: boolean) {
  const result = new Map<string, { additions: number; deletions: number }>();
  if (!withHead) return result;

  const diff = await run(root, ["git", "diff", "--numstat", "--no-renames", "HEAD", "--", area]);
  if (!diff.ok) return result;

  for (const row of split(diff.stdout)) {
    const [adds, dels, ...rest] = row.split("\t");
    if (!adds || !dels || rest.length === 0) continue;
    const file = rest.join("\t");
    const additions = Number(adds);
    const deletions = Number(dels);
    result.set(file, {
      additions: Number.isFinite(additions) ? additions : 0,
      deletions: Number.isFinite(deletions) ? deletions : 0,
    });
  }

  return result;
}

async function before(root: string, file: string, withHead: boolean) {
  if (!withHead) return "";
  const result = await run(root, ["git", "show", `HEAD:${file}`]);
  if (!result.ok) return "";
  return text(result.stdout);
}

async function after(root: string, file: string) {
  const source = Bun.file(path.join(root, file));
  const exists = await source.exists();
  if (!exists) return "";
  return source
    .text()
    .then(text)
    .catch(() => "");
}

async function at(root: string, rev: string, file: string) {
  const result = await run(root, ["git", "show", `${rev}:${file}`]);
  if (!result.ok) return "";
  return text(result.stdout);
}

async function merge(root: string, base: string) {
  const result = await run(root, ["git", "merge-base", base, "HEAD"]);
  if (!result.ok) {
    return {
      rev: "",
      error:
        result.stderr.trim() || result.stdout.trim() || `failed to resolve merge-base for ${base}`,
    };
  }

  const rev = result.stdout.trim();
  if (!rev) {
    return {
      rev: "",
      error: `failed to resolve merge-base for ${base}`,
    };
  }

  return {
    rev,
    error: undefined as string | undefined,
  };
}

async function branchNames(root: string, area: string, rev: string) {
  const result = await run(root, [
    "git",
    "diff",
    "--name-only",
    "--no-renames",
    `${rev}..HEAD`,
    "--",
    area,
  ]);
  if (!result.ok) {
    return {
      files: [] as string[],
      error: result.stderr.trim() || result.stdout.trim() || "failed to list branch changes",
    };
  }

  return {
    files: split(result.stdout).filter((item) => !internal(item)),
    error: undefined as string | undefined,
  };
}

async function branchStats(root: string, area: string, rev: string) {
  const result = new Map<string, { additions: number; deletions: number }>();
  const diff = await run(root, [
    "git",
    "diff",
    "--numstat",
    "--no-renames",
    `${rev}..HEAD`,
    "--",
    area,
  ]);
  if (!diff.ok) return result;

  for (const row of split(diff.stdout)) {
    const [adds, dels, ...rest] = row.split("\t");
    if (!adds || !dels || rest.length === 0) continue;
    const file = rest.join("\t");
    const additions = Number(adds);
    const deletions = Number(dels);
    result.set(file, {
      additions: Number.isFinite(additions) ? additions : 0,
      deletions: Number.isFinite(deletions) ? deletions : 0,
    });
  }

  return result;
}

async function collectWorking(root: string, dir: string) {
  const area = scope(root, dir);
  const withHead = await head(root);
  const listed = await names(root, area, withHead);
  if (listed.error) {
    return {
      files: [] as SourceFile[],
      error: `Failed to read git diff: ${listed.error}`,
    };
  }

  if (listed.files.length === 0) {
    return {
      files: [] as SourceFile[],
      error: undefined as string | undefined,
    };
  }

  const map = await stats(root, area, withHead);
  const files = await Promise.all(
    listed.files.map(async (file) => {
      const prev = await before(root, file, withHead);
      const next = await after(root, file);
      const stat = map.get(file);
      const status: SourceFile["status"] =
        prev && !next ? "deleted" : !prev && next ? "added" : "modified";
      return {
        file,
        status,
        before: prev,
        after: next,
        additions: stat?.additions ?? (prev ? Math.max(0, count(next) - count(prev)) : count(next)),
        deletions: stat?.deletions ?? Math.max(0, count(prev) - count(next)),
      };
    }),
  );

  return {
    files,
    error: undefined as string | undefined,
  };
}

async function collectBase(root: string, dir: string, base: string) {
  const area = scope(root, dir);
  const merged = await merge(root, base);
  if (merged.error) {
    return {
      files: [] as SourceFile[],
      error: `Failed to resolve --base ${base}: ${merged.error}`,
    };
  }

  const listed = await branchNames(root, area, merged.rev);
  if (listed.error) {
    return {
      files: [] as SourceFile[],
      error: `Failed to read git diff for --base ${base}: ${listed.error}`,
    };
  }

  if (listed.files.length === 0) {
    return {
      files: [] as SourceFile[],
      error: undefined as string | undefined,
    };
  }

  const map = await branchStats(root, area, merged.rev);
  const files = await Promise.all(
    listed.files.map(async (file) => {
      const prev = await at(root, merged.rev, file);
      const next = await at(root, "HEAD", file);
      const stat = map.get(file);
      const status: SourceFile["status"] =
        prev && !next ? "deleted" : !prev && next ? "added" : "modified";
      return {
        file,
        status,
        before: prev,
        after: next,
        additions: stat?.additions ?? (prev ? Math.max(0, count(next) - count(prev)) : count(next)),
        deletions: stat?.deletions ?? Math.max(0, count(prev) - count(next)),
      };
    }),
  );

  return {
    files,
    error: undefined as string | undefined,
  };
}

async function collectCommits(root: string, base: string | undefined): Promise<CommitInfo[]> {
  const range = base && base !== "working_tree" ? `${base}..HEAD` : "HEAD~20..HEAD";
  const sep = "\x1f";
  const record = "\x1e";
  const format = ["%H", "%h", "%s", "%an", "%ad"].join(sep) + "%d";
  const result = await run(root, [
    "git",
    "log",
    `--pretty=format:${record}${format}`,
    "--name-only",
    "--date=short",
    "-n",
    "50",
    range,
  ]);
  if (!result.ok) return [];

  const commits: CommitInfo[] = [];
  for (const block of result.stdout.split(record)) {
    if (!block.trim()) continue;
    const lines = block.split("\n");
    const head = lines[0] ?? "";
    const parts = head.split(sep);
    if (!parts[0]) continue;
    const files: string[] = [];
    for (const fileLine of lines.slice(1)) {
      if (fileLine.trim()) files.push(fileLine.trim());
    }
    commits.push({
      sha: parts[0],
      short_sha: parts[1] ?? "",
      message: parts[2] ?? "",
      author: parts[3] ?? "",
      date: parts[4] ?? "",
      files,
    });
  }
  return commits;
}

type CollectResult = {
  files: CollectedFile[];
  diffBase: DiffBase;
  error?: string;
  autoBase?: string;
  autoWorktree?: string;
  autoWorktreeBranch?: string;
};

async function resolveRev(root: string, ref: string): Promise<string> {
  if (!ref) return "";
  const result = await run(root, ["git", "rev-parse", "--verify", ref]);
  if (!result.ok) return "";
  return result.stdout.trim();
}

async function collectMerged(root: string, dir: string, base?: string): Promise<CollectResult> {
  const emptyBase: DiffBase = {
    type: "empty",
    from: base ?? "HEAD",
    to: "HEAD",
    resolved: "",
    sources: [],
  };

  const working = await collectWorking(root, dir);
  if (working.error) {
    return {
      files: [],
      diffBase: emptyBase,
      error: working.error,
    };
  }

  // Resolve the effective base: explicit > auto-detect > none.
  let effectiveBase: string | undefined = base;
  let autoBase: string | undefined;
  if (!effectiveBase) {
    const detected = await detectMeaningfulBase(root);
    if (detected) {
      effectiveBase = detected;
      autoBase = detected;
    }
  }

  let based: { files: SourceFile[]; error?: string } = { files: [], error: undefined };
  let resolved = "";
  if (effectiveBase) {
    resolved = await resolveRev(root, effectiveBase);
    if (!resolved) {
      // Could not resolve the base ref — keep only working tree changes.
      based = { files: [], error: `Failed to resolve --base ${effectiveBase}` };
    } else {
      based = await collectBase(root, dir, effectiveBase);
    }
  }

  const map = new Map<string, CollectedFile>();
  // Insert base files first so working tree versions win on conflict.
  for (const file of based.files) {
    map.set(file.file, { ...file, source: "base" });
  }
  for (const file of working.files) {
    map.set(file.file, { ...file, source: "working" });
  }

  const sources: DiffSource[] = [];
  if (based.files.length > 0) sources.push("base");
  if (working.files.length > 0) sources.push("working");

  let type: DiffBase["type"];
  if (effectiveBase) type = base ? "explicit" : "auto";
  else if (working.files.length > 0) type = "working_only";
  else type = "empty";

  const diffBase: DiffBase = {
    type,
    from: effectiveBase ?? "HEAD",
    to: "HEAD",
    resolved,
    sources,
  };

  return {
    files: Array.from(map.values()),
    diffBase,
    autoBase,
  };
}

async function collect(
  root: string,
  dir: string,
  base?: string,
  worktree?: string,
): Promise<CollectResult> {
  if (!(await inside(root))) {
    return {
      files: [],
      diffBase: {
        type: "empty",
        from: base ?? "HEAD",
        to: "HEAD",
        resolved: "",
        sources: [],
      },
      error: "Current directory is not a git repository.",
    };
  }

  const wtRoot = worktree ?? root;
  const merged = await collectMerged(wtRoot, dir, base);
  if (merged.error) return merged;
  if (merged.files.length > 0) return merged;

  // If we are inside a worktree, do not auto-pick another one — the
  // user explicitly ran the command here. The main-checkout branch
  // below is the only place auto-pick is allowed.
  if (await isWorktree(root)) {
    return merged;
  }
  const worktrees = await listWorktrees(root);
  const others = worktrees.filter((wt) => wt.path !== root);
  const candidates: { path: string; branch: string; ahead: number }[] = [];
  for (const wt of others) {
    const summary = await worktreeAheadSummary(wt.path, wt.branch);
    if (summary && summary.ahead > 0) {
      candidates.push({ path: wt.path, branch: summary.branch, ahead: summary.ahead });
    }
  }
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.ahead - a.ahead);
    const [winner] = candidates;
    if (winner) {
      const result = await collectMerged(winner.path, dir, base);
      if (result.files.length > 0) {
        return {
          ...result,
          autoWorktree: winner.path,
          autoWorktreeBranch: winner.branch,
        };
      }
    }
  }

  return merged;
}

async function renderFiles(files: SourceFile[]) {
  return files.map((item) => ({
    path: item.file,
    status: item.status,
    additions: item.additions,
    deletions: item.deletions,
    before: item.before,
    after: item.after,
  }));
}

function mime(file: string, fallback: string) {
  const ext = path.extname(file);
  if (ext === ".js" || ext === ".mjs") return "text/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".map") return "application/json; charset=utf-8";
  if (ext === ".wasm") return "application/wasm";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".html") return "text/html; charset=utf-8";
  return fallback || "application/octet-stream";
}

async function resolveFile(paths: string[]) {
  for (const item of paths) {
    const exists = await Bun.file(item).exists();
    if (exists) return item;
  }
}

export const DiffReviewPlugin: Plugin = async (ctx) => {
  const html_file = await resolveFile([
    path.join(import.meta.dir, "ui", "review.html"),
    path.join(import.meta.dir, "..", "ui", "review.html"),
    path.join(import.meta.dir, "..", "dist", "ui", "review.html"),
  ]);
  const app_file = await resolveFile([
    path.join(import.meta.dir, "ui", "app.js"),
    path.join(import.meta.dir, "..", "ui", "app.js"),
    path.join(import.meta.dir, "..", "dist", "ui", "app.js"),
  ]);
  const asset_root = app_file ? path.dirname(app_file) : "";

  const html = html_file
    ? await Bun.file(html_file)
        .text()
        .catch(() => "")
    : "";

  return {
    config: async (output) => {
      if (output.command?.[command]) return;
      output.command = {
        ...output.command,
        [command]: {
          description: "Open a local @pierre/diffs review UI and collect annotations",
          template: [
            "### Task Role",
            `You are a code review assistant responsible for executing diff review workflows using the \`${name}\` tool and applying unified fixes.`,
            "",
            "### Core Objective",
            "1. Call the tool to analyze code changes, process its output to design a unified fix plan, apply the plan via Edit calls, and validate fixes until no actionable items remain.",
            "2. Ensure all steps adhere to the specified rules to maintain context consistency and avoid fragmented fixes.",
            "",
            "### Tool Execution Rules",
            "- **Tool Call Requirement**: Call the tool exactly once per round (unless re-running post-fixes to confirm resolution).",
            "- **Argument Passing**: Extract raw command arguments from the user's input and pass them to the tool's `raw` argument.",
            "",
            "### Output Parsing & Priority Rules",
            "- The tool returns a structured JSON payload with `open_count`, `by_severity`, `by_category`, `notes`, and `findings[]` fields.",
            "- **Priority Order**: `notes` (round-level change requests) have the highest priority. If `notes` is non-empty (not whitespace), parse it as a list of change requests and act on them — even if `findings[]` is empty.",
            "- **Findings Handling**:",
            "  - Sort `findings[]` by severity in descending order: high → medium → low.",
            "  - Exclude `category: question` (clarification requests) from actionable items (do not auto-apply these).",
            "",
            "### Workflow Execution Rules",
            "0. **Read Conversation History (do this BEFORE printing the round summary)**:",
            "   The tool's `notes` and `findings[]` are only the CURRENT round. To understand the full conversation (every comment, every rejection, every follow-up across rounds), read `.opencode/reviews/<session>/state.json` directly. The session ID is in the `session_id` field of the tool's response (also exposed via your environment).",
            "   Specifically:",
            "   - Open `.opencode/reviews/<session>/state.json` and parse the `findings[]` array (every round's findings are stored there with their `round`, `comment`, `comments[]`, `status`, `created_at`, `file`, `start_line`, etc.). Read the `comments[]` thread under each finding — these are user/agent replies that inform the current round.",
            "   - Note the prior round(s) of feedback, the user's earlier decisions and rejections, and the chronology of when each finding was raised vs. when it was resolved/stale.",
            "   - Read the `comments[]` thread under each finding. If you need to respond to a user comment or record your own take before editing, call the `add_review_comment` tool with the finding id and your text. Keep it under 500 characters.",
            "   - Treat the current round's `notes` as the top of the stack (the user just wrote them), and treat prior findings+resolutions+comments as the long-running thread that informs why the current state is the way it is.",
            "   This step is mandatory when `state.json` exists (i.e. when `round > 1` or any prior finding exists). Do not skip it — the user expects you to remember the full conversation, not just the most recent round.",
            "1. **Round Summary (must print AFTER reading history, before any tool calls or edits)**:",
            "   Once you have read state.json, ALWAYS print a short human-readable summary in this exact shape:",
            "   ```",
            "   📋 Round N — {open_count} open finding(s) ({by_severity})",
            "   • notes: {summary of notes or '(none)'}",
            "   • actionable findings: {list of {severity}/{category}/{file}:{start_line} — short comment}",
            "   • history context: {1-line summary of any relevant prior-round findings/rejections that inform this round}",
            "   ```",
            "   This MUST be the first thing you output after parsing. Do not silently jump to edits. The user reads this summary to follow what is being done.",
            "2. **Plan-First Rule**:",
            "   - Read all affected files associated with the diff once.",
            "   - Design a **unified fix plan** that addresses all actionable `notes` and `findings` together. Do NOT handle items one at a time (per-finding fixes lose context and produce inconsistent patches — the plan must cover all findings as a coherent change).",
            "   - **Honor prior-round context**: if a previous round's finding was resolved and the user's notes this round align with it, your plan should make sure the prior resolution still holds. If the user rejected a previous fix, do not re-apply the same pattern.",
            "3. **Fix Application**:",
            "   - Apply the entire unified plan in a single batch via Edit calls.",
            '   - **Post-Apply Trace (mandatory)**: After each Edit, call `add_review_comment` once per addressed finding id with a short description of what changed at that location (file:line range, what was changed, why). If one edit fixed multiple findings, comment on each. Keep each comment under 500 characters. Example: `"Fixed in src/foo.ts:120-125 — replaced X with Y, added null check"`. These comments persist in `state.json` even after the user resolves the finding, so they can read what was done and continue the discussion with their own follow-up comments.',
            "4. **Validation**: After all fixes are applied, re-run the tool to confirm resolution of all actionable items.",
            "5. **Closing Rule**: Only respond with `Round N: no actionable items, closing out.` if BOTH:",
            "   - `notes` is empty or whitespace, AND",
            "   - There are no actionable `findings` (excluding `category: question`).",
            "   Otherwise, act on the non-empty `notes` or actionable `findings`.",
            "",
            "### Prohibitions",
            "- Do not call any other tools besides `read` (for state.json and the files mentioned in the diff), `add_review_comment`, and `edit`.",
            "- Do not edit files unless there are actionable `notes` or `findings` (as defined above).",
          ].join("\n"),
        },
      };
    },

    tool: {
      [name]: tool({
        description:
          "Open a local Diffs-based review UI for the current session and return structured findings for proposal discussion.",
        args: {
          raw: tool.schema
            .string()
            .optional()
            .describe("Raw command arguments from /diff-review-dashboard"),
        },

        async execute(args, context) {
          if (!html) return "Failed to load review UI template from plugin package.";
          if (!app_file) {
            return `Failed to load built UI assets. Install packaged plugin build (dist/ui/app.js) before running /${command}.`;
          }

          const parsed = parse(args.raw);
          if (parsed.error) return parsed.error;

          const roots = [parsed.worktree, context.worktree, context.directory].filter(
            (item): item is string => Boolean(item),
          );
          const resolved = await Promise.all(roots.map((item) => repo(item)));
          const root = resolved.find((item) => !item.error);
          if (!root?.path) {
            return [
              "Failed to resolve git repository root for this session.",
              `parsed.worktree=${parsed.worktree ?? ""}`,
              `context.worktree=${context.worktree ?? ""}`,
              `context.directory=${context.directory ?? ""}`,
            ].join("\n");
          }

          // parsed.worktree must lead the fallback chain so state.json lives at the
          // same path whether the user auto-picked or explicitly passed --worktree.
          const scope_root = parsed.worktree || context.worktree || context.directory || root.path;
          const source = await collect(root.path, scope_root, parsed.base);
          if (source.error) return source.error;
          const effective_scope =
            source.autoWorktree ||
            parsed.worktree ||
            context.worktree ||
            context.directory ||
            root.path;

          const output_root = path.join(effective_scope, ".opencode", "reviews", context.sessionID);
          const state_file = path.join(output_root, "state.json");
          const state = await readState(state_file, context.sessionID, defaultState);

          const priorDiffBase = state.diff_base;
          let range_changed_from_last_round = false;
          if (priorDiffBase) {
            const sameFrom = priorDiffBase.from === source.diffBase.from;
            const sameSources =
              priorDiffBase.sources.length === source.diffBase.sources.length &&
              priorDiffBase.sources.every(
                (value, index) => value === source.diffBase.sources[index],
              );
            if (!sameFrom || !sameSources) range_changed_from_last_round = true;
          }

          const all = source.files;
          const scoped = parsed.files?.length
            ? all.filter(
                (item) =>
                  parsed.files?.includes(item.file) ||
                  parsed.files?.some((value) => item.file.endsWith(value)),
              )
            : all;

          if (scoped.length === 0) {
            const available = all.map((item) => `- ${item.file}`).join("\n");
            if (parsed.files?.length) {
              return [
                "No files matched --files filter.",
                "",
                usage(),
                "",
                "Available files:",
                available || "- none",
              ].join("\n");
            }
            if (parsed.base) {
              return `No changes found for --base ${parsed.base}.`;
            }
            if (source.autoBase) {
              return [
                `No changes found for --base ${source.autoBase} (auto-detected).`,
                "",
                "Working tree is clean and the auto-detected base has no differences.",
                "Pass an explicit --base to review against a different ref:",
                `  /${command} --base <ref>`,
              ].join("\n");
            }
            return await buildNoChangesDiagnostic(
              root.path,
              await branchInfo(root.path),
              source.diffBase,
            );
          }

          const files = await renderFiles(scoped);
          const merged = reconcile(files, state.findings);
          const existing = merged;
          const base: State = {
            ...state,
            findings: merged,
            updated_at: Date.now(),
          };
          await saveState(state_file, base);

          const info = await scopeInfo(effective_scope);
          const commits = await collectCommits(
            source.autoWorktree || root.path,
            parsed.base || source.autoBase,
          );
          for (const c of commits) c.round = base.round + 1;
          const id = `review_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 6)}`;
          const token = crypto.randomUUID().replaceAll("-", "");
          const data: Launch = {
            id,
            session_id: context.sessionID,
            repo_root: source.autoWorktree || root.path,
            scope_root: effective_scope,
            round: base.round + 1,
            files,
            commits,
            existing_findings: existing,
            draft: base.draft ?? {
              notes: "",
              new_findings: [],
            },
            taxonomy: {
              categories: [...categories],
              severities: [...severities],
            },
            filter: parsed.files,
            base: parsed.base,
            auto_base: source.autoBase,
            auto_worktree: source.autoWorktree,
            auto_worktree_branch: source.autoWorktreeBranch,
            current_branch: info.current_branch,
            is_worktree: info.is_worktree,
            diff_base: source.diffBase,
            previous_diff_base: priorDiffBase,
            range_changed_from_last_round,
          };

          const map = new Map(files.map((item) => [item.path, item]));

          let done = false;
          let finish = (_: Done) => {};
          const wait = new Promise<Done>((resolve) => {
            finish = resolve;
          });

          const resolve = (result: Done) => {
            if (done) return;
            done = true;
            finish(result);
          };

          let opened = false;

          const server = Bun.serve({
            port: 0,
            fetch: async (request: Request) => {
              const url = new URL(request.url);
              const pathname = url.pathname;

              if (pathname === "/health") {
                return new Response("ok");
              }

              if (request.method === "GET" && pathname.startsWith("/assets/")) {
                if (!asset_root) return new Response("not found", { status: 404 });
                const rel = pathname.slice("/assets/".length);
                if (!rel || rel.includes("\u0000")) {
                  return new Response("bad request", { status: 400 });
                }

                const resolved = path.resolve(asset_root, rel);
                const prefix = asset_root.endsWith(path.sep)
                  ? asset_root
                  : `${asset_root}${path.sep}`;
                if (resolved !== asset_root && !resolved.startsWith(prefix)) {
                  return new Response("forbidden", { status: 403 });
                }

                const file = Bun.file(resolved);
                const exists = await file.exists();
                if (!exists) return new Response("not found", { status: 404 });

                return new Response(file, {
                  headers: {
                    "content-type": mime(resolved, "application/octet-stream"),
                    "cache-control": "no-store",
                  },
                });
              }

              if (url.searchParams.get("token") !== token) {
                return new Response("unauthorized", { status: 401 });
              }

              if (request.method === "GET" && pathname === `/review/${id}`) {
                return new Response(html, {
                  headers: { "content-type": "text/html; charset=utf-8" },
                });
              }

              if (request.method === "GET" && pathname === `/api/review/${id}`) {
                return new Response(JSON.stringify(data), {
                  headers: { "content-type": "application/json" },
                });
              }

              if (request.method === "PUT" && pathname === `/api/review/${id}/draft`) {
                const input = (await request.json().catch(() => ({}))) as Submit;
                const notes = typeof input.notes === "string" ? input.notes : "";
                const new_findings = Array.isArray(input.new_findings) ? input.new_findings : [];
                const next: State = {
                  ...base,
                  draft: {
                    notes,
                    new_findings,
                  },
                  updated_at: Date.now(),
                };
                await saveState(state_file, next);
                return new Response(JSON.stringify({ ok: true }), {
                  headers: { "content-type": "application/json" },
                });
              }

              if (request.method === "POST" && pathname === `/api/review/${id}/resolve`) {
                const input = (await request.json().catch(() => ({}))) as { finding_id?: string };
                const finding_id = input.finding_id;
                if (!finding_id) {
                  return new Response(JSON.stringify({ error: "finding_id required" }), {
                    status: 400,
                    headers: { "content-type": "application/json" },
                  });
                }
                const target = base.findings.find(
                  (item) => item.id === finding_id && item.status === "open",
                );
                if (!target) {
                  return new Response(
                    JSON.stringify({ error: "finding not found or already resolved" }),
                    {
                      status: 404,
                      headers: { "content-type": "application/json" },
                    },
                  );
                }
                target.status = "resolved";
                target.updated_at = Date.now();
                target.closed_at = Date.now();
                base.updated_at = Date.now();
                await saveState(state_file, base);
                const idx = data.existing_findings.findIndex((item) => item.id === finding_id);
                if (idx !== -1) data.existing_findings[idx] = { ...target };
                else data.existing_findings.push({ ...target });
                return new Response(JSON.stringify({ ok: true }), {
                  headers: { "content-type": "application/json" },
                });
              }

              if (request.method === "POST" && pathname === `/api/review/${id}/reopen`) {
                const input = (await request.json().catch(() => ({}))) as { finding_id?: string };
                const finding_id = input.finding_id;
                if (!finding_id) {
                  return new Response(JSON.stringify({ error: "finding_id required" }), {
                    status: 400,
                    headers: { "content-type": "application/json" },
                  });
                }
                const target = base.findings.find((item) => item.id === finding_id);
                if (!target) {
                  return new Response(JSON.stringify({ error: "finding not found" }), {
                    status: 404,
                    headers: { "content-type": "application/json" },
                  });
                }
                if (target.status !== "resolved") {
                  return new Response(
                    JSON.stringify({ error: `cannot reopen (status: ${target.status})` }),
                    {
                      status: 400,
                      headers: { "content-type": "application/json" },
                    },
                  );
                }
                // Validate anchor: the code at the line numbers must still match.
                if (target.kind === "file") {
                  const file = map.get(target.file);
                  if (!file) {
                    return new Response(JSON.stringify({ error: "file removed from diff" }), {
                      status: 409,
                      headers: { "content-type": "application/json" },
                    });
                  }
                  if (file.status === "deleted") {
                    return new Response(JSON.stringify({ error: "file deleted, cannot reopen" }), {
                      status: 409,
                      headers: { "content-type": "application/json" },
                    });
                  }
                } else {
                  const file = map.get(target.file);
                  if (!file) {
                    return new Response(JSON.stringify({ error: "file removed from diff" }), {
                      status: 409,
                      headers: { "content-type": "application/json" },
                    });
                  }
                  const source = file.status === "deleted" ? file.before : file.after;
                  const lines = source.split("\n");
                  const snippet = target.anchor?.selected ?? "";
                  let stillMatches = false;
                  if (target.start_line >= 1 && target.start_line <= lines.length) {
                    const actual = lines[target.start_line - 1] ?? "";
                    stillMatches = snippet === "" || actual.includes(snippet);
                  }
                  if (!stillMatches) {
                    return new Response(
                      JSON.stringify({
                        error: "code at this location has changed, please create a new finding",
                      }),
                      { status: 409, headers: { "content-type": "application/json" } },
                    );
                  }
                }
                target.status = "open";
                target.updated_at = Date.now();
                target.closed_at = undefined;
                base.updated_at = Date.now();
                await saveState(state_file, base);
                const idx = data.existing_findings.findIndex((item) => item.id === finding_id);
                if (idx !== -1) {
                  data.existing_findings[idx] = { ...target };
                } else {
                  data.existing_findings.push({ ...target });
                }
                return new Response(JSON.stringify({ ok: true }), {
                  headers: { "content-type": "application/json" },
                });
              }

              if (request.method === "POST" && pathname === `/api/review/${id}/comment`) {
                const input = (await request.json().catch(() => ({}))) as CommentInput;
                const finding_id = input.finding_id;
                const text = typeof input.text === "string" ? input.text.trim() : "";
                if (!finding_id) {
                  return new Response(JSON.stringify({ error: "finding_id required" }), {
                    status: 400,
                    headers: { "content-type": "application/json" },
                  });
                }
                if (!text) {
                  return new Response(JSON.stringify({ error: "comment text required" }), {
                    status: 400,
                    headers: { "content-type": "application/json" },
                  });
                }
                if (text.length > 500) {
                  return new Response(JSON.stringify({ error: "comment exceeds 500 characters" }), {
                    status: 400,
                    headers: { "content-type": "application/json" },
                  });
                }
                const target = base.findings.find((item) => item.id === finding_id);
                if (!target) {
                  return new Response(JSON.stringify({ error: "finding not found" }), {
                    status: 404,
                    headers: { "content-type": "application/json" },
                  });
                }
                const author = input.author === "agent" ? "agent" : "user";
                const comment: FindingComment = {
                  id: `comment_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 6)}`,
                  author,
                  text,
                  created_at: Date.now(),
                };
                target.comments = target.comments ?? [];
                target.comments.push(comment);
                target.updated_at = Date.now();
                base.updated_at = Date.now();
                await saveState(state_file, base);
                const idx = data.existing_findings.findIndex((item) => item.id === finding_id);
                if (idx !== -1) {
                  data.existing_findings[idx] = { ...target };
                } else {
                  data.existing_findings.push({ ...target });
                }
                return new Response(JSON.stringify({ ok: true, comment }), {
                  headers: { "content-type": "application/json" },
                });
              }

              if (request.method === "POST" && pathname === `/api/review/${id}/submit`) {
                const input = (await request.json().catch(() => ({}))) as Submit;
                const notes = typeof input.notes === "string" ? input.notes.trim() : "";
                const fresh = Array.isArray(input.new_findings) ? input.new_findings : [];
                const round = base.round + 1;
                const created = sanitize(fresh, round, map);
                const carry = base.findings.filter((item) => item.status === "open");
                const closed = base.findings.filter((item) => item.status !== "open");
                const findings = [...closed, ...carry, ...created];
                const next: State = {
                  ...base,
                  round,
                  findings,
                  previous_diff_base: base.diff_base,
                  diff_base: data.diff_base,
                  draft: undefined,
                  updated_at: Date.now(),
                };
                await saveState(state_file, next);

                const stamp = String(round).padStart(3, "0");
                const json_path = path.join(output_root, `round-${stamp}.json`);
                const md_path = path.join(output_root, `round-${stamp}.md`);
                const export_data = {
                  session_id: context.sessionID,
                  round,
                  notes,
                  findings,
                  filter: parsed.files,
                  base: parsed.base,
                  generated_at: Date.now(),
                };
                await writeFileAtomic(json_path, JSON.stringify(export_data, null, 2));
                await writeFileAtomic(
                  md_path,
                  markdown({
                    session_id: context.sessionID,
                    round,
                    notes,
                    findings,
                    filter: parsed.files,
                    base: parsed.base,
                  }),
                );

                const completed: Done = {
                  cancelled: false,
                  round,
                  notes,
                  findings,
                  json_path,
                  md_path,
                  url: `http://127.0.0.1:${server.port}/review/${id}?token=${token}`,
                  opened,
                  state_file,
                };

                queueMicrotask(() => resolve(completed));

                return new Response(
                  JSON.stringify({
                    ok: true,
                    round,
                    json_path,
                    md_path,
                  }),
                  {
                    headers: { "content-type": "application/json" },
                  },
                );
              }

              return new Response("not found", { status: 404 });
            },
          });

          const review_url = `http://127.0.0.1:${server.port}/review/${id}?token=${token}`;
          opened = open(review_url, { cwd: effective_scope });
          context.metadata({
            title: "Diff review",
            metadata: {
              url: review_url,
              files: files.length,
              scope: parsed.files?.length ? parsed.files.join(",") : "all",
              base: parsed.base || "working_tree",
              repo: root.path,
              auto_worktree: source.autoWorktree,
              auto_worktree_branch: source.autoWorktreeBranch,
            },
          });

          await ctx.client.app.log({
            body: {
              service: "diff-review",
              level: "info",
              message: `review launched for ${context.sessionID}`,
              extra: {
                url: review_url,
                files: files.length,
                opened,
                base: parsed.base || "working_tree",
                repo: root.path,
                auto_worktree: source.autoWorktree,
                auto_worktree_branch: source.autoWorktreeBranch,
              },
            },
            query: {
              directory: context.directory,
            },
          });

          context.abort.addEventListener(
            "abort",
            () => {
              resolve({
                cancelled: true,
                round: base.round + 1,
                notes: "",
                findings: base.findings,
                json_path: "",
                md_path: "",
                url: review_url,
                opened,
                state_file,
              });
            },
            { once: true },
          );

          const result = await wait;
          // Server teardown: drop the listener once the browser's
          // auto-close logic (about:blank navigation) has had time to
          // run. The exact value isn't load-bearing — the UI navigates
          // to about:blank ~400ms after submit, so 1500ms is safely
          // past that. Earlier values produced ERR_CONNECTION_REFUSED
          // in the tab because the navigation raced the socket close.
          setTimeout(() => server.stop(true), 1500);

          if (!result.cancelled) {
            return format({
              ...result,
              url: review_url,
              opened,
            });
          }

          return format({
            ...result,
            url: review_url,
            opened,
          });
        },
      }),
      add_review_comment: tool({
        description:
          "Append a comment to an existing review finding so the multi-round discussion is persisted in state.json.",
        args: {
          finding_id: tool.schema.string().describe("The finding id to reply to"),
          text: tool.schema.string().describe("Comment text (max 500 characters)"),
          state_file: tool.schema
            .string()
            .optional()
            .describe("Path to .opencode/reviews/<session>/state.json from the last review result"),
        },
        async execute(args, ctx) {
          const finding_id = args.finding_id;
          const text = args.text.trim();
          if (!finding_id) return JSON.stringify({ error: "finding_id required" });
          if (!text) return JSON.stringify({ error: "comment text required" });
          if (text.length > 500) return JSON.stringify({ error: "comment exceeds 500 characters" });

          let state_file = args.state_file;
          if (!state_file) {
            state_file = path.join(
              ctx.worktree || ctx.directory || "",
              ".opencode",
              "reviews",
              ctx.sessionID,
              "state.json",
            );
          }
          if (!state_file) {
            return JSON.stringify({ error: "state_file not provided and cannot be derived" });
          }

          const state = await readState(state_file, ctx.sessionID, defaultState);
          const target = state.findings.find((item) => item.id === finding_id);
          if (!target) {
            return JSON.stringify({ error: "finding not found" });
          }
          const comment: FindingComment = {
            id: `comment_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 6)}`,
            author: "agent",
            text,
            created_at: Date.now(),
          };
          target.comments = target.comments ?? [];
          target.comments.push(comment);
          target.updated_at = Date.now();
          state.updated_at = Date.now();
          await saveState(state_file, state);
          return JSON.stringify({ ok: true, comment });
        },
      }),
    },
  };
};

export default DiffReviewPlugin;
