# R85 — research

2x "No findings yet." (one in conversation panel, one in findingsRoot) share a single i18n key (no UI difference). 2x unique empty-state strings + 1x savedReplies.empty + 1x previously.empty = 3 new keys. Saved-replies.test.ts and previously-hint.test.ts had to be updated to use t() markers instead of literal English.
