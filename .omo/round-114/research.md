# R114 Research

## #82 Silent round auto-summary

**Files**: `src/index.ts` (RoundSystemNote type, submit-trigger logic), `src/ui/app.ts` (conversation pane header display), `src/ui/i18n.ts`

**Existing patterns**:
- `FindingComment` type (line 30) has `id/author/text/created_at`; `author: "user" | "agent"` — need to extend author literal with `"system"` (or use a separate `author_type` discriminator; additive union extension is safer)
- `Submit` type (line 220) accepts `notes` + `new_findings`
- Submit handler (line 2356-2418) builds `next: State` with `findings: [...closed, ...carry, ...created]` then calls `saveState(state_file, next)` 
- 0 hits for `roundSystemNotes` / `system_note` / `silent_round` — clean slate
- `state.json` schema is additive-compatible: adding `roundSystemNotes?` to State is backward-compatible with old state files

**Simplest change**:
1. Add `RoundSystemNote` type (additive):
   ```typescript
   type RoundSystemNote = {
     id: string;
     round: number;
     kind: "silent_round_summary";
     text: string;  // rendered template output
     payload: {
       files_changed: Array<{ file: string; add: number; del: number }>;
       findings_resolved_in_round: Array<{ id: string; resolution_kind: string }>;
       findings_closed_auto: Array<{ id: string; close_reason: string }>;
       findings_carried_open: Array<{ id: string; file: string; line: number; summary: string }>;
     };
     generator_version: string;
     generated_at: number;
   };
   ```
2. Add `roundSystemNotes?: RoundSystemNote[]` to State
3. After submit handler builds `next: State`, check silent conditions: `fresh.length === 0 && notes === ""`. If silent, compute payload from `findings` history, render template, push to `next.roundSystemNotes` (with cap at 50)
4. Display in conversation pane header (when `state.roundSystemNotes.length > 0`)

**Risk**:
- Template must be EXACT per #82 spec — issue author said "需要设计好固定模版" is a hard constraint
- Cap at 50 prevents unbounded array growth
- Author literal: use `"system"` literal string OR add a discriminator field. Cleaner to add a discriminator. But FindingComment's `author: "user" | "agent"` is a union; if I add `RoundSystemNote` as a separate type with no shared base, that's cleaner.

## Cross-cutting decision

R114 ships 1 feature (#82). Per v6 ≤3 feature cap, I'm well under cap. Lead-direct 100%, no subagent needed. Schema extension is purely additive (new optional field, new entity type).