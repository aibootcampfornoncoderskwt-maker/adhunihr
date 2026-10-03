// Builds the Contact-only versions of the shared files and stages them (HEAD + only the Contact changes).
import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
import { execFileSync } from 'child_process';
import fs from 'fs';
const sh=(args,input)=>execFileSync('git',args,{input,maxBuffer:1<<28}).toString();
const head=p=>sh(['show','HEAD:'+p]);
const stage=(p,content)=>{const h=sh(['hash-object','-w','--stdin'],content).trim();sh(['update-index','--cacheinfo',`100644,${h},${p}`]);};
const norm=s=>s.replace(/\s+/g,' ').trim();

// 1. strings shown on the Contact page (English mode) and in contact-form.ts
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://localhost:4321/contact/');await p.waitForTimeout(3500);
const found=new Set(await p.evaluate(()=>{
 const out=new Set();const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while(n=w.nextNode()){if(n.parentElement.closest('script,style,svg'))continue;const v=n.nodeValue.replace(/\s+/g,' ').trim();if(v)out.add(v);}
 document.querySelectorAll('[aria-label],[placeholder],[title],[data-label]').forEach(e=>['aria-label','placeholder','title','data-label'].forEach(a=>{const v=e.getAttribute(a);if(v)out.add(v.replace(/\s+/g,' ').trim());}));
 out.add(document.title);return [...out];}));
await b.close();
const ts=fs.readFileSync('src/scripts/contact-form.ts','utf8');
for(const m of ts.matchAll(/'((?:[^'\\]|\\.)+)'/g))found.add(norm(m[1].replace(/\\'/g,"'")));
for(const m of ts.matchAll(/`([^`$]+)`/g))found.add(norm(m[1]));

// 2. dictionaries: HEAD + the working entries for those strings
for(const file of ['src/data/arabic.json','src/data/client-arabic.json']){
 const base=JSON.parse(head(file)),work=JSON.parse(fs.readFileSync(file,'utf8'));
 let changed=0;
 for(const key of Object.keys(work)){if(found.has(norm(key))&&base[key]!==work[key]){base[key]=work[key];changed++;}}
 stage(file,JSON.stringify(base,null,2)+'\n');
 console.log(file,'entries staged:',changed);
}

// 3. home-polish.css: HEAD + the Contact page block only
{
 const f='src/styles/home-polish.css';
 const work=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
 const start=work.indexOf('/* ===== Contact page ===== */');
 let block=work.slice(start);
 // drop blocks that belong to other features
 const cut=(from,to)=>{const i=block.indexOf(from);const j=to?block.indexOf(to,i):block.length;if(i>=0)block=block.slice(0,i)+(to?block.slice(j):'');};
 cut('/* Hiring brief builder entry points','/* Contact page polish');
 cut('/* Page hero without a photo',null);
 const headCss=head(f).replace(/\r\n/g,'\n');
 stage(f,headCss.replace(/\n*$/,'\n')+'\n'+block.replace(/\n*$/,'\n'));
}

// 4. Footer: HEAD + '/contact/' in the invitation exclusion list
{
 const f='src/components/Footer.astro';const h=head(f);
 const n=h.replace("!['/','/employers/'].includes","!['/','/employers/','/contact/'].includes");
 if(n===h)throw new Error('Footer anchor not found');stage(f,n);
}
// 5. Icon: HEAD + the clock icon only
{
 const f='src/components/Icon.astro';const h=head(f);
 const nl=h.includes('\r\n')?'\r\n':'\n';
 const i=h.indexOf("calendar:'M4 5h16");
 const n=i>=0?h.slice(0,i)+"clock:'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',"+nl+h.slice(i):h.replace("close:'m6 6 12 12M6 18 18 6'","close:'m6 6 12 12M6 18 18 6',clock:'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'");
 if(n===h)throw new Error('Icon anchor not found');stage(f,n);
}
// 6. site.ts: HEAD with the inline submit handler replaced by the contact-form import
{
 const f='src/scripts/site.ts';const h=head(f);const nl=h.includes('\r\n')?'\r\n':'\n';
 const lines=h.split(nl);
 const i=lines.findIndex(l=>l.startsWith("document.querySelectorAll<HTMLFormElement>('[data-contact-form]')"));
 if(i<0)throw new Error('site.ts anchor not found');
 lines[i]="import './contact-form'; // enquiry forms, file drop zone and contact-page audience cards";
 stage(f,lines.join(nl));
}
console.log('staged shared files');
