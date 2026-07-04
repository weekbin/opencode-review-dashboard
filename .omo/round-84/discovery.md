R84 — 9 hardcoded English strings in app.ts (4 showToast + 4 setAttribute aria-label + 1 placeholder)

R82/R83 closed all hardcoded title= attributes in review.html. R84 moves to the JS side: app.ts has 9 hardcoded English strings in showToast() / setAttribute("aria-label") / input.placeholder assignments. These show in zh-CN user sessions as English fallbacks.
