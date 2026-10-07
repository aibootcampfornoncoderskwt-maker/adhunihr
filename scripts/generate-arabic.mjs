// Generates real, static Arabic pages (/ar/...) from the built English pages, so search engines and AI tools can index them.
// Runs after `astro build` (see the "build" script). It uses the same dictionaries and rules as src/scripts/language.ts, and it:
//   - writes /ar/<path>/index.html with lang="ar" dir="rtl", translated text, attributes, title, description and JSON-LD
//   - points internal links at the Arabic pages and sets an Arabic canonical
//   - adds hreflang (en, ar, x-default) to both language versions
//   - rewrites the sitemap with both languages and their alternates
// Output goes to dist/client and, when present, .vercel/output/static (the Vercel adapter has already copied the English build there).
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { parse, serialize } from 'parse5';

const roots = ['dist/client', '.vercel/output/static'].filter(dir => existsSync(join(dir, 'index.html')));
if (!roots.length) { console.error('No build output found. Run `astro build` first.'); process.exit(2); }

const readJson = file => JSON.parse(readFileSync(file, 'utf8'));
const dictionary = { ...readJson('src/data/arabic.json'), ...readJson('src/data/client-arabic.json'), ...readJson('src/data/seo-arabic.json') };
import { marketPaths, marketPage } from '../src/data/market-pages.mjs';
import { guideList, guidesIndex, guideLabels } from '../src/data/guides.mjs';
const normalise = text => text.replace(/\s+/g, ' ').trim();
const translate = text => {
  const result = dictionary[normalise(text)];
  return result ? (text.match(/^\s*/)?.[0] || '') + result + (text.match(/\s*$/)?.[0] || '') : text.replace(/Showing (\d+) role examples?/g, 'عرض $1 أمثلة للأدوار');
};
// Market pages carry their own Arabic; pair the strings one to one.
function pair(en, ar) { if (typeof en === 'string') { if (en && ar) { dictionary[normalise(en)] = ar; if (!/[.!?]$/.test(en)) dictionary[normalise(en) + '.'] = ar + '.'; } } else if (Array.isArray(en)) en.forEach((v, i) => pair(v, ar[i])); else if (en && typeof en === 'object') for (const k of Object.keys(en)) pair(en[k], ar[k]); }
pair(
  marketPaths().map(({ industry, country }) => marketPage(industry, country).en), marketPaths().map(({ industry, country }) => marketPage(industry, country).ar));
pair(guideList().map(x => x.en), guideList().map(x => x.ar)); pair(guidesIndex.en, guidesIndex.ar); pair(guideLabels.en, guideLabels.ar);
const missing = new Map();   // English text we could not translate, with the pages it appears on
const miss = (text, url) => { const key = normalise(text); if (!key || !/[A-Za-z]{3}/.test(key)) return; (missing.get(key) || missing.set(key, new Set()).get(key)).add(url); };

const attrOf = (node, name) => node.attrs?.find(attr => attr.name === name);
const setAttr = (node, name, value) => { const a = attrOf(node, name); if (a) a.value = value; else node.attrs.push({ name, value }); };
const SKIP_TEXT = new Set(['script', 'style', 'svg', 'bdi', 'textarea', 'input', 'noscript']);
const TRANSLATED_ATTRS = ['aria-label', 'placeholder', 'title', 'data-label', 'alt'];
const PRESERVE = new Set(['data-language']);

