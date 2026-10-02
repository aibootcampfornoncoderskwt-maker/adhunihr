// Site-wide alignment check. Opens the site at several widths and measures the left and right content edges of
// every homepage section (utility bar, header, hero, facts row, ticker, About ... footer) against the header.
// Any section more than 2px away from the header's edges is reported and the script exits with code 1.
//
//   npm run build && npm run check:alignment
//
// Options (flags or env):
//   --base=http://localhost:4321   test a running server (dev server). Default: serve dist/client (run `npm run build` first).
//   --widths=1366,1440,1920        viewport widths (default 1366,1440,1920)
//   --lang=en | ar | en,ar         language(s) to test (default en; Arabic is mirrored, start edge = right edge)
//   --pages=home,about,services    pages to test (default home). Inner pages check every .container plus the footer.
//   --tolerance=2                  allowed difference in px
// Browser: uses PLAYWRIGHT_CHROMIUM_PATH, else installed Chrome, else Edge, else Playwright's own Chromium.
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, v = 'true'] = a.slice(2).split('='); return [k, v]; }));
const widths = (args.widths || process.env.ALIGN_WIDTHS || '1366,1440,1920').split(',').map(Number);
const langs = (args.lang || 'en').split(',');
// Pages may be written /about/, about, or home. (Git Bash rewrites a leading / into a Windows path; that is undone here.)
const pages = (args.pages || '/').split(',')
  .map(p => p.replaceAll('\\', '/').replace(/^[A-Za-z]:\/.*?\/Git(?=\/)/, '').replace(/^\/+|\/+$/g, ''))
  .map(p => (p === '' || p === 'home' ? '/' : `/${p}/`));
const tolerance = Number(args.tolerance ?? 2);
const distDir = resolve('dist/client');

// Homepage sections. mode: 'both' = element edges; 'start' = leading edge only (left-aligned blocks); 'content' = union of everything inside.
const HOME_SPECS = [
  ['Utility bar', '.topbar-inner', 'both'],
  ['Header', '.header-stack .nav-inner', 'both'],
  ['Hero', '.hero-inner', 'both'],
  ['Facts row', '.hero-facts', 'start'],
  ['Ticker', '.country-ribbon .ribbon-label', 'start'],
  ['About', '#about', 'content'],
  ['Services', '#services', 'content'],
  ['Industries', '#industries', 'content'],
  ['Approach', '#approach', 'content'],
  ['Map', '#markets', 'content'],
  ['CTA', '#contact', 'content'],
  ['Footer', '#site-footer', 'content']
];

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain' };
async function serveDist() {
  if (!existsSync(join(distDir, 'index.html'))) {
    console.error('dist/client/index.html not found. Run `npm run build` first, or pass --base=http://localhost:4321 for a running dev server.');
    process.exit(2);
  }
  const server = createServer(async (req, res) => {
    try {
      let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
      let file = join(distDir, path);
      if (!file.startsWith(distDir)) throw new Error('outside');
      if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/html' }).end(await readFile(join(distDir, '404.html')).catch(() => 'Not found'));
    }
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

async function launch() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH, headless: true });
  for (const channel of ['chrome', 'msedge']) {
    try { return await chromium.launch({ channel, headless: true }); } catch { /* try the next browser */ }
  }
  return chromium.launch({ headless: true });
}

