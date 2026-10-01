import { readFileSync, writeFileSync } from 'node:fs';

// Extract only the transcribed source copy. Editorial notes never become UI copy.
const source = readFileSync('docs/reference-content-extraction.md', 'utf8');
const pages = {};
for (const page of source.split(/^## /m).slice(1)) {
  const title = page.split('\n')[0];
  if (!/^\d\./.test(title)) continue;
  const sections = {};
  for (const section of page.split(/^### /m).slice(1)) {
    const [name, ...lines] = section.trim().split('\n');
    sections[name] = lines.join('\n').trim();
  }
  pages[title.replace(/^\d\. /, '')] = sections;
}
writeFileSync('src/data/client-content.json', JSON.stringify(pages, null, 2) + '\n');
