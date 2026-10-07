// Removes PNG/JPG files from the build output when nothing in the output refers to them (source artwork copied from /public).
// Keeps the deployed site small without touching the source files. Runs after `astro build` (see the "build" script).
import { readdirSync, readFileSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
const roots = ['dist/client', '.vercel/output/static'].filter(dir => existsSync(dir));
const TEXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.svg', '.webmanifest']);
for (const root of roots) {
  const files = []; (function walk(dir) { for (const name of readdirSync(dir)) { const path = join(dir, name); statSync(path).isDirectory() ? walk(path) : files.push(path); } })(root);
  const corpus = files.filter(f => TEXT.has(extname(f))).map(f => readFileSync(f, 'utf8')).join('\n');
  let removed = 0, bytes = 0;
  for (const file of files.filter(f => /\.(png|jpe?g)$/i.test(f))) {
    const web = '/' + relative(root, file).split('\\').join('/');
    if (corpus.includes(web)) continue;
    bytes += statSync(file).size; unlinkSync(file); removed++;
  }
  console.log(`Pruned ${removed} unreferenced image(s) (${(bytes / 1e6).toFixed(1)} MB) from ${root}.`);
}
