# R135 Research — localize hardcoded English labels in conversation panel

## Lightweight-round compression

Per v6 SKILL: when total ≤50 LOC + ≤2 src files + no behavior change, capabilities 2 (Research) + 3 (Frame) compress into a single artifact. R135 ships below those thresholds, so the research lives inline in `brief.md` ## Files involved / ## Existing patterns / ## Simplest change / ## Risk sections.

## Files involved

- `src/ui/app.ts` — 4 hardcoded English strings identified by `grep`:
  - L4804: pinned-badge tooltip template literal
  - L4943: conversation panel comment author ternary
  - L5396: previously-discussed empty-notes placeholder
  - L5448: previously-discussed panel comment author ternary (mirror of L4943)
- `src/ui/i18n.ts` — 4 new keys added (8 strings × 2 locales).

## Existing patterns

- `t(key, params)` interpolation already used throughout the codebase.
- R134 introduced `formatRelativeTime` which returns bilingual strings; the new `finding.pinned.tooltip` composes with it via `{ago}` placeholder.
- The `comment.author.agent`/`user` ternary pattern is repeated verbatim in two panels (L4943, L5448) — both get the same i18n lookup.

## Simplest change

Per `brief.md`. 4 keys × 2 locales + 4 call sites updated.

## Risk

The R103 translation-completeness invariant (`en !== zh-CN`) is the gate that catches copy-paste duplicates — `comment.author.agent` zh-CN="🤖 Agent" would have failed it. Resolved by using `zh-CN="🤖 助手"` to localize the role label while keeping the universal emoji.