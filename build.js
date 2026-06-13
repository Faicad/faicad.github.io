const fs = require('fs')
const path = require('path')

const REPLACEMENTS = [
  ['faicad.com', 'faicad.cn'],
  ['<html lang="en"', '<html lang="zh-CN"'],
  ['<title>Faicad</title>', '<title>Faicad - 开源 3D 工具</title>'],
  [
    'content="Faicad — Open-source 3D tools and CAD utilities"',
    'content="Faicad — 开源 3D 工具与 CAD 实用程序"',
  ],
  [
    'property="og:title" content="Faicad"',
    'property="og:title" content="Faicad - 开源 3D 工具"',
  ],
  ["|| 'en'", "|| 'zh'"],
]

const MARKERS = [
  ['<!-- cn:start -->', ''],
  ['<!-- cn:end -->', ''],
]

const SRC = '.'
const OUT = 'dist/cn'

function processFile(filePath, rel) {
  let content = fs.readFileSync(filePath, 'utf-8')

  for (const [from, to] of REPLACEMENTS) {
    content = content.split(from).join(to)
  }
  for (const [m, r] of MARKERS) {
    content = content.split(m).join(r)
  }

  const outPath = path.join(OUT, rel)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, content)
  console.log(`  ✓ ${rel}`)
}

function walk(dir, rel = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    if (e.name === 'dist' || e.name === '.git' || e.name === 'node_modules') continue
    const full = path.join(dir, e.name)
    const r = path.join(rel, e.name)
    if (e.isDirectory()) walk(full, r)
    else if (e.isFile() && /\.html$/.test(e.name)) processFile(full, r)
  }
}

console.log('Building CN version...')
fs.rmSync(OUT, { recursive: true, force: true })
walk(SRC)
fs.writeFileSync(path.join(OUT, 'CNAME'), 'faicad.cn')
console.log(`Done → ${OUT}/`)