// ---- collect pages
const base = roots[0];
const files = [];
(function walk(dir) { for (const name of readdirSync(dir)) { const path = join(dir, name); statSync(path).isDirectory() ? (name !== 'ar' && walk(path)) : name.endsWith('.html') && files.push(path); } })(base);
const urlOf = file => '/' + relative(base, file).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
const pages = files.map(file => ({ file, url: urlOf(file) })).filter(({ url, file }) => !/^\/404/.test(url) && !/http-equiv="refresh"/i.test(readFileSync(file, 'utf8')));
const pageSet = new Set(pages.map(p => p.url));
const siteUrl = ((readFileSync(join(base, 'index.html'), 'utf8').match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || 'https://adhunihrsolutions.com/').replace(/\/$/, '');
const arUrl = url => '/ar' + (url === '/' ? '/' : url);

const hreflangBlock = url => `<link rel="alternate" hreflang="en" href="${siteUrl}${url}"/><link rel="alternate" hreflang="ar" href="${siteUrl}${arUrl(url)}"/><link rel="alternate" hreflang="x-default" href="${siteUrl}${url}"/>`;

// ---- text helpers over the parse5 tree
function walkTree(node, visit) { visit(node); for (const child of node.childNodes || []) walkTree(child, visit); if (node.content) walkTree(node.content, visit); }
const closestSkip = node => { for (let n = node.parentNode; n; n = n.parentNode) { if (SKIP_TEXT.has(n.nodeName) || (n.attrs && attrOf(n, 'data-language'))) return true; } return false; };
const inDataLanguage = node => { for (let n = node; n; n = n.parentNode) if (n.attrs && attrOf(n, 'data-language')) return true; return false; };
const textOf = node => (node.childNodes || []).filter(c => c.nodeName === '#text').map(c => c.value).join('');

function translateJsonLd(value, url) {
  if (typeof value === 'string') { if (/^https?:\/\//.test(value)) return value; const t = translate(value); if (t === value) miss(value, url + ' (schema)'); return t; }
  if (Array.isArray(value)) return value.map(v => translateJsonLd(v, url));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (['@context', '@type', '@id', 'url', 'item', 'logo', 'sameAs', 'telephone', 'email', 'contentUrl', 'image'].includes(k)) out[k] = v;
      else if (k === 'inLanguage') out[k] = 'ar';
      else if (['name', 'description', 'text', 'headline', 'serviceType', 'areaServed', 'alternateName'].includes(k) || typeof v === 'object') out[k] = translateJsonLd(v, url);
      else out[k] = v;
    }
    return out;
  }
  return value;
}

function arabicPage(html, url) {
  const doc = parse(html);
  const arPath = arUrl(url);
  let title = '', htmlNode = null, head = null;
  walkTree(doc, node => {
    if (node.nodeName === 'html') htmlNode = node;
    if (node.nodeName === 'head') head = node;
  });
  setAttr(htmlNode, 'lang', 'ar'); setAttr(htmlNode, 'dir', 'rtl');
  walkTree(doc, node => {
    // Keep submitted option values stable when labels are translated.
    if (node.nodeName === 'option' && !attrOf(node, 'value')) node.attrs.push({ name: 'value', value: textOf(node) });
    if (node.nodeName === '#text') {
      if (closestSkip(node) || !normalise(node.value)) return;
      const t = translate(node.value);
      if (t === node.value) miss(node.value, url); else node.value = t;
      return;
    }
    if (!node.attrs) return;
    if (node.nodeName === 'title') { const t = translate(textOf(node)); node.childNodes[0].value = t; }
    if (node.nodeName === 'a' || node.nodeName === 'area') {
      const href = attrOf(node, 'href');
      if (href && href.value.startsWith('/') && !href.value.startsWith('//') && !href.value.startsWith('/ar/')) {
        const [pathAndQuery, hash = ''] = href.value.split('#'); const [path, query = ''] = pathAndQuery.split('?');
        const normal = path.endsWith('/') ? path : path + '/';
        if (pageSet.has(normal) || (path === '' && hash)) href.value = (path === '' ? '' : arUrl(normal)) + (query ? '?' + query : '') + (hash ? '#' + hash : '');
        else if (path === '/' ) href.value = '/ar/' + (query ? '?' + query : '') + (hash ? '#' + hash : '');
      }
    }
    if (inDataLanguage(node)) return;
    for (const name of TRANSLATED_ATTRS) {
      const a = attrOf(node, name); if (!a || PRESERVE.has(name)) continue;
      const t = translate(a.value); if (t === a.value) { if (name !== 'title' || node.nodeName !== 'link') miss(a.value, url + ` [${name}]`); } else a.value = t;
    }
    // Page-level metadata
    if (node.nodeName === 'meta') {
      const nameOrProp = attrOf(node, 'name')?.value || attrOf(node, 'property')?.value || '';
      const content = attrOf(node, 'content');
      if (content && ['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'].includes(nameOrProp)) { const t = translate(content.value); if (t === content.value) miss(content.value, url + ` [${nameOrProp}]`); else content.value = t; }
      if (nameOrProp === 'og:url' && content) content.value = siteUrl + arPath;
    }
    if (node.nodeName === 'link' && attrOf(node, 'rel')?.value === 'canonical') setAttr(node, 'href', siteUrl + arPath);
    if (node.nodeName === 'script' && attrOf(node, 'type')?.value === 'application/ld+json' && node.childNodes[0]) {
      try { const json = JSON.parse(node.childNodes[0].value); const out = translateJsonLd(json, url); // urls inside the graph point at the Arabic page
        const text = JSON.stringify(out).split(`"${siteUrl}${url}`).join(`"${siteUrl}${arPath}`).replace(/</g, '\\u003c');
        node.childNodes[0].value = text;
      } catch { /* leave as is */ }
    }
  });
  // hreflang + og:locale
  const frag = parse(`<head>${hreflangBlock(url)}<meta property="og:locale" content="ar_AR"/><meta property="og:locale:alternate" content="en_US"/></head>`);
  const extra = []; walkTree(frag, n => { if (n.nodeName === 'link' || (n.nodeName === 'meta')) extra.push(n); });
  for (const n of extra) { n.parentNode = head; head.childNodes.push(n); }
  return serialize(doc);
}

// ---- generate
let generated = 0;
for (const { file, url } of pages) {
  const html = readFileSync(file, 'utf8');
  const arabic = arabicPage(html, url);
  const english = html.includes('hreflang="ar"') ? html : html.replace('</head>', `${hreflangBlock(url)}<meta property="og:locale" content="en_US"/><meta property="og:locale:alternate" content="ar_AR"/></head>`);
  for (const root of roots) {
    const target = join(root, 'ar', url === '/' ? '' : url, 'index.html');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, '<!DOCTYPE html>' + arabic.replace(/^<!DOCTYPE html>/i, ''));
    const englishFile = join(root, relative(base, file));
    if (existsSync(englishFile)) writeFileSync(englishFile, english);
  }
  generated++;
}

