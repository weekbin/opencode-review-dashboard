# R63 Research

Both spots are dynamic (createElement), so they need `t("key")` calls rather than `data-i18n-*` attributes (which only work for static HTML).

Add fileFinding.title to STRINGS table (en + zh-CN: 文件级审查项). Replace 2 hardcoded strings with t("fileFinding.title").
