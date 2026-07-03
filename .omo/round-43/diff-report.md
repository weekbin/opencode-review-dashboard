# diff-report.md — Round 43

## File diff (R43 vs R42 baseline ee4891c)

```text
 opencode.json                       | (unchanged — correct pattern, no id field)
 scripts/verify-plugin-load.mjs      |  ~30 lines updated (Gate 4 de-fanged per R43 user directive)
 src/ui/app.ts                       |  29 ++++++++++++++++++++++++++++--
 src/ui/i18n.test.ts                 |  10 ++++++----
 src/ui/i18n.ts                      |  16 ++++++++++++++--
 src/ui/r43-feedback.test.ts         | ~140 lines (NEW FILE)
 src/ui/review.html                  |  38 +++++++++++++++++++++++++++++----
 src/ui/settings.test.ts             |  21 +++++++++++++++++++--
 8 files changed, X insertions(+), Y deletions(-)
```

## Critical findings

**None.** No CRITICAL regressions detected.

## Per-AC diff narrative

### AC1: range-banner position (src/ui/review.html)

```diff
       .range-banner {
         background: ...;
         padding: 8px 16px;
         display: flex;
         align-items: center;
         gap: 10px;
         font-size: 14px;
+        /* R43 AC1: position: sticky ... */
+        position: sticky;
+        top: 50px;
+        z-index: 48;
       }
```

**Severity**: low (CSS only, bounded affect)
**Risk**: stacking context collision with `.navbar-tabs` z-index 49 — banner at 48 is BELOW navbar (correct)

### AC2: resolution_kind badge (src/ui/app.ts)

```diff
     statusBadge.textContent = entry.status === "closed_auto" ? "stale" : entry.status;
     headLeft.appendChild(statusBadge);
+
+    // R43 AC2: surface the resolution_kind (wontfix / out_of_scope / ...)
+    if (entry.resolution_kind) {
+      const kindBadge = document.createElement("span");
+      kindBadge.className = `conversation-resolution-kind resolution-kind-${entry.resolution_kind}`;
+      ...
+    }
```

**Severity**: low (additive only)
**Risk**: zero (only renders when `entry.resolution_kind` is set)

### AC3: settings button SVG (src/ui/review.html)

```diff
         <button
           type="button"
           id="settings-btn"
           class="btn-icon"
           title="Settings"
           aria-label="Settings"
-          data-i18n="toolbar.settings"
         >
-          ⚙
+          <svg
+            width="16" height="16" viewBox="0 0 16 16"
+            fill="none" stroke="currentColor" stroke-width="1.4"
+            aria-hidden="true"
+          >
+            <circle cx="8" cy="8" r="2.2" />
+            <path d="..." />
+          </svg>
         </button>
```

**Severity**: low
**Risk**: breaking change for `data-i18n="toolbar.settings"` test in `settings.test.ts` — updated in same R43 commit

### AC4: previously-finding stacking (src/ui/review.html)

```diff
       .previously-finding {
         margin: 0 18px 12px;
         padding: 12px 14px;
         ...
+        /* R43 AC4: establish a local stacking context ... */
+        position: relative;
+        z-index: 1;
       }
```

**Severity**: low
**Risk**: zero

### AC5: default language zh-CN (src/ui/i18n.ts)

```diff
-export const DEFAULT_LANGUAGE: Lang = "en";
+/**
+ * R43 AC5: default locale is now `zh-CN` ...
+ */
+export const DEFAULT_LANGUAGE: Lang = "zh-CN";
```

**Severity**: low (config change)
**Risk**: behavioral change documented in commit message

### SG.R27.1 verification script: Gate 4 user-correction (scripts/verify-plugin-load.mjs)

```diff
-  // Gate 4: path-plugin entry shape — for `file://` plugins, the
-  // `<plugin>/opencode.json` must carry an `id` field (R32c / R32d
-  // lessons). npm-name plugins get their id from the registry, but
-  // path plugins need an explicit `id` in the on-disk opencode.json
-  // for the 1.17.12 strict loader. If the plugin doesn't have a
-  // local opencode.json (e.g. it's a CLI tool, not a path plugin),
-  // this gate is skipped silently.
+  // Gate 4: path-plugin entry shape — DISABLED per user directive (R43 retro).
+  // The R32c/R32d retrofit asserted file:// path plugins need a top-level
+  // `id` field in on-disk `<plugin>/opencode.json`. User audit (R43)
+  // confirmed this is WRONG: including `id` causes OpenCode loader to
+  // throw at plugin-load time. Correct schema for path plugins has NO
+  // `id` field. Gate kept as informational PASS-through only.
```

**Severity**: medium (loop-internal fix — corrected false-positive HARD STOP)
**Risk**: zero (correctness fix; future R+ rounds no longer false-block on this gate)

## What was NOT changed

`opencode.json` — R43 retro initially added an `id` field to it (misled by verify-plugin-load.mjs Gate 4). User audit confirmed the correct schema has NO top-level `id` field for `file://` path plugins (id can only come from npm registry for npm-name plugins). The field was REMOVED in this round.

## Test files changed

| File | Test count | New | Updated | Notes |
|---|---|---|---|---|
| src/ui/r43-feedback.test.ts | 10 | 10 | — | NEW: 5 R43 ACs verified |
| src/ui/i18n.test.ts | 41 | — | 1 | Updated "unsupported lang fallback" reflects new zh-CN default |
| src/ui/settings.test.ts | 27 | — | 2 added | "no data-i18n" + "SVG icon" presence tests |

## Phase 3b verdict

**PASS** — No CRITICAL findings. All diffs are small, additive, well-localized. SG.R27.1 Gate 4 loop-internal fix corrects the R32c/R32d false-positive (which would have continued to block future rounds from shipping correct plugin configs).
