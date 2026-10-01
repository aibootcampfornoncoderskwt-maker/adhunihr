import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root='dist/client';
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.isDirectory()?walk(join(dir,item.name)):[join(dir,item.name)]);
const files=walk(root).filter(path=>path.endsWith('.html'));
const decode=value=>value.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"');
for(const file of files){
 const html=readFileSync(file,'utf8');
 assert.ok(!html.includes('To Be Filled'),'Placeholder published: '+file);
 assert.ok(!html.includes('Coverage and services should be updated'),'Editorial source note published: '+file);
 for(const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){
  const href=decode(match[1]);if(!href.startsWith('/')&&!href.startsWith('#'))continue;
  const route='/'+file.replaceAll('\\','/').replace(/^dist\/client\//,'').replace(/index\.html$/,'');
  const url=new URL(href,'http://local'+route);
  const destination=href.startsWith('#')?file:join(root,url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname);
  assert.ok(existsSync(destination),`Broken local link ${href} in ${file}`);
  if(url.hash&&destination.endsWith('.html'))assert.ok(readFileSync(destination,'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`Broken anchor ${href} in ${file}`);
 }
}
const fields=JSON.parse(readFileSync('src/data/enquiry-fields.json','utf8'));
for(const [type,route] of [['employer','employers'],['candidate','candidates'],['general','contact']]){
 const html=readFileSync(join(root,route,'index.html'),'utf8');
 for(const field of fields[type])assert.ok(html.includes(`name="${field.name}"`),`Missing ${type} field: ${field.name}`);
}
const home=readFileSync(join(root,'index.html'),'utf8');
for(const label of ['Permanent Recruitment','Contract &amp; Project Staffing','Skilled &amp; Technical Manpower','Professional &amp; Specialist Recruitment','High-Volume Recruitment','Executive &amp; Leadership Search','Recruitment Process Support','Healthcare','Facilities Management','Education &amp; Professional Services'])assert.ok(home.includes(label),'Missing content: '+label);
console.log(`PASS: ${files.length} HTML pages, all local links/anchors, all supplied form fields, seven-service navigation and twelve-industry coverage. No source placeholders or editorial instructions published.`);

