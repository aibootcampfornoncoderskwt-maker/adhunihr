import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/npm-cache/_npx/db89d7302a373f10/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'C:/Users/ADMIN/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
const p=await b.newPage({reducedMotion:'reduce',viewport:{width:390,height:844}});
await p.goto('http://localhost:4321/contact/');await p.waitForTimeout(3500);
console.log(await p.evaluate(()=>['#general-name','#general-country','#general-subject'].map(s=>{const c=getComputedStyle(document.querySelector(s));return s+' '+c.fontSize+' '+c.height+' '+c.fontFamily.slice(0,12)})));
await b.close();
