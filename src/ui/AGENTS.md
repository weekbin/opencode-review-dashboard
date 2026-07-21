# src/ui/ — browser dashboard

**Parent:** [`/AGENTS.md`](../AGENTS.md) and [`/src/AGENTS.md`](../src/AGENTS.md). This file covers only what is unique inside the browser bundle.

## OVERVIEW

Vanilla-TypeScript dashboard shipped as `dist/ui/app.js` and loaded by `dist/ui/review.html`. The directory is flat (no `components/`, `services/`, etc.) by design; helpers are extracted into sibling `.ts` files so each can be tested in isolation.

## WHERE TO LOOK

| Task                           | Location                                                              | Notes                                                    |
| ------------------------------ | --------------------------------------------------------------------- | -------------------------------------------------------- |
| Dashboard entry                | `src/ui/app.ts`                                                       | Module-load side effect calls `init()` at line 7117      |
| HTML shell                     | `src/ui/review.html`                                                  | Copied verbatim into `dist/ui/` post-build               |
| Bilingual strings              | `src/ui/i18n.ts`                                                      | `STRINGS`, `translate`, `t`, `applyLanguage`             |
| Hunk virtualization            | `src/ui/diff-virtualization.ts`                                       | `DiffVirtualizer` class                                  |
| Toasts, search history, modals | `src/ui/toast.ts`, `src/ui/search-history.ts`, `src/ui/modal-a11y.ts` | Pair each with its `*.test.ts`                           |
| Sidebar review progress helper | `src/ui/review-progress.ts`                                           | Pure formatting only                                     |
| UI unit tests                  | `src/ui/*.test.ts`                                                    | Co-located; ~80 files, many `r<N>-...` round regressions |

## CODE MAP

| Symbol                           | Type         | Location                           | Role                                                               |
| -------------------------------- | ------------ | ---------------------------------- | ------------------------------------------------------------------ |
| `init`                           | function     | `src/ui/app.ts:7041`               | Wires DOM, state, virtualization, modal a11y; invoked at line 7117 |
| `DiffSearchState` / `diffSearch` | type + const | `src/ui/app.ts:667`                | State for in-diff search overlay                                   |
| `DiffVirtualizer`                | class        | `src/ui/diff-virtualization.ts:27` | IntersectionObserver hunk virtualization                           |
| `t` / `translate`                | functions    | `src/ui/i18n.ts`                   | EN/中文 translation surface                                        |
| `STRINGS`                        | constant     | `src/ui/i18n.ts`                   | Bilingual string source of truth                                   |
| `installModalA11y`               | function     | `src/ui/modal-a11y.ts`             | Focus trap + Escape handling                                       |
| `showToast`                      | function     | `src/ui/toast.ts`                  | ARIA-live polite notifications                                     |
| `formatReviewProgress`           | function     | `src/ui/review-progress.ts`        | `X / Y (Z%)` sidebar counter                                       |

## CONVENTIONS

- Use the additive rule (R16 SG.14): never modify existing helpers in `app.ts`; add new ones alongside as a separate exported module so they can be tested in isolation.
- Reuse `t()`/`registerUITranslator()` for every user-facing string; never inline literal strings into DOM nodes.
- Accessibility signals (`aria-live`, `role="tablist"`, focus trap) are required for all interactive components; see `src/ui/modal-a11y.ts` for the canonical pattern.
- `prefers-reduced-motion` must be respected by any new animation; only animate `transform`/`opacity`.

## ANTI-PATTERNS

- Do not introduce nested folders (`components/`, `services/`, `state/`) under `src/ui/`; the flat layout is intentional and matches the team-dev-loop convention.
- Do not remove or rename exported helpers that have `*.test.ts` coverage; tests assert additive interfaces (`DiffVirtualizer`, `Submit`, search-history) and will HARD-FAIL on breaking changes.
- Do not reintroduce the removed `execCommand` clipboard fallback; use `navigator.clipboard.writeText` only (R153).
- Do not use `Bun.*` or any Node-only API in this directory; the bundle targets `platform: "browser"`.
- Do not commit `dist/ui/app.js` or pre-bundled Shiki chunks unless they are produced by `bun run build`; the `dist/` tree is regenerated.

## NOTES

- `src/ui/review.html` is a build artifact copied by `bun run build`; treat its `dist/` copy as generated.
- Most strings live twice (EN + zh-CN) inside `src/ui/i18n.ts`; bilingual tests (`r103-i18n-coverage`, `r110-zh-cn-smoke`) enforce parity.
- The directory has zero subdirectories: a sub-agent looking for `components/` or `state/` will find everything in this flat tree.
