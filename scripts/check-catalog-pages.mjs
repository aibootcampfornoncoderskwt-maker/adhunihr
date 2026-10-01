import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import ts from 'typescript';
const module=ts.transpileModule(readFileSync('src/data/catalog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {services,industries}=await import('data:text/javascript;base64,'+Buffer.from(module).toString('base64'));
assert.equal(services.length,7);assert.equal(industries.length,12);
const titles=new Set(),descriptions=new Set();
const sitemap=readFileSync('dist/client/sitemap-0.xml','utf8');
for(const [kind,items] of [['services',services],['industries',industries]])for(const item of items){
 const route=`/${kind}/${item.slug}/`,html=readFileSync(`dist/client${route}index.html`,'utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1,route+' needs one H1');
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
 assert.ok(title&&!titles.has(title),'Missing or duplicated title: '+route);titles.add(title);
 const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
 assert.ok(description&&!descriptions.has(description),'Missing or duplicated description: '+route);descriptions.add(description);
 assert.ok(html.includes(route+'#webpage'),'Missing self-referencing page schema');
 const canonical=html.match(/rel="canonical" href="([^"]+)"/)?.[1];assert.ok(canonical&&new URL(canonical).pathname===route,'Wrong canonical: '+route);
 assert.ok(sitemap.includes(route),'Missing from sitemap: '+route);
 assert.ok(existsSync('public/images/'+item.image),'Missing image: '+item.image);
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert.equal(graph.filter(node=>node['@type']==='Service').length,1);
 assert.equal(graph.filter(node=>node['@type']==='BreadcrumbList').length,1);
 assert.ok(html.includes('id="hiring-brief"')&&html.includes('id="questions"'),'Missing detail content');
 assert.ok(!html.includes('JobPosting'),'No illustrative role should use vacancy markup');
}
for(const route of ['about','contact','our-approach']){
 const html=readFileSync(`dist/client/${route}/index.html`,'utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.ok(html.includes('class="page-hero-visual"'));
 assert.ok(sitemap.includes(`/${route}/`));
}
const homepage=readFileSync('dist/client/index.html','utf8');
const nav=homepage.match(/<nav id="primary-nav"[\s\S]*?<\/nav>/)[0];
for(const item of services)assert.ok(nav.includes(`/services/${item.slug}/`));
for(const item of industries)assert.ok(nav.includes(`/industries/${item.slug}/`));
for(const route of ['about','contact','our-approach'])assert.ok(nav.includes(`href="/${route}/"`));
for(const old of ['overseas-recruitment','project-bulk-hiring','executive-specialist-search','engineering-construction','manufacturing-industrial','hospitality-retail','corporate-technology'])assert.ok(!sitemap.includes(`/${old}/`),'Legacy URL in sitemap');
const config=JSON.parse(readFileSync('.vercel/output/config.json','utf8'));
assert.ok(JSON.stringify(config).includes('project-bulk-hiring'),'Missing deployed legacy redirect');
console.log('PASS: 7 services + 12 industries; unique titles/descriptions, one H1, hero assets, canonical URLs, page/service/breadcrumb schema, internal navigation, sitemap coverage, dedicated company pages and legacy redirects.');
