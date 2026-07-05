# R129 Discovery — Listener leak fix + proposals.jsonl dedup

## Backlog Scan

**Still-deferred items:**
- **R123 listener leak (PICKED)** — pre-existing minor leak inherited from R123, flagged by R128 oracle
- **proposals.jsonl dedup (PICKED)** — housekeeping debt: R124 has 2 entries, R127 has 2 entries (Oracle flagged multiple times)
- R116 worktree lock (semantic)
- Dark mode CSS variants (R126 retro flag)

## Decision

Pick **listener leak fix + proposals.jsonl dedup** as R129's single housekeeping round:

**Scope 1 — Listener leak fix**:
- Add 3 module-scoped vars (`lastDisposeA11y`, `lastDismiss`, `lastHandleKey`)
- When replacing an existing listing: call all 3 cleanup functions BEFORE removing the DOM node
- Store current run's cleanup references in module-scoped vars at end of showReconcileListing

**Scope 2 — proposals.jsonl dedup**:
- Audit current state: how many entries per round?
- Keep the latest entry per round
- Result: 1 entry per round in canonical form

## Why R129 ≠ alternatives

- **R116 worktree lock**: semantic-only, no clear implementation
- **Dark mode CSS**: separate concern, would need its own round

## Round Profile

- Feature: 0
- Bugfix: 1 (listener leak — pre-existing since R123)
- Polish: 0 (dedup is housekeeping, not visual polish)
- Total: 1 (≤8 cap PASS)
- Subagents: 0 (lead-direct per v6 spec)

## v6 Compliance

- ≤3 features ✓
- ≤5 bugfixes ✓ (1)
- ≤1 polish ✓ (none)
- ≤8 total ✓ (1)