// ---- sitemap with both languages
for (const root of roots) {
  const sitemapFile = join(root, 'sitemap-0.xml');
  if (!existsSync(sitemapFile)) continue;
  const xml = readFileSync(sitemapFile, 'utf8');
  const englishLocs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).filter(loc => !loc.includes('/ar/'));
  const entry = loc => {
    const path = new URL(loc).pathname, ar = siteUrl + arUrl(path);
    const alt = `<xhtml:link rel="alternate" hreflang="en" href="${loc}"/><xhtml:link rel="alternate" hreflang="ar" href="${ar}"/><xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>`;
    return `<url><loc>${loc}</loc>${alt}</url><url><loc>${ar}</loc>${alt}</url>`;
  };
  writeFileSync(sitemapFile, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${englishLocs.map(entry).join('')}</urlset>`);
}

console.log(`Arabic pages generated: ${generated} (to ${roots.join(', ')}).`);
const total = [...missing.values()].reduce((n, set) => n + set.size, 0);
if (missing.size) {
  console.log(`\n${missing.size} English strings have no Arabic yet (${total} places). First ones:`);
  [...missing].slice(0, 25).forEach(([text, urls]) => console.log(`  - ${text.slice(0, 90)}   [${[...urls][0]}${urls.size > 1 ? ' +' + (urls.size - 1) : ''}]`));
  if (process.argv.includes('--write-missing')) { writeFileSync('tmp/arabic-missing.json', JSON.stringify([...missing].map(([text, urls]) => ({ text, pages: [...urls].slice(0, 5) })), null, 2)); console.log('\nFull list: tmp/arabic-missing.json'); }
}
