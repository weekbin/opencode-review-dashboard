# R152 Research — upgrade R113 + R131 to behavior-contract + delete `contextHash`

Lightweight-round compression (≤20 LOC + ≤4 files + no behavior change): research lives inline in `brief.md` ## Existing patterns / ## Simplest change / ## Risk sections.

## R113 AC3 upgrade path

The current brittle test:
```js
const idx = src.indexOf("content_hash") >= 0 ? src.indexOf("content_hash") : src.indexOf("fnv1a");
expect(idx).toBeGreaterThan(-1);
const window = src.slice(idx, idx + 500);
expect(window.includes("anchor") || window.includes("context")).toBe(true);
```

The keyword-grep assumes `context_hash`/`fnv1a` appears within 500 chars of "anchor"/"context". This is true today because `contextHash` function body has `anchor.before\u0000anchor.selected\u0000anchor.after`. Removing `contextHash` removes the "anchor" tokens → test fails.

The behavior-contract upgrade:
```js
// Assert that the submit handler / sanitize function uses fnv1a for context hashing
const fnv1aIdx = src.indexOf("function fnv1a");
expect(fnv1aIdx).toBeGreaterThan(-1);
// Assert that fnv1a is referenced in the submit handler / sanitize flow
const submitBlock = src.match(/function submit|app\.post.*submit|sanitize\([\s\S]*?\n\}/);
expect(submitBlock).not.toBeNull();
// Verify the submit/sanitize flow references either content_hash or contextHash
expect(submitBlock[0]).toMatch(/context_hash|contextHash|fnv1a/);
```

This asserts the **behavior contract** (submit handler uses fnv1a for context hashing) without relying on a nearby function body's token presence.

## R131 upgrade path

The current brittle tests use hardcoded line-number constants:
```js
const SUBMIT_HANDLER_START = 100596;
const window = indexTs.slice(SUBMIT_HANDLER_START, SUBMIT_HANDLER_START + 1000);
expect(window).toMatch(/locked:\s*(true|false|Boolean)/);
```

When `contextHash` is removed (5 lines), the line numbers shift up by 5. The test's sliced window no longer contains the assertion target.

The behavior-contract upgrade:
```js
// Locate the submit handler by function signature, not line number
const submitMatch = indexTs.match(/async function handleSubmit[\s\S]*?\n\}/);
expect(submitMatch).not.toBeNull();
// Assert the locked-field-handling logic is in the submit handler body
expect(submitMatch[0]).toMatch(/locked/);
expect(submitMatch[0]).toMatch(/status:\s*409/);
```

This asserts the **behavior contract** (submit handler has locked-field handling + 409 status) without relying on absolute line numbers.

For STATE_TYPE_DEF_START (line 5543), same upgrade: regex-match the `Finding` type definition by signature, then assert field existence.

## Cascade analysis

R151 retro flagged this cascade pattern. With contextHash deleted:
- R113 AC3 — fails (no "anchor"/"context" within 500 chars of fnv1a)
- R131 AC2 — fails (line numbers shift, sliced window wrong)
- R131 AC6 — fails (same)

With both R113 + R131 upgraded to behavior-contract first, then contextHash deleted:
- All tests still pass (they assert function signatures, not line numbers)
- Lint warning drops from 1 to 0

Per-SHIP append discipline preserved.