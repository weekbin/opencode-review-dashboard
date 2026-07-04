# R117 Research — Reconcile mode overlay (#74)

## Existing Reconcile Code

- `src/index.ts:456` `function reconcile(files, findings)` — server-side, marks stale findings as `closed_auto` with `close_reason: "file_removed" | "anchor_missing" | "content_match"`. Used at line 1860.
- `src/ui/app.ts:1478` `diffsRoot = document.querySelector("#diffs")` — diff panel container
- `src/ui/app.ts:5155` `renderDiffPanel()` — renders `.card[data-file]` per file
- Per-hunk `.card` structure: each file gets one card with header (path + expand/collapse buttons) + body (hunks via `@pierre/diffs` view)

## Cross-round Finding History

- `state.fresh`: current round's new findings (anchored to current diff)
- `state.existing`: findings carried from previous rounds (with status field reflecting round-by-round changes)
- `state.findings`: full history of all findings ever made
- Finding status: `"open" | "closed_auto" | "resolved"`
  - `resolved`: user clicked Resolve on the finding → agent's fix verified by user
  - `closed_auto`: line moved / file removed / content changed → finding auto-marked stale
  - `open`: still needs attention

## State Persistence Pattern

- `RECONCILE_MODE_KEY = "diff-review:reconcile-mode"` follows same pattern as `THEME_KEY`, `LAYOUT_KEY`, `IGNORE_WHITESPACE_KEY`, `SIDEBAR_KEY`, `SUBMIT_FOOTPRINT_KEY`, etc.
- `readStored<"on" | "off">(key, ["on", "off"], "off") === "on"` — standard localStorage persistence helper

## User-Defined Badge Categories (from #74 body)

- 🟢 Green (resolved): finding was resolved (user-initiated close, NOT auto-stale). Indicates "agent did what I asked".
- 🟡 Yellow (still open): finding still open + hunk was touched by agent. Indicates "agent ignored".
- 🔴 Red (new bug): finding is new in current round + anchored to a newly-added line. Indicates "agent introduced a problem".

## v6 Spec Compliance

Per team-dev-loop SKILL.md:
- 6 artifacts required: discovery.md, research.md, brief.md, verify.md, retro.md, decision.md
- 8/8 pre-commit checks (mechanical hygiene + lint + format-write→re-stage→test + typecheck)
- 0 subagents (lead-direct per v6 spec for single-feature rounds)

## Risk Mitigations

- Badge bloat: max 3 badges per hunk (one of each color)
- Click conflicts: badge click uses `event.stopPropagation()` to avoid triggering card-click handlers
- Re-render churn: badges computed inside `renderDiffPanel` which already manages full re-render

## R117 vs R117.x Scope Split

Per issue body 250-400 LOC estimate + v6 cap (1 feature ≤3/round):
- **R117 (this round)**: toolbar toggle + per-file badge rendering (green resolved only) + click delegation
- **R117.1 (future)**: add yellow (still-open) + red (new bug) badge types
- **R117.2 (future)**: per-hunk (not per-file) granularity if user feedback shows file-level is too coarse
- **R117.3 (future)**: auto-toggle when round N+1 loads if previous round had unresolved findings