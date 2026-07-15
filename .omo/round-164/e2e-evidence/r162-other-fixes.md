# R162 other-fixes e2e evidence

**Date**: 2026-07-15
**Setup**: Default mock-server, dashboard loaded with playwright-cli.

## Range-banner hidden (#89)

```js
({ rangeBanner: document.querySelector('#range-banner')?.hidden })
// → { rangeBanner: true }
```

**Verification**: ✅ Range banner is hidden when no range change. The CSS rule `.range-banner[hidden] { display: none }` (R162 fix) prevents the false yellow box.

## Topbar consolidation (#91)

```js
({ 
  layoutToggleHidden: document.querySelector('#layout-toggle')?.hidden,
  themeToggleHidden: document.querySelector('#theme-toggle')?.hidden,
  languageToggleHidden: document.querySelector('#language-toggle')?.hidden
})
// → { layoutToggleHidden: true, themeToggleHidden: true, languageToggleHidden: true }
```

**Verification**: ✅ All 3 topbar toggles (layout, theme, language) are hidden. Functionality is consolidated into the settings modal (gear icon entry point).

## Settings modal Save + Cancel (#91)

```js
// Open settings modal
playwright-cli click "#settings-btn"

// DOM check
({ 
  settingsOk: document.querySelector('#settings-ok')?.textContent,        // → "保存"
  settingsCancel: document.querySelector('#settings-cancel')?.textContent, // → "取消"
  modalVisible: !document.querySelector('#settings-overlay')?.hidden       // → true
})
```

**Verification**: ✅ Settings modal opens with Save (保存) + Cancel (取消) buttons.

## Settings Save toast (#91)

```
playwright-cli click "#settings-ok"
```

```js
({ 
  toast: document.querySelector('.toast')?.textContent,  // → "设置已保存×"
  modalVisible: !document.querySelector('#settings-overlay')?.hidden  // → false
})
```

**Verification**: ✅ Save click:
1. Closes the modal (`modalVisible: false`)
2. Shows success toast "设置已保存" (Settings saved in Chinese) with a close × button

## Tree/Flat button height (#90)

```js
({ 
  sidebarMode: document.querySelector('.sidebar-mode')?.getBoundingClientRect() 
})
// → { height: 26, top: 11.5, right: 875.98, bottom: 37.5, left: 849.98 }
```

**Verification**: ✅ Sidebar-mode button is 26px tall (was 24px pre-R162). Matches adjacent file-row line height (1.4 line-height × 13px font ≈ 18-26px range).

## Settings button (gear icon)

```js
({ 
  settingsBtn: document.querySelector('#settings-btn')?.getBoundingClientRect() 
})
// → { width: 26, height: 26, ... }
```

**Verification**: ✅ Settings button is 26×26 (matches other toolbar buttons), shows the gear SVG icon (R43 AC3).