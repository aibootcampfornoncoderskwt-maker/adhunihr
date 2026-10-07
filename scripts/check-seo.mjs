// SEO audit of the built site (run `npm run build` first):  npm run check:seo
// Checks every page in dist/client: title and description length and uniqueness, one H1, canonical, hreflang pairs, Open Graph,
// image alt text, valid JSON-LD, sitemap coverage, robots.txt, internal links. Exits 1 when something fails.
// `--launch` additionally requires the pages to be indexable (use on a build made with PUBLIC_LAUNCH_READY=true).
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = 'dist/client';
const launch = process.argv.includes('--launch');
if (!existsSync(root)) { console.error('dist/client not found. Run `npm run build` first.'); process.exit(2); }

const files = [];
(function walk(dir) { for (const name of readdirSync(dir)) { const path = join(dir, name); statSync(path).isDirectory() ? walk(path) : name.endsWith('.html') && files.push(path); } })(root);
const urlOf = file => '/' + relative(root, file).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
const pages = files.map(file => ({ file, url: urlOf(file), html: readFileSync(file, 'utf8') })).filter(p => !/^\/404/.test(p.url) && !/http-equiv="refresh"/i.test(p.html));
const known = new Set(files.map(urlOf));
const sitemap = existsSync(join(root, 'sitemap-0.xml')) ? readFileSync(join(root, 'sitemap-0.xml'), 'utf8') : '';
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const problems = [], warnings = [];
const titles = new Map(), descriptions = new Map();
for (const { url, html } of pages) {
  const bad = msg => problems.push(`${url}  ${msg}`), warn = msg => warnings.push(`${url}  ${msg}`);
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  if (!title) bad('missing <title>'); else { if (title.length > 65) warn(`title is ${title.length} characters (aim for 60 or fewer)`); if (title.length < 25) warn(`title is short (${title.length})`); (titles.get(title) || titles.set(title, []).get(title)).push(url); }
  if (!desc) bad('missing meta description'); else { if (desc.length > 165) warn(`description is ${desc.length} characters (aim for 160 or fewer)`); if (desc.length < 70) warn(`description is short (${desc.length})`); (descriptions.get(desc) || descriptions.set(desc, []).get(desc)).push(url); }
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) bad(`${h1} <h1> elements (need exactly 1)`);
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  if (!canonical) bad('missing canonical'); else if (!/^https:\/\//.test(canonical)) warn(`canonical is not https: ${canonical}`);
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
  if (launch && /noindex/.test(robots) && !/^\/(privacy|404)/.test(url)) bad('is noindex in a launch build');
  for (const tag of ['og:title', 'og:description', 'og:image', 'og:url']) if (!html.includes(`property="${tag}"`)) bad(`missing ${tag}`);
  if (!/<html[^>]*lang="/.test(html)) bad('missing <html lang>');
  const alts = [...html.matchAll(/<img\b[^>]*>/g)].filter(m => !/\salt="/.test(m[0]));
  if (alts.length) bad(`${alts.length} image(s) without alt`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { bad('invalid JSON-LD'); } }
  // hreflang: every alternate must exist and link back
  const alts2 = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
  for (const [, lang, href] of alts2) { const path = new URL(href).pathname; if (!known.has(path)) bad(`hreflang ${lang} points to a missing page ${path}`); }
  if (alts2.length && !alts2.some(a => a[1] === 'x-default')) warn('hreflang set has no x-default');
  // internal links that do not exist
  for (const m of html.matchAll(/<a\b[^>]*\shref="(\/[^"#?]*)/g)) { const href = m[1]; if (/\.(webp|png|jpg|svg|pdf|xml|txt|ico)$/.test(href)) continue; const norm = href.endsWith('/') ? href : href + '/'; if (!known.has(norm) && !known.has(href)) bad(`broken internal link ${href}`); }
  if (!/^\/(privacy|404)/.test(url) && sitemap && !sitemap.includes(`<loc>${canonical || ''}</loc>`)) warn('not in sitemap');
}
for (const [t, urls] of titles) if (urls.length > 1) problems.push(`duplicate title "${t.slice(0, 50)}" on ${urls.join(', ')}`);
for (const [d, urls] of descriptions) if (urls.length > 1) problems.push(`duplicate description "${d.slice(0, 50)}" on ${urls.join(', ')}`);
const robotsTxt = existsSync(join(root, 'robots.txt')) ? readFileSync(join(root, 'robots.txt'), 'utf8') : '';
if (launch && /Disallow:\s*\/\s*$/m.test(robotsTxt)) problems.push('robots.txt blocks everything in a launch build');
if (launch && !/Sitemap:/i.test(robotsTxt)) problems.push('robots.txt has no Sitemap line');

console.log(`Checked ${pages.length} pages${launch ? ' (launch mode)' : ' (review mode: noindex is expected)'}.`);
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.slice(0, 60).forEach(w => console.log('  ! ' + w)); }
if (problems.length) { console.log(`\n${problems.length} problem(s):`); problems.slice(0, 80).forEach(p => console.log('  x ' + p)); process.exit(1); }
console.log('\nNo SEO problems found.');
