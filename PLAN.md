# Faicad 双版本部署方案

## 1. 现状

- 静态网站，`index.html` + `logo.svg`
- 中英文通过 `data-en`/`data-zh` + JS 运行时切换
- 部署 GitHub Pages，绑定 `www.faicad.com`
- 流程：`git push master` → GitHub Pages 自动发布

## 2. 目标

| 版本 | 域名 | 定位 |
|---|---|---|
| 国际版 | `faicad.com` | 全球用户 |
| 国内版 | `faicad.cn` | 中国大陆用户 |

**国际版 = 源码，不构建。** `git push master` → `faicad.com` 流程完全不变。
构建只产出国内版。

## 3. 两版本差异

### 3.1 由现有 i18n 机制处理（构建不管）

正文标题、描述、卡片文字等所有 `data-en`/`data-zh` 内容。

### 3.2 需要构建时处理

| 项目 | 国际版（源码） | 国内版（构建替换） |
|---|---|---|
| 域名 | `faicad.com` | `faicad.cn` |
| `<html lang>` | `en` | `zh-CN` |
| `<title>` | `Faicad` | `Faicad - 开源 3D 工具` |
| SEO meta | 英文 | 中文 |
| 页面中所有 URL 引用 | `*.faicad.com/*` | `*.faicad.cn/*` |
| ICP 备案 | 无 | Footer 展示 |

### 3.3 未来可能的差异

- 国内版加入百度统计 / 国际版 Google Analytics
- 项目链接指向国内镜像
- 国内版接入微信登录等服务

## 4. 构建机制

### 4.1 字符串替换

源码直接写国际版的值，构建时逐项替换：

```
faicad.com         → faicad.cn
<html lang="en">   → <html lang="zh-CN">
<title>Faicad</title> → <title>Faicad - 开源 3D 工具</title>
<meta name="description" content="...英文..."> → 中文描述
```

域名替换自动影响所有子域名（`viewer.faicad.com`、`cdn.faicad.com` 等）。

### 4.2 标记展开

通过 `<!-- cn:start -->` / `<!-- cn:end -->` 包裹仅在 CN 版出现的内容：

```html
<!-- cn:start -->
<p style="margin-top:8px">
  <a href="https://beian.miit.gov.cn/" target="_blank">京ICP备XXXXXXXX号-1</a>
</p>
<!-- cn:end -->
```

国际版中为不可见注释，CN 构建时去掉注释标记，内容露出。

## 5. 目录结构

```
/
├── index.html          # 首页（国际版）
├── pages/              # 子页面
│   ├── about.html
│   ├── privacy.html
│   └── ...
├── assets/             # 共用资源
├── build.js            # 构建脚本
├── dist/cn/            # 构建产物（gitignore）
├── .gitignore
└── .github/workflows/deploy-cn.yml
```

所有 HTML 文件遵循相同的标记规则，`build.js` 递归处理。

## 6. 子页面 & 子域名

- 子页面 HTML 放在 `pages/`，构建时同样处理替换和标记
- 源码中所有 URL 直接写 `faicad.com`，构建自动替换为 `faicad.cn`
- 子域名如 `viewer.faicad.com` 同样被替换为 `viewer.faicad.cn`

## 7. 部署

### 国际版（不变）

```bash
git push origin master
# → GitHub Pages → faicad.com
```

### 国内版

自动：GitHub Actions 监听 master push，构建后推送到 `Faicad/faicad.cn`。

手动备用：
```bash
node build.js
# dist/cn/ 内容推送到 faicad.cn 仓库
```

## 8. 实现步骤

- [ ] 1. `index.html` 添加 ICP 备案 `<!-- cn:start -->` 标记
- [ ] 2. 创建 `build.js`
- [ ] 3. 创建 `.gitignore`
- [ ] 4. 验证构建正确
- [ ] 5. 创建 GitHub Actions workflow
- [ ] 6. 创建 `Faicad/faicad.cn` 仓库并配置 Pages
