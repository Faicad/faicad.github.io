# 测试技术文档

## 概述

使用 [Playwright](https://playwright.dev/) + Node.js 内置 `node:test` 运行端到端测试。
所有测试文件命名为 `test-*.spec.mjs`，通过 `node --test` 自动发现执行。

## 测试文件

| 文件 | 覆盖范围 |
|------|----------|
| `test-card-clicks.spec.mjs` | 项目卡片点击行为（图标/描述跳转、tags 不跳转、source 外链弹窗） |
| `test-icp.spec.mjs` | ICP 备案（EN 版不可见、CN 版可见）、默认语言（EN 英文/CN 中文） |

## 本地服务

测试不使用真实部署的网站，而是在本地启动一个 HTTP 服务器，用 `readFileSync` 读取 `index.html` 源码并静态返回：

```js
function serveHtml(html) {
  return new Promise((resolve) => {
    const s = createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
    s.listen(0, () => resolve({ server: s, url: 'http://localhost:' + s.address().port }));
  });
}
```

随机端口避免冲突。

## 外部 URL Mock

产品链接指向 `https://www.faicad.com/*` —— 这是真实域名，测试环境无法访问。
直接导航会导致 `waitForURL`（或 goBack）因 `load` 事件永远不会触发而超时。

解决方案：用 Playwright 的 `page.route` 拦截匹配的请求，直接返回空 HTML。

```js
await page.route('**/www.faicad.com/**', route => route.fulfill({ body: '<html></html>' }));
```

`**/www.faicad.com/**` 是一个 glob 模式：
- 前导 `**` 匹配 `https://`
- `www.faicad.com/` 字面匹配
- 末尾 `**` 匹配任意路径如 `3d_viewer/`

拦截后浏览器认为导航成功完成，`waitForURL` 在 commit 阶段即可 resolve。

### 为什么不直接填超时时间？

- 超时等待浪费测试时间
- 依赖真实网络不可靠（DNS 失败、防火墙、离线环境）
- Mock 让测试在毫秒级完成，且不依赖环境

## 运行测试

```bash
# 构建 CN 版 + 跑所有测试
node build.js && node --test test-*.spec.mjs

# 仅跑测试（需要先 build）
node --test test-*.spec.mjs

# 跑单个文件
node --test test-icp.spec.mjs
```

`scripts/run-tests.sh` 将 build 和测试合并为一步，并在 git pre-commit hook 中自动执行。
