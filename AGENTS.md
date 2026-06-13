# Faicad 项目记忆

## 项目结构
- `index.html` — 网站首页（国际版源码）
- `build.js` — CN 版构建脚本
- `.github/workflows/deploy-cn.yml` — CI 自动部署国内版

## 部署
- 国际版 `faicad.com`：`git push origin master` → GitHub Pages
- 国内版 `faicad.cn`：`node build.js` → `dist/cn/` → 推送到 `Faicad/faicad.cn`

## i18n
- 运行时中英切换：`data-en` / `data-zh` 属性 + JS
- 构建时 CN 版替换：域名 `faicad.com` → `faicad.cn`、SEO 元数据、ICP 备案

## 规则
- HTML 页面必须考虑 SEO 优化（所有当前和未来的页面）
- 改 HTML 前必须读取文件确认当前状态
- 不允许私自 push，必须等用户确认

## 历史教训
- 不要私自 push，必须先问
- 不要加多余的东西（额外 CSS、JS、i18n 属性等），只做要求的
- 项目卡片结构：用 `<div>` 而不是 `<a>`，产品链接放在标题 `<a>`，source 链接用 `<a>` 放在 tags 区（嵌套 `<a>` 只在实际测试过的浏览器中凑合能用，但不要嵌套）
- `target="_blank"` 规则：本网站项目/产品链接（同域名）不加 `target="_blank"`；非本网站外链（GitHub 等）必须加 `target="_blank"`
- 不要用 `{{PLACEHOLDER}}` 占位符。国际版就是源码，CN 版构建时做字符串替换：`faicad.com` → `faicad.cn`
- 构建标记用 `<!-- cn:start -->` / `<!-- cn:end -->` HTML 注释
- 构建写坏文件时用 `git reset --soft` 修复提交历史，不要留 revert 垃圾 commit
