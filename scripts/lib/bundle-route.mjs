// Bundles an Astro API route (TypeScript, with its imports) into a temporary ES module so a test can call it directly.
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
export async function loadRoute(entry) {
  const result = await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', write: false, define: { 'import.meta.env': '{}' }, external: ['astro'], logLevel: 'silent' });
  const dir = mkdtempSync(join(tmpdir(), 'adhuni-route-'));
  const file = join(dir, 'route.mjs');
  writeFileSync(file, result.outputFiles[0].text);
  return import(pathToFileURL(file).href);
}
