# R132 Discovery — Persistent locked-review status

## Inputs

- GitHub backlog: no open issues with `pm-manager-approved`.
- R131 carry-over: none; all loop-internal items closed.
- Recent proposals: no unshipped product proposals in the last 10 entries (round metrics only).
- R131 risk surfaced: the lock is only visible in the post-submit overlay; reopening a locked review has no persistent header indicator.
- Frontend design-system gate: the established dashboard UI has no `DESIGN.md`, so any visual change must first capture the existing token and component conventions rather than invent new styling.

## Selected candidate

- R131 risk: show a persistent, accessible locked-review badge in the Stats summary whenever `state.locked` exists; extract the existing UI design system as the required implementation prerequisite.

## Ranking rationale

This is the highest-impact available candidate because it makes an irreversible state visible after reload, prevents users from mistaking a completed review for an editable one, and closes the only explicitly named R132 candidate from the prior retro. Scope is one polish item plus its design-system prerequisite, within v6 caps.

## Round profile

- Polish: 1
- Total: 1
- Subagents: 0
