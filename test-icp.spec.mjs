import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICP_TEXT = '浙ICP备2026042810号';

function serveHtml(html) {
  return new Promise((resolve) => {
    const s = createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
    s.listen(0, () => resolve({ server: s, url: 'http://localhost:' + s.address().port }));
  });
}

test('EN source: ICP should not be visible in DOM', async () => {
  const html = readFileSync(join(__dirname, 'index.html'), 'utf-8');
  const { server, url } = await serveHtml(html);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  const bodyText = await page.locator('body').innerText();
  assert.ok(!bodyText.includes(ICP_TEXT), 'ICP should not appear in EN page');
  // verify the comment marker exists
  assert.ok(html.includes('<!-- cn:icp -->'), 'comment marker should exist in source');

  await browser.close();
  server.close();
});

test('CN build: ICP should be visible in DOM', async () => {
  const cnPath = join(__dirname, 'dist', 'cn', 'index.html');
  if (!existsSync(cnPath)) {
    execSync('node build.js', { cwd: __dirname });
  }
  const html = readFileSync(cnPath, 'utf-8');
  const { server, url } = await serveHtml(html);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  await assert.doesNotReject(async () => {
    await page.getByText(ICP_TEXT, { exact: false }).waitFor({ state: 'visible', timeout: 3000 });
  }, 'ICP should be visible in CN build');

  // verify comment marker is gone
  assert.ok(!html.includes('<!-- cn:icp -->'), 'comment marker should be replaced in CN build');

  await browser.close();
  server.close();
});
