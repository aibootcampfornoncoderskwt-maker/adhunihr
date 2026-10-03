import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
const p=await b.newPage({reducedMotion:'reduce',viewport:{width:1440,height:900}});
const seen=new Set();
for(const slug of process.argv.slice(2)){
 await p.goto('http://localhost:4321/'+slug+'/?lang=ar');await p.waitForTimeout(3500);
 const t=await p.evaluate(()=>{const out=[];const w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.parentElement.closest('script,style,svg,bdi'))continue;const v=n.nodeValue.replace(/\s+/g,' ').trim();if(/[A-Za-z]{2}/.test(v))out.push(v);}return out;});
 console.log('##',slug);for(const v of t)if(!seen.has(v)){seen.add(v);console.log(JSON.stringify(v));}
}
await b.close();
