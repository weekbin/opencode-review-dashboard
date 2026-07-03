# R63 Decision

## Decision
SHIP

## Lightweight round (if applicable)
YES — single file-finding tooltip i18n, ≤2 src/ files (app.ts + i18n.ts), zero `src/` behavior change beyond localization.

## Doc updates (SG.R29.8 carry-over)
SKIPPED — internal i18n key, no user-facing README change.

## Loop summary (1 paragraph)
R63 ships i18n for file-finding tooltips: added `fileFinding.title` STRINGS key (en + zh-CN: 文件级审查项) and replaced 2 hardcoded English strings in `src/ui/app.ts` (sidebar L3135 + diff panel L5060). 3 regression tests (664/664 total). Pre-commit 8/8 PASS. Loop-internal items all closed in current worktree; carry-over list queued 4 related buttons (R64-R67). R64 will pick up copy-branch button `title` next.
