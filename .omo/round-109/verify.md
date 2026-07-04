116/116 tests pass in the 3 refactored files (r16-features, saved-replies,
r17-features). full suite is 800+ tests, all green. v6 pre-commit 8/8 PASS.

refactored sites:
- r16 T16.7c (`action.copyMarkdown` textContent)
- r16 T16.7d (`action.copyMarkdown.title` title)
- r16 T16.11a (`status.copiedAsMarkdown` setStatus inside copyFindingAsMarkdownToClipboard)
- r16 T16.13a (`panel.expandAll` textContent)
- r16 T16.13b (`panel.collapseAll` textContent)
- r16 T16.17a (ternary with status.expandedAll + status.collapsedAll)
- r16 T16.17b (status.expandedAll + status.collapsedAll existence)
- saved-replies T10.2b (`savedReplies.empty`)
- r17 help-modal title (`help.modal.title`)
