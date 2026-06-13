import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = join(__dirname, 'index.html');

const CARDS = [
  { name: '3D Viewer SKILL', icon: '🌐', url: 'https://www.faicad.com/3d_viewer/' },
  { name: '3D Model Viewer', icon: '🧊', url: 'https://www.faicad.com/3d_viewer_electron/' },
  { name: '3D Model Viewer (Tauri)', icon: '🦀', url: 'https://www.faicad.com/Faicad/3d_viewer_tauri' },
];

let server, browser, page;

function cardLocator(card) {
  return page.locator('.project-card').filter({ has: page.getByRole('heading', { name: card.name, exact: true }) });
}

async function startServer() {
  const html = readFileSync(HTML_PATH, 'utf-8');
  return new Promise((resolve) => {
    server = createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
    server.listen(0, () => resolve('http://localhost:' + server.address().port));
  });
}

test.before(async () => {
  const baseUrl = await startServer();
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  await page.goto(baseUrl);
});

test.after(async () => {
  await browser.close();
  server.close();
});

for (const card of CARDS) {
  test(`${card.name}: click icon navigates to product`, async () => {
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 3000 }),
      cardLocator(card).locator('.project-icon').click(),
    ]);
    assert.equal(popup.url(), card.url);
    await popup.close();
  });

  test(`${card.name}: click description navigates to product`, async () => {
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 3000 }),
      cardLocator(card).locator('.project-info p').click(),
    ]);
    assert.equal(popup.url(), card.url);
    await popup.close();
  });

  test(`${card.name}: click title link navigates to product (native <a>)`, async () => {
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 3000 }),
      cardLocator(card).locator('h3 a').click(),
    ]);
    assert.equal(popup.url(), card.url);
    await popup.close();
  });

  test(`${card.name}: click tag span does NOT navigate`, async () => {
    let opened = false;
    const handler = () => { opened = true; };
    page.on('popup', handler);
    await cardLocator(card).locator('span.tag').first().click();
    await new Promise(r => setTimeout(r, 1000));
    page.removeListener('popup', handler);
    assert.equal(opened, false);
  });

  test(`${card.name}: click tags container does NOT navigate to product`, async () => {
    let opened = false;
    const handler = () => { opened = true; };
    page.on('popup', handler);
    await cardLocator(card).locator('.project-tags').click({ position: { x: 5, y: 5 } });
    await new Promise(r => setTimeout(r, 1000));
    page.removeListener('popup', handler);
    assert.equal(opened, false);
  });
}
