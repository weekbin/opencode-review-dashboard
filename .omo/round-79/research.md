# R79 Research

Pattern matches R57-R78 (template literal / literal string → t() call).

8 new STRINGS keys (en + zh-CN):
- `status.copyPermalinkBlocked`: "Could not copy permalink — clipboard blocked" / "无法复制永久链接——剪贴板被阻止"
- `status.copiedAsMarkdown`: "Copied as Markdown" / "已复制为 Markdown"
- `status.copyMarkdownBlocked`: "Could not copy markdown — clipboard blocked" / "无法复制 Markdown——剪贴板被阻止"
- `status.noReviewData`: "No review data to export" / "没有可导出的审查数据"
- `status.noChangesToSave`: "No changes to save" / "没有需要保存的更改"
- `status.commentTooLong`: "Comment exceeds 500 characters" / "评论超过 500 字符"
- `status.failedAddComment`: "Failed to add comment" / "添加评论失败"
- `status.commentAdded`: "Comment added" / "已添加评论"

Naming: `status.<category>.<semantic>` — matches existing `status.submitFailed`, `status.findingAdded` etc.

Side fix: T16.11a (src/r16-features.test.ts:354) asserts literal English "Copied as Markdown" in setStatus. Updated to anchor on i18n key reference `setStatus(t("status.copiedAsMarkdown"))`.