// Runs in the page: returns one row per spec. Edges are measured against the header row.
function measureInPage({ specs, containerScan }) {
  const rtl = document.documentElement.dir === 'rtl';
  const ref = document.querySelector('.header-stack .nav-inner').getBoundingClientRect();
  const visible = e => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.position !== 'fixed'; };
  const skip = e => e.closest('.hero-slideshow,.ribbon-track,.whatsapp-widget,.catalog-menu,.skip-link,[hidden]') || e.tagName.toLowerCase() === 'image' || (e.closest('svg') && e.tagName.toLowerCase() !== 'svg');
  const label = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const extents = root => {
    let left = Infinity, right = -Infinity;
    // Descendants only: a section's own box is its full-width background, not its content.
    root.querySelectorAll('*').forEach(e => {
      if (skip(e) || !visible(e)) return;
      const b = e.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) return;
      left = Math.min(left, b.left); right = Math.max(right, b.right);
    });
    return { left, right };
  };
  const rows = [];
  const add = (name, mode, box) => rows.push({ name, mode, left: box.left, right: box.right });
  const resolveSpecs = containerScan
    ? [...document.querySelectorAll('.container')].filter(c => c.getBoundingClientRect().width > 0 && !c.closest('.catalog-menu')).map((c, i) => [`Container ${i + 1} (${label(c)})`, c, 'both'])
    : specs.map(([name, selector, mode]) => [name, document.querySelector(selector), mode]);
  for (const [name, el, mode] of resolveSpecs) {
    if (!el) { rows.push({ name, mode, missing: true }); continue; }
    add(name, mode, mode === 'content' ? extents(el) : el.getBoundingClientRect());
  }
  if (containerScan) { const footer = document.querySelector('#site-footer'); if (footer) add('Footer', 'content', extents(footer)); }
  // Header details: logo start edge, header button end edge, language switch end edge.
  const logo = document.querySelector('.brand-logo'), cta = document.querySelector('.nav-cta'), lang = document.querySelector('.language-pill');
  const extra = [];
  if (logo) extra.push(['Logo (start edge)', 'start', logo.getBoundingClientRect()]);
  if (cta && cta.getBoundingClientRect().width > 0) extra.push(['Header button (end edge)', 'end', cta.getBoundingClientRect()]);
  if (lang) extra.push(['Language switch (end edge)', 'end', lang.getBoundingClientRect()]);
  extra.forEach(([name, mode, b]) => rows.push({ name, mode, left: b.left, right: b.right }));
  return { rtl, ref: { left: ref.left, right: ref.right }, rows, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
}

const pad = (v, n) => String(v).padEnd(n);
const fmt = n => (Math.round(n * 10) / 10).toString();
let failures = 0;
let served = null;
const base = args.base || process.env.BASE_URL || (served = await serveDist()).base;
const browser = await launch();
try {
  for (const lang of langs) {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
      for (const path of pages) {
        const page = await context.newPage();
        await page.goto(`${base}${path}${path.includes('?') ? '&' : '?'}lang=${lang}`, { waitUntil: 'load' });
        await page.waitForFunction(() => !document.documentElement.dataset.intro, null, { timeout: 20000 }); // splash finished
        await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-visible')); return document.fonts.ready; });
        await page.waitForTimeout(700);
        const result = await page.evaluate(measureInPage, { specs: HOME_SPECS, containerScan: path !== '/' });
        const { rtl, ref, rows, overflow } = result;
        console.log(`\n${lang.toUpperCase()}  ${width}px  ${path}   header edges: ${fmt(ref.left)} → ${fmt(ref.right)}${rtl ? '  (RTL: start edge = right)' : ''}`);
        console.log(`${pad('Section', 34)}${pad('Left', 9)}${pad('Right', 9)}${pad('ΔStart', 9)}${pad('ΔEnd', 9)}Result`);
        for (const r of rows) {
          if (r.missing) { failures++; console.log(`${pad(r.name, 34)}${'—'.padEnd(36)}FAIL (selector not found)`); continue; }
          const startEdge = rtl ? r.right : r.left, endEdge = rtl ? r.left : r.right;
          const refStart = rtl ? ref.right : ref.left, refEnd = rtl ? ref.left : ref.right;
          const dStart = startEdge - refStart, dEnd = endEdge - refEnd;
          // 'start': only the leading edge must match and the content may not run past the far edge. 'end': only the trailing edge.
          const outside = rtl ? Math.max(0, refEnd - endEdge) : Math.max(0, endEdge - refEnd);
          const checkStart = r.mode !== 'end', checkEnd = r.mode === 'both' || r.mode === 'content' || r.mode === 'end';
          const bad = (checkStart && Math.abs(dStart) > tolerance) || (checkEnd && Math.abs(dEnd) > tolerance) || (r.mode === 'start' && outside > tolerance);
          if (bad) failures++;
          console.log(`${pad(r.name, 34)}${pad(fmt(r.left), 9)}${pad(fmt(r.right), 9)}${pad(checkStart ? fmt(dStart) : '·', 9)}${pad(checkEnd ? fmt(dEnd) : '·', 9)}${bad ? 'FAIL' : 'ok'}`);
        }
        if (overflow > 1) { failures++; console.log(`${pad('Horizontal overflow', 34)}${fmt(overflow)}px of sideways scroll   FAIL`); }
        await page.close();
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  served?.server.close();
}
console.log(failures ? `\n${failures} alignment problem(s) found (tolerance ${tolerance}px).` : `\nAll sections align with the header within ${tolerance}px.`);
process.exit(failures ? 1 : 0);
