# R138 Discovery — worktree hygiene

## Backlog scan

- **GH `pm-manager-approved` open issues**: `[]` (empty)
- **R137 retro carry-over**: none — feature + side-fix R131 both closed
- **proposals.jsonl last entry**: R137 (per-SHIP discipline maintained)
- **Worktree drift** (5+ rounds persistent since R132):
  - 4 R132 visual-evidence PNGs at repo root (48–64 KB each, ~220 KB total)
  - `.agents/` (opencode skill-manager local scratch, 9 subdirectories)
  - `skills-lock.json` (opencode skill hash cache)

## Surfaced candidates

### H1 — Move R132 PNG evidence + gitignore opencode scratch (this round)

**Evidence**:
- 4 PNGs at repo root, last touched Jul 12, predating R133–R137
- `.agents/skills/` contains 9 directories of skill metadata (downloaded skill payloads)
- `skills-lock.json` is skill-manager hash-cache (regenerable from `.opencode/skills/` or upstream)
- `.gitignore` already ignores similar scratch: `.opencode/cache/`, `.opencode/state.json`, `.omo/boulder.json`, `.omo/drafts/`, `.omo/evidence/`, `.playwright-cli/`

**Why close this round**: Worktree `?? ` has been visible in `git status` for 5 rounds. R132 retro explicitly noted "Screenshots and the baseline are produced as scratch evidence; they remain untracked because the project does not ship per-round captures" — so they SHOULD stay untracked, just in a better location (co-located with the round that produced them, not at repo root).

**Cost**: 1 line edit in `.gitignore` + 4 file moves (already done on disk) + 6 round artifacts. ~5 LOC net.

**Profile**: housekeeping (worktree hygiene, 0 features / 0 bugfixes / 0 polish).

### H2 — Hoist fallbackCopy to file scope (R137 retro flag)

**Why not this round**: Pure refactor, no user value. Real risk: regression in clipboard behavior across 4 callers. Better suited for a future housekeeping round where the test surface is dedicated to refactor verification.

### H3 — Add data-i18n-title to R137 button label/title (R137 retro flag)

**Why not this round**: Single-digit-LOC polish, would be a 1-line change but doesn't justify its own round. Batches cleanly with a future i18n polish round.

## Selection

Pick **H1** — worktree hygiene. Closes 5-round accumulated drift. Cap profile: 0/0/0 = 0 total, well within v6 hard caps.

## Hard caps pre-flight

| Cap | This round | Limit | Status |
|-----|------------|-------|--------|
| feature | 0 | ≤3 | OK |
| bugfix | 0 | ≤5 | OK |
| polish | 0 | ≤1 | OK |
| total | 0 | ≤8 | OK |