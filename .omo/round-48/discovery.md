# R48 Discovery

## Source: v6 spec + R47 retro
- v6 SKILL.md: "v6 is self-contained, no external refs needed"
- references/ directory still has v5 cruft that v6 doesn't use

## Backlog scan
1. **GH issues** (`gh issue list --state open --limit 20`): 0 open
2. **R47 carry-over**: empty
3. **proposals.jsonl**: R46-R47 housekeeping rounds

## No backlog — DECIDE housekeeping

**Selected scope**: Delete `references/v5-prompts.md` (440 lines). v6 doesn't use v5 PM/Planner subagents — Capability 1-3 in v6 are lead-direct, no prompt templates needed.

## Specific candidates (from grep)
- `references/v5-prompts.md`: 440 lines (PM Triage + PM Researcher + PM Manager + Planner prompts)
- Only cross-references from other orphaned v5 docs:
  - `environment-setup.md` L447: "references/v5-prompts.md — PM Triage v5 + Planner"
  - `loop-decision.md` L563: "from phase-prompts.md or v5-prompts.md"
- Both ref sites cleaned up to point at the removed file with [R48] note

## Decision
Pick: delete `v5-prompts.md` and update 2 cross-refs. Total 440 lines removed + 2 line edits.

## Why this scope
- Lightweight (single file deletion)
- No `src/` change
- v6 lock-in: dead v5 code is removed, leaving only references/ content that's still referenced by v6 (none currently) or by other v5 docs that may be removed in future rounds
- Continues R47's v6 cleanup pattern

## Rejected alternatives
- **Bulk-delete all references/ (2630 lines)**: too aggressive; keep history for now, address file-by-file in future rounds
- **Update v5-prompts.md headers to v6 phase names**: too much text work for 440 lines of unused content
- **Mark references/ as deprecated with banner**: doesn't reduce scope, just adds metadata